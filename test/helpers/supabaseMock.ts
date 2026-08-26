import { vi } from 'vitest';

export interface QueryState {
  table: string;
  method: 'select' | 'update' | 'insert' | 'delete';
  filters: Record<string, unknown>;
  orFilter?: string;
  payload?: unknown;
}

export type TableHandler = (state: QueryState) => { data: unknown; error: unknown };
export type AuthHandler = (token: string) => { data: { user: unknown }; error: unknown };

/**
 * Minimal chainable stand-in for the subset of the supabase-js query builder
 * actually used by the routes under test: .from(table).select/update/insert/delete()
 * .eq()/.in()/.or() filters, .single()/.maybeSingle(), and thenable resolution.
 */
export type StorageHandler = (
  bucket: string,
  path: string
) => { data: { signedUrl: string } | null; error: unknown };

export function createSupabaseMock(opts: {
  tables?: Record<string, TableHandler>;
  auth?: AuthHandler;
  storage?: StorageHandler;
}) {
  const tableHandlers = opts.tables ?? {};
  const authHandler = opts.auth;
  const storageHandler = opts.storage;

  function resolve(state: QueryState) {
    const handler = tableHandlers[state.table];
    if (!handler) {
      throw new Error(`supabaseMock: no handler registered for table "${state.table}"`);
    }
    return Promise.resolve(handler(state));
  }

  function makeBuilder(state: QueryState) {
    const builder: any = {
      eq(col: string, val: unknown) {
        state.filters[col] = val;
        return builder;
      },
      in(col: string, vals: unknown[]) {
        state.filters[col] = { in: vals };
        return builder;
      },
      or(expr: string) {
        state.orFilter = expr;
        return builder;
      },
      gte(col: string, val: unknown) {
        state.filters[col] = { ...(state.filters[col] as object), gte: val };
        return builder;
      },
      lte(col: string, val: unknown) {
        state.filters[col] = { ...(state.filters[col] as object), lte: val };
        return builder;
      },
      is(col: string, val: unknown) {
        state.filters[col] = { is: val };
        return builder;
      },
      order(_col: string, _opts?: unknown) {
        return builder;
      },
      limit(_n: number) {
        return builder;
      },
      select(_cols?: string) {
        return builder;
      },
      single() {
        return resolve(state);
      },
      maybeSingle() {
        return resolve(state);
      },
      then(onFulfilled: any, onRejected: any) {
        return resolve(state).then(onFulfilled, onRejected);
      },
    };
    return builder;
  }

  const client = {
    auth: {
      getUser: async (token: string) => {
        if (!authHandler) {
          return { data: { user: null }, error: new Error('supabaseMock: no auth handler registered') };
        }
        return authHandler(token);
      },
    },
    from(table: string) {
      return {
        select: (_cols?: string) => makeBuilder({ table, method: 'select', filters: {} }),
        update: (payload: unknown) => makeBuilder({ table, method: 'update', filters: {}, payload }),
        insert: (payload: unknown) => makeBuilder({ table, method: 'insert', filters: {}, payload }),
        delete: () => makeBuilder({ table, method: 'delete', filters: {} }),
      };
    },
    storage: {
      from(bucket: string) {
        return {
          createSignedUrl: async (path: string, _expiresIn: number) => {
            if (!storageHandler) {
              return { data: null, error: new Error('supabaseMock: no storage handler registered') };
            }
            return storageHandler(bucket, path);
          },
        };
      },
    },
  };

  return client;
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
    }),
  }));
}
