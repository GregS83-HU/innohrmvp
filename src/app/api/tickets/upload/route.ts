// app/api/tickets/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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

    // Verify user has access to this ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        company:company_id(
          company_to_users(user_id)
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user has access to this ticket
    const hasAccess = ticket.user_id === user.id || 
      ticket.company.company_to_users.some((cu: any) => cu.user_id === user.id);

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

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}