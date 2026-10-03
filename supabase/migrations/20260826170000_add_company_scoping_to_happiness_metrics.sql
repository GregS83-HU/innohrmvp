-- Make happiness_daily_metrics company-specific.
--
-- Problem: this table had no company_id column at all - it was a single
-- global daily aggregate across every company, keyed only by metric_date
-- (UNIQUE (metric_date)). src/app/api/happiness/dashboard/route.ts recently
-- had a real company-membership check added, but this specific query could
-- not be scoped to it, so a Company A admin's dashboard still showed
-- Company B's (and everyone else's) participation trend mixed in. This
-- migration adds real per-company scoping so that query can be closed too.
--
-- Historical data note: existing rows predate company_id and cannot be
-- retroactively split into per-company figures from the aggregate alone
-- (the underlying per-session detail may or may not still be retained).
-- This migration does not attempt to backfill/reconstruct history - old
-- global rows are left as-is with company_id NULL, and the app-level query
-- filters on a specific company_id, so those rows simply won't surface
-- anywhere going forward (no cross-company leak, but daily-trend history
-- effectively starts fresh from the next time the aggregation function
-- runs for each company). If you want historical continuity instead, that
-- needs a deliberate backfill decision, not something to infer here.

-- ---------------------------------------------------------------------------
-- 1) Schema: add company_id, and scope the uniqueness constraint the
--    upsert (ON CONFLICT) in update_daily_happiness_metrics() relies on to
--    (metric_date, company_id) instead of metric_date alone.
-- ---------------------------------------------------------------------------
ALTER TABLE "public"."happiness_daily_metrics"
  ADD COLUMN IF NOT EXISTS "company_id" bigint REFERENCES "public"."company"("id");

CREATE INDEX IF NOT EXISTS "idx_happiness_daily_metrics_company_id"
  ON "public"."happiness_daily_metrics" ("company_id");

ALTER TABLE "public"."happiness_daily_metrics"
  DROP CONSTRAINT IF EXISTS "happiness_daily_metrics_metric_date_key";

ALTER TABLE "public"."happiness_daily_metrics"
  ADD CONSTRAINT "happiness_daily_metrics_metric_date_company_id_key"
  UNIQUE ("metric_date", "company_id");

-- ---------------------------------------------------------------------------
-- 2) Aggregation function: group by company_id instead of computing one
--    global row per day. Anonymous/company-less sessions (company_id IS
--    NULL on happiness_sessions - the anonymous-session flow supported by
--    "Allow anonymous session creation") are excluded from these
--    per-company figures, matching the dashboard route's own scoping.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."update_daily_happiness_metrics"("target_date" "date") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO happiness_daily_metrics (
        metric_date,
        company_id,
        total_sessions_started,
        total_sessions_completed,
        completion_rate,
        avg_overall_happiness,
        avg_positive_emotions,
        avg_engagement,
        avg_relationships,
        avg_meaning,
        avg_accomplishment,
        avg_work_life_balance
    )
    SELECT
        target_date,
        company_id,
        COUNT(*) as total_started,
        COUNT(*) FILTER (WHERE status = 'completed') as total_completed,
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
            2
        ) as completion_rate,
        ROUND(AVG(overall_happiness_score), 1) as avg_overall,
        ROUND(AVG((perma_scores->>'positive')::INTEGER), 1) as avg_positive,
        ROUND(AVG((perma_scores->>'engagement')::INTEGER), 1) as avg_engagement,
        ROUND(AVG((perma_scores->>'relationships')::INTEGER), 1) as avg_relationships,
        ROUND(AVG((perma_scores->>'meaning')::INTEGER), 1) as avg_meaning,
        ROUND(AVG((perma_scores->>'accomplishment')::INTEGER), 1) as avg_accomplishment,
        ROUND(AVG((perma_scores->>'work_life_balance')::INTEGER), 1) as avg_work_life
    FROM happiness_sessions
    WHERE DATE(created_at) = target_date
        AND status IN ('completed', 'abandoned')
        AND company_id IS NOT NULL
    GROUP BY company_id
    ON CONFLICT (metric_date, company_id) DO UPDATE SET
        total_sessions_started = EXCLUDED.total_sessions_started,
        total_sessions_completed = EXCLUDED.total_sessions_completed,
        completion_rate = EXCLUDED.completion_rate,
        avg_overall_happiness = EXCLUDED.avg_overall_happiness,
        avg_positive_emotions = EXCLUDED.avg_positive_emotions,
        avg_engagement = EXCLUDED.avg_engagement,
        avg_relationships = EXCLUDED.avg_relationships,
        avg_meaning = EXCLUDED.avg_meaning,
        avg_accomplishment = EXCLUDED.avg_accomplishment,
        avg_work_life_balance = EXCLUDED.avg_work_life_balance,
        updated_at = NOW();
END;
$$;

-- ---------------------------------------------------------------------------
-- 3) RLS: the existing "Allow reading daily metrics" policy was USING
--    (true) for any authenticated user - harmless while the table had no
--    tenant column, but not anymore. Replace it with the same
--    company-membership check used elsewhere.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow reading daily metrics" ON "public"."happiness_daily_metrics";

CREATE POLICY "Company members can view own daily metrics"
ON "public"."happiness_daily_metrics" FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."company_to_users" ctu
    WHERE ctu.user_id = auth.uid()
      AND ctu.company_id = happiness_daily_metrics.company_id
  )
);
