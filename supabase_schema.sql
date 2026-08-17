


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."allowance_type" AS ENUM (
    'bonus',
    'remboursement',
    'cafeteria',
    'sport',
    'cadeau',
    'other'
);


ALTER TYPE "public"."allowance_type" OWNER TO "postgres";


CREATE TYPE "public"."deduction_type" AS ENUM (
    'advance_on_salary',
    'loan_repayment',
    'other'
);


ALTER TYPE "public"."deduction_type" OWNER TO "postgres";


CREATE TYPE "public"."tax_treatment" AS ENUM (
    'fully_taxable',
    'non_taxable',
    'partially_taxable',
    'tax_free_under_limit'
);


ALTER TYPE "public"."tax_treatment" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_annual_leave_entitlement"("employment_start_date" "date", "calculation_year" integer) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    years_of_service DECIMAL;
    entitlement INTEGER;
BEGIN
    IF employment_start_date IS NULL THEN
        RETURN 20;
    END IF;

    years_of_service := EXTRACT(YEAR FROM AGE(
        DATE(calculation_year || '-12-31'), 
        employment_start_date
    )) + 
    EXTRACT(MONTH FROM AGE(
        DATE(calculation_year || '-12-31'), 
        employment_start_date
    )) / 12.0;

    entitlement := 20 + FLOOR(years_of_service / 3);

    IF entitlement > 30 THEN
        entitlement := 30;
    END IF;

    RETURN entitlement;
END;
$$;


ALTER FUNCTION "public"."calculate_annual_leave_entitlement"("employment_start_date" "date", "calculation_year" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_time_entry_hours"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.clock_out IS NOT NULL AND NEW.clock_in IS NOT NULL THEN
    -- Calculate total hours
    NEW.total_hours := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600;
    
    -- Calculate regular vs overtime (over 8 hours/day)
    IF NEW.total_hours <= 8 THEN
      NEW.regular_hours := NEW.total_hours;
      NEW.overtime_hours := 0;
    ELSE
      NEW.regular_hours := 8;
      NEW.overtime_hours := NEW.total_hours - 8;
      NEW.is_overtime := true;
    END IF;
    
    -- Check if late (more than 15 min after expected)
    IF NEW.expected_clock_in IS NOT NULL THEN
      IF NEW.clock_in > (NEW.expected_clock_in + INTERVAL '15 minutes') THEN
        NEW.is_late := true;
      END IF;
    END IF;
    
    -- Check if early leave (more than 15 min before expected)
    IF NEW.expected_clock_out IS NOT NULL THEN
      IF NEW.clock_out < (NEW.expected_clock_out - INTERVAL '15 minutes') THEN
        NEW.is_early_leave := true;
      END IF;
    END IF;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_time_entry_hours"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_total_compensation"("p_payroll_id" "uuid", "p_year" integer, "p_month" integer) RETURNS TABLE("base_salary" numeric, "total_allowances" numeric, "taxable_allowances" numeric, "non_taxable_allowances" numeric, "total_deductions" numeric, "gross_total" numeric, "net_before_tax" numeric)
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_base_salary DECIMAL(12, 2);
BEGIN
    -- Get base salary
    SELECT ep.salary_amount INTO v_base_salary
    FROM employee_payroll ep
    WHERE ep.id = p_payroll_id;
    
    -- Calculate allowances
    RETURN QUERY
    SELECT 
        v_base_salary as base_salary,
        
        -- Total allowances for this period
        COALESCE((
            SELECT SUM(amount)
            FROM employee_allowances
            WHERE payroll_id = p_payroll_id
            AND (
                is_recurring = true 
                OR (effective_year = p_year AND effective_month = p_month)
            )
        ), 0) as total_allowances,
        
        -- Taxable allowances
        COALESCE((
            SELECT SUM(amount)
            FROM employee_allowances
            WHERE payroll_id = p_payroll_id
            AND tax_treatment = 'fully_taxable'
            AND (
                is_recurring = true 
                OR (effective_year = p_year AND effective_month = p_month)
            )
        ), 0) as taxable_allowances,
        
        -- Non-taxable allowances
        COALESCE((
            SELECT SUM(amount)
            FROM employee_allowances
            WHERE payroll_id = p_payroll_id
            AND tax_treatment IN ('non_taxable', 'tax_free_under_limit')
            AND (
                is_recurring = true 
                OR (effective_year = p_year AND effective_month = p_month)
            )
        ), 0) as non_taxable_allowances,
        
        -- Total deductions for this period
        COALESCE((
            SELECT SUM(amount)
            FROM employee_deductions
            WHERE payroll_id = p_payroll_id
            AND is_active = true
            AND (
                (start_year < p_year OR (start_year = p_year AND start_month <= p_month))
                AND (end_year IS NULL OR end_year > p_year OR (end_year = p_year AND end_month >= p_month))
            )
        ), 0) as total_deductions,
        
        -- Gross total (before tax, after allowances)
        v_base_salary + COALESCE((
            SELECT SUM(amount)
            FROM employee_allowances
            WHERE payroll_id = p_payroll_id
            AND (
                is_recurring = true 
                OR (effective_year = p_year AND effective_month = p_month)
            )
        ), 0) as gross_total,
        
        -- Net before tax (after deductions, before income tax)
        v_base_salary + COALESCE((
            SELECT SUM(amount)
            FROM employee_allowances
            WHERE payroll_id = p_payroll_id
            AND (
                is_recurring = true 
                OR (effective_year = p_year AND effective_month = p_month)
            )
        ), 0) - COALESCE((
            SELECT SUM(amount)
            FROM employee_deductions
            WHERE payroll_id = p_payroll_id
            AND is_active = true
            AND (
                (start_year < p_year OR (start_year = p_year AND start_month <= p_month))
                AND (end_year IS NULL OR end_year > p_year OR (end_year = p_year AND end_month >= p_month))
            )
        ), 0) as net_before_tax;
END;
$$;


ALTER FUNCTION "public"."calculate_total_compensation"("p_payroll_id" "uuid", "p_year" integer, "p_month" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_total_compensation"("p_payroll_id" "uuid", "p_year" integer, "p_month" integer) IS 'Calculates total compensation including allowances and deductions for a specific period';



CREATE OR REPLACE FUNCTION "public"."calculate_working_days"("start_date" "date", "end_date" "date") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    total_days INTEGER;
    weekend_days INTEGER;
    working_days DECIMAL(4,1);
BEGIN
    total_days := end_date - start_date + 1;
    weekend_days := (
        SELECT COUNT(*)
        FROM generate_series(start_date, end_date, '1 day'::interval) AS date_series
        WHERE EXTRACT(DOW FROM date_series) IN (0, 6)
    );
    working_days := total_days - weekend_days;
    IF working_days < 0.5 THEN
        working_days := 0.5;
    END IF;
    RETURN working_days;
END;
$$;


ALTER FUNCTION "public"."calculate_working_days"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_happy_check"("p_company_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
declare
  access boolean;
begin
  select f.access_happy_check
  into access
  from company c
  join forfait f on c.forfait = f.forfait_name
  where c.id = p_company_id;

  return access;
end;
$$;


ALTER FUNCTION "public"."can_access_happy_check"("p_company_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_add_medical_certificate"("p_company_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$declare
  max_allowed int;
  current_count int;
begin
  -- Récupérer le nombre max autorisé par le forfait de l'entreprise
  select f.max_medical_certificates
  into max_allowed
  from company c
  join forfait f on c.forfait = f.forfait_name
  where c.id = p_company_id;

  -- Compter le nombre de certificats médicaux créés ce mois-ci pour cette entreprise
  select count(*)
  into current_count
  from medical_certificates mc
  where mc.company_id = p_company_id
    and mc.created_at >= date_trunc('month', current_date)
    and mc.created_at < date_trunc('month', current_date) + interval '1 month';

  -- Comparer et retourner le résultat
  if current_count < max_allowed then
    return true;
  else
    return false;
  end if;
end;$$;


ALTER FUNCTION "public"."can_add_medical_certificate"("p_company_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_open_new_position"("p_company_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
declare
  max_allowed int;
  current_opened int;
begin
  -- Récupérer le nombre max autorisé par le forfait de l'entreprise
  select f.max_opened_position
  into max_allowed
  from company c
  join forfait f on c.forfait = f.forfait_name
  where c.id = p_company_id;

  -- Compter les positions actuellement ouvertes
  select count(*)
  into current_opened
  from openedpositions op
  where op.company_id = p_company_id
    and (op.position_end_date is null or op.position_end_date > now());

  -- Comparer et retourner le résultat
  if current_opened < max_allowed then
    return true;
  else
    return false;
  end if;
end;
$$;


ALTER FUNCTION "public"."can_open_new_position"("p_company_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_certificate_date_alignment"("leave_request_id_param" "uuid") RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSON;
    cert_record RECORD;
    leave_record RECORD;
BEGIN
    -- Get leave request
    SELECT * INTO leave_record
    FROM leave_requests
    WHERE id = leave_request_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Leave request not found');
    END IF;
    
    -- Get linked certificate
    SELECT * INTO cert_record
    FROM medical_certificates
    WHERE leave_request_id = leave_request_id_param
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'has_certificate', false,
            'aligned', null
        );
    END IF;
    
    -- Check alignment
    RETURN json_build_object(
        'has_certificate', true,
        'aligned', (
            cert_record.absence_start_date::date = leave_record.start_date AND
            cert_record.absence_end_date::date = leave_record.end_date
        ),
        'certificate_start', cert_record.absence_start_date,
        'certificate_end', cert_record.absence_end_date,
        'leave_start', leave_record.start_date,
        'leave_end', leave_record.end_date
    );
END;
$$;


ALTER FUNCTION "public"."check_certificate_date_alignment"("leave_request_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_overlapping_leaves"("user_id_param" "uuid", "year_param" integer) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(
        json_build_object(
            'date', overlap_date,
            'request_ids', request_ids
        )
    ), '[]'::json) INTO result
    FROM (
        SELECT 
            date_series.date AS overlap_date,
            array_agg(DISTINCT lr.id) AS request_ids
        FROM leave_requests lr
        CROSS JOIN LATERAL generate_series(
            lr.start_date,
            lr.end_date,
            '1 day'::interval
        ) AS date_series(date)
        WHERE lr.user_id = user_id_param
        AND EXTRACT(YEAR FROM date_series.date) = year_param
        AND lr.status IN ('approved', 'pending')
        GROUP BY date_series.date
        HAVING COUNT(DISTINCT lr.id) > 1
    ) AS overlap_data;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."check_overlapping_leaves"("user_id_param" "uuid", "year_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrease_ai_credit"("company_id_input" integer, "credits_input" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update company
  set used_ai_credit = used_ai_credit - credits_input
  where id = company_id_input;
end;
$$;


ALTER FUNCTION "public"."decrease_ai_credit"("company_id_input" integer, "credits_input" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_attendance_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") RETURNS TABLE("total_days_worked" integer, "total_hours" numeric, "regular_hours" numeric, "overtime_hours" numeric, "late_days" integer, "early_leaves" integer, "perfect_attendance_days" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT DATE(clock_in))::INTEGER,
    COALESCE(SUM(te.total_hours), 0),
    COALESCE(SUM(te.regular_hours), 0),
    COALESCE(SUM(te.overtime_hours), 0),
    COUNT(*) FILTER (WHERE te.is_late = true)::INTEGER,
    COUNT(*) FILTER (WHERE te.is_early_leave = true)::INTEGER,
    COUNT(*) FILTER (WHERE te.is_late = false AND te.is_early_leave = false)::INTEGER
  FROM time_entries te
  WHERE te.user_id = p_user_id
    AND DATE(te.clock_in) BETWEEN p_start_date AND p_end_date
    AND te.clock_out IS NOT NULL;
END;
$$;


ALTER FUNCTION "public"."get_attendance_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_calendar_data"("user_id_param" "uuid", "year_param" integer) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
BEGIN
    -- Verify access
    IF auth.uid() != user_id_param THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    SELECT json_build_object(
        'leave_requests', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', lr.id,
                    'leave_type_id', lr.leave_type_id,
                    'leave_type_name', lt.name,
                    'leave_type_name_hu', lt.name_hu,
                    'leave_type_color', lt.color,
                    'start_date', lr.start_date,
                    'end_date', lr.end_date,
                    'total_days', lr.total_days,
                    'status', lr.status,
                    'reason', lr.reason
                )
            ), '[]'::json)
            FROM leave_requests lr
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE lr.user_id = user_id_param
            AND EXTRACT(YEAR FROM lr.start_date) = year_param
            AND lr.status IN ('approved', 'pending')
        ),
        'leave_balances', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'leave_type_id', lb.leave_type_id,
                    'leave_type_name', lt.name,
                    'leave_type_name_hu', lt.name_hu,
                    'leave_type_color', lt.color,
                    'total_days', lb.total_days,
                    'used_days', lb.used_days,
                    'pending_days', lb.pending_days,
                    'remaining_days', lb.remaining_days
                )
            ), '[]'::json)
            FROM leave_balances lb
            JOIN leave_types lt ON lb.leave_type_id = lt.id
            WHERE lb.user_id = user_id_param
            AND lb.year = year_param
        )
    ) INTO result;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_calendar_data"("user_id_param" "uuid", "year_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_candidates"("user_uuid" "uuid") RETURNS TABLE("id" integer, "candidat_firstname" "text", "candidat_lastname" "text", "cv_text" "text", "cv_file" "text", "created_at" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    c.id,
    c.candidat_firstname,
    c.candidat_lastname,
    c.cv_text,
    c.cv_file,
    c.created_at::text
  FROM candidats c
  WHERE EXISTS (
    SELECT 1
    FROM position_to_candidat ptc
    JOIN openedpositions op ON ptc.position_id = op.id
    JOIN company_to_users ctu ON op.company_id = ctu.company_id
    WHERE ptc.candidat_id = c.id
      AND ctu.user_id = user_uuid
  )
  ORDER BY c.created_at DESC;
$$;


ALTER FUNCTION "public"."get_company_candidates"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_users"("company_id_input" integer) RETURNS TABLE("user_id" "uuid", "first_name" "text", "last_name" "text", "email" "text", "is_admin" boolean, "is_super_admin" boolean, "is_manager" boolean, "manager_id" "uuid", "manager_first_name" "text", "manager_last_name" "text", "employment_start_date" "date", "is_active" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT
      au.id AS user_id,
      u.user_firstname::TEXT AS first_name,
      u.user_lastname::TEXT AS last_name,
      au.email::TEXT AS email,
      u.is_admin,
      COALESCE(u.is_super_admin, FALSE) AS is_super_admin,
      u.is_manager,
      up.manager_id,
      mu.user_firstname::TEXT AS manager_first_name,
      mu.user_lastname::TEXT AS manager_last_name,
      up.employment_start_date,
      COALESCE(ctu.is_active, true) as is_active
  FROM company_to_users ctu
  JOIN users u ON u.id = ctu.user_id
  JOIN auth.users au ON au.id = u.id
  LEFT JOIN user_profiles up ON up.user_id = u.id
  LEFT JOIN users mu ON mu.id = up.manager_id
  WHERE ctu.company_id = company_id_input;
END;
$$;


ALTER FUNCTION "public"."get_company_users"("company_id_input" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_company_users_v2"("company_id_input" integer) RETURNS TABLE("user_id" "uuid", "first_name" character varying, "last_name" character varying, "email" character varying, "is_admin" boolean, "is_super_admin" boolean, "is_manager" boolean, "is_active" boolean, "manager_id" "uuid", "manager_first_name" character varying, "manager_last_name" character varying, "employment_start_date" "date")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.email,
        ctu.is_admin,
        ctu.is_super_admin,
        ctu.is_manager,
        ctu.is_active,
        ctu.manager_id,
        m.first_name AS manager_first_name,
        m.last_name AS manager_last_name,
        ctu.employment_start_date
    FROM 
        company_to_users ctu
    INNER JOIN 
        users u ON ctu.user_id = u.id
    LEFT JOIN 
        users m ON ctu.manager_id = m.id
    WHERE 
        ctu.company_id = company_id_input
    ORDER BY 
        u.first_name, u.last_name;
END;
$$;


ALTER FUNCTION "public"."get_company_users_v2"("company_id_input" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_quarter"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_month INTEGER;
  current_year INTEGER;
  quarter_num INTEGER;
BEGIN
  current_month := EXTRACT(MONTH FROM CURRENT_DATE);
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  quarter_num := CEIL(current_month / 3.0);
  
  RETURN 'Q' || quarter_num || ' ' || current_year;
END;
$$;


ALTER FUNCTION "public"."get_current_quarter"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_leave_request_by_medical_cert"("cert_id" integer) RETURNS TABLE("id" "uuid", "medical_certificate_id" integer, "user_id" "uuid", "status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT lr.id, lr.medical_certificate_id, lr.user_id, lr.status::text
  FROM leave_requests lr
  WHERE lr.medical_certificate_id = cert_id;
END;
$$;


ALTER FUNCTION "public"."get_leave_request_by_medical_cert"("cert_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_manager_pending_approvals"("manager_id_param" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    RETURN (
        SELECT json_agg(row_to_json(t))
        FROM (
            SELECT 
                lr.id,
                lr.user_id,
                au.raw_user_meta_data->>'full_name' AS employee_name,
                au.email AS employee_email,
                lt.name AS leave_type_name,
                lt.name_hu AS leave_type_name_hu,
                lt.color AS leave_type_color,
                lr.start_date,
                lr.end_date,
                lr.total_days,
                lr.reason,
                lr.created_at,
                lr.medical_certificate_id,
                mc.certificate_file
            FROM leave_requests lr
            JOIN auth.users au ON lr.user_id = au.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            LEFT JOIN medical_certificates mc ON lr.medical_certificate_id = mc.id
            WHERE lr.manager_id = manager_id_param
              AND lr.status = 'pending'
            ORDER BY lr.created_at ASC
        ) t
    );
END;$$;


ALTER FUNCTION "public"."get_manager_pending_approvals"("manager_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_payroll_for_period"("p_country_code" character varying, "p_year" integer, "p_month" integer) RETURNS TABLE("user_id" "uuid", "user_firstname" "text", "user_lastname" "text", "employment_type" character varying, "contract_type" character varying, "position_title" character varying, "department" character varying, "salary_amount" numeric, "salary_currency" character varying, "bank_account_iban" character varying, "bank_name" character varying, "country_specific_data" "jsonb", "benefits" "jsonb", "weekly_hours" numeric, "worked_days" integer, "leave_days" integer)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_days_in_month INTEGER;
    v_month_start DATE;
    v_month_end DATE;
BEGIN
    -- Calculate the first and last day of the month
    v_month_start := MAKE_DATE(p_year, p_month, 1);
    v_month_end := (v_month_start + INTERVAL '1 month - 1 day')::DATE;
    
    -- Calculate days in the specified month
    v_days_in_month := EXTRACT(DAY FROM v_month_end);

    RETURN QUERY
    SELECT 
        ep.user_id,
        u.user_firstname,
        u.user_lastname,
        ep.employment_type,
        ep.contract_type,
        ep.position_title,
        ep.department,
        ep.salary_amount,
        ep.salary_currency,
        ep.bank_account_iban,
        ep.bank_name,
        ep.country_specific_data,
        ep.benefits,
        ep.weekly_hours,
        -- Calculate actual worked days based on contract dates
        CASE
            -- Employee started during this month (after month start)
            WHEN ep.contract_start_date > v_month_start AND ep.contract_start_date <= v_month_end THEN
                (v_month_end - ep.contract_start_date + 1)::INTEGER
            -- Employee ended during this month (before month end)
            WHEN ep.contract_end_date IS NOT NULL AND ep.contract_end_date >= v_month_start AND ep.contract_end_date < v_month_end THEN
                (ep.contract_end_date - v_month_start + 1)::INTEGER
            -- Employee was active for the full month
            ELSE v_days_in_month
        END as worked_days,
        -- Calculate leave days from leave_requests table
        COALESCE(
            (SELECT SUM(
                CASE 
                    WHEN lr.end_date >= v_month_start 
                        AND lr.start_date <= v_month_end
                    THEN 
                        -- Calculate overlap days between leave request and the month
                        (LEAST(lr.end_date, v_month_end) - GREATEST(lr.start_date, v_month_start) + 1)::INTEGER
                    ELSE 0
                END
            )::INTEGER
             FROM public.leave_requests lr
             WHERE lr.user_id = ep.user_id
             AND lr.status = 'approved'
             AND lr.end_date >= v_month_start
             AND lr.start_date <= v_month_end),
            0
        ) as leave_days
    FROM public.employee_payroll ep
    INNER JOIN public.users u ON ep.user_id = u.id
    WHERE ep.country_code = p_country_code
    AND ep.is_active = true
    -- Only include employees whose contract overlaps with the export month
    AND ep.contract_start_date <= v_month_end  -- Contract started before or during the month
    AND (ep.contract_end_date IS NULL OR ep.contract_end_date >= v_month_start);  -- Contract hasn't ended, or ended during/after the month
END;
$$;


ALTER FUNCTION "public"."get_payroll_for_period"("p_country_code" character varying, "p_year" integer, "p_month" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_payroll_for_period"("p_country_code" character varying, "p_year" integer, "p_month" integer) IS 'Retrieves payroll data for a specific country and month/year. Only includes employees whose contract was active during the specified period. Calculates worked days based on contract start/end dates within the month.';



CREATE OR REPLACE FUNCTION "public"."get_payroll_for_period_with_compensation"("p_country_code" character varying, "p_year" integer, "p_month" integer) RETURNS TABLE("id" "uuid", "user_id" "uuid", "user_firstname" character varying, "user_lastname" character varying, "country_code" character varying, "employment_type" character varying, "contract_type" character varying, "contract_start_date" "date", "contract_end_date" "date", "position_title" character varying, "department" character varying, "work_location" character varying, "weekly_hours" numeric, "salary_amount" numeric, "salary_currency" character varying, "salary_period" character varying, "payment_method" character varying, "bank_account_iban" character varying, "bank_name" character varying, "country_specific_data" "jsonb", "benefits" "jsonb", "is_active" boolean, "worked_days" integer, "leave_days" integer, "actual_worked_days" integer, "total_allowances" numeric, "taxable_allowances" numeric, "non_taxable_allowances" numeric, "total_deductions" numeric, "gross_total" numeric, "net_before_tax" numeric, "allowances_detail" "jsonb", "deductions_detail" "jsonb")
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_month_start DATE := make_date(p_year, p_month, 1);
    v_month_end DATE := (v_month_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
BEGIN
    RETURN QUERY
    SELECT 
        ep.id,
        ep.user_id,
        u.user_firstname::VARCHAR,
        u.user_lastname::VARCHAR,
        ep.country_code,
        ep.employment_type::VARCHAR,
        ep.contract_type::VARCHAR,
        ep.contract_start_date,
        ep.contract_end_date,
        ep.position_title,
        ep.department,
        ep.work_location,
        ep.weekly_hours,
        ep.salary_amount,
        ep.salary_currency,
        ep.salary_period::VARCHAR,
        ep.payment_method::VARCHAR,
        ep.bank_account_iban,
        ep.bank_name,
        ep.country_specific_data,
        ep.benefits,
        ep.is_active,

        -- Worked days
        CASE 
            WHEN ep.contract_start_date > v_month_start THEN (v_month_end - ep.contract_start_date + 1)::INTEGER
            WHEN ep.contract_end_date IS NOT NULL AND ep.contract_end_date < v_month_end THEN (ep.contract_end_date - v_month_start + 1)::INTEGER
            ELSE EXTRACT(DAY FROM v_month_end)::INTEGER
        END as worked_days,

        -- Leave days
        COALESCE((
            SELECT SUM(
                (LEAST(lr.end_date, v_month_end) - GREATEST(lr.start_date, v_month_start) + 1)::INTEGER
            )::INTEGER
            FROM leave_requests lr
            WHERE lr.user_id = ep.user_id
            AND lr.status = 'approved'
            AND lr.start_date <= v_month_end
            AND lr.end_date >= v_month_start
        ), 0) as leave_days,

        -- Actual worked days
        (CASE 
            WHEN ep.contract_start_date > v_month_start THEN (v_month_end - ep.contract_start_date + 1)::INTEGER
            WHEN ep.contract_end_date IS NOT NULL AND ep.contract_end_date < v_month_end THEN (ep.contract_end_date - v_month_start + 1)::INTEGER
            ELSE EXTRACT(DAY FROM v_month_end)::INTEGER
        END - COALESCE((
            SELECT SUM(
                (LEAST(lr.end_date, v_month_end) - GREATEST(lr.start_date, v_month_start) + 1)::INTEGER
            )::INTEGER
            FROM leave_requests lr
            WHERE lr.user_id = ep.user_id
            AND lr.status = 'approved'
            AND lr.start_date <= v_month_end
            AND lr.end_date >= v_month_start
        ), 0))::INTEGER as actual_worked_days,

        -- Compensation: LATERAL join to avoid multiple subquery calls
        comp.total_allowances,
        comp.taxable_allowances,
        comp.non_taxable_allowances,
        comp.total_deductions,
        comp.gross_total,
        comp.net_before_tax,

        -- Allowances detail as JSON
        COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'type', ea.allowance_type,
                'amount', ea.amount,
                'currency', ea.currency,
                'tax_treatment', ea.tax_treatment,
                'description', ea.description,
                'is_recurring', ea.is_recurring
            ))
            FROM employee_allowances ea
            WHERE ea.payroll_id = ep.id
            AND (
                ea.is_recurring = true OR (ea.effective_year = p_year AND ea.effective_month = p_month)
            )
        ), '[]'::jsonb) as allowances_detail,

        -- Deductions detail as JSON
        COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'type', ed.deduction_type,
                'amount', ed.amount,
                'currency', ed.currency,
                'description', ed.description,
                'remaining_amount', ed.remaining_amount,
                'installments_remaining', ed.installments_remaining
            ))
            FROM employee_deductions ed
            WHERE ed.payroll_id = ep.id
            AND ed.is_active = true
            AND (
                (ed.start_year < p_year OR (ed.start_year = p_year AND ed.start_month <= p_month))
                AND (ed.end_year IS NULL OR ed.end_year > p_year OR (ed.end_year = p_year AND ed.end_month >= p_month))
            )
        ), '[]'::jsonb) as deductions_detail

    FROM employee_payroll ep
    INNER JOIN users u ON ep.user_id = u.id
    LEFT JOIN LATERAL calculate_total_compensation(ep.id, p_year, p_month) comp ON true
    WHERE ep.country_code = p_country_code
    AND ep.contract_start_date <= v_month_end
    AND (ep.contract_end_date IS NULL OR ep.contract_end_date >= v_month_start);
