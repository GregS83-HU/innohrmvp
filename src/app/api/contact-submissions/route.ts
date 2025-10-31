// /app/api/contact-submissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define proper types
interface UpdateData {
  updated_at: string;
  status?: string;
  notes?: string | null;
}

// Helper function to verify super_admin access
async function verifySuperAdmin(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    // Get auth token from cookie or header
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sb-access-token')?.value || 
                      cookieStore.get('supabase-auth-token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!authToken) {
      return { authorized: false, error: 'No authentication token found' };
    }

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authToken);
    
    if (authError || !user) {
      return { authorized: false, error: 'Invalid authentication token' };
    }

    // Check if user is super_admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, is_super_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData || userData.is_super_admin !== true) {
      return { authorized: false, error: 'User is not authorized. Super admin access required.' };
    }

    return { authorized: true, userId: userData.id };
  } catch (error) {
    console.error('Authorization error:', error);
    return { authorized: false, error: 'Authorization check failed' };
  }
}

// GET - Fetch all submissions with filtering and sorting
export async function GET(request: NextRequest) {
  try {
    // Verify super_admin access
    const authCheck = await verifySuperAdmin(request);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error || 'Unauthorized access' }, 
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'submitted_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabase
      .from('contact_submissions')
      .select('*');

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search functionality
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update submission (status, notes, etc.)
export async function PATCH(request: NextRequest) {
  try {
    // Verify super_admin access
    const authCheck = await verifySuperAdmin(request);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error || 'Unauthorized access' }, 
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const updateData: UpdateData = {
      updated_at: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a submission
export async function DELETE(request: NextRequest) {
  try {
    // Verify super_admin access
    const authCheck = await verifySuperAdmin(request);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: authCheck.error || 'Unauthorized access' }, 
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}