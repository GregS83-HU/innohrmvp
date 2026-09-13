import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { AuthzResult, SessionTokenResult } from './types';

// lib/entitlements.ts constructs its own Supabase client eagerly at module
// scope (unlike this file's lazy getSupabase()). Importing
// resolveCompanyIdForUser statically at the top of this file would force
// that eager construction on every consumer of lib/authz, not just the two
// functions below that actually need it - so it's imported dynamically,
// inside those functions only, instead.
async function resolveCompanyIdForUser(userId: string): Promise<number | null> {
  const entitlements = await import('../entitlements');
  return entitlements.resolveCompanyIdForUser(userId);
}

// Lazily instantiated so shapes that don't need a Supabase client (e.g.
// requireServiceSecret) don't pay for/depend on one at module-load time.
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

/**
 * Shape 1 (super-admin): caller's users.is_super_admin === true, global.
 * Extracted from lib/verifySuperAdmin.ts — same token resolution order
 * (sb-access-token / supabase-auth-token cookies, then Authorization header),
 * same DB check, same always-403-on-failure behavior as every route that
 * currently performs this check (whether via the shared helper or one of
 * the drifted inline copies).
 */
export async function requireSuperAdmin(request: Request): Promise<AuthzResult> {
  try {
    const supabase = getSupabase();
    const cookieStore = await cookies();
    const authToken =
      cookieStore.get('sb-access-token')?.value ||
      cookieStore.get('supabase-auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!authToken) {
      return { authorized: false, status: 403, error: 'No authentication token found' };
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authToken);
    if (authError || !user) {
      return { authorized: false, status: 403, error: 'Invalid authentication token' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, is_super_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData as { is_super_admin: boolean }).is_super_admin !== true) {
      return {
        authorized: false,
        status: 403,
        error: 'User is not authorized. Super admin access required.',
      };
    }

    return { authorized: true, userId: user.id };
  } catch (error) {
    console.error('Authorization error:', error);
    return { authorized: false, status: 403, error: 'Authorization check failed' };
  }
}

/**
 * Shape 6 (service secret): caller presents `Authorization: Bearer <secret>`
 * matching the named env var. Not a user — used by the Vercel Cron routes.
 * Extracted verbatim from the identical check duplicated in
 * cron/data-retention/route.ts and cron/onboarding-reminders/route.ts.
 */
export function requireServiceSecret(request: Request, envVar: string): AuthzResult {
  const secret = process.env[envVar];
  const authHeader = request.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return { authorized: false, status: 401, error: 'Unauthorized' };
  }
  return { authorized: true, userId: 'service' };
}

/**
 * Identity-only primitive: verifies the Authorization bearer token and
 * resolves the real caller. Extracted from the token-verification block
 * duplicated (with identical error messages) at the top of
 * candidates/signed-cv-url, medical-certificates/signed-url, and
 * stats/route/[positionId]. Composable — routes that need to interleave a
 * resource lookup between "who is calling" and "do they own this specific
 * record" (e.g. stats/[positionId]) can call this directly instead of
 * requireCompanyMember/requireCompanyAdmin.
 */
export async function requireAuthenticatedUser(request: Request): Promise<AuthzResult> {
  const supabase = getSupabase();
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { authorized: false, status: 401, error: 'Missing authorization header' };
  }
  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { authorized: false, status: 401, error: 'Invalid token' };
  }
  return { authorized: true, userId: user.id };
}

/**
 * Shape 3 (company member): caller is any member of a company, resolved via
 * company_to_users. Pass `companyId` to verify membership in one specific
 * company (matches stats/route/[positionId]'s "Access denied" behavior);
 * omit it to resolve the caller's own company generically (matches
 * candidates/signed-cv-url's "No company associated with your account").
 */
export async function requireCompanyMember(request: Request, companyId?: number): Promise<AuthzResult> {
  const authResult = await requireAuthenticatedUser(request);
  if (!authResult.authorized) return authResult;

  const supabase = getSupabase();
  let query = supabase.from('company_to_users').select('company_id').eq('user_id', authResult.userId);
  if (companyId !== undefined) {
    query = query.eq('company_id', companyId);
  }
  const { data: membership, error } = await query.single();

  if (error || !membership) {
    return {
      authorized: false,
      status: 403,
      error: companyId !== undefined ? 'Access denied' : 'No company associated with your account',
    };
  }
  return { authorized: true, userId: authResult.userId, companyId: (membership as { company_id: number }).company_id };
}

/**
 * Shape 2 (company admin): caller is is_admin or is_super_admin AND a member
 * of their own company. Extracted from medical-certificates/signed-url.
 */