END;
$$;


ALTER FUNCTION "public"."get_payroll_for_period_with_compensation"("p_country_code" character varying, "p_year" integer, "p_month" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pending_certificates"("company_id_param" bigint DEFAULT NULL::bigint) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user is admin/HR
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND (is_admin = true OR is_super_admin = true)
    ) THEN
        RAISE EXCEPTION 'Access denied: HR role required';
    END IF;
    
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', mc.id,
            'employee_name', mc.employee_name,
            'absence_start_date', mc.absence_start_date,
            'absence_end_date', mc.absence_end_date,
            'employee_comment', mc.employee_comment,
            'certificate_file', mc.certificate_file,
            'created_at', mc.created_at,
            'leave_request_id', mc.leave_request_id,
            'leave_request_status', lr.status,
            'leave_type', lt.name_hu,
            'dates_match', (
                mc.absence_start_date::date = lr.start_date AND
                mc.absence_end_date::date = lr.end_date
            )
        ) ORDER BY mc.created_at ASC
    ), '[]'::json) INTO result
    FROM medical_certificates mc
    LEFT JOIN leave_requests lr ON mc.leave_request_id = lr.id
    LEFT JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE 
        mc.treated = false
        AND (company_id_param IS NULL OR mc.company_id = company_id_param);
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_pending_certificates"("company_id_param" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_period_status"("p_country_code" character varying, "p_year" integer, "p_month" integer) RETURNS TABLE("status" character varying, "closed_at" timestamp with time zone, "closed_by" "uuid", "closed_by_name" "text", "closed_reason" "text", "reopened_at" timestamp with time zone, "reopened_by" "uuid", "reopened_by_name" "text", "reopen_reason" "text", "last_export_id" "uuid")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(pc.status, 'open') as status,
        pc.closed_at,
        pc.closed_by,
        CASE 
            WHEN pc.closed_by IS NOT NULL 
            THEN (SELECT user_firstname || ' ' || user_lastname FROM users WHERE id = pc.closed_by)
            ELSE NULL
        END as closed_by_name,
        pc.closed_reason,
        pc.reopened_at,
        pc.reopened_by,
        CASE 
            WHEN pc.reopened_by IS NOT NULL 
            THEN (SELECT user_firstname || ' ' || user_lastname FROM users WHERE id = pc.reopened_by)
            ELSE NULL
        END as reopened_by_name,
        pc.reopen_reason,
        pc.last_export_id
    FROM public.payroll_period_closures pc
    WHERE pc.country_code = p_country_code
      AND pc.year = p_year
      AND pc.month = p_month;
    
    -- If no record found, return default 'open' status
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            'open'::VARCHAR(20), 
            NULL::TIMESTAMP WITH TIME ZONE,
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::TIMESTAMP WITH TIME ZONE,
            NULL::UUID,
            NULL::TEXT,
            NULL::TEXT,
            NULL::UUID;
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_period_status"("p_country_code" character varying, "p_year" integer, "p_month" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_period_status"("p_country_code" character varying, "p_year" integer, "p_month" integer) IS 'Returns detailed status information for a specific payroll period including closure/reopen history';



CREATE OR REPLACE FUNCTION "public"."get_recruitment_steps_for_user"("user_id" "uuid") RETURNS TABLE("step_id" bigint, "step_name" "text")
    LANGUAGE "sql"
    SET "search_path" TO 'public'
    AS $$
  select rs.id as step_id,
         rs.step_name
  from recruitment_steps rs
  join company_steps cs 
    on cs.step_id = rs.id
  join company_to_users ctu
    on ctu.company_id = cs.company_id
  where ctu.user_id = user_id
  group by rs.id, rs.step_name
  order by min(cs.step_order) asc;
$$;


ALTER FUNCTION "public"."get_recruitment_steps_for_user"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_calendar_data"("manager_id_param" "uuid", "year_param" integer) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
    team_size INTEGER;
BEGIN
    -- Count direct reports
    SELECT COUNT(*) INTO team_size
    FROM user_profiles up
    WHERE up.manager_id = manager_id_param;
    
    -- Return empty if no team
    IF team_size = 0 THEN
        RETURN json_build_object(
            'team_size', 0,
            'team_leaves', '[]'::json
        );
    END IF;
    
    SELECT json_build_object(
        'team_size', team_size,
        'team_leaves', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', lr.id,
                    'user_id', lr.user_id,
                    'employee_name', COALESCE(u.user_firstname || ' ' || u.user_lastname, au.email),
                    'leave_type_name', lt.name,
                    'leave_type_name_hu', lt.name_hu,
                    'leave_type_color', lt.color,
                    'start_date', lr.start_date,
                    'end_date', lr.end_date,
                    'status', lr.status
                )
            ), '[]'::json)
            FROM leave_requests lr
            JOIN user_profiles up ON lr.user_id = up.user_id
            JOIN public.users u ON lr.user_id = u.id
            JOIN auth.users au ON lr.user_id = au.id
            JOIN leave_types lt ON lr.leave_type_id = lt.id
            WHERE up.manager_id = manager_id_param
            AND EXTRACT(YEAR FROM lr.start_date) = year_param
            AND lr.status IN ('approved', 'pending')
            AND (
                -- Only count if user was employed during the leave period
                up.employment_start_date IS NULL 
                OR up.employment_start_date <= lr.end_date
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_team_calendar_data"("manager_id_param" "uuid", "year_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_members_by_manager"("manager_uuid" "uuid") RETURNS TABLE("user_id" "uuid", "first_name" "text", "last_name" "text", "manager_id" "uuid")
    LANGUAGE "sql"
    AS $$
    select 
        up.user_id,
        u.user_firstname as first_name,
        u.user_lastname as last_name,
        up.manager_id
    from user_profiles up
    join users u on up.user_id = u.id
    where up.manager_id = manager_uuid;
$$;


ALTER FUNCTION "public"."get_team_members_by_manager"("manager_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_ticket_stats"("company_id_param" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'open', COUNT(*) FILTER (WHERE status = 'open'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
    'closed', COUNT(*) FILTER (WHERE status = 'closed'),
    'high_priority', COUNT(*) FILTER (WHERE priority IN ('high', 'urgent')),
    'avg_resolution_time_hours', 
    COALESCE(
      EXTRACT(EPOCH FROM AVG(resolved_at - created_at))/3600,
      0
    )
  )
  INTO result
  FROM tickets 
  WHERE company_id = company_id_param;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_ticket_stats"("company_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_leave_overview"("user_id_param" "uuid", "year_param" integer DEFAULT EXTRACT(year FROM "now"())) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
    balances_json JSON;
    requests_json JSON;
BEGIN
    -- Verify the user is requesting their own data or is a manager
    IF auth.uid() != user_id_param AND NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = user_id_param 
        AND manager_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    -- Initialize balances for the user if they don't exist
    PERFORM initialize_user_leave_balances(user_id_param, year_param);
    
    -- Get balances
    SELECT COALESCE(json_agg(
        json_build_object(
            'leave_type_id', lb.leave_type_id,
            'leave_type_name', lt.name,
            'leave_type_name_hu', lt.name_hu,
            'leave_type_color', lt.color,
            'total_days', lb.total_days,
            'used_days', lb.used_days,
            'pending_days', lb.pending_days,
            'remaining_days', lb.remaining_days
        ) ORDER BY 
            CASE lt.name 
                WHEN 'Annual Leave' THEN 1
                WHEN 'Sick Leave (Self-reported)' THEN 2
                WHEN 'Sick Leave (Medical Certificate)' THEN 3
                ELSE 4
            END
    ), '[]'::json) INTO balances_json
    FROM leave_balances lb
    JOIN leave_types lt ON lb.leave_type_id = lt.id
    WHERE lb.user_id = user_id_param AND lb.year = year_param;
    
    -- Get recent requests with certificate info
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', lr.id,
            'leave_type_name', lt.name,
            'leave_type_name_hu', lt.name_hu,
            'leave_type_color', lt.color,
            'start_date', lr.start_date,
            'end_date', lr.end_date,
            'total_days', lr.total_days,
            'status', lr.status,
            'reason', lr.reason,
            'created_at', lr.created_at,
            'reviewed_at', lr.reviewed_at,
            'review_notes', lr.review_notes,
            'is_medical_confirmed', lr.is_medical_confirmed,
            'hr_validated', lr.hr_validated,
            'has_certificate', EXISTS(
                SELECT 1 FROM medical_certificates mc 
                WHERE mc.leave_request_id = lr.id
            ),
            'certificate_treated', (
                SELECT mc.treated FROM medical_certificates mc 
                WHERE mc.leave_request_id = lr.id 
                LIMIT 1
            )
        ) ORDER BY lr.created_at DESC
    ), '[]'::json) INTO requests_json
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    WHERE lr.user_id = user_id_param 
    LIMIT 10;
    
    -- Build final result
    SELECT json_build_object(
        'balances', balances_json,
        'recent_requests', requests_json
    ) INTO result;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_user_leave_overview"("user_id_param" "uuid", "year_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_manager"("user_id_param" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    manager_id UUID;
