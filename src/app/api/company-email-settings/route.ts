// app/api/company-email-settings/route.ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { encryptPassword } from '../../../../lib/encryption'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      company_id,
      smtp_host,
      smtp_port,
      smtp_secure,
      smtp_username,
      smtp_password,
      from_name,
      from_email,
    } = body

    // Validate required fields
    if (!company_id || !smtp_host || !smtp_port || !smtp_username || !smtp_password || !from_email) {
      return NextResponse.json(
        { error: 'Missing required fields: company_id, smtp_host, smtp_port, smtp_username, smtp_password, from_email' },
        { status: 400 }
      )
    }

    // Validate SMTP port
    if (typeof smtp_port !== 'number' || smtp_port < 1 || smtp_port > 65535) {
      return NextResponse.json(
        { error: 'Invalid smtp_port: must be a number between 1 and 65535' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(from_email)) {
      return NextResponse.json(
        { error: 'Invalid from_email format' },
        { status: 400 }
      )
    }

    const supabase = createServerComponentClient({ cookies })

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from('company')
      .select('id')
      .eq('id', company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Encrypt the password
    const encryptedPassword = encryptPassword(smtp_password)

    // Check if settings already exist for this company
    const { data: existingSettings } = await supabase
      .from('company_email_settings')
      .select('id')
      .eq('company_id', company_id)
      .single()

    if (existingSettings) {
      // Update existing settings
      const { data: updatedData, error: updateError } = await supabase
        .from('company_email_settings')
        .update({
          smtp_host,
          smtp_port,
          smtp_secure: smtp_secure ?? true,
          smtp_username,
          smtp_password_encrypted: encryptedPassword,
          from_name: from_name || null,
          from_email,
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', company_id)
        .select()

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Email settings updated successfully',
        data: updatedData[0],
      })
    } else {
      // Insert new settings
      const { data: insertedData, error: insertError } = await supabase
        .from('company_email_settings')
        .insert([
          {
            company_id,
            smtp_host,
            smtp_port,
            smtp_secure: smtp_secure ?? true,
            smtp_username,
            smtp_password_encrypted: encryptedPassword,
            from_name: from_name || null,
            from_email,
          },
        ])
        .select()

      if (insertError || !insertedData || insertedData.length === 0) {
        return NextResponse.json(
          { error: insertError?.message || 'Failed to create email settings' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Email settings created successfully',
        data: insertedData[0],
      })
    }
  } catch (error) {
    console.error('Error saving company email settings:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const company_id = searchParams.get('company_id')

    if (!company_id) {
      return NextResponse.json(
        { error: 'Missing company_id parameter' },
        { status: 400 }
      )
    }

    const supabase = createServerComponentClient({ cookies })

    const { data, error } = await supabase
      .from('company_email_settings')
      .select('id, company_id, smtp_host, smtp_port, smtp_secure, smtp_username, from_name, from_email, created_at, updated_at')
      .eq('company_id', company_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Email settings not found for this company' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Don't return the encrypted password
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching company email settings:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const company_id = searchParams.get('company_id')

    if (!company_id) {
      return NextResponse.json(
        { error: 'Missing company_id parameter' },
        { status: 400 }
      )
    }

    const supabase = createServerComponentClient({ cookies })

    const { error } = await supabase
      .from('company_email_settings')
      .delete()
      .eq('company_id', company_id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Email settings deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting company email settings:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}