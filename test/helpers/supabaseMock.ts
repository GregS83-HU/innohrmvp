import { vi } from 'vitest';

export interface QueryState {
  table: string;
  method: 'select' | 'update' | 'insert' | 'upsert' | 'delete';
  filters: Record<string, unknown>;
  orFilter?: string;
  payload?: unknown;
  /** Columns passed to .select(), if any. */
  columns?: string;
  /** True when .select(..., { head: true }) was used (count-only query). */
  head?: boolean;
  /** Terminal used to resolve the query. */
  terminal?: 'single' | 'maybeSingle' | 'then';
}

export interface QueryResult {
  data?: unknown;
  error?: unknown;
  count?: number | null;
}

export type TableHandler = (state: QueryState) => QueryResult;
export type AuthHandler = (token: string) => { data: { user: unknown }; error: unknown };
export type RpcHandler = (name: string, args: unknown) => QueryResult;

/**
 * Minimal chainable stand-in for the subset of the supabase-js query builder
 * used by the routes under test: .from(table).select/update/insert/upsert/delete()
 * with any filter/modifier chain, resolved via .single()/.maybeSingle() or by
 * awaiting the builder. Every resolved query is recorded in `client.calls`
 * so tests can assert on what was written (and to which tenant).
 */
export type StorageHandler = (
  bucket: string,
  path: string
) => { data: { signedUrl: string } | null; error: unknown };

export function createSupabaseMock(opts: {
  tables?: Record<string, TableHandler>;
  auth?: AuthHandler;
  storage?: StorageHandler;
  rpc?: RpcHandler;
  /** Overrides for auth.admin.* (createUser, deleteUser, ...). */
  authAdmin?: Record<string, (...args: any[]) => any>;
  /** Overrides for other auth.* methods (signUp, signInWithPassword, ...). */
  authMethods?: Record<string, (...args: any[]) => any>;
}) {
  const tableHandlers = opts.tables ?? {};
  const authHandler = opts.auth;
  const storageHandler = opts.storage;
  const calls: QueryState[] = [];

  function resolve(state: QueryState, terminal: QueryState['terminal']) {
    state.terminal = terminal;
    calls.push(state);
    const handler = tableHandlers[state.table];
    if (!handler) {
      throw new Error(`supabaseMock: no handler registered for table "${state.table}"`);
    }
    const result = handler(state);
    return Promise.resolve({ data: null, error: null, count: null, ...result });
  }

  function makeBuilder(state: QueryState) {
    const range = (op: string) => (col: string, val: unknown) => {
      const prev = state.filters[col];
      state.filters[col] = { ...(prev && typeof prev === 'object' ? (prev as object) : {}), [op]: val };
      return builder;
    };
    const builder: any = {
      eq(col: string, val: unknown) {
        state.filters[col] = val;
        return builder;
      },
      neq: range('neq'),
      gt: range('gt'),
      gte: range('gte'),
      lt: range('lt'),
      lte: range('lte'),
      like: range('like'),
      ilike: range('ilike'),
      contains: range('contains'),
      in(col: string, vals: unknown[]) {
        state.filters[col] = { in: vals };
        return builder;
      },
      is(col: string, val: unknown) {
        state.filters[col] = { is: val };
        return builder;
      },
      not(col: string, op: string, val: unknown) {
        state.filters[col] = { not: { [op]: val } };
        return builder;
      },
      or(expr: string) {
        state.orFilter = expr;
        return builder;
      },
      match(obj: Record<string, unknown>) {
        Object.assign(state.filters, obj);
        return builder;
      },
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      returns: () => builder,
      select(cols?: string, selOpts?: { head?: boolean }) {
        // After a write, .select() just asks for the row back - keep the method.
        if (cols !== undefined && state.columns === undefined) state.columns = cols;
        if (selOpts?.head) state.head = true;
        return builder;
      },
      single: () => resolve(state, 'single'),
      maybeSingle: () => resolve(state, 'maybeSingle'),
      then(onFulfilled: any, onRejected: any) {
        return resolve(state, 'then').then(onFulfilled, onRejected);
      },
    };
    return builder;
  }

  const client = {
    calls,
    auth: {
      getUser: async (token?: string) => {
        if (!authHandler) {
          return { data: { user: null }, error: new Error('supabaseMock: no auth handler registered') };
        }
        return authHandler(token ?? '');
      },
      admin: {
        createUser: vi.fn(async () => ({ data: { user: { id: 'new-user-id' } }, error: null })),
        deleteUser: vi.fn(async () => ({ data: null, error: null })),
        getUserById: vi.fn(async (id: string) => ({ data: { user: { id, email: `${id}@test.local` } }, error: null })),
        generateLink: vi.fn(async () => ({ data: { properties: { action_link: 'https://link.test' } }, error: null })),
        ...(opts.authAdmin ?? {}),
      },
      ...(opts.authMethods ?? {}),
    },
    from(table: string) {
      return {
        select: (cols?: string, selOpts?: { head?: boolean }) =>
          makeBuilder({ table, method: 'select', filters: {}, columns: cols, head: !!selOpts?.head }),
        update: (payload: unknown) => makeBuilder({ table, method: 'update', filters: {}, payload }),
        insert: (payload: unknown) => makeBuilder({ table, method: 'insert', filters: {}, payload }),
        upsert: (payload: unknown) => makeBuilder({ table, method: 'upsert', filters: {}, payload }),
        delete: () => makeBuilder({ table, method: 'delete', filters: {} }),
      };
    },
    rpc: vi.fn(async (name: string, args: unknown) => {
      if (!opts.rpc) throw new Error(`supabaseMock: no rpc handler registered (called "${name}")`);
      return { data: null, error: null, ...opts.rpc(name, args) };
    }),
    storage: {
      from(bucket: string) {
        return {
          createSignedUrl: async (path: string, _expiresIn: number) => {
            if (!storageHandler) {
              return { data: null, error: new Error('supabaseMock: no storage handler registered') };
            }
            return storageHandler(bucket, path);
          },
          upload: vi.fn(async (path: string) => ({ data: { path }, error: null })),
          remove: vi.fn(async (paths: string[]) => ({ data: paths.map((p) => ({ name: p })), error: null })),
        };
      },
    },
  };

  return client;
}

/** All recorded writes (insert/update/upsert/delete) against `table`. */
export function writesTo(client: ReturnType<typeof createSupabaseMock>, table: string) {
  return client.calls.filter((c) => c.table === table && c.method !== 'select');
}

/** Mocks the `@supabase/supabase-js` module's createClient export for the current test file. */
export function mockSupabaseJs(client: ReturnType<typeof createSupabaseMock>) {
  vi.doMock('@supabase/supabase-js', () => ({
    createClient: () => client,
  }));
}

/** Mocks `next/headers`'s cookies() with an empty jar (tests drive auth via the Authorization header instead). */
export function mockEmptyCookies() {
  vi.doMock('next/headers', () => ({
    cookies: async () => ({
      get: (_name: string) => undefined,
      getAll: () => [],
      set: () => undefined,
    }),
    headers: async () => new Headers(),
  }));
}
