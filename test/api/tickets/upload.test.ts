import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../../helpers/supabaseMock';

const ROUTE_PATH = '../../../src/app/api/tickets/upload/route';

const OWNER_USER_ID = 'owner-uuid';
const COWORKER_USER_ID = 'coworker-uuid';
const ADMIN_USER_ID = 'admin-uuid';
const OTHER_COMPANY_ADMIN_ID = 'other-company-admin-uuid';
const STRANGER_USER_ID = 'stranger-uuid';

const TICKET_COMPANY_ID = 100;
const OTHER_COMPANY_ID = 200;

const USER_COMPANY: Record<string, number> = {
  [OWNER_USER_ID]: TICKET_COMPANY_ID,
  [COWORKER_USER_ID]: TICKET_COMPANY_ID,
  [ADMIN_USER_ID]: TICKET_COMPANY_ID,
  [OTHER_COMPANY_ADMIN_ID]: OTHER_COMPANY_ID,
};
const IS_ADMIN: Record<string, boolean> = {
  [ADMIN_USER_ID]: true,
  [OTHER_COMPANY_ADMIN_ID]: true,
};

async function loadRoute() {
  vi.resetModules();
  const client = createSupabaseMock({
    auth: (token: string) => {
      if (token === 'owner-token') return { data: { user: { id: OWNER_USER_ID } }, error: null };
      if (token === 'coworker-token') return { data: { user: { id: COWORKER_USER_ID } }, error: null };
      if (token === 'admin-token') return { data: { user: { id: ADMIN_USER_ID } }, error: null };
      if (token === 'other-company-admin-token') return { data: { user: { id: OTHER_COMPANY_ADMIN_ID } }, error: null };
      if (token === 'stranger-token') return { data: { user: { id: STRANGER_USER_ID } }, error: null };
      return { data: { user: null }, error: new Error('invalid token') };
    },
    tables: {
      tickets: () => ({ data: { id: 'ticket-1', user_id: OWNER_USER_ID, company_id: TICKET_COMPANY_ID }, error: null }),
      users: (state) => {
        const id = state.filters['id'] as string;
        return { data: { is_admin: !!IS_ADMIN[id], is_super_admin: false }, error: null };
      },
      company_to_users: (state) => {
        const id = state.filters['user_id'] as string;
        const companyId = USER_COMPANY[id];
        return companyId !== undefined ? { data: { company_id: companyId }, error: null } : { data: null, error: new Error('not found') };
      },
      ticket_attachments: (state) => ({
        data: { id: 'attach-1', ticket_id: 'ticket-1', file_name: 'f.txt', ...(state.payload as object) },
        error: null,
      }),
    },
  });
  // This route uploads/removes storage objects rather than creating signed
  // URLs, so replace the mock's storage surface with the methods it needs.
  (client as unknown as { storage: unknown }).storage = {
    from: (_bucket: string) => ({
      upload: async (path: string, _file: unknown) => ({ data: { path }, error: null }),
      remove: async (_paths: string[]) => ({ data: null, error: null }),
    }),
  };
  vi.doMock('@supabase/supabase-js', () => ({ createClient: () => client }));
  return import(ROUTE_PATH);
}

function req(token?: string, ticketId = 'ticket-1') {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  const form = new FormData();
  form.set('file', new File(['hello'], 'f.txt', { type: 'text/plain' }));
  form.set('ticketId', ticketId);
  return new Request('http://localhost/api/tickets/upload', { method: 'POST', headers, body: form });
}

describe('POST /api/tickets/upload', () => {
  beforeEach(() => vi.resetModules());

  it('rejects with 401 when no auth header is present', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req());
    expect(res.status).toBe(401);
  });

  it('rejects with 401 for an invalid token', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('bad-token'));
    expect(res.status).toBe(401);
  });

  it('rejects with 403 for a caller unrelated to the ticket or its company', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('stranger-token'));
    expect(res.status).toBe(403);
  });

  it(
    'rejects with 403 for a coworker in the same company who is not the owner or an admin (access scope tightened per explicit decision)',
    async () => {
      const { POST } = await loadRoute();
      const res = await POST(req('coworker-token'));
      expect(res.status).toBe(403);
    }
  );

  it("rejects with 403 for an admin of a different company (cross-tenant attempt)", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('other-company-admin-token'));
    expect(res.status).toBe(403);
  });

  it('allows the ticket owner to upload', async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('owner-token'));
    expect(res.status).toBe(200);
  });

  it("allows an admin of the ticket's own company to upload", async () => {
    const { POST } = await loadRoute();
    const res = await POST(req('admin-token'));
    expect(res.status).toBe(200);
  });
});
