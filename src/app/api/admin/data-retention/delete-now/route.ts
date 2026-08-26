// Super-admin-only: immediately delete one specific record, independent of
// the scheduled sweep. Supports a data-subject deletion request arriving
// before automated retention would otherwise catch it.

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '../../../../../../lib/authz';
import { deleteRecordNow, DataType } from '../../../../../../lib/dataRetention';
import { safeErrorInfo } from '../../../../../../lib/logSafe';

const DELETABLE_DATA_TYPES: DataType[] = ['medical_certificate', 'cv_company_pipeline'];

export async function POST(request: NextRequest) {
  const authCheck = await requireSuperAdmin(request);
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error || 'Unauthorized access' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const dataType = body?.data_type as DataType | undefined;
  const recordId = Number(body?.record_id);

  if (!dataType || !DELETABLE_DATA_TYPES.includes(dataType)) {
    return NextResponse.json({ error: `data_type must be one of ${DELETABLE_DATA_TYPES.join(', ')}` }, { status: 400 });
  }
  if (!Number.isInteger(recordId)) {
    return NextResponse.json({ error: 'record_id must be an integer' }, { status: 400 });
  }

  try {
    const deletedCount = await deleteRecordNow(dataType, recordId, authCheck.userId);
    if (deletedCount === 0) {
      return NextResponse.json({ error: 'No matching record found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: deletedCount });
  } catch (err) {
    console.error('Manual deletion failed:', safeErrorInfo(err));
    return NextResponse.json({ error: (err as Error).message || 'Deletion failed' }, { status: 500 });
  }
}