BEGIN
    SELECT up.manager_id INTO manager_id
    FROM user_profiles up
    WHERE up.user_id = user_id_param;
    RETURN manager_id;
END;
$$;


ALTER FUNCTION "public"."get_user_manager"("user_id_param" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_week_start"() RETURNS "date"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN CURRENT_DATE - (EXTRACT(DOW FROM CURRENT_DATE)::INTEGER - 1);
END;
$$;


ALTER FUNCTION "public"."get_week_start"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_pulse_this_week"("p_goal_id" "uuid", "p_employee_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  week_start DATE;
  pulse_count INTEGER;
BEGIN
  week_start := get_week_start();
  
  SELECT COUNT(*) INTO pulse_count
  FROM goal_updates
  WHERE goal_id = p_goal_id
    AND employee_id = p_employee_id
    AND week_start_date = week_start;
  
  RETURN pulse_count > 0;
END;
$$;


ALTER FUNCTION "public"."has_pulse_this_week"("p_goal_id" "uuid", "p_employee_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_user_leave_balances"("user_id_param" "uuid", "year_param" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_employment_date DATE;
    balance_exists BOOLEAN;
BEGIN
    -- Check if balances already exist for this user/year
    SELECT EXISTS(
        SELECT 1 FROM leave_balances 
        WHERE user_id = user_id_param AND year = year_param
    ) INTO balance_exists;
    
    -- Only initialize if no balances exist
    IF NOT balance_exists THEN
        SELECT employment_start_date INTO user_employment_date
        FROM user_profiles 
        WHERE user_id = user_id_param;
        
        INSERT INTO leave_balances (user_id, leave_type_id, year, total_days)
        SELECT 
            user_id_param,
            lt.id,
            year_param,
            CASE 
                WHEN lt.name = 'Annual Leave' THEN calculate_annual_leave_entitlement(user_employment_date, year_param)
                WHEN lt.name = 'Sick Leave (Self-reported)' THEN 3
                WHEN lt.name = 'Sick Leave (Medical Certificate)' THEN 999
                WHEN lt.name = 'Study Leave' THEN 999
                ELSE COALESCE(lt.max_days_per_year, 999)
            END
        FROM leave_types lt;
    END IF;
END;
$$;


ALTER FUNCTION "public"."initialize_user_leave_balances"("user_id_param" "uuid", "year_param" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_period_closed"("p_country_code" character varying, "p_year" integer, "p_month" integer) RETURNS boolean
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_status VARCHAR(20);
BEGIN
    SELECT status INTO v_status
    FROM public.payroll_period_closures
    WHERE country_code = p_country_code
      AND year = p_year
      AND month = p_month;
    
    -- If no record exists, period is open
    IF v_status IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Period is closed only if status is 'closed'
    RETURN (v_status = 'closed');
END;
$$;


ALTER FUNCTION "public"."is_period_closed"("p_country_code" character varying, "p_year" integer, "p_month" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_period_closed"("p_country_code" character varying, "p_year" integer, "p_month" integer) IS 'Returns TRUE if the specified period is currently closed, FALSE otherwise';



CREATE OR REPLACE FUNCTION "public"."nightly_cleanup"() RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$DECLARE
    v_step TEXT;
    v_demo_company_id CONSTANT INTEGER := 6;
BEGIN
    -- Log batch start
    INSERT INTO night_batch_log (step_name, status)
    VALUES ('Nightly Cleanup - START', 'RUNNING');

    --------------------------------------------------------------------------
    -- Step 1: Delete candidats linked to demo company
    --------------------------------------------------------------------------
    v_step := 'DELETE candidats (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM candidats
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1
              FROM position_to_candidat ptc
              JOIN openedpositions op ON ptc.position_id = op.id
              WHERE op.company_id = v_demo_company_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 2: Delete openedpositions
    --------------------------------------------------------------------------
    v_step := 'DELETE openedpositions (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM openedpositions
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND company_id = v_demo_company_id;
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 3: Delete happiness_sessions
    --------------------------------------------------------------------------
    v_step := 'DELETE happiness_sessions (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM happiness_sessions
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND company_id = v_demo_company_id;
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 4: Delete medical_certificates
    --------------------------------------------------------------------------
    v_step := 'DELETE medical_certificates';
    BEGIN
        DELETE FROM medical_certificates
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day');
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 5: attendance_exceptions
    --------------------------------------------------------------------------
    v_step := 'DELETE attendance_exceptions (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM attendance_exceptions ae
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = ae.user_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 6: interviews
    --------------------------------------------------------------------------
    v_step := 'DELETE interviews (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM interviews
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1
              FROM position_to_candidat ptc
              JOIN openedpositions op ON ptc.position_id = op.id
              WHERE op.company_id = v_demo_company_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 7: leave_balances
    --------------------------------------------------------------------------
    v_step := 'DELETE leave_balances (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM leave_balances lb
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = lb.user_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 8: notifications
    --------------------------------------------------------------------------
    v_step := 'DELETE notifications (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM notifications n
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = n.sender_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 9: leave_requests
    --------------------------------------------------------------------------
    v_step := 'DELETE leave_requests (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM leave_requests lr
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = lr.user_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 10: goal_updates
    --------------------------------------------------------------------------
    v_step := 'DELETE goal_updates (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM goal_updates gu
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = gu.employee_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 11: performance_goals
    --------------------------------------------------------------------------
    v_step := 'DELETE performance_goals (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM performance_goals pg
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = pg.employee_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 12: tickets
    --------------------------------------------------------------------------
    v_step := 'DELETE tickets (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM tickets t
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = t.user_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 13: time_entries
    --------------------------------------------------------------------------
    v_step := 'DELETE time_entries (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM time_entries te
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = te.user_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 14: user_profiles
    --------------------------------------------------------------------------
    v_step := 'DELETE user_profiles (company ' || v_demo_company_id || ')';
    BEGIN
        DELETE FROM user_profiles up
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = up.user_id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 15: auth.users (safe deletion via Supabase function)
    --------------------------------------------------------------------------
    v_step := 'DELETE auth.users (company ' || v_demo_company_id || ')';
    BEGIN
        PERFORM auth.admin_delete_user(u.id)
        FROM auth.users u
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1 FROM company_to_users ctu
              WHERE ctu.company_id = v_demo_company_id
              AND ctu.user_id = u.id
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 16a: Delete files from 'cvs'
    --------------------------------------------------------------------------
    v_step := 'DELETE storage.objects (cvs)';
    BEGIN
        DELETE FROM storage.objects
        WHERE bucket_id = 'cvs'
          AND created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND created_at::date <> DATE '2025-09-20';
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Step 16b: Delete files from 'medical-certificates' subfolder
    --------------------------------------------------------------------------
    v_step := 'DELETE storage.objects (medical-certificates, /' || v_demo_company_id || '/)';
    BEGIN
        DELETE FROM storage.objects
        WHERE bucket_id = 'medical-certificates'
          AND created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND name LIKE '%/' || v_demo_company_id || '/%';
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    --------------------------------------------------------------------------
    -- Final steps
    --------------------------------------------------------------------------
    -- Clean old logs
    v_step := 'DELETE night_batch_log (older than 90 days)';
    BEGIN
        DELETE FROM night_batch_log
        WHERE created_at < NOW() - INTERVAL '90 days';
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    -- Log batch end
    INSERT INTO night_batch_log (step_name, status)
    VALUES ('Nightly Cleanup - END', 'SUCCESS');

END;$$;


ALTER FUNCTION "public"."nightly_cleanup"() OWNER TO "postgres";


CREATE PROCEDURE "public"."nightly_cleanup_demo"()
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_step TEXT;
BEGIN
    -- Step 1: Delete candidats linked to company_id = 6
    v_step := 'DELETE candidats (company 6)';
    BEGIN
        DELETE FROM candidats
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND EXISTS (
              SELECT 1
              FROM position_to_candidat ptc
              JOIN openedpositions op ON ptc.position_id = op.id
              JOIN company_to_users ctu ON op.company_id = ctu.company_id
              WHERE op.company_id = 6
          );
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    -- Step 2: Delete openedpositions for company_id = 6
    v_step := 'DELETE openedpositions (company 6)';
    BEGIN
        DELETE FROM openedpositions
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND company_id = 6;
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    -- Step 3: Delete happiness_sessions
    v_step := 'DELETE happiness_sessions (company 6)';
    BEGIN
        DELETE FROM happiness_sessions
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND company_id = 6;
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    -- Step 4: Delete medical_certificates
    v_step := 'DELETE medical_certificates';
    BEGIN
        DELETE FROM medical_certificates
        WHERE created_at::date = (CURRENT_DATE - INTERVAL '1 day');
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    -- Step 5a: Delete files from 'cvs'
    v_step := 'DELETE storage.objects (cvs)';
    BEGIN
        DELETE FROM storage.objects
        WHERE bucket_id = 'cvs'
          AND created_at::date = (CURRENT_DATE - INTERVAL '1 day');
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

    -- Step 5b: Delete files from 'medical-certificates' in subfolder '6'
    v_step := 'DELETE storage.objects (medical-certificates, /6/)';
    BEGIN
        DELETE FROM storage.objects
        WHERE bucket_id = 'medical-certificates'
          AND created_at::date = (CURRENT_DATE - INTERVAL '1 day')
          AND name LIKE '%/6/%';
        INSERT INTO night_batch_log (step_name, status) VALUES (v_step, 'SUCCESS');
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO night_batch_log (step_name, status, error_message)
        VALUES (v_step, 'ERROR', SQLERRM);
    END;

END $$;


ALTER PROCEDURE "public"."nightly_cleanup_demo"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_employee_goal_approved"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  manager_name TEXT;
BEGIN
  IF OLD.status = 'draft' AND NEW.status = 'active' THEN
    -- Get manager name
    SELECT CONCAT(user_firstname, ' ', user_lastname) INTO manager_name
    FROM users WHERE id = NEW.manager_id;
    
    -- Create notification for employee
    INSERT INTO notifications (
      type, title, message, goal_id, sender_id, recipient_id, read, created_at
    ) VALUES (
      'goal_approved',
      'Goal Approved',
      manager_name || ' approved your goal: "' || NEW.goal_title || '"',
      NEW.id,
      NEW.manager_id,
      NEW.employee_id,
      false,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_employee_goal_approved"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_manager_goal_created"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  employee_name TEXT;
BEGIN
  -- Get employee name
  SELECT CONCAT(user_firstname, ' ', user_lastname) INTO employee_name
  FROM users WHERE id = NEW.employee_id;
  
  -- Create notification for manager
  INSERT INTO notifications (
    type, title, message, goal_id, sender_id, recipient_id, read, created_at
  ) VALUES (
    'goal_created',
    'New Goal Created',
    employee_name || ' created a new goal: "' || NEW.goal_title || '"',
    NEW.id,
    NEW.employee_id,
    NEW.manager_id,
    false,
    NOW()
  );
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_manager_goal_created"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_manager_red_flag"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  employee_name TEXT;
  v_goal_title TEXT; -- rename variable to avoid conflict
BEGIN
  IF NEW.status = 'red' THEN
    -- Get employee name and goal title
    SELECT u.user_firstname || ' ' || u.user_lastname, pg.goal_title
    INTO employee_name, v_goal_title
    FROM users u
    JOIN performance_goals pg ON pg.id = NEW.goal_id
    WHERE u.id = NEW.employee_id;

    -- Create notification for manager
    INSERT INTO notifications (
      type, title, message, goal_id, sender_id, recipient_id, read, created_at
    )
    SELECT
      'goal_red_flag',
      '🚨 Red Flag Alert',
      employee_name || ' marked "' || v_goal_title || '" as RED. Blockers: ' || COALESCE(NEW.blockers, 'None specified'),
      NEW.goal_id,
      NEW.employee_id,
      pg.manager_id,
      false,
      NOW()
    FROM performance_goals pg
    WHERE pg.id = NEW.goal_id;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_manager_red_flag"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_ai_usage"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update companies set used_ai_credits = 0;
end;
$$;


ALTER FUNCTION "public"."reset_ai_usage"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_leave_to_attendance"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  day_date DATE;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Generate exception for each day in the leave period
    FOR day_date IN 
      SELECT generate_series(
        NEW.start_date::DATE,
        NEW.end_date::DATE,
        '1 day'::INTERVAL
      )::DATE
    LOOP
      INSERT INTO attendance_exceptions (
        user_id, 
        exception_date, 
        exception_type, 
        leave_request_id
      )
      VALUES (
        NEW.user_id, 
        day_date, 
        'approved_absence', 
        NEW.id
      )
      ON CONFLICT (user_id, exception_date) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_leave_to_attendance"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."track_payroll_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_changed_fields JSONB := '[]'::jsonb;
    v_previous_values JSONB := '{}'::jsonb;
    v_new_values JSONB := '{}'::jsonb;
    v_change_type VARCHAR(50);
    v_field TEXT;
    v_old_val JSONB;
    v_new_val JSONB;
BEGIN
    -- Determine change type
    IF TG_OP = 'INSERT' THEN
        v_change_type := 'created';
        -- For inserts, all fields are "new"
        v_changed_fields := jsonb_build_array('all');
        v_new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_change_type := 'updated';
        
        -- Compare OLD and NEW to find changed fields
        FOR v_field IN 
            SELECT key FROM jsonb_each(to_jsonb(NEW))
        LOOP
            v_old_val := to_jsonb(OLD) -> v_field;
            v_new_val := to_jsonb(NEW) -> v_field;
            
            IF v_old_val IS DISTINCT FROM v_new_val THEN
                v_changed_fields := v_changed_fields || jsonb_build_array(v_field);
                v_previous_values := v_previous_values || jsonb_build_object(v_field, v_old_val);
                v_new_values := v_new_values || jsonb_build_object(v_field, v_new_val);
            END IF;
        END LOOP;
        
        -- Special handling for termination
        IF NEW.is_active = false AND OLD.is_active = true THEN
            v_change_type := 'terminated';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_change_type := 'deleted';
        v_changed_fields := jsonb_build_array('all');
        v_previous_values := to_jsonb(OLD);
    END IF;
    
    -- Insert history record
    INSERT INTO public.employee_payroll_history (
        payroll_id,
        user_id,
        change_type,
        effective_date,
        changed_by,
        data_snapshot,
        changed_fields,
        previous_values,
        new_values
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.user_id, OLD.user_id),
        v_change_type,
        COALESCE(NEW.contract_start_date, OLD.contract_start_date, CURRENT_DATE),
        COALESCE(NEW.updated_by, NEW.created_by, auth.uid()),
        to_jsonb(COALESCE(NEW, OLD)),
        v_changed_fields,
        v_previous_values,
        v_new_values
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."track_payroll_changes"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."track_payroll_changes"() IS 'Automatically creates history records when payroll data changes';



CREATE OR REPLACE FUNCTION "public"."update_allowance_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_allowance_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_daily_happiness_metrics"("target_date" "date") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
    INSERT INTO happiness_daily_metrics (
        metric_date,
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
    ON CONFLICT (metric_date) DO UPDATE SET
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


ALTER FUNCTION "public"."update_daily_happiness_metrics"("target_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_deduction_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_deduction_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_leave_balances"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE leave_balances 
        SET 
            pending_days = pending_days + NEW.total_days,
            updated_at = NOW()
        WHERE 
            user_id = NEW.user_id 
            AND leave_type_id = NEW.leave_type_id 
            AND year = EXTRACT(YEAR FROM NEW.start_date);
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
            UPDATE leave_balances 
            SET 
                pending_days = pending_days - NEW.total_days,
                used_days = used_days + NEW.total_days,
                updated_at = NOW()
            WHERE 
                user_id = NEW.user_id 
                AND leave_type_id = NEW.leave_type_id 
                AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        IF OLD.status = 'pending' AND NEW.status IN ('rejected', 'cancelled') THEN
            UPDATE leave_balances 
            SET 
                pending_days = pending_days - NEW.total_days,
                updated_at = NOW()
            WHERE 
                user_id = NEW.user_id 
                AND leave_type_id = NEW.leave_type_id 
                AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        IF OLD.status = 'approved' AND NEW.status = 'cancelled' THEN
            UPDATE leave_balances 
            SET 
                used_days = used_days - NEW.total_days,
                updated_at = NOW()
            WHERE 
                user_id = NEW.user_id 
                AND leave_type_id = NEW.leave_type_id 
                AND year = EXTRACT(YEAR FROM NEW.start_date);
        END IF;

        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'pending' THEN
            UPDATE leave_balances 
            SET 
                pending_days = pending_days - OLD.total_days,
                updated_at = NOW()
            WHERE 
                user_id = OLD.user_id 
                AND leave_type_id = OLD.leave_type_id 
                AND year = EXTRACT(YEAR FROM OLD.start_date);
        ELSIF OLD.status = 'approved' THEN
            UPDATE leave_balances 
            SET 
                used_days = used_days - OLD.total_days,
                updated_at = NOW()
            WHERE 
                user_id = OLD.user_id 
                AND leave_type_id = OLD.leave_type_id 
                AND year = EXTRACT(YEAR FROM OLD.start_date);
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_leave_balances"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_leave_request_by_medical_cert"("cert_id" integer, "is_confirmed" boolean, "validated" boolean, "validated_by_user" "uuid", "validated_at_time" timestamp with time zone) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE leave_requests
  SET 
    is_medical_confirmed = is_confirmed,
    hr_validated = validated,
    hr_validated_by = validated_by_user,
    hr_validated_at = validated_at_time,
    updated_at = now()
  WHERE medical_certificate_id = cert_id;
END;
$$;


ALTER FUNCTION "public"."update_leave_request_by_medical_cert"("cert_id" integer, "is_confirmed" boolean, "validated" boolean, "validated_by_user" "uuid", "validated_at_time" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_payroll_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_payroll_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_period_closure_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_period_closure_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_user_profile"("user_id_param" "uuid", "manager_id_param" "uuid" DEFAULT NULL::"uuid", "employment_start_date_param" "date" DEFAULT NULL::"date") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO user_profiles (user_id, manager_id, employment_start_date)
    VALUES (user_id_param, manager_id_param, employment_start_date_param)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        manager_id = COALESCE(manager_id_param, user_profiles.manager_id),
        employment_start_date = COALESCE(employment_start_date_param, user_profiles.employment_start_date),
        updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."upsert_user_profile"("user_id_param" "uuid", "manager_id_param" "uuid", "employment_start_date_param" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_medical_certificate"("certificate_id_param" bigint, "hr_comment_param" "text" DEFAULT NULL::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    cert_record RECORD;
    leave_record RECORD;
    result JSON;
BEGIN
    -- Get certificate details
    SELECT * INTO cert_record
    FROM medical_certificates
    WHERE id = certificate_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Certificate not found';
    END IF;
    
    -- Update certificate as treated
    UPDATE medical_certificates
    SET 
        treated = true,
        treatment_date = NOW(),
        hr_comment = COALESCE(hr_comment_param, hr_comment)
    WHERE id = certificate_id_param;
    
    -- If linked to a leave request, update and approve it
    IF cert_record.leave_request_id IS NOT NULL THEN
        UPDATE leave_requests
        SET 
            status = 'approved',
            is_medical_confirmed = true,
            hr_validated = true,
            hr_validated_by = auth.uid(),
            hr_validated_at = NOW(),
            reviewed_by = auth.uid(),
            reviewed_at = NOW(),
            review_notes = COALESCE(hr_comment_param, 'Medical certificate validated by HR')
        WHERE id = cert_record.leave_request_id
        RETURNING * INTO leave_record;
        
        result := json_build_object(
            'success', true,
            'message', 'Certificate validated and leave request approved',
            'certificate_id', certificate_id_param,
            'leave_request_id', cert_record.leave_request_id,
            'leave_status', 'approved'
        );
    ELSE
        result := json_build_object(
            'success', true,
            'message', 'Certificate validated (no linked leave request)',
            'certificate_id', certificate_id_param
        );
    END IF;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."validate_medical_certificate"("certificate_id_param" bigint, "hr_comment_param" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_credit_packs" (
    "id" "text" NOT NULL,
    "credits" integer NOT NULL,
    "price_id" "text" NOT NULL,
    "price" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "currency" "text"
);


ALTER TABLE "public"."ai_credit_packs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attendance_exceptions" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "exception_date" "date" NOT NULL,
    "exception_type" character varying(50) NOT NULL,
    "leave_request_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."attendance_exceptions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."attendance_exceptions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."attendance_exceptions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."attendance_exceptions_id_seq" OWNED BY "public"."attendance_exceptions"."id";



CREATE TABLE IF NOT EXISTS "public"."candidats" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "candidat_firstname" "text",
    "candidat_lastname" "text",
    "cv_text" "text",
    "cv_file" "text",
    "candidat_email" "text",
    "candidat_phone" "text",
    "candidat_gdpr_consent_date" timestamp with time zone,
    "candidat_ai_consent_date" timestamp with time zone
);


ALTER TABLE "public"."candidats" OWNER TO "postgres";


ALTER TABLE "public"."candidats" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."candidats_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid",
    "message_text" "text" NOT NULL,
    "is_bot_message" boolean DEFAULT false,
    "message_type" character varying(20),
    "step_number" integer,
    "score_value" integer,
    "perma_category" character varying(20),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chat_messages_message_type_check" CHECK ((("message_type")::"text" = ANY (ARRAY[('welcome'::character varying)::"text", ('question'::character varying)::"text", ('score'::character varying)::"text", ('followup'::character varying)::"text", ('recommendation'::character varying)::"text", ('completion'::character varying)::"text"]))),
    CONSTRAINT "chat_messages_perma_category_check" CHECK ((("perma_category" IS NULL) OR (("perma_category")::"text" = ANY (ARRAY[('positive'::character varying)::"text", ('engagement'::character varying)::"text", ('relationships'::character varying)::"text", ('meaning'::character varying)::"text", ('accomplishment'::character varying)::"text", ('work_life_balance'::character varying)::"text"])))),
    CONSTRAINT "chat_messages_score_value_check" CHECK ((("score_value" IS NULL) OR (("score_value" >= 1) AND ("score_value" <= 10))))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_name" "text",
    "company_end_date" "date",
    "company_logo" "text",
    "slug" "text",
    "gdpr_file_url" "text",
    "forfait" "text",
    "stripe_customer_id" "text",
    "stripe_subscription_id" "text",
    "is_super_admin_company" boolean,
    "used_ai_credits" bigint DEFAULT 0,
    "forfait_id" bigint,
    "grace_until" timestamp with time zone
);


ALTER TABLE "public"."company" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_email_settings" (
    "id" bigint NOT NULL,
    "company_id" bigint,
    "smtp_host" "text" NOT NULL,
    "smtp_port" integer NOT NULL,
    "smtp_secure" boolean NOT NULL,
    "smtp_username" "text" NOT NULL,
    "smtp_password_encrypted" "text" NOT NULL,
    "from_name" "text" NOT NULL,
    "from_email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."company_email_settings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."company_email_settings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."company_email_settings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."company_email_settings_id_seq" OWNED BY "public"."company_email_settings"."id";



CREATE TABLE IF NOT EXISTS "public"."company_holidays" (
    "id" bigint NOT NULL,
    "company_id" bigint NOT NULL,
    "holiday_name" character varying(200) NOT NULL,
    "holiday_date" "date" NOT NULL,
    "is_recurring" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."company_holidays" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."company_holidays_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."company_holidays_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."company_holidays_id_seq" OWNED BY "public"."company_holidays"."id";



ALTER TABLE "public"."company" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company_steps" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_id" bigint,
    "step_id" bigint,
    "step_order" smallint
);


ALTER TABLE "public"."company_steps" OWNER TO "postgres";


ALTER TABLE "public"."company_steps" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_steps_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."company_to_users" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "company_id" bigint,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "is_active" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."company_to_users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."company_to_users"."is_active" IS 'Indicates if the user is active in this company. Inactive users cannot log in but their data is preserved.';



ALTER TABLE "public"."company_to_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."company_to_users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."contact_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" character varying(100) NOT NULL,
    "last_name" character varying(100) NOT NULL,
    "email" character varying(255) NOT NULL,
    "phone" character varying(50),
    "company_name" character varying(200) NOT NULL,
    "comment" "text",
    "gdpr_consent" boolean DEFAULT false NOT NULL,
    "marketing_consent" boolean DEFAULT false NOT NULL,
    "trigger" character varying(50) DEFAULT 'other'::character varying,
    "ip_address" "inet",
    "user_agent" "text",
    "submitted_at" timestamp with time zone NOT NULL,
    "processed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" character varying(50) DEFAULT 'new'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text"
);


ALTER TABLE "public"."contact_submissions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."contact_submissions_summary" WITH ("security_invoker"='on') AS
 SELECT "id",
    ((("first_name")::"text" || ' '::"text") || ("last_name")::"text") AS "full_name",
    "email",
    "phone",
    "company_name",
    "trigger",
    "gdpr_consent",
    "marketing_consent",
    "status",
    "created_at"
   FROM "public"."contact_submissions"
  ORDER BY "created_at" DESC;


ALTER VIEW "public"."contact_submissions_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."demo_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "ip_address" character varying(45),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "demo_feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."demo_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_allowances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payroll_id" "uuid" NOT NULL,
    "allowance_type" "public"."allowance_type" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "currency" character varying(3) DEFAULT 'HUF'::character varying NOT NULL,
    "tax_treatment" "public"."tax_treatment" DEFAULT 'fully_taxable'::"public"."tax_treatment" NOT NULL,
    "tax_free_limit" numeric(12,2),
    "is_recurring" boolean DEFAULT false,
    "effective_month" integer,
    "effective_year" integer,
    "description" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "chk_allowance_period" CHECK ((("is_recurring" = true) OR ("effective_year" IS NOT NULL))),
    CONSTRAINT "employee_allowances_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "employee_allowances_effective_month_check" CHECK ((("effective_month" >= 1) AND ("effective_month" <= 12)))
);


ALTER TABLE "public"."employee_allowances" OWNER TO "postgres";


COMMENT ON TABLE "public"."employee_allowances" IS 'Stores additional compensation like bonuses, benefits, and reimbursements';



CREATE TABLE IF NOT EXISTS "public"."employee_deductions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payroll_id" "uuid" NOT NULL,
    "deduction_type" "public"."deduction_type" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "currency" character varying(3) DEFAULT 'HUF'::character varying NOT NULL,
    "total_amount" numeric(12,2),
    "remaining_amount" numeric(12,2),
    "installment_count" integer,
    "installments_remaining" integer,
    "start_month" integer,
    "start_year" integer,
    "end_month" integer,
    "end_year" integer,
    "is_active" boolean DEFAULT true,
    "is_completed" boolean DEFAULT false,
    "description" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "employee_deductions_amount_check" CHECK (("amount" >= (0)::numeric)),
    CONSTRAINT "employee_deductions_end_month_check" CHECK ((("end_month" >= 1) AND ("end_month" <= 12))),
    CONSTRAINT "employee_deductions_start_month_check" CHECK ((("start_month" >= 1) AND ("start_month" <= 12)))
);


ALTER TABLE "public"."employee_deductions" OWNER TO "postgres";


COMMENT ON TABLE "public"."employee_deductions" IS 'Stores deductions like salary advances and loan repayments';



CREATE TABLE IF NOT EXISTS "public"."employee_payroll" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "country_code" character varying(2) NOT NULL,
    "employment_type" character varying(50),
    "contract_type" character varying(50),
    "contract_start_date" "date",
    "contract_end_date" "date",
    "position_title" character varying(200),
    "department" character varying(100),
    "work_location" character varying(200),
    "weekly_hours" numeric(5,2),
    "salary_amount" numeric(12,2) NOT NULL,
    "salary_currency" character varying(3) DEFAULT 'HUF'::character varying,
    "salary_period" character varying(20) DEFAULT 'monthly'::character varying,
    "payment_method" character varying(50) DEFAULT 'bank_transfer'::character varying,
    "bank_account_iban" character varying(34),
    "bank_name" character varying(100),
    "country_specific_data" "jsonb" DEFAULT '{}'::"jsonb",
    "benefits" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "termination_date" "date",
    "termination_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "valid_contract_dates" CHECK ((("contract_end_date" IS NULL) OR ("contract_end_date" >= "contract_start_date"))),
    CONSTRAINT "valid_hours" CHECK ((("weekly_hours" >= (0)::numeric) AND ("weekly_hours" <= (168)::numeric))),
    CONSTRAINT "valid_salary" CHECK (("salary_amount" >= (0)::numeric)),
    CONSTRAINT "valid_termination" CHECK ((("termination_date" IS NULL) OR ("is_active" = false)))
);


ALTER TABLE "public"."employee_payroll" OWNER TO "postgres";


COMMENT ON TABLE "public"."employee_payroll" IS 'Current payroll information for all employees';



COMMENT ON COLUMN "public"."employee_payroll"."country_specific_data" IS 'JSONB field storing country-specific payroll data (e.g., TAJ number for Hungary)';



CREATE TABLE IF NOT EXISTS "public"."employee_payroll_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payroll_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "change_type" character varying(50) NOT NULL,
    "change_date" timestamp with time zone DEFAULT "now"(),
    "effective_date" "date" NOT NULL,
    "changed_by" "uuid",
    "change_reason" "text",
    "data_snapshot" "jsonb" NOT NULL,
    "changed_fields" "jsonb",
    "previous_values" "jsonb",
    "new_values" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."employee_payroll_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."employee_payroll_history" IS 'Complete audit trail of all payroll changes';



COMMENT ON COLUMN "public"."employee_payroll_history"."data_snapshot" IS 'Complete snapshot of payroll record at the time of change';



CREATE TABLE IF NOT EXISTS "public"."forfait" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "forfait_name" "text",
    "max_opened_position" bigint,
    "max_medical_certificates" bigint,
    "access_happy_check" boolean,
    "stripe_price_id" "text",
    "description" "text",
    "included_ai_credits" bigint DEFAULT 100,
    "credit_overage_price" numeric DEFAULT 0.25
);


ALTER TABLE "public"."forfait" OWNER TO "postgres";


ALTER TABLE "public"."forfait" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."forfait_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."goal_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "goal_id" "uuid" NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "progress_comment" "text",
    "blockers" "text",
    "week_start_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "goal_updates_status_check" CHECK (("status" = ANY (ARRAY['green'::"text", 'yellow'::"text", 'red'::"text"])))
);


ALTER TABLE "public"."goal_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."happiness_daily_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "metric_date" "date" DEFAULT CURRENT_DATE,
    "total_sessions_started" integer DEFAULT 0,
    "total_sessions_completed" integer DEFAULT 0,
    "completion_rate" numeric(5,2),
    "avg_overall_happiness" numeric(3,1),
    "median_overall_happiness" integer,
    "avg_positive_emotions" numeric(3,1),
    "avg_engagement" numeric(3,1),
    "avg_relationships" numeric(3,1),
    "avg_meaning" numeric(3,1),
    "avg_accomplishment" numeric(3,1),
    "avg_work_life_balance" numeric(3,1),
    "low_scores_count" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."happiness_daily_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."happiness_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_token" character varying(255) NOT NULL,
    "ip_hash" character varying(255),
    "user_agent_hash" character varying(255),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "overall_happiness_score" integer,
    "perma_scores" "jsonb",
    "status" character varying(20) DEFAULT 'created'::character varying,
    "current_step" integer DEFAULT 0,
    "total_steps" integer DEFAULT 12,
    "last_activity" timestamp with time zone DEFAULT "now"(),
    "timeout_at" timestamp with time zone DEFAULT ("now"() + '24:00:00'::interval),
    "company_id" bigint,
    CONSTRAINT "happiness_sessions_overall_happiness_score_check" CHECK ((("overall_happiness_score" >= 1) AND ("overall_happiness_score" <= 10))),
    CONSTRAINT "happiness_sessions_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('created'::character varying)::"text", ('in_progress'::character varying)::"text", ('completed'::character varying)::"text", ('abandoned'::character varying)::"text", ('timeout'::character varying)::"text"])))
);


ALTER TABLE "public"."happiness_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interviews" (
    "id" bigint NOT NULL,
    "position_id" bigint,
    "candidat_id" bigint,
    "recruiter_id" "uuid",
    "interview_datetime" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 45,
    "location" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "notes" "text",
    "ai_summary" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "questions" "jsonb",
    "summary" "jsonb",
    "recruitment_step_id" bigint,
    CONSTRAINT "interviews_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'done'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."interviews" OWNER TO "postgres";


ALTER TABLE "public"."interviews" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."interviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."leave_balances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "leave_type_id" "uuid" NOT NULL,
    "year" integer NOT NULL,
    "total_days" numeric(4,1) DEFAULT 0 NOT NULL,
    "used_days" numeric(4,1) DEFAULT 0 NOT NULL,
    "pending_days" numeric(4,1) DEFAULT 0 NOT NULL,
    "remaining_days" numeric(4,1) GENERATED ALWAYS AS ((("total_days" - "used_days") - "pending_days")) STORED,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."leave_balances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leave_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "leave_type_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "total_days" numeric(4,1) NOT NULL,
    "reason" "text",
    "status" character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    "manager_id" "uuid",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    "medical_certificate_id" integer,
    "is_medical_confirmed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "hr_validated" boolean DEFAULT false,
    "hr_validated_by" "uuid",
    "hr_validated_at" timestamp with time zone,
    CONSTRAINT "leave_requests_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('approved'::character varying)::"text", ('rejected'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."leave_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leave_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "name_hu" character varying(100) NOT NULL,
    "color" character varying(7) DEFAULT '#3B82F6'::character varying NOT NULL,
    "is_paid" boolean DEFAULT true NOT NULL,
    "requires_medical_certificate" boolean DEFAULT false NOT NULL,
    "max_days_per_year" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."leave_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medical_certificates" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "employee_name" "text",
    "absence_start_date" "date",
    "absence_end_date" "text",
    "employee_comment" "text",
    "hr_comment" "text",
    "certificate_file" "text",
    "treated" boolean,
    "treatment_date" timestamp with time zone,
    "company_id" bigint,
    "leave_request_id" "uuid",
    "employee_ai_consent_date" timestamp with time zone
);


ALTER TABLE "public"."medical_certificates" OWNER TO "postgres";


ALTER TABLE "public"."medical_certificates" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."medical_certificates_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."night_batch_log" (
    "id" bigint NOT NULL,
    "step_name" "text" NOT NULL,
    "status" "text" NOT NULL,
    "error_message" "text",
    "executed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."night_batch_log" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."night_batch_log_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."night_batch_log_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."night_batch_log_id_seq" OWNED BY "public"."night_batch_log"."id";



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "ticket_id" "uuid",
    "sender_id" "uuid",
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "recipient_id" "uuid",
    "leave_request_id" "uuid",
    "goal_id" "uuid",
    "one_on_one_id" "uuid",
    "position_id" "text",
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['ticket_created'::"text", 'ticket_status_changed'::"text", 'ticket_message'::"text", 'leave_request_created'::"text", 'leave_request_approved'::"text", 'leave_request_rejected'::"text", 'leave_request_cancelled'::"text", 'goal_created'::"text", 'goal_approved'::"text", 'goal_red_flag'::"text", 'pulse_reminder'::"text", 'one_on_one_scheduled'::"text", 'cv_uploaded'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."one_on_ones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "manager_id" "uuid" NOT NULL,
    "company_id" bigint NOT NULL,
    "scheduled_date" "date" NOT NULL,
    "completed_date" "date",
    "employee_notes" "text",
    "manager_notes" "text",
    "action_items" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "one_on_ones_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."one_on_ones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."openedpositions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "position_name" "text",
    "position_description" "text",
    "position_start_date" "date",
    "position_end_date" "date",
    "company_id" bigint,
    "user_id" "uuid",
    "position_description_detailed" "text",
    "manager_id" "uuid"
);


ALTER TABLE "public"."openedpositions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."openedpositions"."manager_id" IS 'id of the manager linked to the openedposition';



ALTER TABLE "public"."openedpositions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."openedpositions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."payroll_countries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_code" character varying(2) NOT NULL,
    "country_name" character varying(100) NOT NULL,
    "is_active" boolean DEFAULT true,
    "field_config" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payroll_countries" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_countries" IS 'Defines country-specific payroll configurations and field requirements';



CREATE TABLE IF NOT EXISTS "public"."payroll_exports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "export_date" timestamp with time zone DEFAULT "now"(),
    "exported_by" "uuid" NOT NULL,
    "country_code" character varying(2) NOT NULL,
    "export_month" integer NOT NULL,
    "export_year" integer NOT NULL,
    "export_format" character varying(50) NOT NULL,
    "employee_count" integer NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_path" "text",
    "export_options" "jsonb" DEFAULT '{}'::"jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "export_name" character varying(200),
    CONSTRAINT "payroll_exports_export_month_check" CHECK ((("export_month" >= 1) AND ("export_month" <= 12))),
    CONSTRAINT "payroll_exports_export_year_check" CHECK (("export_year" >= 2000))
);


