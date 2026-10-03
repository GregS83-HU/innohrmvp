import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock, mockSupabaseJs, mockEmptyCookies } from '../helpers/supabaseMock';
import { personaAuth, personaTables, jsonRequest, PERSONAS, COMPANY_A, COMPANY_B, type PersonaName } from '../helpers/authFixtures';

async function loadAuthz(extraTables: Parameters<typeof createSupabaseMock>[0]['tables'] = {}) {
  vi.resetModules();
  mockSupabaseJs(createSupabaseMock({ auth: personaAuth, tables: { ...personaTables(), ...extraTables } }));
  mockEmptyCookies();
  return import('../../lib/authz');
}

const req = (persona?: PersonaName, headers: Record<string, string> = {}) =>
  jsonRequest('http://localhost/api/x', 'GET', undefined, persona, headers);

describe('lib/authz', () => {
  beforeEach(() => vi.resetModules());

  describe('requireSuperAdmin', () => {
    it('403 without a token, for a company admin, and for an invalid token', async () => {
      const authz = await loadAuthz();
      expect(await authz.requireSuperAdmin(req())).toMatchObject({ authorized: false, status: 403 });
      expect(await authz.requireSuperAdmin(req('admin'))).toMatchObject({ authorized: false, status: 403 });
      expect(await authz.requireSuperAdmin(req(undefined, { authorization: 'Bearer forged' }))).toMatchObject({ authorized: false, status: 403 });
    });
    it('authorizes a super admin', async () => {
      const authz = await loadAuthz();
      expect(await authz.requireSuperAdmin(req('superAdmin'))).toEqual({ authorized: true, userId: PERSONAS.superAdmin.id });
    });
  });

  describe('requireServiceSecret (cron routes)', () => {
    it('only accepts the exact bearer secret', async () => {
      const authz = await loadAuthz();
      expect(authz.requireServiceSecret(req(), 'CRON_SECRET').authorized).toBe(false);
      expect(authz.requireServiceSecret(req(undefined, { authorization: 'Bearer wrong' }), 'CRON_SECRET').authorized).toBe(false);
      expect(authz.requireServiceSecret(req(undefined, { authorization: `Bearer ${process.env.CRON_SECRET}` }), 'CRON_SECRET').authorized).toBe(true);
    });
    it('fails closed when the secret env var is unset', async () => {
      const authz = await loadAuthz();
      expect(authz.requireServiceSecret(req(undefined, { authorization: 'Bearer undefined' }), 'NOT_SET_ANYWHERE').authorized).toBe(false);
    });
  });

  describe('requireCompanyMember', () => {
    it("resolves the caller's own company", async () => {
      const authz = await loadAuthz();
      expect(await authz.requireCompanyMember(req('employee'))).toMatchObject({ authorized: true, companyId: COMPANY_A });
    });
    it('refuses membership checks against another tenant', async () => {
      const authz = await loadAuthz();
      expect(await authz.requireCompanyMember(req('employee'), COMPANY_B)).toMatchObject({ authorized: false, status: 403 });
    });
    it('401 when unauthenticated', async () => {
      const authz = await loadAuthz();
      expect(await authz.requireCompanyMember(req())).toMatchObject({ authorized: false, status: 401 });
    });
  });

  describe('requireCompanyAdmin', () => {
    it('refuses employees and managers, accepts admins and super admins', async () => {
      const authz = await loadAuthz();
      expect((await authz.requireCompanyAdmin(req('employee'))).authorized).toBe(false);
      expect((await authz.requireCompanyAdmin(req('manager'))).authorized).toBe(false);
      expect(await authz.requireCompanyAdmin(req('admin'))).toMatchObject({ authorized: true, companyId: COMPANY_A });
      expect(await authz.requireCompanyAdmin(req('superAdmin'))).toMatchObject({ authorized: true });
    });
  });

  describe('requireSelf', () => {
    it('only lets a user act as themselves', async () => {
      const authz = await loadAuthz();
      expect((await authz.requireSelf(req('employee'), PERSONAS.employee.id)).authorized).toBe(true);
      expect(await authz.requireSelf(req('employee'), PERSONAS.manager.id)).toMatchObject({ authorized: false, status: 403 });
      expect((await authz.requireSelf(req('admin'), PERSONAS.employee.id)).authorized).toBe(false);
    });
  });

  describe('requireSelfOrManagerOf', () => {
    it('allows self, the real manager of record, and a same-company admin', async () => {
      const authz = await loadAuthz();
      for (const p of ['employee', 'manager', 'admin'] as const) {
        expect((await authz.requireSelfOrManagerOf(req(p), PERSONAS.employee.id)).authorized, p).toBe(true);
      }
    });
    it('refuses another tenant admin (cross-tenant) and a peer who is not the manager', async () => {
      const authz = await loadAuthz();
      expect((await authz.requireSelfOrManagerOf(req('otherAdmin'), PERSONAS.employee.id)).authorized).toBe(false);
      expect((await authz.requireSelfOrManagerOf(req('employee'), PERSONAS.manager.id)).authorized).toBe(false);
    });
  });

  describe('requireSelfOrCompanyAdminOf', () => {
    it('allows self and same-company admin, refuses other tenants and peers', async () => {
      const authz = await loadAuthz();
      expect((await authz.requireSelfOrCompanyAdminOf(req('manager'), PERSONAS.manager.id)).authorized).toBe(true);
      expect((await authz.requireSelfOrCompanyAdminOf(req('admin'), PERSONAS.manager.id)).authorized).toBe(true);
      expect((await authz.requireSelfOrCompanyAdminOf(req('otherAdmin'), PERSONAS.manager.id)).authorized).toBe(false);
      expect((await authz.requireSelfOrCompanyAdminOf(req('employee'), PERSONAS.manager.id)).authorized).toBe(false);
    });
  });

  describe('requireSessionToken (anonymous wellbeing sessions)', () => {
    it('401 without token, 404 for unknown token, ok for a known one', async () => {
      const authz = await loadAuthz({
        happiness_sessions: (s) => (s.filters['session_token'] === 'tok-1' ? { data: { id: 's1' } } : { data: null, error: new Error('nf') }),
      });
      const msgs = { noToken: 'no', notFound: 'nf' };
      expect(await authz.requireSessionToken(req(), 'happiness_sessions', msgs)).toMatchObject({ status: 401 });
      expect(await authz.requireSessionToken(req(undefined, { 'x-session-token': 'guess' }), 'happiness_sessions', msgs)).toMatchObject({ status: 404 });
      expect(await authz.requireSessionToken(req(undefined, { 'x-session-token': 'tok-1' }), 'happiness_sessions', msgs)).toMatchObject({ authorized: true });
    });
  });

  it('ownerOrManagerRowFilter scopes rows to the employee or their manager', async () => {
    const authz = await loadAuthz();
    expect(authz.ownerOrManagerRowFilter('u1')).toBe('employee_id.eq.u1,manager_id.eq.u1');
  });
});
