// Lightweight, privacy-respecting funnel event tracking. See
// FUNNEL_TRACKING.md for the full design (what's tracked, where it lives,
// how to query it).
//
// Writes to the first-party `funnel_events` table (queryable for the admin
// dashboard and joinable against company/contact_submissions), and also
// fires a Vercel Analytics custom event as a free secondary signal - not
// the source of truth, since Vercel Analytics events can't be queried back
// programmatically for the dashboard this task also asks for.
'use client';

import { createClient } from '@supabase/supabase-js';
import { track as vercelTrack } from '@vercel/analytics';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SESSION_STORAGE_KEY = 'hrinno_funnel_sid';

export type FunnelEventType =
  | 'job_assistant_started'
  | 'job_assistant_completed'
  | 'pricing_viewed'
  | 'pricing_cta_clicked'
  | 'contact_form_submitted'
  | 'roi_calculator_used'
  | 'signup_started'
  | 'signup_completed'
  | 'onboarding_marked_complete'
  | 'onboarding_link_sent'
  | 'onboarding_reminder_sent';

export type FunnelSource = 'homepage' | 'pricing_page' | 'marketing_site';
export type FunnelPlan = 'free' | 'momentum' | 'infinity';

/**
 * An anonymous, client-generated session id - not tied to any account,
 * email, or name. Persisted in localStorage so a single visitor's funnel
 * steps (e.g. viewed pricing, then clicked a plan) can be correlated
 * without identifying who they are. Never sent anywhere except our own
 * funnel_events row.
 */
function getFunnelSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let sid = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      window.localStorage.setItem(SESSION_STORAGE_KEY, sid);
    }
    return sid;
  } catch {
    // localStorage unavailable (private browsing, etc.) - fall back to a
    // per-call random id rather than failing tracking entirely.
    return crypto.randomUUID();
  }
}

export function trackFunnelEvent(
  eventType: FunnelEventType,
  options?: { source?: FunnelSource; plan?: FunnelPlan; metadata?: Record<string, unknown> }
): void {
  const sessionId = getFunnelSessionId();

  // Fire-and-forget: never block or throw into the caller's UI flow over an
  // analytics write.
  supabase
    .from('funnel_events')
    .insert({
      event_type: eventType,
      session_id: sessionId,
      source: options?.source ?? null,
      plan: options?.plan ?? null,
      metadata: options?.metadata ?? null,
    })
    .then(({ error }) => {
      if (error) console.error('Funnel tracking error:', error.message);
    });

  try {
    vercelTrack(eventType, {
      ...(options?.source ? { source: options.source } : {}),
      ...(options?.plan ? { plan: options.plan } : {}),
    });
  } catch (err) {
    console.error('Vercel Analytics tracking error:', err);
  }
}
