// app/api/tickets/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuthenticatedUser, requireCompanyAdmin } from '../../../../../lib/authz';
import { safeErrorInfo } from '../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const identity = await requireAuthenticatedUser(req);
    if (!identity.authorized) {
      return NextResponse.json({ error: identity.error }, { status: identity.status });
    }
    const user = { id: identity.userId };

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const ticketId = formData.get('ticketId') as string;

    if (!file || !ticketId) {
      return NextResponse.json({ error: 'Missing file or ticketId' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Verify the ticket exists and get its owner + company
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, user_id, company_id')
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Restricted to the ticket's own creator or an admin of the ticket's
    // company - previously any coworker in the same company could act on
    // any ticket, regardless of role, which could expose potentially
    // sensitive ticket content company-wide.
    let hasAccess = ticket.user_id === user.id;
    if (!hasAccess) {
      const adminCheck = await requireCompanyAdmin(req);
      hasAccess = adminCheck.authorized && adminCheck.companyId === ticket.company_id;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate unique filename
    const fileName = `${user.id}/${ticketId}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Save attachment record to database
    const { data: attachmentData, error: dbError } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('ticket-attachments')
        .remove([uploadData.path]);
      throw dbError;
    }

    return NextResponse.json({ 
      success: true, 
      attachment: attachmentData 
    });

  } catch (error: unknown) {
    console.error('File upload error:', safeErrorInfo(error));
    return NextResponse.json(
       { error: error instanceof Error ? error.message : 'Failed to upload file' },
       { status: 500 }
    );
  }
}