ALTER TABLE "public"."payroll_exports" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_exports" IS 'Log of all payroll exports for compliance. Allows multiple exports per month for corrections, different formats, and audit trail.';



COMMENT ON COLUMN "public"."payroll_exports"."id" IS 'Auto-incrementing primary key allowing multiple exports per month';



COMMENT ON COLUMN "public"."payroll_exports"."export_format" IS 'Format used for export: generic, kulcs-soft, nexon, or sap';



COMMENT ON COLUMN "public"."payroll_exports"."export_name" IS 'Optional user-provided name for this export (e.g., "Final December Export")';



CREATE TABLE IF NOT EXISTS "public"."payroll_period_closures" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_code" character varying(2) NOT NULL,
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "status" character varying(20) DEFAULT 'open'::character varying NOT NULL,
    "closed_at" timestamp with time zone,
    "closed_by" "uuid",
    "closed_reason" "text",
    "last_export_id" "uuid",
    "reopened_at" timestamp with time zone,
    "reopened_by" "uuid",
    "reopen_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chk_closed_at_required" CHECK ((((("status")::"text" = 'closed'::"text") AND ("closed_at" IS NOT NULL) AND ("closed_by" IS NOT NULL)) OR (("status")::"text" <> 'closed'::"text"))),
    CONSTRAINT "chk_closure_status" CHECK ((("status")::"text" = ANY ((ARRAY['open'::character varying, 'closed'::character varying, 'reopened'::character varying])::"text"[]))),
    CONSTRAINT "chk_reopened_at_required" CHECK ((((("status")::"text" = 'reopened'::"text") AND ("reopened_at" IS NOT NULL) AND ("reopened_by" IS NOT NULL) AND ("reopen_reason" IS NOT NULL)) OR (("status")::"text" <> 'reopened'::"text"))),
    CONSTRAINT "payroll_period_closures_month_check" CHECK ((("month" >= 1) AND ("month" <= 12)))
);


