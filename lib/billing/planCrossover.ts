// Computes, from the live forfait.base_fee_huf / per_seat_fee_huf columns
// (see 20260913120000_pricing_overhaul_schema.sql), the headcount at which
// Growth's flat-base + per-seat formula becomes cheaper than Core's. Used by
// the plan-crossover cron (src/app/api/cron/plan-crossover-check/route.ts)
// to notify existing Core accounts that have grown past that point instead
// of leaving them to find out on their own - see docs/product-brief.md.
//
// Deliberately reads pricing from the DB rather than hardcoding the two
// tiers' numbers a second time here: if base_fee_huf/per_seat_fee_huf ever
// change (a reprice), the crossover headcount recalculates on the next cron
// run with no code change required.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface PlanPricing {
  baseFeeHuf: number;
  perSeatFeeHuf: number;
}

/** Monthly cost for `employeeCount` seats under a flat-base + per-seat plan. */
export function monthlyCost(plan: PlanPricing, employeeCount: number): number {
  return plan.baseFeeHuf + plan.perSeatFeeHuf * employeeCount;
}

/**
 * The smallest integer employee count at which `growth` is strictly cheaper
 * than `core`, or null if Growth's per-seat fee isn't lower than Core's - in
 * that case Growth's higher base fee means it can never overtake Core
 * regardless of headcount, so there is no crossover to notify about.
 */
export function computeGrowthCrossoverHeadcount(
  core: PlanPricing,
  growth: PlanPricing
): number | null {
  if (growth.perSeatFeeHuf >= core.perSeatFeeHuf) return null;
  const threshold =
    (growth.baseFeeHuf - core.baseFeeHuf) / (core.perSeatFeeHuf - growth.perSeatFeeHuf);
  // Costs are equal exactly at `threshold` (not cheaper), so the first
  // headcount where Growth is strictly cheaper is the next integer above it.
  return Math.floor(threshold) + 1;
}

/** Fetches Core and Growth's live cached pricing from the forfait table. */
export async function getCoreGrowthPricing(): Promise<{
  core: PlanPricing;
  growth: PlanPricing;
} | null> {
  const { data, error } = await supabase
    .from("forfait")
    .select("forfait_name, base_fee_huf, per_seat_fee_huf")
    .in("forfait_name", ["Core", "Growth"]);

  if (error || !data) return null;

  const core = data.find((r) => r.forfait_name === "Core");
  const growth = data.find((r) => r.forfait_name === "Growth");

  if (
    !core ||
    !growth ||
    core.base_fee_huf == null ||
    core.per_seat_fee_huf == null ||
    growth.base_fee_huf == null ||
    growth.per_seat_fee_huf == null
  ) {
    return null;
  }

  return {
    core: { baseFeeHuf: core.base_fee_huf, perSeatFeeHuf: core.per_seat_fee_huf },
    growth: { baseFeeHuf: growth.base_fee_huf, perSeatFeeHuf: growth.per_seat_fee_huf },
  };
}
