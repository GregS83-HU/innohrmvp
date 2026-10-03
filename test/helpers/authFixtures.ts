import { NextRequest } from 'next/server';

export const SUPER_ADMIN_USER_ID = 'super-admin-uuid';
export const REGULAR_USER_ID = 'regular-user-uuid';
export const VALID_SUPER_ADMIN_TOKEN = 'valid-super-admin-token';
export const VALID_REGULAR_TOKEN = 'valid-regular-token';

/**
 * Covers the three super-admin-check scenarios every converted route needs
 * to exercise: no/invalid token, valid token but not a super admin, valid
 * token and is a super admin. Pass to createSupabaseMock({ auth: ... }).
 */
export function superAdminAuthHandler(token: string) {
  if (token === VALID_SUPER_ADMIN_TOKEN) {
    return { data: { user: { id: SUPER_ADMIN_USER_ID } }, error: null };
  }
  if (token === VALID_REGULAR_TOKEN) {
    return { data: { user: { id: REGULAR_USER_ID } }, error: null };
  }
  return { data: { user: null }, error: new Error('invalid token') };
}

export function usersTableHandler() {
  return (state: { filters: Record<string, unknown> }) => {
    const id = state.filters['id'];
    if (id === SUPER_ADMIN_USER_ID) {
      return { data: { id, is_super_admin: true }, error: null };
    }
    if (id === REGULAR_USER_ID) {
      return { data: { id, is_super_admin: false }, error: null };
    }
    return { data: null, error: new Error('not found') };
  };
}

export function requestWithAuth(url: string, init?: RequestInit, token?: string) {
  const headers = new Headers(init?.headers);
  if (token) headers.set('authorization', `Bearer ${token}`);
  return new NextRequest(url, { ...init, headers });
}

/**
 * Standard cast used across module tests. Tenant A (company 100) is "our"
 * company; tenant B (company 999) exists only to prove cross-tenant access
 * is refused.
 */
export const COMPANY_A = 100;
export const COMPANY_B = 999;

export const PERSONAS = {
  admin: { token: 'admin-token', id: 'admin-a', company: COMPANY_A, is_admin: true, is_super_admin: false, manager_id: null },
  manager: { token: 'manager-token', id: 'manager-a', company: COMPANY_A, is_admin: false, is_super_admin: false, manager_id: null },
  employee: { token: 'employee-token', id: 'employee-a', company: COMPANY_A, is_admin: false, is_super_admin: false, manager_id: 'manager-a' },
  otherAdmin: { token: 'other-admin-token', id: 'admin-b', company: COMPANY_B, is_admin: true, is_super_admin: false, manager_id: null },
  superAdmin: { token: 'super-token', id: 'super-1', company: COMPANY_A, is_admin: true, is_super_admin: true, manager_id: null },
} as const;

export type PersonaName = keyof typeof PERSONAS;

const byToken = new Map<string, (typeof PERSONAS)[PersonaName]>(Object.values(PERSONAS).map((p) => [p.token, p]));
const byId = new Map<string, (typeof PERSONAS)[PersonaName]>(Object.values(PERSONAS).map((p) => [p.id, p]));

/** auth.getUser handler resolving any PERSONAS token. */
export function personaAuth(token: string) {
  const p = byToken.get(token);
  return p ? { data: { user: { id: p.id, email: `${p.id}@test.local` } }, error: null } : { data: { user: null }, error: new Error('invalid token') };
}

/**
 * Table handlers backing lib/authz lookups for PERSONAS: `users` (role
 * flags), `company_to_users` (tenant membership, honouring a company_id
 * filter) and `user_profiles` (manager_id). Spread into createSupabaseMock's
 * `tables` and override/extend per test.
 */
export function personaTables() {
  return {
    users: (s: { filters: Record<string, unknown> }) => {
      const p = byId.get(s.filters['id'] as string);
      return p ? { data: { id: p.id, is_admin: p.is_admin, is_super_admin: p.is_super_admin, email: `${p.id}@test.local` } } : { data: null, error: new Error('not found') };
    },
    company_to_users: (s: { filters: Record<string, unknown>; head?: boolean }) => {
      if (s.head) return { count: 3 };
      const p = byId.get(s.filters['user_id'] as string);
      if (!p) return { data: null, error: new Error('not found') };
      const wanted = s.filters['company_id'];
      if (wanted !== undefined && wanted !== p.company) return { data: null, error: new Error('not found') };
      return { data: { company_id: p.company, user_id: p.id, is_active: true } };
    },
    user_profiles: (s: { filters: Record<string, unknown> }) => {
      const p = byId.get(s.filters['user_id'] as string);
      return p ? { data: { user_id: p.id, manager_id: p.manager_id } } : { data: null, error: new Error('not found') };
    },
  };
}

/** JSON request with an optional persona bearer token. */
export function jsonRequest(url: string, method: string, body?: unknown, persona?: PersonaName, extraHeaders: Record<string, string> = {}) {
  const headers = new Headers({ 'content-type': 'application/json', ...extraHeaders });
  if (persona) headers.set('authorization', `Bearer ${PERSONAS[persona].token}`);
  return new NextRequest(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
}
