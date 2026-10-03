import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../helpers/supabaseMock';
import {
  superAdminAuthHandler,
  usersTableHandler,
  requestWithAuth,
  VALID_SUPER_ADMIN_TOKEN,
  VALID_REGULAR_TOKEN,
} from '../helpers/authFixtures';

const ROUTE_PATH = '../../src/app/api/contact-submissions/route';
const SUBMISSIONS_FIXTURE = [{ id: 1, first_name: 'Jane', status: 'new' }];

let updateMock: ReturnType<typeof vi.fn>;
let deleteMock: ReturnType<typeof vi.fn>;

async function loadRoute() {
  vi.resetModules();
  updateMock = vi.fn();
  deleteMock = vi.fn();
  const client = createSupabaseMock({
    auth: superAdminAuthHandler,
    tables: {
      users: usersTableHandler(),
      contact_submissions: (state) => {
        if (state.method === 'select') return { data: SUBMISSIONS_FIXTURE, error: null };
        if (state.method === 'update') {
          updateMock(state.filters['id'], state.payload);
          return { data: { id: state.filters['id'], ...(state.payload as object) }, error: null };
        }
        if (state.method === 'delete') {
          deleteMock(state.filters['id']);
          return { data: null, error: null };
        }
        return { data: null, error: null };
      },
    },
  });
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  vi.doMock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }));
  return import(ROUTE_PATH);
}

describe('GET /api/contact-submissions', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 403 when no auth token is present', async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth('http://localhost/api/contact-submissions'));
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is not a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth('http://localhost/api/contact-submissions', {}, VALID_REGULAR_TOKEN));
    expect(res.status).toBe(403);
  });

  it('returns submissions for a super admin', async () => {
    const { GET } = await loadRoute();
    const res = await GET(requestWithAuth('http://localhost/api/contact-submissions', {}, VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(SUBMISSIONS_FIXTURE);
  });
});

describe('PATCH /api/contact-submissions', () => {
  beforeEach(() => vi.resetModules());
  const patchReq = (token?: string) =>
    requestWithAuth(
      'http://localhost/api/contact-submissions',
      { method: 'PATCH', body: JSON.stringify({ id: 1, status: 'resolved' }) },
      token
    );

  it('rejects with 403 when no auth token is present', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq());
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is not a super admin', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq(VALID_REGULAR_TOKEN));
    expect(res.status).toBe(403);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('updates the submission for a super admin', async () => {
    const { PATCH } = await loadRoute();
    const res = await PATCH(patchReq(VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
    expect(updateMock).toHaveBeenCalledWith(1, expect.objectContaining({ status: 'resolved' }));
  });
});

describe('DELETE /api/contact-submissions', () => {
  beforeEach(() => vi.resetModules());
  const deleteReq = (token?: string) =>
    requestWithAuth('http://localhost/api/contact-submissions?id=1', { method: 'DELETE' }, token);

  it('rejects with 403 when no auth token is present', async () => {
    const { DELETE } = await loadRoute();
    const res = await DELETE(deleteReq());
    expect(res.status).toBe(403);
  });

  it('rejects with 403 when caller is not a super admin', async () => {
    const { DELETE } = await loadRoute();
    const res = await DELETE(deleteReq(VALID_REGULAR_TOKEN));
    expect(res.status).toBe(403);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('deletes the submission for a super admin', async () => {
    const { DELETE } = await loadRoute();
    const res = await DELETE(deleteReq(VALID_SUPER_ADMIN_TOKEN));
    expect(res.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith('1');
  });
});
