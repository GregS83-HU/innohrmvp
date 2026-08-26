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