ALTER TABLE "public"."payroll_period_closures" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_period_closures" IS 'Tracks payroll period closures to prevent accidental changes after payroll is finalized. Supports reopening with full audit trail.';



COMMENT ON COLUMN "public"."payroll_period_closures"."status" IS 'Period status: open (default), closed (finalized), reopened (was closed but reopened for corrections)';



COMMENT ON COLUMN "public"."payroll_period_closures"."closed_reason" IS 'Optional reason for closing the period (e.g., "Monthly payroll completed and exported")';



COMMENT ON COLUMN "public"."payroll_period_closures"."last_export_id" IS 'Reference to the export that was performed before closing the period';



COMMENT ON COLUMN "public"."payroll_period_closures"."reopen_reason" IS 'Required reason for reopening a closed period (e.g., "Salary correction needed for employee X")';



CREATE TABLE IF NOT EXISTS "public"."payroll_validation_issues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "validation_run_id" "uuid" NOT NULL,
    "severity" character varying(10) NOT NULL,
    "code" character varying(100) NOT NULL,
    "user_id" "uuid",
    "field_name" "text",
    "message" "text" NOT NULL,
    "suggested_fix" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payroll_validation_issues_severity_check" CHECK ((("severity")::"text" = ANY ((ARRAY['CRITICAL'::character varying, 'WARNING'::character varying, 'INFO'::character varying])::"text"[])))
);


ALTER TABLE "public"."payroll_validation_issues" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_validation_issues" IS 'Stores validation findings for payroll data. CRITICAL issues block payroll export.';



COMMENT ON COLUMN "public"."payroll_validation_issues"."severity" IS 'CRITICAL blocks export, WARNING allows export with risk, INFO is informational';



COMMENT ON COLUMN "public"."payroll_validation_issues"."code" IS 'Machine-readable validation identifier used for UI logic and AI explanations';



COMMENT ON COLUMN "public"."payroll_validation_issues"."suggested_fix" IS 'Optional human-readable suggestion for resolving the issue';



CREATE TABLE IF NOT EXISTS "public"."payroll_validation_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_code" character varying(2) NOT NULL,
    "year" integer NOT NULL,
    "month" integer NOT NULL,
    "export_format" character varying(50) NOT NULL,
    "has_critical_errors" boolean DEFAULT false NOT NULL,
    "validated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "validation_name" character varying(200),
    "issue_count" integer DEFAULT 0,
    "validation_status" character varying(50) DEFAULT 'completed'::character varying,
    CONSTRAINT "chk_validation_status" CHECK ((("validation_status")::"text" = ANY ((ARRAY['running'::character varying, 'completed'::character varying, 'failed'::character varying])::"text"[]))),
    CONSTRAINT "payroll_validation_runs_month_check" CHECK ((("month" >= 1) AND ("month" <= 12))),
    CONSTRAINT "payroll_validation_runs_year_check" CHECK (("year" >= 2000))
);


ALTER TABLE "public"."payroll_validation_runs" OWNER TO "postgres";


COMMENT ON TABLE "public"."payroll_validation_runs" IS 'Log of all payroll validation runs. Allows multiple validations per month for testing, corrections, and audit trail.';



COMMENT ON COLUMN "public"."payroll_validation_runs"."id" IS 'UUID primary key allowing multiple validation runs per month';



COMMENT ON COLUMN "public"."payroll_validation_runs"."validation_name" IS 'Optional user-provided name for this validation run';



COMMENT ON COLUMN "public"."payroll_validation_runs"."issue_count" IS 'Cached count of validation issues for quick reference';



COMMENT ON COLUMN "public"."payroll_validation_runs"."validation_status" IS 'Status: running (in progress), completed (finished), failed (error occurred)';



CREATE TABLE IF NOT EXISTS "public"."pending_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" bigint,
    "price_id" "text" NOT NULL,
    "setup_intent_id" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pending_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."performance_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "manager_id" "uuid" NOT NULL,
    "company_id" bigint NOT NULL,
    "goal_title" "text" NOT NULL,
    "goal_description" "text",
    "success_criteria" "text",
    "quarter" "text" NOT NULL,
    "year" integer NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "performance_goals_created_by_check" CHECK (("created_by" = ANY (ARRAY['employee'::"text", 'manager'::"text"]))),
    CONSTRAINT "performance_goals_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'completed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."performance_goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."position_to_candidat" (
    "position_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "candidat_id" bigint NOT NULL,
    "candidat_score" bigint,
    "candidat_comment" "text",
    "candidat_next_step" "text",
    "candidat_ai_analyse" "text",
    "source" "text" DEFAULT 'upload manuel'::"text"
);


ALTER TABLE "public"."position_to_candidat" OWNER TO "postgres";


ALTER TABLE "public"."position_to_candidat" ALTER COLUMN "position_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."position_to_candidat_position_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."positions_by_user_company" WITH ("security_invoker"='on') AS
 SELECT "op"."id",
    "op"."position_name",
    "op"."position_description",
    "op"."user_id",
    "c"."company_logo"
   FROM (("public"."openedpositions" "op"
     JOIN "public"."company_to_users" "ctu" ON (("op"."company_id" = "ctu"."company_id")))
     JOIN "public"."company" "c" ON (("ctu"."company_id" = "c"."id")));


ALTER VIEW "public"."positions_by_user_company" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "user_firstname" "text",
    "user_lastname" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recruitment_steps" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "step_name" "text"
);


ALTER TABLE "public"."recruitment_steps" OWNER TO "postgres";


ALTER TABLE "public"."recruitment_steps" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."recruitment_steps_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."session_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid",
    "category" character varying(50),
    "recommendation_text" "text" NOT NULL,
    "priority" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."session_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stripe_events" (
    "id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."stripe_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" bigint,
    "stripe_subscription_id" "text" NOT NULL,
    "stripe_customer_id" "text",
    "price_id" "text" NOT NULL,
    "status" "text" NOT NULL,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid",
    "file_name" character varying(255) NOT NULL,
    "file_path" character varying(500) NOT NULL,
    "file_size" integer NOT NULL,
    "file_type" character varying(100) NOT NULL,
    "uploaded_by" "uuid",
    "uploaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ticket_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid",
    "sender_type" character varying(10) NOT NULL,
    "sender_id" "uuid",
    "sender_email" character varying(255),
    "sender_name" character varying(100),
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ticket_messages_sender_type_check" CHECK ((("sender_type")::"text" = ANY (ARRAY[('user'::character varying)::"text", ('admin'::character varying)::"text"])))
);


ALTER TABLE "public"."ticket_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text" NOT NULL,
    "status" character varying(20) DEFAULT 'open'::character varying,
    "priority" character varying(10) DEFAULT 'medium'::character varying,
    "category" character varying(50),
    "company_id" bigint,
    "user_id" "uuid",
    "user_email" character varying(255),
    "user_name" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone,
    "assigned_to" "uuid",
    CONSTRAINT "tickets_priority_check" CHECK ((("priority")::"text" = ANY (ARRAY[('low'::character varying)::"text", ('medium'::character varying)::"text", ('high'::character varying)::"text", ('urgent'::character varying)::"text"]))),
    CONSTRAINT "tickets_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('open'::character varying)::"text", ('in_progress'::character varying)::"text", ('resolved'::character varying)::"text", ('closed'::character varying)::"text"])))
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_entries" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_id" bigint NOT NULL,
    "clock_in" timestamp with time zone NOT NULL,
    "clock_out" timestamp with time zone,
    "expected_clock_in" timestamp with time zone,
    "expected_clock_out" timestamp with time zone,
    "is_late" boolean DEFAULT false,
    "is_early_leave" boolean DEFAULT false,
    "is_overtime" boolean DEFAULT false,
    "total_hours" numeric(5,2),
    "regular_hours" numeric(5,2),
    "overtime_hours" numeric(5,2),
    "employee_notes" "text",
    "manager_notes" "text",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "approved_by" "uuid",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."time_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."time_entries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."time_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."time_entries_id_seq" OWNED BY "public"."time_entries"."id";



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "manager_id" "uuid",
    "employment_start_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_shifts" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "shift_id" bigint NOT NULL,
    "effective_from" "date" NOT NULL,
    "effective_until" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_shifts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_shifts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_shifts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_shifts_id_seq" OWNED BY "public"."user_shifts"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "user_firstname" "text",
    "user_lastname" "text",
    "is_admin" boolean,
    "is_super_admin" boolean,
    "is_manager" boolean
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_goals_with_status" WITH ("security_invoker"='on') AS
 SELECT "pg"."id",
    "pg"."employee_id",
    "pg"."manager_id",
    "pg"."company_id",
    "pg"."goal_title",
    "pg"."goal_description",
    "pg"."success_criteria",
    "pg"."quarter",
    "pg"."year",
    "pg"."status",
    "pg"."created_by",
    "pg"."created_at",
    "pg"."updated_at",
    "gu"."status" AS "latest_status",
    "gu"."progress_comment" AS "latest_comment",
    "gu"."blockers" AS "latest_blockers",
    "gu"."week_start_date" AS "last_update_week",
    "gu"."created_at" AS "last_update_date",
    (("emp"."user_firstname" || ' '::"text") || "emp"."user_lastname") AS "employee_name",
    (("mgr"."user_firstname" || ' '::"text") || "mgr"."user_lastname") AS "manager_name"
   FROM ((("public"."performance_goals" "pg"
     LEFT JOIN LATERAL ( SELECT "goal_updates"."id",
            "goal_updates"."goal_id",
            "goal_updates"."employee_id",
            "goal_updates"."status",
            "goal_updates"."progress_comment",
            "goal_updates"."blockers",
            "goal_updates"."week_start_date",
            "goal_updates"."created_at"
           FROM "public"."goal_updates"
          WHERE ("goal_updates"."goal_id" = "pg"."id")
          ORDER BY "goal_updates"."created_at" DESC
         LIMIT 1) "gu" ON (true))
     JOIN "public"."users" "emp" ON (("emp"."id" = "pg"."employee_id")))
     JOIN "public"."users" "mgr" ON (("mgr"."id" = "pg"."manager_id")));


