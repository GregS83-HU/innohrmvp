// src/app/api/payroll/export/route.ts
    // POST: Export payroll data to Excel in various Hungarian formats

    import { createClient } from '@supabase/supabase-js';
    import { NextRequest, NextResponse } from 'next/server';
    import type { ExportPayrollRequest, ExportFormat } from '../../../../../types/payroll';
    import { runPayrollValidation } from '../../../../../lib/runPayrollValidation';

    /**
     * POST /api/payroll/export
     * Export payroll data to Excel (admin only)
     */
    export async function POST(request: NextRequest) {
    try {
        const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Parse request body
        const body: ExportPayrollRequest & { validated_by?: string } = await request.json();

        // Validate required fields
        if (!body.country_code || !body.export_month || !body.export_year || !body.export_format) {
        return NextResponse.json(
            { error: 'Missing required fields: country_code, export_month, export_year, export_format' },
            { status: 400 }
        );
        }

        if (!body.validated_by) {
        return NextResponse.json(
            { error: 'validated_by is required' },
            { status: 400 }
        );
        }

        // Validate month and year
        if (body.export_month < 1 || body.export_month > 12) {
        return NextResponse.json(
            { error: 'Invalid month. Must be between 1 and 12' },
            { status: 400 }
        );
        }

        if (body.export_year < 2000 || body.export_year > 2100) {
        return NextResponse.json(
            { error: 'Invalid year' },
            { status: 400 }
        );
        }

        // -------------------------------
        // RUN PAYROLL VALIDATION
        // -------------------------------
        const validationResult = await runPayrollValidation({
        countryCode: body.country_code,
        year: body.export_year,
        month: body.export_month,
        exportFormat: body.export_format,
        validatedBy: body.validated_by
        });

        if (validationResult.hasCriticalErrors) {
        return NextResponse.json(
            {
            success: false,
            status: 'blocked',
            reason: 'Payroll validation failed',
            issues: validationResult.issues
            },
            { status: 400 }
        );
        }

        // Call stored function to get payroll data for the period
        const { data: payrollData, error: dataError } = await supabase
        .rpc('get_payroll_for_period', {
            p_country_code: body.country_code,
            p_year: body.export_year,
            p_month: body.export_month
        });

        if (dataError) {
        console.error('Error fetching payroll data:', dataError);
        return NextResponse.json({ error: dataError.message }, { status: 500 });
        }

        // Filter by employment type if specified
        let filteredData = payrollData || [];
        if (body.employment_types && body.employment_types.length > 0) {
        filteredData = filteredData.filter((emp: any) =>
            body.employment_types!.includes(emp.employment_type)
        );
        }

        // Filter by department if specified
        if (body.department) {
        filteredData = filteredData.filter((emp: any) =>
            emp.department === body.department
        );
        }

        // Filter terminated employees if requested
        if (!body.include_terminated) {
        filteredData = filteredData.filter((emp: any) =>
            !emp.termination_date || new Date(emp.termination_date) > new Date()
        );
        }

        if (filteredData.length === 0) {
        return NextResponse.json(
            { error: 'No employees found matching the criteria' },
            { status: 404 }
        );
        }

        // Generate filename
        const monthName = new Date(body.export_year, body.export_month - 1).toLocaleString('en-US', { month: 'long' });
        const fileName = `Payroll_${body.country_code}_${monthName}_${body.export_year}_${body.export_format}.xlsx`;

        // Log export
        const { data: exportLog, error: logError } = await supabase
        .from('payroll_exports')
        .insert({
            exported_by: body.validated_by,
            country_code: body.country_code,
            export_month: body.export_month,
            export_year: body.export_year,
            export_format: body.export_format,
            export_name: body.export_name || null, // NEW: Optional user-provided name
            employee_count: filteredData.length,
            file_name: fileName,
            export_options: {
            include_terminated: body.include_terminated,
            department: body.department,
            employment_types: body.employment_types
            }
        })
        .select()
        .single();

        if (logError) {
        console.error('Error logging export:', logError);
        // Continue anyway
        }

        // Return data for client-side Excel generation
        return NextResponse.json({
        success: true,
        export_id: exportLog?.id,
        file_name: fileName,
        employee_count: filteredData.length,
        export_date: new Date().toISOString(),
        data: filteredData,
        format: body.export_format,
        month: body.export_month,
        year: body.export_year
        }, { status: 200 });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    }