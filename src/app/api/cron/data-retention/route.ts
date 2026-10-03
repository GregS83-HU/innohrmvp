// Daily scheduled retention sweep, triggered by Vercel Cron (see the
// `crons` entry in vercel.json). Reads data_retention_settings fresh on
// every run — the retention period is never baked into this route or
// cached at deploy time. See REDACTION_RETENTION_FIX.md.

import { NextRequest, NextResponse } from 'next/server';
import { requireServiceSecret } from '../../../../../lib/authz';
import { runRetentionSweep } from '../../../../../lib/dataRetention';
import { safeErrorInfo } from '../../../../../lib/logSafe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Vercel automatically sends `Authorization: Bearer $CRON_SECRET` for
  // cron-triggered requests when a CRON_SECRET env var is configured.
  const authCheck = requireServiceSecret(request, 'CRON_SECRET');
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const summary = await runRetentionSweep('scheduled');
    console.log('Data retention sweep completed:', JSON.stringify(summary));
    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error('Data retention sweep failed:', safeErrorInfo(err));
    return NextResponse.json({ error: 'Retention sweep failed' }, { status: 500 });
  }
}