ALTER VIEW "public"."v_goals_with_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_shifts" (
    "id" bigint NOT NULL,
    "company_id" bigint NOT NULL,
    "shift_name" character varying(100) NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone NOT NULL,
    "days_of_week" integer[] NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."work_shifts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."work_shifts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."work_shifts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."work_shifts_id_seq" OWNED BY "public"."work_shifts"."id";



ALTER TABLE ONLY "public"."attendance_exceptions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."attendance_exceptions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."company_email_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."company_email_settings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."company_holidays" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."company_holidays_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."night_batch_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."night_batch_log_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."time_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."time_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_shifts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_shifts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."work_shifts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."work_shifts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."openedpositions"
    ADD CONSTRAINT "OpenedPositions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_credit_packs"
    ADD CONSTRAINT "ai_credit_packs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_exceptions"
    ADD CONSTRAINT "attendance_exceptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attendance_exceptions"
    ADD CONSTRAINT "attendance_exceptions_user_id_exception_date_key" UNIQUE ("user_id", "exception_date");



ALTER TABLE ONLY "public"."candidats"
    ADD CONSTRAINT "candidats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_email_settings"
    ADD CONSTRAINT "company_email_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_holidays"
    ADD CONSTRAINT "company_holidays_company_id_holiday_date_key" UNIQUE ("company_id", "holiday_date");



ALTER TABLE ONLY "public"."company_holidays"
    ADD CONSTRAINT "company_holidays_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company"
    ADD CONSTRAINT "company_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_steps"
    ADD CONSTRAINT "company_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_to_users"
    ADD CONSTRAINT "company_to_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contact_submissions"
    ADD CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."demo_feedback"
    ADD CONSTRAINT "demo_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_allowances"
    ADD CONSTRAINT "employee_allowances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_deductions"
    ADD CONSTRAINT "employee_deductions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_payroll_history"
    ADD CONSTRAINT "employee_payroll_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_payroll"
    ADD CONSTRAINT "employee_payroll_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forfait"
    ADD CONSTRAINT "forfait_forfait_name_key" UNIQUE ("forfait_name");



ALTER TABLE ONLY "public"."forfait"
    ADD CONSTRAINT "forfait_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."goal_updates"
    ADD CONSTRAINT "goal_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."happiness_daily_metrics"
    ADD CONSTRAINT "happiness_daily_metrics_metric_date_key" UNIQUE ("metric_date");



ALTER TABLE ONLY "public"."happiness_daily_metrics"
    ADD CONSTRAINT "happiness_daily_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."happiness_sessions"
    ADD CONSTRAINT "happiness_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."happiness_sessions"
    ADD CONSTRAINT "happiness_sessions_session_token_key" UNIQUE ("session_token");



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leave_balances"
    ADD CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leave_balances"
    ADD CONSTRAINT "leave_balances_user_id_leave_type_id_year_key" UNIQUE ("user_id", "leave_type_id", "year");



ALTER TABLE ONLY "public"."leave_requests"
    ADD CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leave_types"
    ADD CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_certificates"
    ADD CONSTRAINT "medical_certificates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."night_batch_log"
    ADD CONSTRAINT "night_batch_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."one_on_ones"
    ADD CONSTRAINT "one_on_ones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_countries"
    ADD CONSTRAINT "payroll_countries_country_code_key" UNIQUE ("country_code");



ALTER TABLE ONLY "public"."payroll_countries"
    ADD CONSTRAINT "payroll_countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_exports"
    ADD CONSTRAINT "payroll_exports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_period_closures"
    ADD CONSTRAINT "payroll_period_closures_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_validation_issues"
    ADD CONSTRAINT "payroll_validation_issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_validation_runs"
    ADD CONSTRAINT "payroll_validation_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_subscriptions"
    ADD CONSTRAINT "pending_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."performance_goals"
    ADD CONSTRAINT "performance_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."position_to_candidat"
    ADD CONSTRAINT "position_to_candidat_pkey1" PRIMARY KEY ("position_id", "candidat_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recruitment_steps"
    ADD CONSTRAINT "recruitment_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_recommendations"
    ADD CONSTRAINT "session_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stripe_events"
    ADD CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."ticket_attachments"
    ADD CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_shifts"
    ADD CONSTRAINT "user_shifts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_shifts"
    ADD CONSTRAINT "user_shifts_user_id_shift_id_effective_from_key" UNIQUE ("user_id", "shift_id", "effective_from");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_shifts"
    ADD CONSTRAINT "work_shifts_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_allowances_payroll" ON "public"."employee_allowances" USING "btree" ("payroll_id");



CREATE INDEX "idx_allowances_period" ON "public"."employee_allowances" USING "btree" ("effective_year", "effective_month");



CREATE INDEX "idx_allowances_recurring" ON "public"."employee_allowances" USING "btree" ("is_recurring") WHERE ("is_recurring" = true);



CREATE INDEX "idx_allowances_type" ON "public"."employee_allowances" USING "btree" ("allowance_type");



CREATE INDEX "idx_attendance_exceptions_user_date" ON "public"."attendance_exceptions" USING "btree" ("user_id", "exception_date");



CREATE INDEX "idx_chat_messages_created_at" ON "public"."chat_messages" USING "btree" ("created_at");



CREATE INDEX "idx_chat_messages_session_id" ON "public"."chat_messages" USING "btree" ("session_id");



CREATE INDEX "idx_company_to_users_company_active" ON "public"."company_to_users" USING "btree" ("company_id", "is_active");



CREATE INDEX "idx_company_to_users_is_active" ON "public"."company_to_users" USING "btree" ("is_active");



CREATE INDEX "idx_contact_submissions_company" ON "public"."contact_submissions" USING "btree" ("company_name");



CREATE INDEX "idx_contact_submissions_created_at" ON "public"."contact_submissions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_contact_submissions_email" ON "public"."contact_submissions" USING "btree" ("email");



CREATE INDEX "idx_contact_submissions_status" ON "public"."contact_submissions" USING "btree" ("status");



CREATE INDEX "idx_daily_metrics_date" ON "public"."happiness_daily_metrics" USING "btree" ("metric_date");



CREATE INDEX "idx_deductions_active" ON "public"."employee_deductions" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_deductions_payroll" ON "public"."employee_deductions" USING "btree" ("payroll_id");



CREATE INDEX "idx_deductions_period" ON "public"."employee_deductions" USING "btree" ("start_year", "start_month");



CREATE INDEX "idx_deductions_type" ON "public"."employee_deductions" USING "btree" ("deduction_type");



CREATE INDEX "idx_demo_feedback_created_at" ON "public"."demo_feedback" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_demo_feedback_rating" ON "public"."demo_feedback" USING "btree" ("rating");



CREATE INDEX "idx_employee_payroll_active" ON "public"."employee_payroll" USING "btree" ("is_active");



CREATE INDEX "idx_employee_payroll_country" ON "public"."employee_payroll" USING "btree" ("country_code");



CREATE INDEX "idx_employee_payroll_employment_type" ON "public"."employee_payroll" USING "btree" ("employment_type");



CREATE UNIQUE INDEX "idx_employee_payroll_user" ON "public"."employee_payroll" USING "btree" ("user_id") WHERE ("is_active" = true);



CREATE INDEX "idx_goal_updates_employee" ON "public"."goal_updates" USING "btree" ("employee_id");



CREATE INDEX "idx_goal_updates_goal" ON "public"."goal_updates" USING "btree" ("goal_id");



CREATE INDEX "idx_goal_updates_week" ON "public"."goal_updates" USING "btree" ("week_start_date");



CREATE INDEX "idx_happiness_sessions_created_at" ON "public"."happiness_sessions" USING "btree" ("created_at");



CREATE INDEX "idx_happiness_sessions_status" ON "public"."happiness_sessions" USING "btree" ("status");



CREATE INDEX "idx_happiness_sessions_token" ON "public"."happiness_sessions" USING "btree" ("session_token");



CREATE INDEX "idx_interviews_candidate" ON "public"."interviews" USING "btree" ("candidat_id");



CREATE INDEX "idx_interviews_position" ON "public"."interviews" USING "btree" ("position_id");



CREATE INDEX "idx_leave_balances_user_year" ON "public"."leave_balances" USING "btree" ("user_id", "year");



CREATE INDEX "idx_leave_requests_dates" ON "public"."leave_requests" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_leave_requests_manager_status" ON "public"."leave_requests" USING "btree" ("manager_id", "status");



CREATE INDEX "idx_leave_requests_user_status" ON "public"."leave_requests" USING "btree" ("user_id", "status");



CREATE INDEX "idx_medical_certificates_company_treated" ON "public"."medical_certificates" USING "btree" ("company_id", "treated");



CREATE INDEX "idx_medical_certificates_leave_request" ON "public"."medical_certificates" USING "btree" ("leave_request_id");



CREATE INDEX "idx_notifications_leave_request_id" ON "public"."notifications" USING "btree" ("leave_request_id");



CREATE INDEX "idx_notifications_position_id" ON "public"."notifications" USING "btree" ("position_id");



CREATE INDEX "idx_notifications_recipient_id" ON "public"."notifications" USING "btree" ("recipient_id");



CREATE INDEX "idx_notifications_recipient_unread" ON "public"."notifications" USING "btree" ("recipient_id", "read") WHERE ("read" = false);



CREATE INDEX "idx_one_on_ones_employee" ON "public"."one_on_ones" USING "btree" ("employee_id");



CREATE INDEX "idx_one_on_ones_manager" ON "public"."one_on_ones" USING "btree" ("manager_id");



CREATE INDEX "idx_one_on_ones_scheduled" ON "public"."one_on_ones" USING "btree" ("scheduled_date");



CREATE INDEX "idx_payroll_countries_code" ON "public"."payroll_countries" USING "btree" ("country_code") WHERE ("is_active" = true);



CREATE INDEX "idx_payroll_exports_country" ON "public"."payroll_exports" USING "btree" ("country_code");



CREATE INDEX "idx_payroll_exports_created" ON "public"."payroll_exports" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payroll_exports_date" ON "public"."payroll_exports" USING "btree" ("export_date" DESC);



CREATE INDEX "idx_payroll_exports_period" ON "public"."payroll_exports" USING "btree" ("export_year", "export_month");



CREATE INDEX "idx_payroll_exports_user" ON "public"."payroll_exports" USING "btree" ("exported_by");



CREATE INDEX "idx_payroll_history_change_date" ON "public"."employee_payroll_history" USING "btree" ("change_date" DESC);



CREATE INDEX "idx_payroll_history_change_type" ON "public"."employee_payroll_history" USING "btree" ("change_type");



CREATE INDEX "idx_payroll_history_effective_date" ON "public"."employee_payroll_history" USING "btree" ("effective_date" DESC);



CREATE INDEX "idx_payroll_history_payroll" ON "public"."employee_payroll_history" USING "btree" ("payroll_id");



CREATE INDEX "idx_payroll_history_user" ON "public"."employee_payroll_history" USING "btree" ("user_id");



CREATE INDEX "idx_pending_subscriptions_company_id" ON "public"."pending_subscriptions" USING "btree" ("company_id");



CREATE INDEX "idx_pending_subscriptions_setup_intent" ON "public"."pending_subscriptions" USING "btree" ("setup_intent_id");



CREATE INDEX "idx_perf_goals_company" ON "public"."performance_goals" USING "btree" ("company_id");



CREATE INDEX "idx_perf_goals_employee" ON "public"."performance_goals" USING "btree" ("employee_id");



CREATE INDEX "idx_perf_goals_manager" ON "public"."performance_goals" USING "btree" ("manager_id");



CREATE INDEX "idx_perf_goals_quarter_year" ON "public"."performance_goals" USING "btree" ("quarter", "year");



CREATE INDEX "idx_perf_goals_status" ON "public"."performance_goals" USING "btree" ("status");



CREATE UNIQUE INDEX "idx_period_closure_unique" ON "public"."payroll_period_closures" USING "btree" ("country_code", "year", "month") WHERE (("status")::"text" = ANY ((ARRAY['closed'::character varying, 'open'::character varying])::"text"[]));



CREATE INDEX "idx_period_closures_closed_at" ON "public"."payroll_period_closures" USING "btree" ("closed_at" DESC);



CREATE INDEX "idx_period_closures_closed_by" ON "public"."payroll_period_closures" USING "btree" ("closed_by");



CREATE INDEX "idx_period_closures_period" ON "public"."payroll_period_closures" USING "btree" ("country_code", "year", "month");



CREATE INDEX "idx_period_closures_status" ON "public"."payroll_period_closures" USING "btree" ("status");



CREATE INDEX "idx_subscriptions_company_id" ON "public"."subscriptions" USING "btree" ("company_id");



CREATE INDEX "idx_subscriptions_stripe_id" ON "public"."subscriptions" USING "btree" ("stripe_subscription_id");



CREATE INDEX "idx_ticket_attachments_ticket_id" ON "public"."ticket_attachments" USING "btree" ("ticket_id");



CREATE INDEX "idx_ticket_messages_ticket_id" ON "public"."ticket_messages" USING "btree" ("ticket_id");



CREATE INDEX "idx_tickets_company_id" ON "public"."tickets" USING "btree" ("company_id");



CREATE INDEX "idx_tickets_created_at" ON "public"."tickets" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_tickets_status" ON "public"."tickets" USING "btree" ("status");



CREATE INDEX "idx_time_entries_company" ON "public"."time_entries" USING "btree" ("company_id");



CREATE INDEX "idx_time_entries_status" ON "public"."time_entries" USING "btree" ("status");



CREATE INDEX "idx_time_entries_user_date" ON "public"."time_entries" USING "btree" ("user_id", "clock_in");



CREATE INDEX "idx_user_shifts_user" ON "public"."user_shifts" USING "btree" ("user_id");



CREATE INDEX "idx_validation_issues_run" ON "public"."payroll_validation_issues" USING "btree" ("validation_run_id");



CREATE INDEX "idx_validation_issues_severity" ON "public"."payroll_validation_issues" USING "btree" ("severity");



CREATE INDEX "idx_validation_issues_user" ON "public"."payroll_validation_issues" USING "btree" ("user_id");



CREATE INDEX "idx_validation_runs_country" ON "public"."payroll_validation_runs" USING "btree" ("country_code");



CREATE INDEX "idx_validation_runs_created" ON "public"."payroll_validation_runs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_validation_runs_errors" ON "public"."payroll_validation_runs" USING "btree" ("has_critical_errors") WHERE ("has_critical_errors" = true);



CREATE INDEX "idx_validation_runs_period" ON "public"."payroll_validation_runs" USING "btree" ("year", "month");



CREATE INDEX "idx_validation_runs_user" ON "public"."payroll_validation_runs" USING "btree" ("validated_by");



CREATE OR REPLACE TRIGGER "leave_request_to_attendance" AFTER INSERT OR UPDATE ON "public"."leave_requests" FOR EACH ROW EXECUTE FUNCTION "public"."sync_leave_to_attendance"();



CREATE OR REPLACE TRIGGER "time_entry_calculate_hours" BEFORE UPDATE ON "public"."time_entries" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_time_entry_hours"();



CREATE OR REPLACE TRIGGER "trg_update_allowance_timestamp" BEFORE UPDATE ON "public"."employee_allowances" FOR EACH ROW EXECUTE FUNCTION "public"."update_allowance_timestamp"();



CREATE OR REPLACE TRIGGER "trg_update_deduction_timestamp" BEFORE UPDATE ON "public"."employee_deductions" FOR EACH ROW EXECUTE FUNCTION "public"."update_deduction_timestamp"();



CREATE OR REPLACE TRIGGER "trg_update_period_closure_timestamp" BEFORE UPDATE ON "public"."payroll_period_closures" FOR EACH ROW EXECUTE FUNCTION "public"."update_period_closure_timestamp"();



CREATE OR REPLACE TRIGGER "trigger_notify_employee_goal_approved" AFTER UPDATE ON "public"."performance_goals" FOR EACH ROW EXECUTE FUNCTION "public"."notify_employee_goal_approved"();



CREATE OR REPLACE TRIGGER "trigger_notify_manager_goal_created" AFTER INSERT ON "public"."performance_goals" FOR EACH ROW WHEN ((("new"."created_by" = 'employee'::"text") AND ("new"."status" = 'draft'::"text"))) EXECUTE FUNCTION "public"."notify_manager_goal_created"();



CREATE OR REPLACE TRIGGER "trigger_notify_manager_red_flag" AFTER INSERT ON "public"."goal_updates" FOR EACH ROW EXECUTE FUNCTION "public"."notify_manager_red_flag"();



CREATE OR REPLACE TRIGGER "trigger_track_payroll_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."employee_payroll" FOR EACH ROW EXECUTE FUNCTION "public"."track_payroll_changes"();



CREATE OR REPLACE TRIGGER "trigger_update_leave_balances" AFTER INSERT OR DELETE OR UPDATE ON "public"."leave_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_leave_balances"();



CREATE OR REPLACE TRIGGER "trigger_update_payroll_timestamp" BEFORE UPDATE ON "public"."employee_payroll" FOR EACH ROW EXECUTE FUNCTION "public"."update_payroll_timestamp"();



CREATE OR REPLACE TRIGGER "update_ai_credit_packs_updated_at" BEFORE UPDATE ON "public"."ai_credit_packs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_contact_submissions_updated_at" BEFORE UPDATE ON "public"."contact_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_demo_feedback_updated_at" BEFORE UPDATE ON "public"."demo_feedback" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tickets_updated_at" BEFORE UPDATE ON "public"."tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."openedpositions"
    ADD CONSTRAINT "OpenedPositions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id");



ALTER TABLE ONLY "public"."openedpositions"
    ADD CONSTRAINT "OpenedPositions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."attendance_exceptions"
    ADD CONSTRAINT "attendance_exceptions_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "public"."leave_requests"("id");



ALTER TABLE ONLY "public"."attendance_exceptions"
    ADD CONSTRAINT "attendance_exceptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."happiness_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_email_settings"
    ADD CONSTRAINT "company_email_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company"
    ADD CONSTRAINT "company_forfait_fkey" FOREIGN KEY ("forfait") REFERENCES "public"."forfait"("forfait_name");



ALTER TABLE ONLY "public"."company"
    ADD CONSTRAINT "company_forfait_id_fkey" FOREIGN KEY ("forfait_id") REFERENCES "public"."forfait"("id");



ALTER TABLE ONLY "public"."company_holidays"
    ADD CONSTRAINT "company_holidays_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_steps"
    ADD CONSTRAINT "company_steps_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id");



