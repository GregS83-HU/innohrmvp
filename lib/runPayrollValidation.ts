/* =====================================================
   Payroll Validation Runner
   Purpose: Validate payroll data before export
   ===================================================== */

import { createClient } from "@supabase/supabase-js"

/* -----------------------------------------------------
   Supabase client (SERVICE ROLE REQUIRED)
----------------------------------------------------- */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/* -----------------------------------------------------
   Types
----------------------------------------------------- */

type PayrollValidationContext = {
  countryCode: string
  year: number
  month: number
  exportFormat: string
  validatedBy: string // user_id
  validationName?: string // OPTIONAL: user-provided name
}

type ValidationIssue = {
  severity: "CRITICAL" | "WARNING" | "INFO"
  code: string
  user_id?: string
  field_name?: string
  message: string
  suggested_fix?: string
}

/* -----------------------------------------------------
   MAIN ENTRY POINT
----------------------------------------------------- */

export async function runPayrollValidation(
  ctx: PayrollValidationContext
): Promise<{
  validationRunId: string
  hasCriticalErrors: boolean
  issues: ValidationIssue[]
}> {
  /* -----------------------------------------------
     1. Load country configuration
  ----------------------------------------------- */
  const { data: country, error: countryError } = await supabase
    .from("payroll_countries")
    .select("country_code, field_config")
    .eq("country_code", ctx.countryCode)
    .single()

  if (countryError || !country) {
    throw new Error("Payroll country configuration not found")
  }

  /* -----------------------------------------------
     2. Load payroll data for period (export boundary)
  ----------------------------------------------- */
  console.log('Running payroll validation for', ctx)
  console.log({ countryCode: ctx.countryCode, year: ctx.year, month: ctx.month })


  const { data: employees, error: payrollError } = await supabase.rpc(
    "get_payroll_for_period",
    {
      p_country_code: ctx.countryCode,
      p_year: ctx.year,
      p_month: ctx.month
    }
  )

  if (payrollError) {
      console.error("RPC get_payroll_for_period failed:", payrollError)

    throw new Error("Failed to load payroll data for validation")
  }

  /* -----------------------------------------------
     3. Run validation rules
  ----------------------------------------------- */
  const issues: ValidationIssue[] = []

  const requiredFields =
    country.field_config?.required_fields ?? []

  for (const employee of employees ?? []) {
    const countryData = employee.country_specific_data || {}

    for (const field of requiredFields) {
      const value = countryData[field.field_name]

      // Missing required field
      if (value === undefined || value === null || value === "") {
        issues.push({
          severity: "CRITICAL",
          code: "MISSING_REQUIRED_FIELD",
          user_id: employee.user_id,
          field_name: field.field_name,
          message: `${employee.user_firstname} ${employee.user_lastname} is missing required field: ${field.field_label}`,
          suggested_fix: `Fill "${field.field_label}" in employee payroll profile`
        })
        continue
      }

      // Regex validation
      if (field.validation) {
        try {
          const regex = new RegExp(field.validation)
          if (!regex.test(String(value))) {
            issues.push({
              severity: "CRITICAL",
              code: "INVALID_FIELD_FORMAT",
              user_id: employee.user_id,
              field_name: field.field_name,
              message: `${employee.user_firstname} ${employee.user_lastname} has invalid format for ${field.field_label}`,
              suggested_fix: field.description
            })
          }
        } catch {
          // Ignore invalid regex definitions
        }
      }
    }
  }

  /* -----------------------------------------------
     4. Persist validation run
  ----------------------------------------------- */
  const hasCriticalErrors = issues.some(
    issue => issue.severity === "CRITICAL"
  )

  // CHANGED: Use INSERT instead of UPSERT to allow multiple runs per month
  const { data: run, error: runError } = await supabase
    .from("payroll_validation_runs")
    .insert({
      country_code: ctx.countryCode,
      year: ctx.year,
      month: ctx.month,
      export_format: ctx.exportFormat,
      has_critical_errors: hasCriticalErrors,
      validated_by: ctx.validatedBy,
      validation_name: ctx.validationName || null, // NEW: Optional name
      issue_count: issues.length, // NEW: Track issue count
      validation_status: 'completed' // NEW: Mark as completed
    })
    .select()
    .single()

  if (runError || !run) {
    console.error('Failed to persist payroll_validation_run:', runError)
    throw new Error("Failed to persist payroll validation run")
  }

  /* -----------------------------------------------
     5. Persist validation issues
  ----------------------------------------------- */
  if (issues.length > 0) {
    const records = issues.map(issue => ({
      validation_run_id: run.id,
      ...issue
    }))

    await supabase
      .from("payroll_validation_issues")
      .insert(records)
  }

  /* -----------------------------------------------
     6. Return result
  ----------------------------------------------- */
  return {
    validationRunId: run.id,
    hasCriticalErrors,
    issues
  }
}