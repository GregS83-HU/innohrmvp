// lib/logSafe.ts

/**
 * Reduces a caught error/exception to non-identifying diagnostic metadata
 * safe to write to server or browser logs: an Error's name, a Postgrest
 * error code, or a generic label. Deliberately never returns `.message`
 * or `.details` — on Supabase/Postgrest constraint violations those fields
 * can embed the offending row's values (e.g. a candidate's email or name).
 */
export function safeErrorInfo(error: unknown): string {
  if (error instanceof Error) {
    return error.name;
  }

  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }

  return 'unknown error';
}
