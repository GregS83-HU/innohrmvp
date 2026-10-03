export type AuthzResult =
  | { authorized: true; userId: string; companyId?: number }
  | { authorized: false; status: number; error: string };

export type SessionTokenResult<T = Record<string, unknown>> =
  | { authorized: true; session: T }
  | { authorized: false; status: number; error: string };
