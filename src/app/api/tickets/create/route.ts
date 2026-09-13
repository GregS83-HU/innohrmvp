// Server-side entry point for creating a support ticket. Tickets previously
// had no API route at all - the create page inserted into `tickets` directly
// from the client against RLS - but plan gating needs a real server-side
// check, so ticket *creation* specifically goes through this route instead
// of a direct client insert, mirroring leave-requests/create/route.ts.
// Replying to, closing, or otherwise updating an existing ticket is
// untouched - only creating a new one is gated.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasFeatureAccess, entitlementErrorBody, resolveCompanyIdForUser } from '../../../../../lib/entitlements';
import { requireSelfOrManagerOf } from '../../../../../lib/authz';
import { safeErrorInfo } from '../../../../../lib/logSafe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, description, priority, category } = body as {
      user_id?: string;
      title?: string;
      description?: string;
      priority?: string;
      category?: string | null;
    };

    if (!user_id || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Caller must be the ticket's owner, that owner's manager, or a company
    // admin - never an arbitrary user_id, which previously let anyone open
    // a ticket "as" any user (including the impersonation risk of another
    // person's name/email being attached to it below).
    const authCheck = await requireSelfOrManagerOf(request, user_id);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const companyId = await resolveCompanyIdForUser(user_id);
    if (!companyId) {
      return NextResponse.json({ error: 'Company not found for this user' }, { status: 400 });
    }

    const entitlement = await hasFeatureAccess(companyId, 'support.tickets');
    if (!entitlement.allowed) {
      return NextResponse.json(entitlementErrorBody('support.tickets', entitlement), { status: 403 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, user_firstname, user_lastname')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title,
        description,
        priority: priority || 'medium',
        category: category || null,
        company_id: companyId,
        user_id,
        user_email: userData.email,
        user_name: `${userData.user_firstname} ${userData.user_lastname}`,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Ticket creation error:', safeErrorInfo(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
