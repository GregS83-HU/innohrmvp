// app/api/performance/goals/update/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface GoalUpdatePayload {
  updated_at: string;
  status?: string;
  goal_title?: string;
  goal_description?: string;
  success_criteria?: string;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { goal_id, status, goal_title, goal_description, success_criteria, user_id } = body;

    if (!goal_id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    );

    // Build update object with explicit type
    const updates: GoalUpdatePayload = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (goal_title) updates.goal_title = goal_title;
    if (goal_description) updates.goal_description = goal_description;
    if (success_criteria) updates.success_criteria = success_criteria;

    // Update goal (service role bypasses RLS, but we verify ownership)
    const { data: updatedData, error: updateError } = await supabase
      .from('performance_goals')
      .update(updates)
      .eq('id', goal_id)
      .or(`employee_id.eq.${user_id},manager_id.eq.${user_id}`) // Ensure user owns or manages this goal
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updatedData || updatedData.length === 0) {
      return NextResponse.json({ error: 'Goal not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Goal updated successfully',
      goal: updatedData[0],
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const goal_id = searchParams.get('goal_id');
    const user_id = searchParams.get('user_id');

    if (!goal_id) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    );

    // Delete goal (verify ownership first)
    const { error: deleteError } = await supabase
      .from('performance_goals')
      .delete()
      .eq('id', goal_id)
      .eq('employee_id', user_id); // Only employee can delete their own draft goals

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
