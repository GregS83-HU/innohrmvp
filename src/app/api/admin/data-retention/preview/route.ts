// Super-admin-only: read-only preview of what the next scheduled retention
// sweep would delete, based on the CURRENTLY configured retention_days.

import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdmin } from '../../../../../../lib/verifySuperAdmin';
import { previewDeletions } from '../../../../../../lib/dataRetention';

export async function GET(request: NextRequest) {
  const authCheck = await verifySuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  try {
    const preview = await previewDeletions();
    return NextResponse.json({ preview });
  } catch (err) {
    console.error('Failed to build retention preview:', err);
    return NextResponse.json({ error: 'Failed to build retention preview' }, { status: 500 });
  }
}
