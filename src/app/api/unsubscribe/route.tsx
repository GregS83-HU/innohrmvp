import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { safeErrorInfo } from '../../../../lib/logSafe';
import { requireEmailToken } from '../../../../lib/authz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Links carry signEmailToken(email, 'UNSUBSCRIBE_SECRET'), so a link can
    // only unsubscribe the address it was sent to.
    const auth = requireEmailToken(email, typeof token === 'string' ? token : null, 'UNSUBSCRIBE_SECRET');
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Update contact_submissions to unsubscribe
    const { error } = await supabase
      .from('contact_submissions')
      .update({ 
        marketing_consent: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Unsubscribe error:', safeErrorInfo(error));
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', safeErrorInfo(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}