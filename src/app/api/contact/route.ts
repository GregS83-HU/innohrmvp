// /app/api/contact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations
);

// -------------------
// Rate Limiting Setup
// -------------------
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function getRateLimitKey(ip: string, email: string): string {
  return `${ip}-${email}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const requests = rateLimitStore.get(key) || [];

  // Remove outdated requests
  const recentRequests = requests.filter((ts) => now - ts < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) return true;

  // Update store
  recentRequests.push(now);
  rateLimitStore.set(key, recentRequests);

  return false;
}

// -------------------
// Helpers
// -------------------
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;
  return 'unknown';
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  if (!phone) return true; // optional
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

function sanitizeInput(input: string): string {
  return input.trim().substring(0, 1000); // max 1000 chars
}

// -------------------
// POST Handler
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      phone,
      email,
      companyName,
      comment,
      gdprConsent,
      marketingConsent,
      trigger,
      submittedAt,
      userAgent
    } = body;

    // 1. Required fields
    if (!firstName || !lastName || !email || !companyName || !gdprConsent) {
      return NextResponse.json(
        { error: 'Missing required fields or GDPR consent' },
        { status: 400 }
      );
    }

    // 2. Email & phone validation
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if (phone && !validatePhone(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // 3. Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = getRateLimitKey(clientIP, email);
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 4. Sanitize inputs
    const sanitizedData = {
      first_name: sanitizeInput(firstName),
      last_name: sanitizeInput(lastName),
      email: sanitizeInput(email.toLowerCase()),
      phone: phone ? sanitizeInput(phone) : null,
      company_name: sanitizeInput(companyName),
      comment: comment ? sanitizeInput(comment) : null,
      gdpr_consent: Boolean(gdprConsent),
      marketing_consent: Boolean(marketingConsent),
      trigger: trigger || 'other',
      ip_address: clientIP,
      user_agent: userAgent || '',
      submitted_at: submittedAt || new Date().toISOString(),
      processed_at: new Date().toISOString(),
      status: 'new'
    };

    // 5. Save to Supabase
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([sanitizedData])
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save contact information' }, { status: 500 });
    }

    console.log(
      `New contact submission: ID ${data.id}, Email: ${sanitizedData.email}, Company: ${sanitizedData.company_name}`
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Contact information received successfully',
        submissionId: data.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