export async function requireCompanyAdmin(request: Request): Promise<AuthzResult> {
  const authResult = await requireAuthenticatedUser(request);
  if (!authResult.authorized) return authResult;

  const supabase = getSupabase();
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_admin, is_super_admin')
    .eq('id', authResult.userId)
    .single();

  if (
    profileError ||
    !profile ||
    (!(profile as { is_admin: boolean }).is_admin && !(profile as { is_super_admin: boolean }).is_super_admin)
  ) {
    return { authorized: false, status: 403, error: 'Access denied' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', authResult.userId)
    .single();

  if (membershipError || !membership) {
    return { authorized: false, status: 403, error: 'No company associated with your account' };
  }
  return { authorized: true, userId: authResult.userId, companyId: (membership as { company_id: number }).company_id };
}

/**
 * Shape 5 (session-token possession): caller holds an unguessable,
 * single-purpose token (not a user session). Extracted from the identical
 * lookup duplicated in happiness/chat and happiness/session (GET) — the
 * caller-facing error text differs per route (English vs. French), so it's
 * parameterized rather than hard-coded.
 */
export async function requireSessionToken<T = Record<string, unknown>>(
  request: Request,
  table: string,
  messages: { noToken: string; notFound: string },
  headerName: string = 'x-session-token'
): Promise<SessionTokenResult<T>> {
  const supabase = getSupabase();
  const token = request.headers.get(headerName);
  if (!token) {
    return { authorized: false, status: 401, error: messages.noToken };
  }
  const { data: session, error } = await supabase.from(table).select('*').eq('session_token', token).single();
  if (error || !session) {
    return { authorized: false, status: 404, error: messages.notFound };
  }
  return { authorized: true, session: session as T };
}

/**
 * Shape 4 (manager-or-owner row filter): builds the `.or()` filter expression
 * that scopes a query to rows where the given userId is either the record's
 * employee_id or its manager_id. Extracted from performance/goals/update's
 * PATCH handler. NOT an identity check — like the original code, this trusts
 * whatever userId it's given (the caller-identity gap Phase 1 flagged there
 * is out of scope for this refactor); it only centralizes the filter shape
 * so it isn't hand-written inline.
 */
export function ownerOrManagerRowFilter(userId: string): string {
  return `employee_id.eq.${userId},manager_id.eq.${userId}`;
}

/**
 * Company-member check for routes using a cookie-scoped (not bearer-token)
 * client — e.g. lib/supabaseServerClient.ts's createServerClient(). Resolves
 * the caller from the client's own session (mirroring what auth.uid() sees
 * for RLS) instead of an Authorization header. Used to add an app-level
 * check to routes that today rely entirely on an RLS policy with this exact
 * predicate (company_to_users membership matching a specific company_id) —
 * defense-in-depth, not a replacement for the RLS policy itself.
 */
export async function requireCompanyMemberSession(
  supabase: SupabaseClient,
  companyId?: number
): Promise<AuthzResult> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { authorized: false, status: 401, error: 'Not authenticated' };
  }
  let query = supabase.from('company_to_users').select('company_id').eq('user_id', user.id);
  if (companyId !== undefined) {
    query = query.eq('company_id', companyId);
  }
  const { data: membership, error } = await query.single();
  if (error || !membership) {
    return { authorized: false, status: 403, error: 'Access denied' };
  }
  return { authorized: true, userId: user.id, companyId: (membership as { company_id: number }).company_id };
}

/**
 * Shape 7 (self only): caller must literally be the user they're claiming
 * to act as. The most basic identity check, but a recurring gap across the
 * Medium/Low audit — several routes take a "which user is this for" param
 * from the request body/query and never verify the caller actually is that
 * user.
 */
export async function requireSelf(request: Request, claimedUserId: string): Promise<AuthzResult> {
  const identity = await requireAuthenticatedUser(request);
  if (!identity.authorized) return identity;
  if (identity.userId !== claimedUserId) {
    return { authorized: false, status: 403, error: 'Access denied' };
  }
  return identity;
}

/**
 * Shape 8 (self, or company admin of that person): caller is the named
 * user themselves, or an admin of that user's own company (oversight).
 * Originally built as a private, unexported verifyManagerAccess() inside
 * timeclock/manager/route.ts to check "is the caller this specific
 * manager, or an admin who may act on their behalf" — promoted here so the
 * same relationship check isn't rewritten per route. Distinct from
 * requireSelfOrManagerOf below: this checks "is the caller this person
 * (or their company's admin)", not "is the caller this person's manager".
 */
export async function requireSelfOrCompanyAdminOf(request: Request, targetUserId: string): Promise<AuthzResult> {
  const identity = await requireAuthenticatedUser(request);
  if (!identity.authorized) return identity;
  if (identity.userId === targetUserId) return identity;

  const adminCheck = await requireCompanyAdmin(request);
  if (!adminCheck.authorized) return { authorized: false, status: 403, error: 'Access denied' };

  const targetCompanyId = await resolveCompanyIdForUser(targetUserId);
  if (!targetCompanyId || targetCompanyId !== adminCheck.companyId) {
    return { authorized: false, status: 403, error: 'Access denied' };
  }
  return adminCheck;
}

/**
 * Shape 9 (self, the employee's real manager, or a company admin): caller
 * is the named employee themselves, is that employee's manager of record
 * (via user_profiles.manager_id — resolved server-side, never trusted from
 * the request), or is an admin of the employee's own company. Covers the
 * "employee acts for themselves, or their manager acts on their behalf"
 * pattern used by performance goals, pulse updates, leave requests, and
 * ticket creation.
 */
export async function requireSelfOrManagerOf(request: Request, employeeId: string): Promise<AuthzResult> {
  const identity = await requireAuthenticatedUser(request);
  if (!identity.authorized) return identity;
  if (identity.userId === employeeId) return identity;

  const supabase = getSupabase();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('manager_id')
    .eq('user_id', employeeId)
    .single();

  if (profile && (profile as { manager_id: string | null }).manager_id === identity.userId) {
    return identity;
  }

  const adminCheck = await requireCompanyAdmin(request);
  if (!adminCheck.authorized) return { authorized: false, status: 403, error: 'Access denied' };

  const employeeCompanyId = await resolveCompanyIdForUser(employeeId);
  if (!employeeCompanyId || employeeCompanyId !== adminCheck.companyId) {
    return { authorized: false, status: 403, error: 'Access denied' };
  }
  return adminCheck;
}
