/**
 * Adds `count` business days (Mon-Fri, no holiday calendar) to `start` and
 * returns the resulting Date. Used to compute SLA-style deadlines (e.g. "N
 * business days after signup") without hardcoding a day count wherever the
 * deadline is checked - reused if the SLA number ever changes.
 */
export function addBusinessDays(start: Date, count: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < count) {
    result.setUTCDate(result.getUTCDate() + 1);
    const day = result.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}