ALTER TABLE ONLY "public"."company_steps"
    ADD CONSTRAINT "company_steps_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "public"."recruitment_steps"("id");



ALTER TABLE ONLY "public"."company_to_users"
    ADD CONSTRAINT "company_to_users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id");



ALTER TABLE ONLY "public"."company_to_users"
    ADD CONSTRAINT "company_to_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."employee_allowances"
    ADD CONSTRAINT "employee_allowances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."employee_allowances"
    ADD CONSTRAINT "employee_allowances_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "public"."employee_payroll"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_deductions"
    ADD CONSTRAINT "employee_deductions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."employee_deductions"
    ADD CONSTRAINT "employee_deductions_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "public"."employee_payroll"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_payroll"
    ADD CONSTRAINT "employee_payroll_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "public"."payroll_countries"("country_code");



ALTER TABLE ONLY "public"."employee_payroll"
    ADD CONSTRAINT "employee_payroll_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."employee_payroll_history"
    ADD CONSTRAINT "employee_payroll_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."employee_payroll_history"
    ADD CONSTRAINT "employee_payroll_history_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "public"."employee_payroll"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_payroll_history"
    ADD CONSTRAINT "employee_payroll_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_payroll"
    ADD CONSTRAINT "employee_payroll_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."employee_payroll"
    ADD CONSTRAINT "employee_payroll_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "fk_user_profiles_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."goal_updates"
    ADD CONSTRAINT "goal_updates_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."goal_updates"
    ADD CONSTRAINT "goal_updates_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."performance_goals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."happiness_sessions"
    ADD CONSTRAINT "happiness_sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id");



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "public"."candidats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."openedpositions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_recruitment_step_id_fkey" FOREIGN KEY ("recruitment_step_id") REFERENCES "public"."recruitment_steps"("id");



ALTER TABLE ONLY "public"."leave_balances"
    ADD CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_types"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leave_balances"
    ADD CONSTRAINT "leave_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leave_requests"
    ADD CONSTRAINT "leave_requests_hr_validated_by_fkey" FOREIGN KEY ("hr_validated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leave_requests"
    ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_types"("id");



ALTER TABLE ONLY "public"."leave_requests"
    ADD CONSTRAINT "leave_requests_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leave_requests"
    ADD CONSTRAINT "leave_requests_medical_certificate_id_fkey" FOREIGN KEY ("medical_certificate_id") REFERENCES "public"."medical_certificates"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."leave_requests"
    ADD CONSTRAINT "leave_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leave_requests"
    ADD CONSTRAINT "leave_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."medical_certificates"
    ADD CONSTRAINT "medical_certificates_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "public"."leave_requests"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "public"."performance_goals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "public"."leave_requests"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_one_on_one_id_fkey" FOREIGN KEY ("one_on_one_id") REFERENCES "public"."one_on_ones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id");



ALTER TABLE ONLY "public"."one_on_ones"
    ADD CONSTRAINT "one_on_ones_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."one_on_ones"
    ADD CONSTRAINT "one_on_ones_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."one_on_ones"
    ADD CONSTRAINT "one_on_ones_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payroll_exports"
    ADD CONSTRAINT "payroll_exports_exported_by_fkey" FOREIGN KEY ("exported_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."payroll_period_closures"
    ADD CONSTRAINT "payroll_period_closures_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."payroll_period_closures"
    ADD CONSTRAINT "payroll_period_closures_reopened_by_fkey" FOREIGN KEY ("reopened_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."payroll_validation_issues"
    ADD CONSTRAINT "payroll_validation_issues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."payroll_validation_issues"
    ADD CONSTRAINT "payroll_validation_issues_validation_run_id_fkey" FOREIGN KEY ("validation_run_id") REFERENCES "public"."payroll_validation_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payroll_validation_runs"
    ADD CONSTRAINT "payroll_validation_runs_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "public"."payroll_countries"("country_code");



ALTER TABLE ONLY "public"."payroll_validation_runs"
    ADD CONSTRAINT "payroll_validation_runs_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."pending_subscriptions"
    ADD CONSTRAINT "pending_subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."performance_goals"
    ADD CONSTRAINT "performance_goals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."performance_goals"
    ADD CONSTRAINT "performance_goals_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."performance_goals"
    ADD CONSTRAINT "performance_goals_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."position_to_candidat"
    ADD CONSTRAINT "position_to_candidat_candidat_id_fkey" FOREIGN KEY ("candidat_id") REFERENCES "public"."candidats"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."position_to_candidat"
    ADD CONSTRAINT "position_to_candidat_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."openedpositions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_recommendations"
    ADD CONSTRAINT "session_recommendations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."happiness_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_attachments"
    ADD CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_attachments"
    ADD CONSTRAINT "ticket_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_shifts"
    ADD CONSTRAINT "user_shifts_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "public"."work_shifts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_shifts"
    ADD CONSTRAINT "user_shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_shifts"
    ADD CONSTRAINT "work_shifts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete payroll data" ON "public"."employee_payroll" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can insert payroll data" ON "public"."employee_payroll" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can insert payroll validation issues" ON "public"."payroll_validation_issues" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can insert payroll validation runs" ON "public"."payroll_validation_runs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can update payroll data" ON "public"."employee_payroll" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can update payroll validation runs" ON "public"."payroll_validation_runs" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can view all payroll data" ON "public"."employee_payroll" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can view export logs" ON "public"."payroll_exports" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can view payroll history" ON "public"."employee_payroll_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can view payroll validation issues" ON "public"."payroll_validation_issues" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Admins can view payroll validation runs" ON "public"."payroll_validation_runs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "Allow all updates" ON "public"."medical_certificates" USING (true);



CREATE POLICY "Allow all updates" ON "public"."openedpositions" FOR UPDATE USING (true);



CREATE POLICY "Allow all updates" ON "public"."position_to_candidat" USING (true);



CREATE POLICY "Allow anonymous session creation" ON "public"."happiness_sessions" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to delete company email settings" ON "public"."company_email_settings" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert company email settings" ON "public"."company_email_settings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to read company email settings" ON "public"."company_email_settings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update company email settings" ON "public"."company_email_settings" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update company_to_users" ON "public"."company_to_users" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow chat messages for session" ON "public"."chat_messages" TO "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."happiness_sessions"
  WHERE (("happiness_sessions"."id" = "chat_messages"."session_id") AND (("happiness_sessions"."session_token")::"text" = ( SELECT (("current_setting"('request.headers'::"text", true))::json ->> 'x-session-token'::"text")))))));



CREATE POLICY "Allow insert for authenticated users" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow logged-in users to select their company" ON "public"."company_to_users" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow logged-in users to select their company" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow public insert" ON "public"."openedpositions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow reading daily metrics" ON "public"."happiness_daily_metrics" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow reading own session" ON "public"."happiness_sessions" FOR SELECT TO "anon" USING ((("session_token")::"text" = ( SELECT (("current_setting"('request.headers'::"text", true))::json ->> 'x-session-token'::"text"))));



CREATE POLICY "Allow recommendations for session" ON "public"."session_recommendations" TO "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."happiness_sessions"
  WHERE (("happiness_sessions"."id" = "session_recommendations"."session_id") AND (("happiness_sessions"."session_token")::"text" = (("current_setting"('request.headers'::"text"))::json ->> 'x-session-token'::"text"))))));



CREATE POLICY "Allow session updates by token" ON "public"."happiness_sessions" FOR UPDATE TO "anon" USING ((("session_token")::"text" = ( SELECT "t"."token_value"
   FROM ( SELECT (("current_setting"('request.headers'::"text", true))::json ->> 'x-session-token'::"text") AS "token_value") "t")));



CREATE POLICY "Allow update for authenticated users" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow users to insert their own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Allow users to select their own profile" ON "public"."profiles" FOR SELECT USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Allow users to update their own profile" ON "public"."profiles" FOR UPDATE USING (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Anyone can insert feedback" ON "public"."demo_feedback" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can view active countries" ON "public"."payroll_countries" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Company admins can update company tickets" ON "public"."tickets" FOR UPDATE USING ((("company_id" IN ( SELECT "ctu"."company_id"
   FROM "public"."company_to_users" "ctu"
  WHERE ("ctu"."user_id" = "auth"."uid"()))) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true))))));



CREATE POLICY "Company users can insert company tickets" ON "public"."tickets" FOR INSERT WITH CHECK (("company_id" IN ( SELECT "company_to_users"."company_id"
   FROM "public"."company_to_users"
  WHERE ("company_to_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Company users can view company ticket messages" ON "public"."ticket_messages" FOR SELECT USING (("ticket_id" IN ( SELECT "t"."id"
   FROM ("public"."tickets" "t"
     JOIN "public"."company_to_users" "ctu" ON (("t"."company_id" = "ctu"."company_id")))
  WHERE ("ctu"."user_id" = "auth"."uid"()))));



CREATE POLICY "Employees can insert their own updates" ON "public"."goal_updates" FOR INSERT WITH CHECK (("auth"."uid"() = "employee_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."contact_submissions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."interviews" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."company_email_settings" FOR INSERT;



CREATE POLICY "Enable read access for all users" ON "public"."ai_credit_packs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."candidats" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."company" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."company_email_settings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."company_steps" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."company_to_users" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."contact_submissions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."employee_payroll" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."forfait" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."interviews" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."medical_certificates" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."notifications" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."openedpositions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."position_to_candidat" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."recruitment_steps" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_profiles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Everyone can view leave types" ON "public"."leave_types" FOR SELECT USING (true);



CREATE POLICY "HR can update company certificates" ON "public"."medical_certificates" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."is_admin" = true) OR ("u"."is_super_admin" = true))))));



CREATE POLICY "HR can update leave requests with medical certificates" ON "public"."leave_requests" FOR UPDATE USING ((("medical_certificate_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."is_admin" = true) OR ("users"."is_super_admin" = true)))))));



CREATE POLICY "HR can view company certificates" ON "public"."medical_certificates" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."is_admin" = true) OR ("u"."is_super_admin" = true))))));



CREATE POLICY "HR can view leave requests with medical certificates" ON "public"."leave_requests" FOR SELECT USING ((("medical_certificate_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND (("users"."is_admin" = true) OR ("users"."is_super_admin" = true)))))));



CREATE POLICY "Managers and employees can update one-on-ones" ON "public"."one_on_ones" FOR UPDATE USING ((("auth"."uid"() = "employee_id") OR ("auth"."uid"() = "manager_id")));



CREATE POLICY "Managers approve team time entries" ON "public"."time_entries" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."manager_id" = "auth"."uid"()) AND ("up"."user_id" = "time_entries"."user_id")))));



CREATE POLICY "Managers can insert one-on-ones" ON "public"."one_on_ones" FOR INSERT WITH CHECK ((("auth"."uid"() = "manager_id") OR ("auth"."uid"() = "employee_id")));



CREATE POLICY "Managers can update team requests" ON "public"."leave_requests" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "leave_requests"."user_id") AND ("user_profiles"."manager_id" = "auth"."uid"())))) OR ("auth"."uid"() = "manager_id")));



CREATE POLICY "Managers can view team certificates" ON "public"."medical_certificates" FOR SELECT USING (("leave_request_id" IN ( SELECT "lr"."id"
   FROM "public"."leave_requests" "lr"
  WHERE ("lr"."manager_id" = "auth"."uid"()))));



CREATE POLICY "Managers can view team leave balances" ON "public"."leave_balances" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "leave_balances"."user_id") AND ("user_profiles"."manager_id" = "auth"."uid"())))));



CREATE POLICY "Managers can view team leave requests" ON "public"."leave_requests" FOR SELECT USING (("auth"."uid"() = "manager_id"));



CREATE POLICY "Managers view team time entries" ON "public"."time_entries" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."manager_id" = "auth"."uid"()) AND ("up"."user_id" = "time_entries"."user_id")))));



CREATE POLICY "Only authenticated users can read feedback" ON "public"."demo_feedback" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Super admins can view all ticket messages" ON "public"."ticket_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."company_to_users" "ctu"
     JOIN "public"."company" "c" ON (("c"."id" = "ctu"."company_id")))
  WHERE (("ctu"."user_id" = "auth"."uid"()) AND ("c"."slug" = ANY (ARRAY['innohr'::"text", 'hrinno'::"text"]))))));



CREATE POLICY "Super admins can view all tickets" ON "public"."tickets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."company_to_users" "ctu"
     JOIN "public"."company" "c" ON (("c"."id" = "ctu"."company_id")))
  WHERE (("ctu"."user_id" = "auth"."uid"()) AND ("c"."slug" = ANY (ARRAY['innohr'::"text", 'hrinno'::"text"]))))));



CREATE POLICY "Super admins can view all tickets for realtime" ON "public"."tickets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."company_to_users" "ctu"
     JOIN "public"."company" "c" ON (("c"."id" = "ctu"."company_id")))
  WHERE (("ctu"."user_id" = "auth"."uid"()) AND ("c"."slug" = ANY (ARRAY['innohr'::"text", 'hrinno'::"text"]))))));



CREATE POLICY "System can manage leave balances" ON "public"."leave_balances" USING ((("current_setting"('role'::"text", true) = 'service_role'::"text") OR (CURRENT_USER = 'postgres'::"name")));



CREATE POLICY "Users can create own leave requests" ON "public"."leave_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own leave requests" ON "public"."leave_requests" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert attachments for their company tickets" ON "public"."ticket_attachments" FOR INSERT WITH CHECK (("ticket_id" IN ( SELECT "tickets"."id"
   FROM "public"."tickets"
  WHERE ("tickets"."company_id" IN ( SELECT "tickets"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"()))))));



CREATE POLICY "Users can insert own certificates" ON "public"."medical_certificates" FOR INSERT WITH CHECK ((("leave_request_id" IN ( SELECT "leave_requests"."id"
   FROM "public"."leave_requests"
  WHERE ("leave_requests"."user_id" = "auth"."uid"()))) OR ("leave_request_id" IS NULL)));



CREATE POLICY "Users can insert own leave balances" ON "public"."leave_balances" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert ticket messages" ON "public"."ticket_messages" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM ("public"."company_to_users" "ctu"
     JOIN "public"."company" "c" ON (("c"."id" = "ctu"."company_id")))
  WHERE (("ctu"."user_id" = "auth"."uid"()) AND ("c"."is_super_admin_company" = true)))) OR ("ticket_id" IN ( SELECT "t"."id"
   FROM ("public"."tickets" "t"
     JOIN "public"."company_to_users" "ctu" ON (("t"."company_id" = "ctu"."company_id")))
  WHERE ("ctu"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can read company_to_users for their own record" ON "public"."company_to_users" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own leave balances" ON "public"."leave_balances" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own pending requests" ON "public"."leave_requests" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (("status")::"text" = 'pending'::"text")));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view attachments for their company tickets" ON "public"."ticket_attachments" FOR SELECT USING (("ticket_id" IN ( SELECT "tickets"."id"
   FROM "public"."tickets"
  WHERE ("tickets"."company_id" IN ( SELECT "tickets"."company_id"
           FROM "public"."users"
          WHERE ("users"."id" = "auth"."uid"()))))));



CREATE POLICY "Users can view company tickets" ON "public"."tickets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."company_to_users" "ctu"
  WHERE (("ctu"."user_id" = "auth"."uid"()) AND ("ctu"."company_id" = "tickets"."company_id")))));



CREATE POLICY "Users can view own certificates" ON "public"."medical_certificates" FOR SELECT USING ((("employee_name" ~~* ( SELECT COALESCE((("u"."user_firstname" || ' '::"text") || "u"."user_lastname"), ("au"."email")::"text") AS "coalesce"
   FROM ("public"."users" "u"
     JOIN "auth"."users" "au" ON (("u"."id" = "au"."id")))
  WHERE ("u"."id" = "auth"."uid"()))) OR ("leave_request_id" IN ( SELECT "leave_requests"."id"
   FROM "public"."leave_requests"
  WHERE ("leave_requests"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own leave balances" ON "public"."leave_balances" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own leave requests" ON "public"."leave_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own one-on-ones" ON "public"."one_on_ones" FOR SELECT USING ((("auth"."uid"() = "employee_id") OR ("auth"."uid"() = "manager_id")));



CREATE POLICY "Users can view their own pending subscriptions" ON "public"."pending_subscriptions" FOR SELECT USING (("company_id" IN ( SELECT "company_to_users"."company_id"
   FROM "public"."company_to_users"
  WHERE ("company_to_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own subscriptions" ON "public"."subscriptions" FOR SELECT USING (("company_id" IN ( SELECT "company_to_users"."company_id"
   FROM "public"."company_to_users"
  WHERE ("company_to_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own tickets for realtime" ON "public"."tickets" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view ticket messages" ON "public"."ticket_messages" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."company_to_users" "ctu"
     JOIN "public"."company" "c" ON (("c"."id" = "ctu"."company_id")))
  WHERE (("ctu"."user_id" = "auth"."uid"()) AND ("c"."is_super_admin_company" = true)))) OR ("ticket_id" IN ( SELECT "t"."id"
   FROM ("public"."tickets" "t"
     JOIN "public"."company_to_users" "ctu" ON (("t"."company_id" = "ctu"."company_id")))
  WHERE ("ctu"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view updates for their goals" ON "public"."goal_updates" FOR SELECT USING ((("employee_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."performance_goals"
  WHERE (("performance_goals"."id" = "goal_updates"."goal_id") AND ("performance_goals"."manager_id" = "auth"."uid"()))))));



CREATE POLICY "Users insert own time entries" ON "public"."time_entries" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND ("clock_out" IS NULL)));



CREATE POLICY "Users update own time entries" ON "public"."time_entries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users view own time entries" ON "public"."time_entries" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ai_credit_packs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attendance_exceptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_email_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_holidays" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_to_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contact_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."demo_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_allowances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_deductions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_payroll" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_payroll_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "employees can insert own goals" ON "public"."performance_goals" FOR INSERT WITH CHECK ((("auth"."uid"() = "employee_id") AND ("created_by" = 'employee'::"text")));



CREATE POLICY "employees can update own draft goals" ON "public"."performance_goals" FOR UPDATE USING ((("auth"."uid"() = "employee_id") AND ("status" = 'draft'::"text")));



CREATE POLICY "employees can view own goals" ON "public"."performance_goals" FOR SELECT USING (("auth"."uid"() = "employee_id"));



ALTER TABLE "public"."forfait" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."goal_updates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."happiness_daily_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."happiness_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leave_balances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leave_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leave_types" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "managers can insert for team" ON "public"."performance_goals" FOR INSERT WITH CHECK ((("auth"."uid"() = "manager_id") AND ("created_by" = 'manager'::"text")));



CREATE POLICY "managers can update team goals" ON "public"."performance_goals" FOR UPDATE USING (("auth"."uid"() = "manager_id"));



CREATE POLICY "managers can view team goals" ON "public"."performance_goals" FOR SELECT USING (("auth"."uid"() = "manager_id"));



ALTER TABLE "public"."medical_certificates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."night_batch_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."one_on_ones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."openedpositions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_exports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_period_closures" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_validation_issues" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_validation_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."performance_goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "policy_allowances_admin" ON "public"."employee_allowances" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "policy_deductions_admin" ON "public"."employee_deductions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "policy_period_closures_insert" ON "public"."payroll_period_closures" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "policy_period_closures_select" ON "public"."payroll_period_closures" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



CREATE POLICY "policy_period_closures_update" ON "public"."payroll_period_closures" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."is_admin" = true)))));



ALTER TABLE "public"."position_to_candidat" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recruitment_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stripe_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "super_admin_update" ON "public"."tickets" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM (("public"."users" "u"
     JOIN "public"."company_to_users" "ctu" ON (("u"."id" = "ctu"."user_id")))
     JOIN "public"."company" "c" ON (("c"."id" = "ctu"."company_id")))
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."is_admin" = true) AND ("c"."slug" = ANY (ARRAY['innohr'::"text", 'hrinno'::"text"])))))) WITH CHECK (true);



ALTER TABLE "public"."ticket_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ticket_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_shifts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."work_shifts" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_annual_leave_entitlement"("employment_start_date" "date", "calculation_year" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_annual_leave_entitlement"("employment_start_date" "date", "calculation_year" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_annual_leave_entitlement"("employment_start_date" "date", "calculation_year" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_time_entry_hours"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_time_entry_hours"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_time_entry_hours"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_total_compensation"("p_payroll_id" "uuid", "p_year" integer, "p_month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_total_compensation"("p_payroll_id" "uuid", "p_year" integer, "p_month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_total_compensation"("p_payroll_id" "uuid", "p_year" integer, "p_month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_working_days"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_working_days"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_working_days"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_access_happy_check"("p_company_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."can_access_happy_check"("p_company_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_access_happy_check"("p_company_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."can_add_medical_certificate"("p_company_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."can_add_medical_certificate"("p_company_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_add_medical_certificate"("p_company_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."can_open_new_position"("p_company_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."can_open_new_position"("p_company_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_open_new_position"("p_company_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."check_certificate_date_alignment"("leave_request_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_certificate_date_alignment"("leave_request_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_certificate_date_alignment"("leave_request_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_overlapping_leaves"("user_id_param" "uuid", "year_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."check_overlapping_leaves"("user_id_param" "uuid", "year_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_overlapping_leaves"("user_id_param" "uuid", "year_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."decrease_ai_credit"("company_id_input" integer, "credits_input" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."decrease_ai_credit"("company_id_input" integer, "credits_input" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrease_ai_credit"("company_id_input" integer, "credits_input" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_attendance_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_attendance_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_attendance_summary"("p_user_id" "uuid", "p_start_date" "date", "p_end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_calendar_data"("user_id_param" "uuid", "year_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_calendar_data"("user_id_param" "uuid", "year_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_calendar_data"("user_id_param" "uuid", "year_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_candidates"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_candidates"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_candidates"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_users"("company_id_input" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_users"("company_id_input" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_users"("company_id_input" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_company_users_v2"("company_id_input" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_company_users_v2"("company_id_input" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_company_users_v2"("company_id_input" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_quarter"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_quarter"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_quarter"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_leave_request_by_medical_cert"("cert_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_leave_request_by_medical_cert"("cert_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_leave_request_by_medical_cert"("cert_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_manager_pending_approvals"("manager_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_manager_pending_approvals"("manager_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_manager_pending_approvals"("manager_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payroll_for_period"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_payroll_for_period"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payroll_for_period"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payroll_for_period_with_compensation"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_payroll_for_period_with_compensation"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payroll_for_period_with_compensation"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pending_certificates"("company_id_param" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_pending_certificates"("company_id_param" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pending_certificates"("company_id_param" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_period_status"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_period_status"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_period_status"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recruitment_steps_for_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_recruitment_steps_for_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recruitment_steps_for_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_calendar_data"("manager_id_param" "uuid", "year_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_calendar_data"("manager_id_param" "uuid", "year_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_calendar_data"("manager_id_param" "uuid", "year_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_members_by_manager"("manager_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_members_by_manager"("manager_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_members_by_manager"("manager_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_ticket_stats"("company_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_ticket_stats"("company_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ticket_stats"("company_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_leave_overview"("user_id_param" "uuid", "year_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_leave_overview"("user_id_param" "uuid", "year_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_leave_overview"("user_id_param" "uuid", "year_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_manager"("user_id_param" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_manager"("user_id_param" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_manager"("user_id_param" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_week_start"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_week_start"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_week_start"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_pulse_this_week"("p_goal_id" "uuid", "p_employee_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_pulse_this_week"("p_goal_id" "uuid", "p_employee_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_pulse_this_week"("p_goal_id" "uuid", "p_employee_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_user_leave_balances"("user_id_param" "uuid", "year_param" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_user_leave_balances"("user_id_param" "uuid", "year_param" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_user_leave_balances"("user_id_param" "uuid", "year_param" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_period_closed"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_period_closed"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_period_closed"("p_country_code" character varying, "p_year" integer, "p_month" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."nightly_cleanup"() TO "anon";
GRANT ALL ON FUNCTION "public"."nightly_cleanup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."nightly_cleanup"() TO "service_role";



GRANT ALL ON PROCEDURE "public"."nightly_cleanup_demo"() TO "anon";
GRANT ALL ON PROCEDURE "public"."nightly_cleanup_demo"() TO "authenticated";
GRANT ALL ON PROCEDURE "public"."nightly_cleanup_demo"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_employee_goal_approved"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_employee_goal_approved"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_employee_goal_approved"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_manager_goal_created"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_manager_goal_created"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_manager_goal_created"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_manager_red_flag"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_manager_red_flag"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_manager_red_flag"() TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_ai_usage"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_ai_usage"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_ai_usage"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_leave_to_attendance"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_leave_to_attendance"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_leave_to_attendance"() TO "service_role";



GRANT ALL ON FUNCTION "public"."track_payroll_changes"() TO "anon";
GRANT ALL ON FUNCTION "public"."track_payroll_changes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."track_payroll_changes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_allowance_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_allowance_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_allowance_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_daily_happiness_metrics"("target_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."update_daily_happiness_metrics"("target_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_daily_happiness_metrics"("target_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_deduction_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_deduction_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_deduction_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_leave_balances"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_leave_balances"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_leave_balances"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_leave_request_by_medical_cert"("cert_id" integer, "is_confirmed" boolean, "validated" boolean, "validated_by_user" "uuid", "validated_at_time" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."update_leave_request_by_medical_cert"("cert_id" integer, "is_confirmed" boolean, "validated" boolean, "validated_by_user" "uuid", "validated_at_time" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_leave_request_by_medical_cert"("cert_id" integer, "is_confirmed" boolean, "validated" boolean, "validated_by_user" "uuid", "validated_at_time" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_payroll_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_payroll_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_payroll_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_period_closure_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_period_closure_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_period_closure_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_user_profile"("user_id_param" "uuid", "manager_id_param" "uuid", "employment_start_date_param" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_user_profile"("user_id_param" "uuid", "manager_id_param" "uuid", "employment_start_date_param" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_user_profile"("user_id_param" "uuid", "manager_id_param" "uuid", "employment_start_date_param" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_medical_certificate"("certificate_id_param" bigint, "hr_comment_param" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_medical_certificate"("certificate_id_param" bigint, "hr_comment_param" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_medical_certificate"("certificate_id_param" bigint, "hr_comment_param" "text") TO "service_role";



GRANT ALL ON TABLE "public"."ai_credit_packs" TO "anon";
GRANT ALL ON TABLE "public"."ai_credit_packs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_credit_packs" TO "service_role";



GRANT ALL ON TABLE "public"."attendance_exceptions" TO "anon";
GRANT ALL ON TABLE "public"."attendance_exceptions" TO "authenticated";
GRANT ALL ON TABLE "public"."attendance_exceptions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."attendance_exceptions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."attendance_exceptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."attendance_exceptions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."candidats" TO "anon";
GRANT ALL ON TABLE "public"."candidats" TO "authenticated";
GRANT ALL ON TABLE "public"."candidats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."candidats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."candidats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."candidats_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."company" TO "anon";
GRANT ALL ON TABLE "public"."company" TO "authenticated";
GRANT ALL ON TABLE "public"."company" TO "service_role";



GRANT ALL ON TABLE "public"."company_email_settings" TO "anon";
GRANT ALL ON TABLE "public"."company_email_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."company_email_settings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_email_settings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_email_settings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_email_settings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_holidays" TO "anon";
GRANT ALL ON TABLE "public"."company_holidays" TO "authenticated";
GRANT ALL ON TABLE "public"."company_holidays" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_holidays_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_holidays_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_holidays_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_steps" TO "anon";
GRANT ALL ON TABLE "public"."company_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."company_steps" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_steps_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_steps_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_steps_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."company_to_users" TO "anon";
GRANT ALL ON TABLE "public"."company_to_users" TO "authenticated";
GRANT ALL ON TABLE "public"."company_to_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."company_to_users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."company_to_users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."company_to_users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."contact_submissions" TO "anon";
GRANT ALL ON TABLE "public"."contact_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."contact_submissions_summary" TO "anon";
GRANT ALL ON TABLE "public"."contact_submissions_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_submissions_summary" TO "service_role";



GRANT ALL ON TABLE "public"."demo_feedback" TO "anon";
GRANT ALL ON TABLE "public"."demo_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."demo_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."employee_allowances" TO "anon";
GRANT ALL ON TABLE "public"."employee_allowances" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_allowances" TO "service_role";



GRANT ALL ON TABLE "public"."employee_deductions" TO "anon";
GRANT ALL ON TABLE "public"."employee_deductions" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_deductions" TO "service_role";



GRANT ALL ON TABLE "public"."employee_payroll" TO "anon";
GRANT ALL ON TABLE "public"."employee_payroll" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_payroll" TO "service_role";



GRANT ALL ON TABLE "public"."employee_payroll_history" TO "anon";
GRANT ALL ON TABLE "public"."employee_payroll_history" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_payroll_history" TO "service_role";



GRANT ALL ON TABLE "public"."forfait" TO "anon";
GRANT ALL ON TABLE "public"."forfait" TO "authenticated";
GRANT ALL ON TABLE "public"."forfait" TO "service_role";



GRANT ALL ON SEQUENCE "public"."forfait_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."forfait_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."forfait_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."goal_updates" TO "anon";
GRANT ALL ON TABLE "public"."goal_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."goal_updates" TO "service_role";



GRANT ALL ON TABLE "public"."happiness_daily_metrics" TO "anon";
GRANT ALL ON TABLE "public"."happiness_daily_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."happiness_daily_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."happiness_sessions" TO "anon";
GRANT ALL ON TABLE "public"."happiness_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."happiness_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."interviews" TO "anon";
GRANT ALL ON TABLE "public"."interviews" TO "authenticated";
GRANT ALL ON TABLE "public"."interviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."interviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."interviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."interviews_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."leave_balances" TO "anon";
GRANT ALL ON TABLE "public"."leave_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."leave_balances" TO "service_role";



GRANT ALL ON TABLE "public"."leave_requests" TO "anon";
GRANT ALL ON TABLE "public"."leave_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."leave_requests" TO "service_role";



GRANT ALL ON TABLE "public"."leave_types" TO "anon";
GRANT ALL ON TABLE "public"."leave_types" TO "authenticated";
GRANT ALL ON TABLE "public"."leave_types" TO "service_role";



GRANT ALL ON TABLE "public"."medical_certificates" TO "anon";
GRANT ALL ON TABLE "public"."medical_certificates" TO "authenticated";
GRANT ALL ON TABLE "public"."medical_certificates" TO "service_role";



GRANT ALL ON SEQUENCE "public"."medical_certificates_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."medical_certificates_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."medical_certificates_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."night_batch_log" TO "anon";
GRANT ALL ON TABLE "public"."night_batch_log" TO "authenticated";
GRANT ALL ON TABLE "public"."night_batch_log" TO "service_role";



GRANT ALL ON SEQUENCE "public"."night_batch_log_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."night_batch_log_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."night_batch_log_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."one_on_ones" TO "anon";
GRANT ALL ON TABLE "public"."one_on_ones" TO "authenticated";
GRANT ALL ON TABLE "public"."one_on_ones" TO "service_role";



GRANT ALL ON TABLE "public"."openedpositions" TO "anon";
GRANT ALL ON TABLE "public"."openedpositions" TO "authenticated";
GRANT ALL ON TABLE "public"."openedpositions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."openedpositions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."openedpositions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."openedpositions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_countries" TO "anon";
GRANT ALL ON TABLE "public"."payroll_countries" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_countries" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_exports" TO "anon";
GRANT ALL ON TABLE "public"."payroll_exports" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_exports" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_period_closures" TO "anon";
GRANT ALL ON TABLE "public"."payroll_period_closures" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_period_closures" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_validation_issues" TO "anon";
GRANT ALL ON TABLE "public"."payroll_validation_issues" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_validation_issues" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_validation_runs" TO "anon";
GRANT ALL ON TABLE "public"."payroll_validation_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_validation_runs" TO "service_role";



GRANT ALL ON TABLE "public"."pending_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."pending_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."performance_goals" TO "anon";
GRANT ALL ON TABLE "public"."performance_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_goals" TO "service_role";



GRANT ALL ON TABLE "public"."position_to_candidat" TO "anon";
GRANT ALL ON TABLE "public"."position_to_candidat" TO "authenticated";
GRANT ALL ON TABLE "public"."position_to_candidat" TO "service_role";



GRANT ALL ON SEQUENCE "public"."position_to_candidat_position_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."position_to_candidat_position_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."position_to_candidat_position_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."positions_by_user_company" TO "anon";
GRANT ALL ON TABLE "public"."positions_by_user_company" TO "authenticated";
GRANT ALL ON TABLE "public"."positions_by_user_company" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recruitment_steps" TO "anon";
GRANT ALL ON TABLE "public"."recruitment_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."recruitment_steps" TO "service_role";



GRANT ALL ON SEQUENCE "public"."recruitment_steps_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."recruitment_steps_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."recruitment_steps_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."session_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."session_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."session_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."stripe_events" TO "anon";
GRANT ALL ON TABLE "public"."stripe_events" TO "authenticated";
GRANT ALL ON TABLE "public"."stripe_events" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_attachments" TO "anon";
GRANT ALL ON TABLE "public"."ticket_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_messages" TO "anon";
GRANT ALL ON TABLE "public"."ticket_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_messages" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON TABLE "public"."time_entries" TO "anon";
GRANT ALL ON TABLE "public"."time_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."time_entries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."time_entries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."time_entries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."time_entries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_shifts" TO "anon";
GRANT ALL ON TABLE "public"."user_shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."user_shifts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_shifts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_shifts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_shifts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."v_goals_with_status" TO "anon";
GRANT ALL ON TABLE "public"."v_goals_with_status" TO "authenticated";
GRANT ALL ON TABLE "public"."v_goals_with_status" TO "service_role";



GRANT ALL ON TABLE "public"."work_shifts" TO "anon";
GRANT ALL ON TABLE "public"."work_shifts" TO "authenticated";
GRANT ALL ON TABLE "public"."work_shifts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."work_shifts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."work_shifts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."work_shifts_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







