# Codebase - innohrmvp
**Mode:** full-feature-extract  
**Generated:** Sun Feb 15 15:29:06 CET 2026
**Purpose:** Complete AI analysis including all APIs, components & features

---


## `package.json`

```
Folder: .
Type: json | Lines:       73
Top definitions:
--- Package Info ---
  "name": "innohrmvp",
  "version": "0.1.0",

--- Scripts ---
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "patch-package",
    "lint": "next lint",
    "test-env": "node -e \"console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)\""
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@stripe/react-stripe-js": "^4.0.2",
    "@stripe/stripe-js": "^7.9.0",

--- Key Dependencies ---
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@stripe/react-stripe-js": "^4.0.2",
    "@stripe/stripe-js": "^7.9.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/ssr": "^0.7.0",
    "@supabase/supabase-js": "^2.53.0",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.3.1",
    "canvas": "^3.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.23.12",
    "jszip": "^3.10.1",
```

<details>
<summary>📄 Full content (      73 lines)</summary>

```json
{
  "name": "innohrmvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "patch-package",
    "lint": "next lint",
    "test-env": "node -e \"console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)\""
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@stripe/react-stripe-js": "^4.0.2",
    "@stripe/stripe-js": "^7.9.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/ssr": "^0.7.0",
    "@supabase/supabase-js": "^2.53.0",
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.3.1",
    "canvas": "^3.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.23.12",
    "jszip": "^3.10.1",
    "lucide-react": "^0.539.0",
    "next": "^15.5.7",
    "next-intl": "^4.3.12",
    "nodemailer": "^7.0.10",
    "openai": "^5.11.0",
    "pdf-parse": "1.1.1",
    "react": "^19.2.1",
    "react-dom": "^19.2.1",
    "react-icons": "^5.5.0",
    "recharts": "^3.1.2",
    "resend": "^6.1.2",
    "stripe": "^18.5.0",
    "tailwind-merge": "^3.3.1",
    "tesseract.js": "^6.0.1",
    "tesseract.js-node": "^0.1.0",
    "uuid": "^13.0.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/nodemailer": "^7.0.3",
    "@types/pdf-parse": "^1.1.5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/stripe-v3": "^3.1.33",
    "@types/tesseract.js": "^0.0.2",
    "@types/uuid": "^10.0.0",
    "autoprefixer": "^10.4.21",
    "dotenv": "^17.2.3",
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
    "patch-package": "^8.0.1",
    "postcss": "^8.5.6",
    "snyk": "^1.1299.0",
    "tailwindcss": "^4.1.13",
    "tw-animate-css": "^1.3.7",
    "typescript": "^5"
  }
}
```
</details>

---

## `tsconfig.json`

```
Folder: .
Type: json | Lines:       28
Top definitions:
- (config file)
```

<details>
<summary>📄 Full content (      28 lines)</summary>

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": "src",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", "lib/parsePdfSimple.cjs"],
  "exclude": ["node_modules"]
}
```
</details>

---

## `next.config.ts`

```
Folder: .
Type: ts | Lines:        9
Top definitions:
--- Exports ---
export default withNextIntl(nextConfig);

--- Key Functions/Components ---
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
const nextConfig: NextConfig = {
```

<details>
<summary>📄 Full content (       9 lines)</summary>

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse'],
};

export default withNextIntl(nextConfig);
```
</details>

---

## `./supabase_schema.sql`

```
Folder: .
Type: sql | Lines:     6199
Top definitions:
CREATE TABLE IF NOT EXISTS "public"."ai_credit_packs" (
ALTER TABLE "public"."ai_credit_packs" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."attendance_exceptions" (
ALTER TABLE "public"."attendance_exceptions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."candidats" (
ALTER TABLE "public"."candidats" OWNER TO "postgres";
ALTER TABLE "public"."candidats" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
ALTER TABLE "public"."chat_messages" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."company" (
ALTER TABLE "public"."company" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."company_email_settings" (
ALTER TABLE "public"."company_email_settings" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."company_holidays" (
ALTER TABLE "public"."company_holidays" OWNER TO "postgres";
ALTER TABLE "public"."company" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
CREATE TABLE IF NOT EXISTS "public"."company_steps" (
ALTER TABLE "public"."company_steps" OWNER TO "postgres";
ALTER TABLE "public"."company_steps" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
CREATE TABLE IF NOT EXISTS "public"."company_to_users" (
ALTER TABLE "public"."company_to_users" OWNER TO "postgres";
ALTER TABLE "public"."company_to_users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
CREATE TABLE IF NOT EXISTS "public"."contact_submissions" (
ALTER TABLE "public"."contact_submissions" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."demo_feedback" (
ALTER TABLE "public"."demo_feedback" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."employee_allowances" (
ALTER TABLE "public"."employee_allowances" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."employee_deductions" (
ALTER TABLE "public"."employee_deductions" OWNER TO "postgres";
```

<details>
<summary>📄 Preview (first 100 lines of     6199)</summary>

```sql



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
... (truncated,     6199 total lines)
```
</details>

---

## `src/app/api/notifications/email/types.ts`

```
Folder: src/app/api/notifications/email
Type: ts | Lines:       18
Top definitions:
--- Exports ---
export interface TicketData {
export interface MessageData {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      18 lines)</summary>

```ts
// app/types.ts

export interface TicketData {
  id: string;
  title: string;
  user_email: string;
  user_name: string;
  priority: string;
  category?: string;
  description: string;
  status?: string;
}

export interface MessageData {
  sender_name: string;
  sender_type: 'user' | 'admin';
  message: string;
}
```
</details>

---

## `src/app/api/analyse-cv/route.ts`

```
Folder: src/app/api/analyse-cv
Type: ts | Lines:      418
Top definitions:
--- Exports ---
export const runtime = "nodejs";

--- Key Functions/Components ---
const supabase = createClient(
function extractAndParseJSON(rawResponse: string, context = '') {
function sanitizeFileName(filename: string) {
```

<details>
<summary>📄 Preview (first 100 lines of      418)</summary>

```ts
// src/app/api/analyse-cv/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import parsePdfBuffer from '../../../../lib/parsePdfSafe';
import { createClient } from '@supabase/supabase-js';
import { consumeCredit } from '../../../../lib/credit';
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from '../../../../lib/prompts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Create notifications for all admins in the company when a CV is uploaded
 */
async function notifyAdminsOfNewCV(
  positionId: string,
  positionName: string,
  companyId: string
) {
  try {
    const { data: companyAdmins, error: adminError } = await supabase
      .from('company_to_users')
      .select(`
        user_id,
        users!inner(
          id,
          is_admin
        )
      `)
      .eq('company_id', companyId);

    if (adminError || !companyAdmins || companyAdmins.length === 0) {
      console.log('No users found for company:', companyId);
      return { success: true, message: 'No users to check' };
    }

    const adminUsers = companyAdmins
      .filter(cu => {
        const users = Array.isArray(cu.users) ? cu.users[0] : cu.users;
        return users?.is_admin === true;
      })
      .map(cu => {
        const users = Array.isArray(cu.users) ? cu.users[0] : cu.users;
        return users?.id;
      })
      .filter(Boolean);

    if (adminUsers.length === 0) {
      return { success: true, message: 'No admin users to notify' };
    }

    const notifications = adminUsers.map(adminId => ({
      type: 'cv_uploaded',
      title: 'New CV Uploaded',
      message: `New CV uploaded for ${positionName}`,
      position_id: positionId,
      recipient_id: adminId,
      read: false,
      created_at: new Date().toISOString()
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating CV upload notifications:', notificationError);
      return { success: false, error: notificationError };
    }

    console.log(`✅ Created ${notifications.length} CV upload notifications`);
    return { success: true, count: notifications.length };
  } catch (err) {
    console.error('Failed to notify admins of new CV:', err);
    return { success: false, error: err };
  }
}

/**
 * Create notification for the position manager when a CV is uploaded
 */
async function notifyManagerOfNewCV(
  positionId: string,
  positionName: string,
  managerId: string | null
) {
  try {
    if (!managerId) {
      console.log('No manager assigned to position:', positionId);
      return { success: true, message: 'No manager to notify' };
    }

    const notification = {
      type: 'cv_uploaded',
      title: 'New CV for Your Position',
      message: `A new CV has been uploaded for ${positionName}`,
      position_id: positionId,
      recipient_id: managerId,
... (truncated,      418 total lines)
```
</details>

---

## `src/app/api/analyse-massive/route.ts`

```
Folder: src/app/api/analyse-massive
Type: ts | Lines:      272
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (     272 lines)</summary>

```ts
// src/app/api/analyse-massive/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { consumeCredit } from "../../../../lib/credit";
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from "../../../../lib/prompts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// === Utility: Analyse a CV with the AI model ===
async function analyseCvWithAi(
  cvText: string,
  jobDescription: string,
  jobDescriptionDetailed: string
) {
  // Fetch prompt from database
  const promptTemplate = await getPrompt('massive_cv_analysis');
  
  // Fill in variables - use detailed description if available, otherwise fall back to regular
  const prompt = fillPromptVariables(promptTemplate, {
    cvText,
    jobDescriptionDetailed: jobDescriptionDetailed || jobDescription
  });

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  const completion = await res.json();
  const rawResponse = completion.choices?.[0]?.message?.content ?? "";
  const match = rawResponse.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse JSON IA invalide");
  return JSON.parse(match[0]);
}

// === SSE Endpoint for "Analyse Massive" ===
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const position_id_str = url.searchParams.get("position_id");
  const user_id = url.searchParams.get("user_id");
  const company_id = url.searchParams.get("company_id");

  if (!position_id_str) {
    return new Response(JSON.stringify({ error: "position_id requis" }), {
      status: 400,
    });
  }
  if (!user_id) {
    return new Response(JSON.stringify({ error: "user_id requis" }), {
      status: 400,
    });
  }
  if (!company_id) {
    return new Response(JSON.stringify({ error: "company_id requis" }), {
      status: 400,
    });
  }

  const positionId = Number(position_id_str);
  if (isNaN(positionId)) {
    return new Response(JSON.stringify({ error: "position_id invalide" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // === Step 0: Verify prompt availability before starting ===
        try {
          await getPrompt('massive_cv_analysis');
        } catch (error) {
          if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
            console.error('Prompt unavailable:', error.message);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: "AI tool is currently unavailable. Please try again later.",
                })}\n\n`
              )
            );
            controller.close();
            return;
          }
          throw error;
        }

        // === Step 1: Load position details ===
        const { data: position, error: posErr } = await supabase
          .from("openedpositions")
          .select("*")
          .eq("id", positionId)
          .single();

        if (posErr || !position) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Position non trouvée",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // === Step 2: Load company candidates ===
        const { data: candidats, error: candErr } = await supabase.rpc(
          "get_company_candidates",
          { user_uuid: user_id }
        );

        if (candErr) {
          console.error("Erreur RPC get_company_candidates:", candErr);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: "Impossible de récupérer les candidats",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        if (!candidats || candidats.length === 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                matched: 0,
                total: 0,
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // === Step 3: Iterate over candidates one by one ===
        let matched = 0;

        for (let i = 0; i < candidats.length; i++) {
          const candidat = candidats[i];

          try {
            // ✅ Check AI credit availability
            const ok = await consumeCredit(company_id);
            if (!ok) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    error:
                      "Plus de crédits AI disponibles. Analyse interrompue.",
                  })}\n\n`
                )
              );
              break;
            }

            // ✅ Run analysis
            const { score, analysis } = await analyseCvWithAi(
              candidat.cv_text,
              position.position_description,
              position.position_description_detailed
            );

            if (score >= 7) {
              matched++;
            }

            // ✅ Store result
            await supabase.from("position_to_candidat").upsert({
              position_id: positionId,
              candidat_id: candidat.id,
              candidat_score: score,
              candidat_ai_analyse: analysis,
              source: "Analyse from Database",
              candidat_next_step: score < 7 ? "1" : "0",
            });

            // ✅ Send progress event
            const progress = Math.floor(((i + 1) / candidats.length) * 100);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  progress,
                  candidat_id: candidat.id,
                  score,
                })}\n\n`
              )
            );
          } catch (err) {
            console.error(`Erreur analyse CV ${candidat.id}:`, err);
            
            // Check if it's a prompt error
            if (err instanceof PromptNotFoundError || err instanceof PromptDatabaseError) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "error",
                    error: "AI tool is currently unavailable. Analysis interrupted.",
                  })}\n\n`
                )
              );
              break; // Stop processing if prompt system fails
            }
            
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  candidat_id: candidat.id,
                  error: (err as Error).message,
                })}\n\n`
              )
            );
          }
        }

        // === Step 4: End of stream ===
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "done",
              matched,
              total: candidats.length,
            })}\n\n`
          )
        );
        controller.close();
      } catch (err) {
        console.error("Erreur serveur analyse massive:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: "Erreur serveur pendant l'analyse massive",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```
</details>

---

## `src/app/api/candidate-count/route.ts`

```
Folder: src/app/api/candidate-count
Type: ts | Lines:       45
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      45 lines)</summary>

```ts
// src/app/api/candidate-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { error: "user_id is required" },
      { status: 400 }
    );
  }

  try {
    // Use the same RPC function that your analyse-massive uses
    const { data: candidats, error } = await supabase.rpc(
      "get_company_candidates",
      { user_uuid: user_id }
    );

    if (error) {
      console.error("Error fetching candidates:", error);
      return NextResponse.json(
        { error: "Failed to fetch candidate count" },
        { status: 500 }
      );
    }

    const count = candidats?.length || 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```
</details>

---

## `src/app/api/close/route.ts`

```
Folder: src/app/api/close
Type: ts | Lines:       33
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      33 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'

export async function POST(request: Request) {
  try {
    const { positionId } = await request.json()

    if (!positionId) {
      return NextResponse.json({ error: 'positionId is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    console.log("ID to close:",positionId)

    const {data, error } = await supabase
      .from('openedpositions')
      .update({ position_end_date: new Date().toISOString() })
      .eq('id', positionId)
      .select();

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Rows Updated:", data)

    return NextResponse.json({ message: 'Position closed' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/company-email-settings/route.ts`

```
Folder: src/app/api/company-email-settings
Type: ts | Lines:      218
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     218 lines)</summary>

```ts
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
```
</details>

---

## `src/app/api/contact-submissions/route.ts`

```
Folder: src/app/api/contact-submissions
Type: ts | Lines:      186
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface UpdateData {
```

<details>
<summary>📄 Full content (     186 lines)</summary>

```ts
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
    /*  return NextResponse.json(
        { error: authCheck.error || 'Unauthorized access' }, 
        { status: 403 }
      );*/
    console.warn('Skipping auth check temporarily for testing');
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
      /*return NextResponse.json(
        { error: authCheck.error || 'Unauthorized access' }, 
        { status: 403 }
      );*/
      console.warn('Skipping auth check temporarily for testing');
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
```
</details>

---

## `src/app/api/contact/route.ts`

```
Folder: src/app/api/contact
Type: ts | Lines:      159
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;
function getRateLimitKey(ip: string, email: string): string {
function isRateLimited(key: string): boolean {
function getClientIP(request: NextRequest): string {
function validateEmail(email: string): boolean {
function validatePhone(phone: string): boolean {
function sanitizeInput(input: string): string {
```

<details>
<summary>📄 Full content (     159 lines)</summary>

```ts
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
```
</details>

---

## `src/app/api/feedback/route.ts`

```
Folder: src/app/api/feedback
Type: ts | Lines:       84
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      84 lines)</summary>

```ts
// app/api/feedback/route.js
import { createClient } from '@supabase/supabase-js'
import { NextResponse,NextRequest } from 'next/server'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rating, comment } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get client IP for tracking (optional)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('demo_feedback')
      .insert({
        rating: parseInt(rating),
        comment: comment || null,
        ip_address: ip,
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Feedback submitted successfully', data },
      { status: 201 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Optional: Get all feedback (for admin purposes)
    const { data, error } = await supabase
      .from('demo_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 200 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```
</details>

---

## `src/app/api/happiness/chat/route.ts`

```
Folder: src/app/api/happiness/chat
Type: ts | Lines:      678
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface PermaScores {
interface PermaQuestion {
interface ChatMessage {
interface EndMessageSet {
type SupportedLanguage = 'en' | 'hu';
const permaQuestionsMap: Record<SupportedLanguage, PermaQuestion[]> = {
const languageInstructions: Record<SupportedLanguage, string> = {
function getSupportedLanguage(lang: string | null): SupportedLanguage {
const endMessages: Record<SupportedLanguage, EndMessageSet> = {
const completionMessages: Record<SupportedLanguage, string> = {
```

<details>
<summary>📄 Preview (first 100 lines of      678)</summary>

```ts
// src/app/api/happiness/chat/route.ts (Multi-language version - TypeScript strict)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from '../../../../../lib/prompts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

interface PermaQuestion {
  step: number;
  dimension: keyof PermaScores;
  question: string;
}

interface ChatMessage {
  message_text: string;
  step_number: number;
}

interface EndMessageSet {
  excellent: string;
  good: string;
  improvable: string;
  poor: string;
}

type SupportedLanguage = 'en' | 'hu';

// Multi-language questions
const permaQuestionsMap: Record<SupportedLanguage, PermaQuestion[]> = {
  en: [
    {
      step: 1,
      dimension: 'positive',
      question: "To start, how would you describe your overall mood at work this week? How do you usually feel when arriving in the morning?"
    },
    {
      step: 2,
      dimension: 'positive', 
      question: "Can you tell me about a recent moment at work where you felt joy or genuine pleasure? Please give a concrete example."
    },
    {
      step: 3,
      dimension: 'engagement',
      question: "Describe a recent time when you were fully absorbed in your work—where time seemed to fly by."
    },
    {
      step: 4,
      dimension: 'engagement',
      question: "To what extent do you feel your skills and talents are being well utilized in your current role?"
    },
    {
      step: 5,
      dimension: 'relationships',
      question: "How would you describe the quality of your relationships with colleagues? Do you feel you have people you can rely on at work?"
    },
    {
      step: 6,
      dimension: 'relationships',
      question: "Do you feel heard and valued by your manager and team?"
    },
    {
      step: 7,
      dimension: 'meaning',
      question: "In what ways does your work feel meaningful to you? How do you feel you contribute to something bigger?"
    },
    {
      step: 8,
      dimension: 'meaning',
      question: "Do your personal values align with those of your organization? Can you give an example?"
    },
    {
      step: 9,
      dimension: 'accomplishment',
      question: "Which achievements from the past months are you most proud of?"
    },
    {
      step: 10,
      dimension: 'accomplishment',
      question: "How do you see your professional growth? Do you feel you are reaching your goals?"
    },
    {
      step: 11,
      dimension: 'work_life_balance',
      question: "How do you manage the balance between your work and personal life? Are you able to disconnect and recharge?"
    },
    {
... (truncated,      678 total lines)
```
</details>

---

## `src/app/api/happiness/dashboard/route.ts`

```
Folder: src/app/api/happiness/dashboard
Type: ts | Lines:      197
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface PermaScores {
interface HappinessSession {
interface DailyMetric {
interface AreaForImprovement {
type SupportedLanguage = 'en' | 'hu';
function getSupportedLanguage(lang: string | null): SupportedLanguage {
const messages: Record<SupportedLanguage, {
```

<details>
<summary>📄 Full content (     197 lines)</summary>

```ts
// src/app/api/happiness/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Types
interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

interface HappinessSession {
  overall_happiness_score: number | null;
  perma_scores: PermaScores | null;
  status: string;
  created_at: string;
}

interface DailyMetric {
  metric_date: string;
  total_sessions_completed: number;
  avg_happiness_score: number;
  [key: string]: string | number;
}

interface AreaForImprovement {
  area: string;
  score: number;
}

type SupportedLanguage = 'en' | 'hu';

// Helper function to validate language
function getSupportedLanguage(lang: string | null): SupportedLanguage {
  if (lang === 'hu' || lang === 'en') {
    return lang;
  }
  return 'en';
}

// Translation messages
const messages: Record<SupportedLanguage, {
  errors: {
    missingUserId: string;
    metricsError: string;
    statsError: string;
    serverError: string;
  };
  period: string;
}> = {
  en: {
    errors: {
      missingUserId: 'Missing user_id',
      metricsError: 'Error retrieving metrics',
      statsError: 'Error retrieving statistics',
      serverError: 'Server error'
    },
    period: 'last {days} days'
  },
  hu: {
    errors: {
      missingUserId: 'Hiányzó user_id',
      metricsError: 'Hiba a metrikák lekérésekor',
      statsError: 'Hiba a statisztikák lekérésekor',
      serverError: 'Szerver hiba'
    },
    period: 'utolsó {days} nap'
  }
};

export async function GET(req: NextRequest) {
  try {
    // Get language from header
    const languageHeader = req.headers.get('x-lang');
    const language = getSupportedLanguage(languageHeader);
    const t = messages[language];
    
    console.log('Dashboard API - Received language:', language);
    
    const url = new URL(req.url)
    const days = parseInt(url.searchParams.get('days') || '30', 10)
    const user_id = url.searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { error: t.errors.missingUserId }, 
        { status: 400 }
      )
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get company_id from user
    const { data: company, error: companyError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', user_id)
      .single()

    if (companyError) {
      console.error('Company error:', companyError)
    }

    // Get recent metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('happiness_daily_metrics')
      .select('*')
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: false })

    if (metricsError) {
      console.error('Metrics error:', metricsError)
      return NextResponse.json(
        { error: t.errors.metricsError }, 
        { status: 500 }
      )
    }

    // Get current period stats
    const { data: currentStats, error: statsError } = await supabase
      .from('happiness_sessions')
      .select('overall_happiness_score, perma_scores, status, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')

    if (statsError) {
      console.error('Stats error:', statsError)
      return NextResponse.json(
        { error: t.errors.statsError }, 
        { status: 500 }
      )
    }

    const typedStats = (currentStats || []) as HappinessSession[];
    const typedMetrics = (metrics || []) as DailyMetric[];

    // Calculate summary stats
    const totalSessions = typedStats.length
    const avgHappiness = totalSessions > 0 
      ? typedStats.reduce((sum, s) => sum + (s.overall_happiness_score || 0), 0) / totalSessions
      : 0

    // Calculate PERMA averages
    const permaAverages: PermaScores = totalSessions > 0 ? {
      positive: typedStats.reduce((sum, s) => sum + (s.perma_scores?.positive || 0), 0) / totalSessions,
      engagement: typedStats.reduce((sum, s) => sum + (s.perma_scores?.engagement || 0), 0) / totalSessions,
      relationships: typedStats.reduce((sum, s) => sum + (s.perma_scores?.relationships || 0), 0) / totalSessions,
      meaning: typedStats.reduce((sum, s) => sum + (s.perma_scores?.meaning || 0), 0) / totalSessions,
      accomplishment: typedStats.reduce((sum, s) => sum + (s.perma_scores?.accomplishment || 0), 0) / totalSessions,
      work_life_balance: typedStats.reduce((sum, s) => sum + (s.perma_scores?.work_life_balance || 0), 0) / totalSessions
    } : {}

    // Find areas for improvement (lowest scores)
    const sortedPerma = Object.entries(permaAverages)
      .sort(([, a], [, b]) => (a || 0) - (b || 0))
      .slice(0, 2)

    const areasForImprovement: AreaForImprovement[] = sortedPerma.map(([key, value]) => ({
      area: key,
      score: Math.round((value || 0) * 10) / 10
    }))

    const periodText = t.period.replace('{days}', days.toString())

    return NextResponse.json({
      summary: {
        totalSessions,
        avgHappiness: Math.round(avgHappiness * 10) / 10,
        participationTrend: typedMetrics.length > 1 ? 
          (typedMetrics[0]?.total_sessions_completed || 0) - (typedMetrics[1]?.total_sessions_completed || 0) : 0
      },
      permaAverages,
      areasForImprovement,
      dailyMetrics: typedMetrics,
      period: periodText
    })

  } catch (err) {
    console.error('Dashboard error:', err)
    const languageHeader = req.headers.get('x-lang');
    const language = getSupportedLanguage(languageHeader);
    const t = messages[language];
    
    return NextResponse.json(
      { error: t.errors.serverError }, 
      { status: 500 }
    )
  }
}
```
</details>

---

## `src/app/api/happiness/session/route.ts`

```
Folder: src/app/api/happiness/session
Type: ts | Lines:      129
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface CreateSessionRequestBody {
interface SessionData {
function generateSessionToken(): string {
function hashIP(ip: string): string {
```

<details>
<summary>📄 Full content (     129 lines)</summary>

```ts
// src/app/api/happiness/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Interface pour le body de la requête
interface CreateSessionRequestBody {
  company_id?: number;
}

// Interface pour les données de session
interface SessionData {
  session_token: string;
  ip_hash: string;
  user_agent_hash: string;
  status: string;
  company_id?: number;
}

function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'default_salt').digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateSessionRequestBody = await req.json()
    const { company_id } = body // Extract company_id from request body
    
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const sessionToken = generateSessionToken()
    const ipHash = hashIP(ip)
    const userAgentHash = hashIP(userAgent)

    // Check for recent sessions from same IP (optional cooldown)
    const { data: recentSessions } = await supabase
      .from('happiness_sessions')
      .select('created_at')
      .eq('ip_hash', ipHash)
      //.gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // 2 hours cooldown
      .gte('created_at', new Date(Date.now()).toISOString())
      .eq('status', 'completed')

    if (recentSessions && recentSessions.length > 0) {
      return NextResponse.json({
        error: 'Une évaluation récente a déjà été effectuée. Merci de réessayer plus tard.'
      }, { status: 429 })
    }

    // Prepare session data
    const sessionData: SessionData = {
      session_token: sessionToken,
      ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      status: 'created'
    }

    // Add company_id if provided
    if (company_id) {
      sessionData.company_id = company_id
    }

    const { data: session, error } = await supabase
      .from('happiness_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Session creation error:', error)
      return NextResponse.json({ error: 'Erreur création session' }, { status: 500 })
    }

    return NextResponse.json({
      sessionToken,
      sessionId: session.id,
      message: 'Session créée avec succès',
      company_id: session.company_id // Return company_id in response for confirmation
    })

  } catch (err) {
    console.error('Session creation error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.headers.get('x-session-token')
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Token session requis' }, { status: 401 })
    }

    const { data: session, error } = await supabase
      .from('happiness_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Check if session is expired
    if (new Date() > new Date(session.timeout_at)) {
      await supabase
        .from('happiness_sessions')
        .update({ status: 'timeout' })
        .eq('session_token', sessionToken)
      
      return NextResponse.json({ error: 'Session expirée' }, { status: 410 })
    }

    return NextResponse.json({ session })

  } catch (err) {
    console.error('Session retrieval error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/import-users/route.ts`

```
Folder: src/app/api/import-users
Type: ts | Lines:      123
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface CSVRow {
interface ImportResult {
```

<details>
<summary>📄 Full content (     123 lines)</summary>

```ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Define types for CSV row data
interface CSVRow {
  email?: string
  company_id?: number | string
  is_admin?: boolean | string
  first_name?: string
  firstname?: string
  FirstName?: string
  last_name?: string
  lastname?: string
  LastName?: string
}

// Define result type
interface ImportResult {
  email?: string
  success?: boolean
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Missing CSV/XLSX file" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const rows = XLSX.utils.sheet_to_json<CSVRow>(workbook.Sheets[sheetName])

    const results: ImportResult[] = []

    for (const row of rows) {
      const email = row.email?.toLowerCase()
      const company_id = Number(row.company_id)
      const is_admin = row.is_admin === true || row.is_admin === "true"

      // Read first & last name from CSV
      const first_name = row.first_name || row.firstname || row.FirstName || null
      const last_name = row.last_name || row.lastname || row.LastName || null

      if (!email || !company_id) {
        results.push({ email, error: "Missing email or company_id" })
        continue
      }

      // 1️⃣ Create user in Supabase Auth
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: false,
        })

      if (userError || !userData?.user) {
        results.push({ email, error: userError?.message })
        continue
      }

      const userId = userData.user.id

      // 2️⃣ Insert into your custom users table (with names)
      const { error: customUserError } = await supabase
        .from("users")
        .insert({
          id: userId,
          is_admin,
          user_firstname: first_name,
          user_lastname: last_name,
        })

      if (customUserError) {
        results.push({ email, error: customUserError.message })
        continue
      }

      // 3️⃣ Link user to company
      const { error: linkError } = await supabase
        .from("company_to_users")
        .insert({
          user_id: userId,
          company_id,
        })

      if (linkError) {
        results.push({ email, error: linkError.message })
        continue
      }

      // 4️⃣ Send magic link invitation
      const { error: inviteError } = await supabase.auth.admin.generateLink({
        type: "invite",
        email,
      })

      if (inviteError) {
        results.push({ email, error: inviteError.message })
        continue
      }

      results.push({ email, success: true })
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error("Import error:", err)
    return NextResponse.json(
      { error: "Failed to import users" },
      { status: 500 }
    )
  }
}
```
</details>

---

## `src/app/api/interview-assistant/route.ts`

```
Folder: src/app/api/interview-assistant
Type: ts | Lines:      169
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
const languageNames: Record<string, string> = {
```

<details>
<summary>📄 Full content (     169 lines)</summary>

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPrompts, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from '../../../../lib/prompts'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Language mapping for AI prompts
const languageNames: Record<string, string> = {
  en: 'English',
  fr: 'French',
  hu: 'Hungarian',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ro: 'Romanian',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, candidat_id, position_id, interview_id, notes, locale = 'en' } = body

    // Get the language name for the AI prompt
    const languageName = languageNames[locale] || 'English'

    const { data: candidat, error: candErr } = await supabase
      .from('candidats')
      .select('cv_text, candidat_firstname, candidat_lastname')
      .eq('id', candidat_id)
      .single()

    if (candErr || !candidat) {
      console.error('[Interview Assistant] Candidate not found', candErr)
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const { data: position, error: posErr } = await supabase
      .from('openedpositions')
      .select('position_description, position_description_detailed')
      .eq('id', position_id)
      .single()

    if (posErr || !position) {
      console.error('[Interview Assistant] Position not found', posErr)
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    // Fetch recruitment step
    const { data: positionCandidat, error: pcErr } = await supabase
      .from('position_to_candidat')
      .select('candidat_next_step')
      .eq('position_id', position_id)
      .eq('candidat_id', candidat_id)
      .single()

    if (pcErr || !positionCandidat || !positionCandidat.candidat_next_step) {
      console.error('[Interview Assistant] Recruitment step not found', pcErr)
      return NextResponse.json({ error: 'Recruitment step not found' }, { status: 404 })
    }

    const { data: recruitmentStep, error: stepErr } = await supabase
      .from('recruitment_steps')
      .select('step_name')
      .eq('id', positionCandidat.candidat_next_step)
      .single()

    if (stepErr || !recruitmentStep) {
      console.error('[Interview Assistant] Step name not found', stepErr)
      return NextResponse.json({ error: 'Step name not found' }, { status: 404 })
    }

    let prompt = ''
    let aiMode = ''
    let promptName = ''

    // Determine which prompt to use
    if (mode === 'questions') {
      aiMode = 'questions'
      promptName = 'interview_questions_generation'
    } else if (mode === 'summary') {
      aiMode = 'summary'
      promptName = 'interview_summary_generation'
    } else {
      console.error('[Interview Assistant] Invalid mode:', mode)
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Fetch prompt from database
    try {
      const promptTemplate = await getPrompts([promptName]);
      const template = promptTemplate[promptName];
      
      const candidateName = `${candidat.candidat_firstname} ${candidat.candidat_lastname}`;
      const jobDescription = position.position_description_detailed || position.position_description;
      
      if (mode === 'questions') {
        prompt = fillPromptVariables(template, {
          languageName,
          candidateName,
          cvText: candidat.cv_text,
          jobDescription,
          stepName: recruitmentStep.step_name
        });
      } else if (mode === 'summary') {
        prompt = fillPromptVariables(template, {
          languageName,
          candidateName,
          cvText: candidat.cv_text,
          jobDescription,
          stepName: recruitmentStep.step_name,
          notes: notes || ''
        });
      }
    } catch (error) {
      if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
        console.error('[Interview Assistant] Failed to load prompt:', error.message);
        return NextResponse.json({ 
          error: 'AI tool is currently unavailable. Please try again later.' 
        }, { status: 503 });
      }
      throw error;
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Invalid AI output')

    const parsed = JSON.parse(match[0])

    // Save results to the specific interview
    if (aiMode === 'questions') {
      await supabase
        .from('interviews')
        .update({ questions: parsed })
        .eq('id', interview_id)
    } else if (aiMode === 'summary') {
      await supabase
        .from('interviews')
        .update({ 
          notes, 
          summary: parsed 
        })
        .eq('id', interview_id)
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[Interview Assistant] Error occurred:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/interviews/route.ts`

```
Folder: src/app/api/interviews
Type: ts | Lines:      301
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Preview (first 100 lines of      301)</summary>

```ts
// app/api/interviews/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendInterviewInvitation, sendInterviewCancellation } from '../../../../lib/email-service'
import { getServerTranslation } from '../../../i18n/server-translations' 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const candidat_id = searchParams.get('candidat_id')
  if (!candidat_id) return NextResponse.json([], { status: 200 })

  const { data, error } = await supabase
    .from('interviews')
    .select('*, recruitment_steps(step_name)')
    .eq('candidat_id', candidat_id)
    .order('interview_datetime', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      position_id, 
      candidat_id, 
      recruiter_id, 
      interview_datetime, 
      duration_minutes, 
      location,
      locale
    } = body

    console.log('[Interviews API] Creating interview:', body)

    // Fetch the current recruitment step for this candidate/position
    let recruitment_step_id: number | null = null
    
    if (position_id && candidat_id) {
      const { data: positionCandidat, error: pcErr } = await supabase
        .from('position_to_candidat')
        .select('candidat_next_step')
        .eq('position_id', position_id)
        .eq('candidat_id', candidat_id)
        .single()

      if (!pcErr && positionCandidat?.candidat_next_step) {
        recruitment_step_id = positionCandidat.candidat_next_step
      }
    }

    // Insert interview into database with recruitment step
    const { data: interview, error: insertError } = await supabase
      .from('interviews')
      .insert([{ 
        position_id, 
        candidat_id, 
        recruiter_id, 
        interview_datetime, 
        duration_minutes, 
        location,
        recruitment_step_id,
        status: 'pending' 
      }])
      .select()
      .single()

    if (insertError) {
      console.error('[Interviews API] Insert error:', insertError)
      return NextResponse.json({ error: insertError.message, details: insertError.details }, { status: 400 })
    }

    console.log('[Interviews API] Interview created:', interview)

    // Fetch candidate details
    const { data: candidate, error: candidateError } = await supabase
      .from('candidats')
      .select('candidat_email, candidat_firstname, candidat_lastname')
      .eq('id', candidat_id)
      .single()

    if (candidateError || !candidate) {
      console.error('[Interviews API] Candidate not found:', candidateError)
      return NextResponse.json({ 
        error: 'Interview created but candidate not found for email',
        interview 
      }, { status: 207 })
    }

    // Fetch recruiter details from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(recruiter_id)

    if (authError || !authUser) {
... (truncated,      301 total lines)
```
</details>

---

## `src/app/api/medical-certificates/confirm/route.ts`

```
Folder: src/app/api/medical-certificates/confirm
Type: ts | Lines:      111
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
const secureUrl = signedUrlData.signedUrl;
```

<details>
<summary>📄 Full content (     111 lines)</summary>

```ts
// /api/medical-certificates/confirm/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const employee_name = formData.get('employee_name') as string | null
    const absenceDateStart = formData.get('absenceDateStart') as string | null
    const absenceDateEnd = formData.get('absenceDateEnd') as string | null
    const employee_comment = formData.get('comment') as string | null
    const file = formData.get('file') as File | null
    const company_id = formData.get('company_id') as string | null
    const leave_request_id = formData.get('leave_request_id') as string | null
    const employee_ai_consent_date = formData.get('employee_ai_consent_date') as string | null


    if (!company_id || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const companyIdNumber = parseInt(company_id, 10)
    if (isNaN(companyIdNumber)) {
      return NextResponse.json(
        { error: 'Invalid company_id format' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const filePath = `certificates/${company_id}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('medical-certificates')
      .upload(filePath, fileBuffer, { contentType: file.type })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Error uploading file' },
        { status: 500 }
      )
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('medical-certificates')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      throw new Error("Could not generate signed URL for medical certificate");
      }

const secureUrl = signedUrlData.signedUrl;

    // Insert into database
    const insertData = {
      employee_name,
      absence_start_date: absenceDateStart,
      absence_end_date: absenceDateEnd,
      employee_comment,
      certificate_file: filePath,
      company_id: companyIdNumber,
      leave_request_id: leave_request_id || null,
      treated: false,
      employee_ai_consent_date: employee_ai_consent_date ? new Date(employee_ai_consent_date).toISOString() : null

    }

    const { data: insertedData, error: dbError } = await supabase
      .from('medical_certificates')
      .insert([insertData])
      .select()

    if (dbError) {
      return NextResponse.json(
        { error: 'Error inserting into database', details: dbError.message },
        { status: 500 }
      )
    }

    // If linked to leave request, update it
    if (leave_request_id) {
      await supabase
        .from('leave_requests')
        .update({ 
          is_medical_confirmed: true,
          medical_certificate_id: insertedData[0].id 
        })
        .eq('id', leave_request_id)
    }

    return NextResponse.json({ 
      message: 'Certificate saved successfully!',
      insertedData
    })
  } catch (e) {
    console.error('Server error:', e)
    return NextResponse.json(
      { error: 'Server error', details: (e as Error).message },
      { status: 500 }
    )
  }
}
```
</details>

---

## `src/app/api/medical-certificates/upload/route.ts`

```
Folder: src/app/api/medical-certificates/upload
Type: ts | Lines:      212
Top definitions:
--- Exports ---
export const dynamic = "force-dynamic"; // évite le cache
export const maxDuration = 60; // Vercel: laisse le temps à l'OCR

--- Key Functions/Components ---
const supabase = createClient(
type OCRSpaceResponse = {
type CertificateData = {
function sanitizeFileName(filename: string) {
function safeExtractJson(text: string): CertificateData | null {
```

<details>
<summary>📄 Full content (     212 lines)</summary>

```ts
// src/app/api/medical-certificates/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/next"
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from "../../../../../lib/prompts";

export const dynamic = "force-dynamic"; // évite le cache
export const maxDuration = 60; // Vercel: laisse le temps à l'OCR

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OCR.Space renvoie ce type de structure
type OCRSpaceResponse = {
  OCRExitCode: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
  ParsedResults?: Array<{
    ParsedText?: string;
    ErrorMessage?: string | string[];
  }>;
};

type CertificateData = {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  raw?: string;
};

function sanitizeFileName(filename: string) {
  return filename
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
}

// Tente d'extraire un JSON depuis un texte (au cas où le LLM renvoie du texte autour)
function safeExtractJson(text: string): CertificateData | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return {
      employee_name: parsed.employee_name ?? "not recognised",
      sickness_start_date: parsed.sickness_start_date ?? "not recognised",
      sickness_end_date: parsed.sickness_end_date ?? "not recognised",
      raw: text,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OCRSPACE_API_KEY) {
      return NextResponse.json({ error: "Missing OCRSPACE_API_KEY" }, { status: 500 });
    }
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("company_id") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    // Détection type fichier
    const fileType = file.type;
    const isPdf = fileType === "application/pdf";
    const isImage = fileType.startsWith("image/");

    if (!isPdf && !isImage) {
      return NextResponse.json({ error: "File must be an image or PDF" }, { status: 400 });
    }

    // 1) Upload dans Supabase Storage avec le company_id dans le chemin
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = sanitizeFileName(file.name);
    const filePath = `uploads/${companyId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("medical-certificates")
      .upload(filePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase
      .storage.from("medical-certificates")
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl ?? null;

    const { data: signed, error: signErr } = await supabase
      .storage.from("medical-certificates")
      .createSignedUrl(filePath, 60 * 5);

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: "Could not create signed URL for OCR" }, { status: 500 });
    }

    // 2) Appel OCR.Space
    const params = new URLSearchParams();
    params.set("url", signed.signedUrl);
    params.set("language", "hun");
    params.set("detectOrientation", "true");
    params.set("isOverlayRequired", "false");
    params.set("isTable", "true");
    params.set("scale", "true");
    params.set("OCREngine", "1");

    if (isPdf) {
      params.set("filetype", "pdf"); // OCR.Space gère les PDF
    }

    const ocrRes = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        apikey: process.env.OCRSPACE_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const ocrJson = (await ocrRes.json()) as OCRSpaceResponse;

    if (!ocrRes.ok || !ocrJson || ocrJson.OCRExitCode !== 1 || ocrJson.IsErroredOnProcessing) {
      const msg =
        (Array.isArray(ocrJson?.ErrorMessage) ? ocrJson.ErrorMessage.join("; ") : ocrJson?.ErrorMessage) ||
        "OCR failed";
      return NextResponse.json({ error: `OCR error: ${msg}` }, { status: 502 });
    }

    const rawText =
      (ocrJson.ParsedResults ?? [])
        .map((r) => r?.ParsedText ?? "")
        .join("\n")
        .trim() || "";

    // 3) Extraction JSON via OpenRouter using database prompt
    let extractPrompt: string;
    
    try {
      const promptTemplate = await getPrompt('medical_certificate_extraction');
      extractPrompt = fillPromptVariables(promptTemplate, {
        rawText
      });
    } catch (error) {
      if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
        console.error('Failed to load prompt:', error.message);
        return NextResponse.json({ 
          error: 'AI tool is currently unavailable. Please try again later.' 
        }, { status: 503 });
      }
      throw error;
    }

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: extractPrompt }],
        temperature: 0.1,
      }),
    });

    const aiJson = await aiRes.json();
    const candidateText = aiJson?.choices?.[0]?.message?.content ?? "";
    let structured: CertificateData | null = safeExtractJson(candidateText);
    console.log("JSON from AI:", candidateText)

    if (!structured) {
      structured = {
        employee_name: "not recognised",
        sickness_start_date: "not recognised",
        sickness_end_date: "not recognised",
        raw: candidateText || null,
      };
    }

    return NextResponse.json({
      success: true,
      company_id: companyId,
      storage_path: filePath,
      public_url: publicUrl,
      raw_text: rawText,
      extracted_data: structured,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", details: (err as Error)?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
```
</details>

---

## `src/app/api/new-position/route.ts`

```
Folder: src/app/api/new-position
Type: ts | Lines:       49
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      49 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, manager_id, position_name, position_description, position_description_detailed, position_start_date } = body

    if (!user_id || !manager_id || !position_name || !position_description || !position_description_detailed || !position_start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServerComponentClient({ cookies })

    const { data: company, error: companyError } = await supabase
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', user_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: companyError?.message || 'Company not found' }, { status: 400 })
    }

    const { data: insertedData, error: insertError } = await supabase
      .from('openedpositions')
      .insert([
        {
          position_name,
          position_description,
          position_description_detailed,
          position_start_date,
          user_id,
          manager_id,        // ← added manager_id
          company_id: company.company_id,
        },
      ])
      .select()

    if (insertError || !insertedData || insertedData.length === 0) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create position' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Position created successfully', id: insertedData[0].id })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/notifications/email/route.ts`

```
Folder: src/app/api/notifications/email
Type: ts | Lines:      152
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
const emailTemplates = {
```

<details>
<summary>📄 Full content (     152 lines)</summary>

```ts
// app/api/notifications/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Email templates
const emailTemplates = {
  newTicket: {
    subject: 'New Support Ticket Created - #{ticketId}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">New Support Ticket</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;"><strong>From:</strong> {{userEmail}} ({{userName}})</p>
          <p style="color: #475569;"><strong>Priority:</strong> {{priority}}</p>
          <p style="color: #475569;"><strong>Category:</strong> {{category}}</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <p style="color: #374151; margin: 0;">{{description}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Ticket
          </a>
        </div>
      </div>
    `
  },
  newMessage: {
    subject: 'New Reply on Ticket #{ticketId} - {{title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">New Message</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;"><strong>From:</strong> {{senderName}} ({{senderType}})</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <p style="color: #374151; margin: 0; white-space: pre-wrap;">{{message}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Conversation
          </a>
        </div>
      </div>
    `
  },
  statusUpdate: {
    subject: 'Ticket Status Updated - #{ticketId}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #3b82f6); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Ticket Status Update</h1>
        </div>
        <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1e293b; margin-top: 0;">{{title}}</h2>
          <p style="color: #475569;">Your ticket status has been updated:</p>
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; text-align: center;">
            <p style="color: #374151; margin: 0; font-size: 18px; font-weight: bold;">{{status}}</p>
          </div>
          <a href="{{ticketUrl}}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View Ticket
          </a>
        </div>
      </div>
    `
  }
};

// Mock email service
async function sendEmail(to: string, subject: string, html: string) {
  console.log('Sending email:', { to, subject, html });
  return { success: true };
}

export async function POST(req: NextRequest) {
  try {
    const { type, recipientEmail, ticketData, messageData, companySlug } = await req.json();

    if (!type || !recipientEmail || !ticketData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/tickets/${ticketData.id}`;

    let template;
    let replacements: Record<string, string> = {};

    switch (type) {
      case 'new_ticket':
        template = emailTemplates.newTicket;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          userEmail: ticketData.user_email,
          userName: ticketData.user_name,
          priority: ticketData.priority,
          category: ticketData.category || 'General',
          description: ticketData.description,
          ticketUrl
        };
        break;

      case 'new_message':
        template = emailTemplates.newMessage;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          senderName: messageData.sender_name,
          senderType: messageData.sender_type === 'admin' ? 'Support Team' : 'User',
          message: messageData.message,
          ticketUrl
        };
        break;

      case 'status_update':
        template = emailTemplates.statusUpdate;
        replacements = {
          ticketId: ticketData.id,
          title: ticketData.title,
          status: ticketData.status.replace('_', ' ').toUpperCase(),
          ticketUrl
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Replace template variables
    let subject = template.subject;
    let html = template.html;
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      html = html.replace(regex, value);
    });

    await sendEmail(recipientEmail, subject, html);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/notifications/email/types.ts`

```
Folder: src/app/api/notifications/email
Type: ts | Lines:       18
Top definitions:
--- Exports ---
export interface TicketData {
export interface MessageData {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      18 lines)</summary>

```ts
// app/types.ts

export interface TicketData {
  id: string;
  title: string;
  user_email: string;
  user_name: string;
  priority: string;
  category?: string;
  description: string;
  status?: string;
}

export interface MessageData {
  sender_name: string;
  sender_type: 'user' | 'admin';
  message: string;
}
```
</details>

---

## `src/app/api/payroll/[id]/route.ts`

```
Folder: src/app/api/payroll/[id]
Type: ts | Lines:      241
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const getSupabaseClient = () =>
const extractParams = (request: NextRequest) => {
const checkAdmin = async (supabase: ReturnType<typeof getSupabaseClient>, userId: string) => {
```

<details>
<summary>📄 Full content (     241 lines)</summary>

```ts
// src/app/api/payroll/[id]/route.ts
// GET: Get specific payroll record
// PUT: Update payroll record
// DELETE: Soft delete payroll record

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdatePayrollRequest } from '../../../../../types/payroll';

/**
 * Utility: Get Supabase client with service role
 */
const getSupabaseClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * Utility: Extract payroll ID and current_user_id from request
 */
const extractParams = (request: NextRequest) => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const payrollId = segments[segments.length - 1];
  const currentUserId = url.searchParams.get('current_user_id');
  return { payrollId, currentUserId };
};

/**
 * Utility: Check if user is admin
 */
const checkAdmin = async (supabase: ReturnType<typeof getSupabaseClient>, userId: string) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return !error && userData?.is_admin;
};

/**
 * GET /api/payroll/[id]
 * Get specific payroll record with history (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { payrollId, currentUserId } = extractParams(request);

    if (!payrollId) {
      return NextResponse.json({ error: 'Payroll ID is required' }, { status: 400 });
    }
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    const isAdmin = await checkAdmin(supabase, currentUserId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { data: payroll, error: payrollError } = await supabase
      .from('employee_payroll')
      .select(`
        *,
        users!employee_payroll_user_id_fkey (
          id,
          user_firstname,
          user_lastname,
          is_manager
        )
      `)
      .eq('id', payrollId)
      .single();

    if (payrollError) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    const { data: history, error: historyError } = await supabase
      .from('employee_payroll_history')
      .select('*')
      .eq('payroll_id', payrollId)
      .order('change_date', { ascending: false });

    if (historyError) {
      console.error('Error fetching history:', historyError);
    }

    return NextResponse.json({ data: payroll, history: history || [] }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/payroll/[id]
 * Update payroll record (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { payrollId, currentUserId } = extractParams(request);

    if (!payrollId) {
      return NextResponse.json({ error: 'Payroll ID is required' }, { status: 400 });
    }
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    const isAdmin = await checkAdmin(supabase, currentUserId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body: UpdatePayrollRequest = await request.json();

    // Verify payroll exists
    const { data: existingPayroll, error: checkError } = await supabase
      .from('employee_payroll')
      .select('*')
      .eq('id', payrollId)
      .single();

    if (checkError || !existingPayroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    type PayrollUpdateData = { updated_by: string } & Partial<UpdatePayrollRequest>;
    const updateData: PayrollUpdateData = { updated_by: currentUserId };

    const allowedFields: (keyof UpdatePayrollRequest)[] = [
      'employment_type',
      'contract_type',
      'contract_start_date',
      'contract_end_date',
      'position_title',
      'department',
      'work_location',
      'weekly_hours',
      'salary_amount',
      'salary_currency',
      'salary_period',
      'payment_method',
      'bank_account_iban',
      'bank_name',
      'country_specific_data',
      'benefits',
      'is_active',
      'termination_date',
      'termination_reason',
    ];

    allowedFields.forEach(field => {
      const value = body[field];
      if (value !== undefined) {
        (updateData[field] as UpdatePayrollRequest[keyof UpdatePayrollRequest]) = value;
      }
    });

    // Validate termination logic
    if (body.is_active === false && !body.termination_date) {
      return NextResponse.json(
        { error: 'Termination date is required when setting is_active to false' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('employee_payroll')
      .update(updateData)
      .eq('id', payrollId)
      .select(`
        *,
        users!employee_payroll_user_id_fkey (
          id,
          user_firstname,
          user_lastname
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Payroll record updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/payroll/[id]
 * Soft delete payroll record (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { payrollId, currentUserId } = extractParams(request);

    if (!payrollId) {
      return NextResponse.json({ error: 'Payroll ID is required' }, { status: 400 });
    }
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    const isAdmin = await checkAdmin(supabase, currentUserId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('employee_payroll')
      .update({
        is_active: false,
        termination_date: new Date().toISOString().split('T')[0],
        updated_by: currentUserId
      })
      .eq('id', payrollId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Payroll record deactivated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/allowances/[id]/route.ts`

```
Folder: src/app/api/payroll/allowances/[id]
Type: ts | Lines:       89
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      89 lines)</summary>

```ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { UpdateAllowanceRequest } from '../../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function isAdmin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return !error && data?.is_admin;
}

/**
 * PUT /api/payroll/allowances/[id]
 */
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const currentUserId = url.searchParams.get('current_user_id');
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    if (!(await isAdmin(currentUserId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const pathSegments = url.pathname.split('/');
    const allowanceId = pathSegments[pathSegments.length - 1];

    const body: UpdateAllowanceRequest = await req.json();

    const { data, error } = await supabase
      .from('employee_allowances')
      .update(body)
      .eq('id', allowanceId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: 'Allowance updated successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/payroll/allowances/[id]
 */
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const currentUserId = url.searchParams.get('current_user_id');
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    if (!(await isAdmin(currentUserId))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const pathSegments = url.pathname.split('/');
    const allowanceId = pathSegments[pathSegments.length - 1];

    const { error } = await supabase
      .from('employee_allowances')
      .delete()
      .eq('id', allowanceId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Allowance deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/allowances/route.ts`

```
Folder: src/app/api/payroll/allowances
Type: ts | Lines:      133
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (     133 lines)</summary>

```ts
// src/app/api/payroll/allowances/route.ts
// GET: Get allowances for a payroll record
// POST: Create new allowance

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateAllowanceRequest } from '../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/payroll/allowances?payroll_id=xxx
 * Get allowances for a payroll record
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payrollId = searchParams.get('payroll_id');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!payrollId) {
      return NextResponse.json(
        { error: 'payroll_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('employee_allowances')
      .select('*')
      .eq('payroll_id', payrollId)
      .order('created_at', { ascending: false });

    // Filter by period if specified
    if (year && month) {
      query = query.or(
        `is_recurring.eq.true,and(effective_year.eq.${year},effective_month.eq.${month})`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching allowances:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/payroll/allowances
 * Create new allowance
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('current_user_id');

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'current_user_id is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', currentUserId)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body: CreateAllowanceRequest = await request.json();

    // Validate required fields
    if (!body.payroll_id || !body.allowance_type || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: payroll_id, allowance_type, amount' },
        { status: 400 }
      );
    }

    // Validate amount
    if (body.amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Create allowance
    const { data, error } = await supabase
      .from('employee_allowances')
      .insert({
        ...body,
        currency: body.currency || 'HUF',
        tax_treatment: body.tax_treatment || 'fully_taxable',
        is_recurring: body.is_recurring || false,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating allowance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Allowance created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/bulk/route.ts`

```
Folder: src/app/api/payroll/bulk
Type: ts | Lines:      279
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
type BulkOperation = 
interface BulkOperationRequest {
```

<details>
<summary>📄 Full content (     279 lines)</summary>

```ts
// src/app/api/payroll/bulk/route.ts
// POST: Perform bulk operations on multiple employees

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { AllowanceType, DeductionType, TaxTreatment } from '../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BulkOperation = 
  | 'salary_increase'
  | 'add_allowance'
  | 'add_deduction'
  | 'change_department'
  | 'update_field';

interface BulkOperationRequest {
  operation: BulkOperation;
  payroll_ids: string[];
  current_user_id: string;
  
  // For salary increase
  salary_change?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  
  // For add allowance
  allowance?: {
    allowance_type: AllowanceType;
    amount: number;
    currency?: string;
    tax_treatment?: TaxTreatment;
    is_recurring?: boolean;
    effective_month?: number;
    effective_year?: number;
    description?: string;
  };
  
  // For add deduction
  deduction?: {
    deduction_type: DeductionType;
    amount: number;
    currency?: string;
    total_amount?: number;
    installment_count?: number;
    start_month?: number;
    start_year?: number;
    description?: string;
  };
  
  // For change department
  new_department?: string;
  
  // For generic field update
  field_updates?: Record<string, string | number | boolean>;
}

/**
 * POST /api/payroll/bulk
 * Perform bulk operations on selected employees
 */
export async function POST(request: NextRequest) {
  try {
    const body: BulkOperationRequest = await request.json();

    // Validate required fields
    if (!body.operation || !body.payroll_ids || body.payroll_ids.length === 0 || !body.current_user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: operation, payroll_ids, current_user_id' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', body.current_user_id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ payroll_id: string; error: string }> = [];

    // Execute operation based on type
    switch (body.operation) {
      case 'salary_increase':
        if (!body.salary_change) {
          return NextResponse.json({ error: 'salary_change is required' }, { status: 400 });
        }

        for (const payrollId of body.payroll_ids) {
          try {
            // Get current salary
            const { data: payroll } = await supabase
              .from('employee_payroll')
              .select('salary_amount')
              .eq('id', payrollId)
              .single();

            if (!payroll) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: 'Payroll not found' });
              continue;
            }

            const currentSalary = Number(payroll.salary_amount) || 0;
            let newSalary = currentSalary;

            if (body.salary_change.type === 'percentage') {
              newSalary = currentSalary * (1 + body.salary_change.value / 100);
            } else {
              newSalary = currentSalary + body.salary_change.value;
            }

            // Update salary
            const { error } = await supabase
              .from('employee_payroll')
              .update({
                salary_amount: Math.round(newSalary),
                updated_by: body.current_user_id,
              })
              .eq('id', payrollId);

            if (error) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: error.message });
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            errors.push({ payroll_id: payrollId, error: String(err) });
          }
        }
        break;

      case 'add_allowance':
        if (!body.allowance) {
          return NextResponse.json({ error: 'allowance is required' }, { status: 400 });
        }

        for (const payrollId of body.payroll_ids) {
          try {
            const { error } = await supabase
              .from('employee_allowances')
              .insert({
                payroll_id: payrollId,
                allowance_type: body.allowance.allowance_type,
                amount: body.allowance.amount,
                currency: body.allowance.currency || 'HUF',
                tax_treatment: body.allowance.tax_treatment || 'fully_taxable',
                is_recurring: body.allowance.is_recurring || false,
                effective_month: body.allowance.effective_month,
                effective_year: body.allowance.effective_year,
                description: body.allowance.description,
                created_by: body.current_user_id,
              });

            if (error) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: error.message });
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            errors.push({ payroll_id: payrollId, error: String(err) });
          }
        }
        break;

      case 'add_deduction':
        if (!body.deduction) {
          return NextResponse.json({ error: 'deduction is required' }, { status: 400 });
        }

        for (const payrollId of body.payroll_ids) {
          try {
            const { error } = await supabase
              .from('employee_deductions')
              .insert({
                payroll_id: payrollId,
                deduction_type: body.deduction.deduction_type,
                amount: body.deduction.amount,
                currency: body.deduction.currency || 'HUF',
                total_amount: body.deduction.total_amount,
                installment_count: body.deduction.installment_count,
                remaining_amount: body.deduction.total_amount || body.deduction.amount,
                installments_remaining: body.deduction.installment_count,
                start_month: body.deduction.start_month,
                start_year: body.deduction.start_year,
                description: body.deduction.description,
                is_active: true,
                is_completed: false,
                created_by: body.current_user_id,
              });

            if (error) {
              errorCount++;
              errors.push({ payroll_id: payrollId, error: error.message });
            } else {
              successCount++;
            }
          } catch (err) {
            errorCount++;
            errors.push({ payroll_id: payrollId, error: String(err) });
          }
        }
        break;

      case 'change_department':
        if (!body.new_department) {
          return NextResponse.json({ error: 'new_department is required' }, { status: 400 });
        }

        const { error: deptError, count: deptCount } = await supabase
          .from('employee_payroll')
          .update({
            department: body.new_department,
            updated_by: body.current_user_id,
          })
          .in('id', body.payroll_ids);

        if (deptError) {
          return NextResponse.json({ error: deptError.message }, { status: 500 });
        }

        successCount = deptCount || 0;
        break;

      case 'update_field':
        if (!body.field_updates) {
          return NextResponse.json({ error: 'field_updates is required' }, { status: 400 });
        }

        const { error: updateError, count: updateCount } = await supabase
          .from('employee_payroll')
          .update({
            ...body.field_updates,
            updated_by: body.current_user_id,
          })
          .in('id', body.payroll_ids);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        successCount = updateCount || 0;
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      total_processed: body.payroll_ids.length,
      success_count: successCount,
      error_count: errorCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Bulk operation completed: ${successCount} succeeded, ${errorCount} failed`,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/by-user/[userId]/route.ts`

```
Folder: src/app/api/payroll/by-user/[userId]
Type: ts | Lines:       88
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const getSupabaseClient = () =>
const extractParams = (request: NextRequest) => {
const checkAdmin = async (supabase: ReturnType<typeof getSupabaseClient>, userId: string) => {
```

<details>
<summary>📄 Full content (      88 lines)</summary>

```ts
// src/app/api/payroll/by-user/[userId]/route.ts
// GET: Get payroll record by user_id

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Utility: Get Supabase client with service role
 */
const getSupabaseClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * Utility: Extract userId and current_user_id from request
 */
const extractParams = (request: NextRequest) => {
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const userId = segments[segments.length - 1];
  const currentUserId = url.searchParams.get('current_user_id');
  return { userId, currentUserId };
};

/**
 * Utility: Check if user is admin
 */
const checkAdmin = async (supabase: ReturnType<typeof getSupabaseClient>, userId: string) => {
  const { data: userData, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return !error && userData?.is_admin;
};

/**
 * GET /api/payroll/by-user/[userId]
 * Get payroll record for a specific user (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { userId, currentUserId } = extractParams(request);

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!currentUserId) {
      return NextResponse.json({ error: 'current_user_id is required' }, { status: 400 });
    }

    const isAdmin = await checkAdmin(supabase, currentUserId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { data: payroll, error: payrollError } = await supabase
      .from('employee_payroll')
      .select(`
        *,
        users!employee_payroll_user_id_fkey (
          id,
          user_firstname,
          user_lastname,
          is_manager
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (payrollError) {
      // If no payroll found, return 404
      return NextResponse.json({
        data: null,
        message: 'No payroll record found for this user'
      }, { status: 404 });
    }

    return NextResponse.json({ data: payroll }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/deductions/route.ts`

```
Folder: src/app/api/payroll/deductions
Type: ts | Lines:      120
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (     120 lines)</summary>

```ts
// src/app/api/payroll/deductions/route.ts
// GET: Get deductions for a payroll record
// POST: Create new deduction

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateDeductionRequest } from '../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/payroll/deductions?payroll_id=xxx
 * Get deductions for a payroll record
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payrollId = searchParams.get('payroll_id');

    if (!payrollId) {
      return NextResponse.json(
        { error: 'payroll_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('employee_deductions')
      .select('*')
      .eq('payroll_id', payrollId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deductions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/payroll/deductions
 * Create new deduction
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('current_user_id');

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'current_user_id is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', currentUserId)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body: CreateDeductionRequest = await request.json();

    // Validate required fields
    if (!body.payroll_id || !body.deduction_type || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: payroll_id, deduction_type, amount' },
        { status: 400 }
      );
    }

    // Calculate remaining amount if installments
    const remaining_amount = body.total_amount || body.amount;
    const installments_remaining = body.installment_count;

    // Create deduction
    const { data, error } = await supabase
      .from('employee_deductions')
      .insert({
        ...body,
        currency: body.currency || 'HUF',
        remaining_amount,
        installments_remaining,
        is_active: true,
        is_completed: false,
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating deduction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Deduction created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/export/route.ts`

```
Folder: src/app/api/payroll/export
Type: ts | Lines:      172
Top definitions:
--- Exports ---
export type PayrollData = {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     172 lines)</summary>

```ts
// src/app/api/payroll/export/route.ts
// POST: Export payroll data to Excel in various Hungarian formats

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { ExportPayrollRequest, ExportFormat, EmploymentType } from '../../../../../types/payroll';
import { runPayrollValidation } from '../../../../../lib/runPayrollValidation';
import type { PostgrestError } from '@supabase/supabase-js';


export type PayrollData = {
  id: string;
  user_id: string;
  user_firstname: string;
  user_lastname: string;
  employment_type: EmploymentType;
  department?: string | null;
  termination_date?: string | null;
  [key: string]: unknown;
};

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
   const { data: payrollData, error: dataError }: { data: PayrollData[] | null; error: PostgrestError | null } = await supabase
  .rpc('get_payroll_for_period_with_compensation', {
    p_country_code: body.country_code,
    p_year: body.export_year,
    p_month: body.export_month
  });

if (dataError) {
  console.error('Error fetching payroll data:', dataError);
  return NextResponse.json({ error: dataError.message }, { status: 500 });
}

    let filteredData: PayrollData[] = payrollData ?? [];

    // Filter by employment type if specified
    const employmentTypes: EmploymentType[] = Array.isArray(body.employment_types)
      ? body.employment_types
      : [];

    if (employmentTypes.length > 0) {
      filteredData = filteredData.filter(emp => employmentTypes.includes(emp.employment_type));
    }

    // Filter by department if specified
    if (body.department) {
      filteredData = filteredData.filter(emp => emp.department === body.department);
    }

    // Filter terminated employees if requested
    if (!body.include_terminated) {
      const now = new Date();
      filteredData = filteredData.filter(emp => !emp.termination_date || new Date(emp.termination_date) > now);
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
        export_name: body.export_name ?? null,
        employee_count: filteredData.length,
        file_name: fileName,
        export_options: {
          include_terminated: body.include_terminated ?? false,
          department: body.department ?? null,
          employment_types: employmentTypes
        }
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging export:', logError);
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
```
</details>

---

## `src/app/api/payroll/grid/route.ts`

```
Folder: src/app/api/payroll/grid
Type: ts | Lines:      187
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface GridParams {
```

<details>
<summary>📄 Full content (     187 lines)</summary>

```ts
// src/app/api/payroll/grid/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { EmploymentType } from '../../../../../types/payroll';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GridParams {
  country_code: string;
  page?: number;
  page_size?: number;
  search?: string;
  department?: string;
  employment_type?: EmploymentType;
  status?: 'active' | 'inactive' | 'all';
  sort_by?: 'name' | 'salary' | 'department' | 'position';
  sort_order?: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: GridParams = {
      country_code: searchParams.get('country_code') || 'HU',
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '50'),
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      employment_type: (searchParams.get('employment_type') as EmploymentType) || undefined,
      status: (searchParams.get('status') as 'active' | 'inactive' | 'all') || 'active',
      sort_by: (searchParams.get('sort_by') as 'name' | 'salary' | 'department' | 'position') || 'name',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    };

    // Build base query
    let query = supabase
      .from('employee_payroll')
      .select(`
        id,
        user_id,
        country_code,
        employment_type,
        contract_type,
        contract_start_date,
        contract_end_date,
        position_title,
        department,
        salary_amount,
        salary_currency,
        weekly_hours,
        is_active,
        termination_date,
        country_specific_data,
        users!employee_payroll_user_id_fkey(
          id,
          user_firstname,
          user_lastname
        )
      `, { count: 'exact' })
      .eq('country_code', params.country_code);

    // Apply status filter
    if (params.status === 'active') query = query.eq('is_active', true);
    else if (params.status === 'inactive') query = query.eq('is_active', false);

    // Apply search filter
    if (params.search?.trim()) {
      const searchTerm = `%${params.search.trim()}%`;
      query = query.or(`
        users.user_firstname.ilike.${searchTerm},
        users.user_lastname.ilike.${searchTerm},
        position_title.ilike.${searchTerm},
        department.ilike.${searchTerm}
      `);
    }

    // Apply department filter
    if (params.department) query = query.eq('department', params.department);

    // Apply employment type filter
    if (params.employment_type) query = query.eq('employment_type', params.employment_type);

    // Apply sorting (except name)
    if (params.sort_by === 'salary') {
      query = query.order('salary_amount', { ascending: params.sort_order === 'asc' });
    } else if (params.sort_by === 'department') {
      query = query.order('department', { ascending: params.sort_order === 'asc', nullsFirst: false });
    } else if (params.sort_by === 'position') {
      query = query.order('position_title', { ascending: params.sort_order === 'asc' });
    }

    // Apply pagination
    const page = params.page || 1;
    const pageSize = params.page_size || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data: payrollData, error: dataError, count } = await query;

    if (dataError) {
      console.error('Error fetching grid data:', dataError);
      return NextResponse.json({ error: dataError.message }, { status: 500 });
    }

    let enrichedData = payrollData || [];

    
    // Fetch allowances, deductions, validation issues (same as before)
    const payrollIds = enrichedData.map(p => p.id);
    let allowancesData: Record<string, unknown>[] = [];
    let deductionsData: Record<string, unknown>[] = [];
    if (payrollIds.length) {
      const { data: allowances } = await supabase.from('employee_allowances').select('*').in('payroll_id', payrollIds);
      allowancesData = allowances || [];
      const { data: deductions } = await supabase.from('employee_deductions').select('*').in('payroll_id', payrollIds).eq('is_active', true);
      deductionsData = deductions || [];
    }

    const userIds = enrichedData.map(p => p.user_id);
    let validationIssues: Record<string, unknown>[] = [];
    if (userIds.length) {
      const { data: issues } = await supabase.from('payroll_validation_issues').select('user_id, severity').in('user_id', userIds);
      validationIssues = issues || [];
    }

    // Enrich data
    enrichedData = enrichedData.map(payroll => {
      const empAllowances = (allowancesData as Array<{ payroll_id: string; amount: number }>).filter(a => a.payroll_id === payroll.id);
      const totalAllowances = empAllowances.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
      const empDeductions = (deductionsData as Array<{ payroll_id: string; amount: number }>).filter(d => d.payroll_id === payroll.id);
      const totalDeductions = empDeductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
      const empIssues = (validationIssues as Array<{ user_id: string; severity: string }>).filter(i => i.user_id === payroll.user_id);
      const hasCritical = empIssues.some(i => i.severity === 'CRITICAL');
      const hasWarning = empIssues.some(i => i.severity === 'WARNING');
      let validationStatus: 'valid' | 'warning' | 'error' = 'valid';
      if (hasCritical) validationStatus = 'error';
      else if (hasWarning) validationStatus = 'warning';

      return {
        ...payroll,
        total_allowances: totalAllowances,
        total_deductions: totalDeductions,
        allowances_count: empAllowances.length,
        deductions_count: empDeductions.length,
        allowances: empAllowances,
        deductions: empDeductions,
        validation_status: validationStatus,
        validation_issues_count: empIssues.length,
      };
    });

    // Unique departments
    const { data: departments } = await supabase
      .from('employee_payroll')
      .select('department')
      .eq('country_code', params.country_code)
      .not('department', 'is', null)
      .order('department');

    const uniqueDepartments = [...new Set(departments?.map(d => d.department).filter(Boolean) || [])];

    return NextResponse.json({
      data: enrichedData,
      pagination: {
        page,
        page_size: pageSize,
        total_count: count || 0,
        total_pages: Math.ceil((count || 0) / pageSize),
        has_next: (count || 0) > to + 1,
        has_previous: page > 1,
      },
      filters: {
        departments: uniqueDepartments,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/periods/close/route.ts`

```
Folder: src/app/api/payroll/periods/close
Type: ts | Lines:      220
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
function getMonthName(month: number): string {
```

<details>
<summary>📄 Full content (     220 lines)</summary>

```ts
// src/app/api/payroll/periods/close/route.ts
// POST: Close a payroll period
// PUT: Reopen a closed period

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/payroll/periods/close
 * Close a payroll period (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country_code, year, month, closed_by, closed_reason, last_export_id } = body;

    // Validate required fields
    if (!country_code || !year || !month || !closed_by) {
      return NextResponse.json(
        { error: 'Missing required fields: country_code, year, month, closed_by' },
        { status: 400 }
      );
    }

    // Validate month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month. Must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', closed_by)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Check if period is already closed
    const { data: existingClosure } = await supabase
      .from('payroll_period_closures')
      .select('*')
      .eq('country_code', country_code)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existingClosure && existingClosure.status === 'closed') {
      return NextResponse.json(
        { error: 'This period is already closed' },
        { status: 400 }
      );
    }

    // Close the period
    const closureData = {
      country_code,
      year,
      month,
      status: 'closed',
      closed_at: new Date().toISOString(),
      closed_by,
      closed_reason: closed_reason || `${getMonthName(month)} ${year} payroll finalized`,
      last_export_id: last_export_id || null,
    };

    let result;
    if (existingClosure) {
      // Update existing record
      const { data, error } = await supabase
        .from('payroll_period_closures')
        .update(closureData)
        .eq('id', existingClosure.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating period closure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('payroll_period_closures')
        .insert(closureData)
        .select()
        .single();

      if (error) {
        console.error('Error creating period closure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: `Period ${getMonthName(month)} ${year} has been closed`,
      data: result,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/payroll/periods/close
 * Reopen a closed payroll period (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { country_code, year, month, reopened_by, reopen_reason } = body;

    // Validate required fields
    if (!country_code || !year || !month || !reopened_by || !reopen_reason) {
      return NextResponse.json(
        { error: 'Missing required fields: country_code, year, month, reopened_by, reopen_reason' },
        { status: 400 }
      );
    }

    // Validate reopen reason
    if (reopen_reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Reopen reason must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', reopened_by)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Check if period exists and is closed
    const { data: existingClosure, error: fetchError } = await supabase
      .from('payroll_period_closures')
      .select('*')
      .eq('country_code', country_code)
      .eq('year', year)
      .eq('month', month)
      .single();

    if (fetchError || !existingClosure) {
      return NextResponse.json(
        { error: 'No closure record found for this period' },
        { status: 404 }
      );
    }

    if (existingClosure.status !== 'closed') {
      return NextResponse.json(
        { error: 'This period is not closed' },
        { status: 400 }
      );
    }

    // Reopen the period
    const { data, error } = await supabase
      .from('payroll_period_closures')
      .update({
        status: 'reopened',
        reopened_at: new Date().toISOString(),
        reopened_by,
        reopen_reason,
      })
      .eq('id', existingClosure.id)
      .select()
      .single();

    if (error) {
      console.error('Error reopening period:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Period ${getMonthName(month)} ${year} has been reopened`,
      data,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
}
```
</details>

---

## `src/app/api/payroll/periods/status/route.ts`

```
Folder: src/app/api/payroll/periods/status
Type: ts | Lines:      115
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (     115 lines)</summary>

```ts
// src/app/api/payroll/periods/status/route.ts
// GET: Get status of payroll periods

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/payroll/periods/status
 * Get status of one or multiple payroll periods (admin only)
 * 
 * Query params:
 * - current_user_id: UUID (required)
 * - country_code: string (optional, filter by country)
 * - year: number (optional, filter by year)
 * - month: number (optional, filter by month - requires year)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get('current_user_id');
    const countryCode = searchParams.get('country_code');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'current_user_id is required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', currentUserId)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // If specific period requested, use the helper function
    if (countryCode && year && month) {
      const { data, error } = await supabase
        .rpc('get_period_status', {
          p_country_code: countryCode,
          p_year: parseInt(year),
          p_month: parseInt(month)
        });

      if (error) {
        console.error('Error fetching period status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        country_code: countryCode,
        year: parseInt(year),
        month: parseInt(month),
        status: data[0] || { status: 'open' },
      }, { status: 200 });
    }

    // Otherwise, get all periods matching filters
    let query = supabase
      .from('payroll_period_closures')
      .select(`
        *,
        closed_by_user:users!payroll_period_closures_closed_by_fkey(
          id,
          user_firstname,
          user_lastname
        ),
        reopened_by_user:users!payroll_period_closures_reopened_by_fkey(
          id,
          user_firstname,
          user_lastname
        )
      `)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }

    if (year) {
      query = query.eq('year', parseInt(year));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching period closures:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      periods: data || [],
      count: data?.length || 0,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/payroll/route.ts`

```
Folder: src/app/api/payroll
Type: ts | Lines:      213
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     213 lines)</summary>

```ts
// src/app/api/payroll/route.ts
// GET: List all payroll records
// POST: Create new payroll record

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreatePayrollRequest, EmployeePayroll } from '../../../../types/payroll';

/**
 * GET /api/payroll
 * List all payroll records (admin only)
 * Query params:
 * - country_code: Filter by country
 * - is_active: Filter by active status
 * - department: Filter by department
 */
export async function GET(request: NextRequest) {
  try {
   const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
    // Check if user is admin
  /*  const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }*/

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('country_code');
    const isActive = searchParams.get('is_active');
   // const department = searchParams.get('department');
    const userId = searchParams.get('user_id');

    // Build query
    let query = supabase
      .from('employee_payroll')
      .select(`
        *,
        users!employee_payroll_user_id_fkey (
          id,
          user_firstname,
          user_lastname,
          is_manager
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (countryCode) {
      query = query.eq('country_code', countryCode);
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }
   /* if (department) {
      query = query.eq('department', department);
    }*/
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payroll records:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data.length }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/payroll
 * Create new payroll record (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
    
    // Check if user is admin
  /*  const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    } */

    // Parse request body
    const body: CreatePayrollRequest = await request.json();

    // Validate required fields
    if (!body.user_id || !body.country_code || !body.employment_type || 
        !body.contract_type || !body.salary_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already has active payroll record
    const { data: existingPayroll, error: checkError } = await supabase
      .from('employee_payroll')
      .select('id')
      .eq('user_id', body.user_id)
      .eq('is_active', true)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing payroll:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingPayroll) {
      return NextResponse.json(
        { error: 'User already has an active payroll record' },
        { status: 400 }
      );
    }

    // Verify country exists
    const { data: country, error: countryError } = await supabase
      .from('payroll_countries')
      .select('country_code')
      .eq('country_code', body.country_code)
      .eq('is_active', true)
      .single();

    if (countryError || !country) {
      return NextResponse.json(
        { error: 'Invalid or inactive country code' },
        { status: 400 }
      );
    }

    // Prepare payroll data
    const payrollData = {
      user_id: body.user_id,
      country_code: body.country_code,
      employment_type: body.employment_type,
      contract_type: body.contract_type,
      contract_start_date: body.contract_start_date,
      contract_end_date: body.contract_end_date || null,
      position_title: body.position_title,
      department: body.department || null,
      work_location: body.work_location || null,
      weekly_hours: body.weekly_hours,
      salary_amount: body.salary_amount,
      salary_currency: body.salary_currency || 'HUF',
      salary_period: body.salary_period || 'monthly',
      payment_method: body.payment_method || 'bank_transfer',
      bank_account_iban: body.bank_account_iban || null,
      bank_name: body.bank_name || null,
      country_specific_data: body.country_specific_data || {},
      benefits: body.benefits || [],
      is_active: true,
      created_by: body.user_id,
      updated_by: body.user_id,
    };

    // Insert payroll record
    const { data, error } = await supabase
      .from('employee_payroll')
      .insert(payrollData)
      .select(`
        *,
        users!employee_payroll_user_id_fkey (
          id,
          user_firstname,
          user_lastname
        )
      `)
      .single();

    if (error) {
      console.error('Error creating payroll record:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data, 
      message: 'Payroll record created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/performance/goals/create/route.ts`

```
Folder: src/app/api/performance/goals/create
Type: ts | Lines:      130
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     130 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('📥 Request body:', body)
    
    const {
      employee_id,
      goal_title,
      goal_description,
      success_criteria,
      created_by
    } = body

    if (!employee_id || !goal_title || !created_by) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use service role client (like your openedpositions route)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('company_to_users')
      .select('company_id')
      .eq('user_id', employee_id)
      .single()
    
    console.log('🏢 Company lookup:', { company, error: companyError?.message })

    if (companyError || !company) {
      return NextResponse.json({ 
        error: companyError?.message || 'Company not found' 
      }, { status: 400 })
    }

    // Get manager
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('manager_id')
      .eq('user_id', employee_id)
      .single()
    
    console.log('👤 Profile lookup:', { profile, error: profileError?.message })

    if (profileError || !profile?.manager_id) {
      return NextResponse.json({ 
        error: 'Manager not found for employee' 
      }, { status: 400 })
    }

    // Get quarter
    const { data: quarterData, error: quarterError } = await supabaseAdmin.rpc('get_current_quarter')
    console.log('📅 Quarter lookup:', { quarter: quarterData, error: quarterError?.message })

    if (quarterError) {
      return NextResponse.json({ 
        error: 'Failed to get current quarter' 
      }, { status: 500 })
    }

    const quarter = quarterData as string
    const year = new Date().getFullYear()
    const status = created_by === 'employee' ? 'draft' : 'active'

    const goalData = {
      employee_id,
      manager_id: profile.manager_id,
      company_id: company.company_id,
      goal_title,
      goal_description,
      success_criteria,
      quarter,
      year,
      status,
      created_by
    }

    console.log('📝 Attempting insert with data:', goalData)

    // Insert the goal using service role (bypasses RLS)
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('performance_goals')
      .insert([goalData])
      .select()

    if (insertError) {
      console.error('❌ Insert failed:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      return NextResponse.json({ 
        error: insertError.message || 'Failed to create goal'
      }, { status: 500 })
    }

    if (!insertedData || insertedData.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create goal' 
      }, { status: 500 })
    }

    console.log('✅ Goal created successfully:', insertedData)

    return NextResponse.json({
      message: 'Goal created successfully',
      goal: insertedData[0]
    })

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/performance/goals/route.ts`

```
Folder: src/app/api/performance/goals
Type: ts | Lines:      101
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     101 lines)</summary>

```ts
// app/api/performance/goals/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') // 'employee' or 'manager'
    const employee_id = searchParams.get('employee_id') // for manager viewing specific employee
    const user_id = searchParams.get('user_id') // current user's ID
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }
    
    const cookieStore = await cookies()
    
    // Use service role to bypass RLS for server-side operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    )
    
    if (view === 'manager') {
      console.log('=== Manager View Debug ===')
      console.log('Manager user_id:', user_id)
      
      // Get manager's team members directly from user_profiles (same as timeclock route)
      const { data: teamMembers, error: teamError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('manager_id', user_id)
      
      if (teamError) {
        console.error('Team fetch error:', teamError)
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
      }
      
      console.log('Team members found:', teamMembers?.length)
      
      if (!teamMembers || teamMembers.length === 0) {
        return NextResponse.json({ goals: [] })
      }
      
      const employeeIds = teamMembers.map(m => m.user_id)
      console.log('Employee IDs:', employeeIds)
      
      // If specific employee requested, filter to just that employee
      const targetIds = employee_id ? [employee_id] : employeeIds
      
      // Get goals using the view for better performance
      const { data: goals, error: goalsError } = await supabase
        .from('v_goals_with_status')
        .select('*')
        .in('employee_id', targetIds)
        .order('created_at', { ascending: false })
      
      if (goalsError) {
        console.error('Goals fetch error:', goalsError)
        return NextResponse.json({ error: goalsError.message }, { status: 500 })
      }
      
      console.log('Goals found:', goals?.length)
      
      return NextResponse.json({ goals: goals || [] })
    } else {
      // Get employee's own goals
      const { data: goals, error: goalsError } = await supabase
        .from('v_goals_with_status')
        .select('*')
        .eq('employee_id', user_id)
        .order('created_at', { ascending: false })
      
      if (goalsError) {
        console.error('Goals fetch error:', goalsError)
        return NextResponse.json({ error: goalsError.message }, { status: 500 })
      }
      
      return NextResponse.json({ goals: goals || [] })
    }
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/performance/goals/update/route.ts`

```
Folder: src/app/api/performance/goals/update
Type: ts | Lines:      134
Top definitions:
--- Exports ---

--- Key Functions/Components ---
interface GoalUpdatePayload {
```

<details>
<summary>📄 Full content (     134 lines)</summary>

```ts
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
```
</details>

---

## `src/app/api/performance/pulse/submit/route.ts`

```
Folder: src/app/api/performance/pulse/submit
Type: ts | Lines:      109
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     109 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { goal_id, status, progress_comment, blockers, employee_id } = body
    console.log('Pulse submit body:', body)

    // --- Input validation ---
    if (!goal_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!employee_id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }
    if (!['green', 'yellow', 'red'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // --- Supabase server client with cookies ---
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    // --- Get current week start ---
    const { data: weekStart, error: weekError } = await supabase.rpc('get_week_start')
    if (weekError) {
      console.error('Week start error:', weekError)
      return NextResponse.json({ error: 'Failed to get week start' }, { status: 500 })
    }
    console.log('Week start:', weekStart)

    // --- Check if a pulse already exists this week ---
    const { data: existing } = await supabase
      .from('goal_updates')
      .select('id')
      .eq('goal_id', goal_id)
      .eq('employee_id', employee_id)
      .eq('week_start_date', weekStart as string)
      .maybeSingle()

    if (existing) {
      // --- Update existing pulse ---
      const { data: updatedData, error: updateError } = await supabase
        .from('goal_updates')
        .update({
          status,
          progress_comment: progress_comment || null,
          blockers: blockers || null,
        })
        .eq('id', existing.id)
        .select('id, goal_id, employee_id, status, progress_comment, blockers, week_start_date')

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error(updateError.message)
      }

      return NextResponse.json({
        message: 'Pulse updated successfully',
        update: updatedData?.[0],
      })
    }

    // --- Insert new pulse ---
    const { data: insertedData, error: insertError } = await supabase
      .from('goal_updates')
      .insert([
        {
          goal_id,
          employee_id,
          status,
          progress_comment: progress_comment || null,
          blockers: blockers || null,
          week_start_date: weekStart as string,
        },
      ])
      .select('id, goal_id, employee_id, status, progress_comment, blockers, week_start_date')

    if (insertError) {
      console.error('Insert error:', insertError)
      throw new Error(insertError.message)
    }

    return NextResponse.json({
      message: 'Pulse submitted successfully',
      update: insertedData?.[0],
    })
  } catch (error) {
    console.error('Pulse submission error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/positions-private/route.ts`

```
Folder: src/app/api/positions-private
Type: ts | Lines:       83
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      83 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
 
  
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const now = new Date().toISOString()

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = createServerComponentClient({ cookies: () => cookies() })

  // Get the user's company_id
  const { data: companyLink, error: errorCompany } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single()

  console.log('🏢 Company Link:', companyLink)

  if (errorCompany) {
    return NextResponse.json({ error: errorCompany.message }, { status: 500 })
  }

  if (!companyLink) {
    return NextResponse.json({ positions: [] })
  }

  // Get the user's role from users table
  const { data: userData, error: errorUser } = await supabase
    .from('users')
    .select('is_manager, is_admin')
    .eq('id', userId)
    .single()

  console.log('👔 User Data:', userData)

  if (errorUser) {
    return NextResponse.json({ error: errorUser.message }, { status: 500 })
  }

  // Build the query - IMPORTANT: Inclure manager_id dans le select
  const query = supabase
    .from('openedpositions')
    .select(`
      *,
      manager_id,
      company:company_id (company_logo, company_name, slug)
    `)
    .eq('company_id', companyLink.company_id)
    .or(`position_end_date.is.null,position_end_date.gt.${now}`)

  console.log('🔍 Is Manager:', userData.is_manager)
  console.log('🔍 Is Admin:', userData.is_admin)

  // Managers voient TOUTES les positions de leur company (pas de filtre)
  // Ils verront différents boutons selon qu'ils soient assignés ou non
  
  const { data: positions, error: errorPositions } = await query

  console.log('📊 Positions found:', positions?.length || 0)
  
  if (positions && positions.length > 0) {
    console.log('🔍 First position sample:', {
      id: positions[0].id,
      position_name: positions[0].position_name,
      manager_id: positions[0].manager_id
    })
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (errorPositions) {
    return NextResponse.json({ error: errorPositions.message }, { status: 500 })
  }

  return NextResponse.json({ positions: positions || [] })
}
```
</details>

---

## `src/app/api/positions-public/route.ts`

```
Folder: src/app/api/positions-public
Type: ts | Lines:       47
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      47 lines)</summary>

```ts
import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabaseServerClient"

export async function GET(req: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    
    
    let query = supabase
      .from("openedpositions")
      .select(
        `
        id,
        position_name,
        position_description,
        position_description_detailed,
        manager_id,
        company:company(
          company_logo,
          company_name,
          slug
        )
      `
      )

    // ⚡ Filtre par slug si fourni
    if (slug) {
      query = query.eq("company.slug", slug)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ positions: data }, { status: 200 })
  } catch (e) {
    console.error("API error:", e)
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    )
  }
}
```
</details>

---

## `src/app/api/positions/analytics.ts`

```
Folder: src/app/api/positions
Type: ts | Lines:       95
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface CandidatData {
interface PositionToCandidatItem {
```

<details>
<summary>📄 Full content (      95 lines)</summary>

```ts
// app/api/positions/analytics/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CandidatData {
  candidat_firstname?: string;
  candidat_lastname?: string;
}

interface PositionToCandidatItem {
  created_at: string;
  candidat_score: number | null;
  source: string;
  candidats: CandidatData | null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const position_id = url.searchParams.get('position_id')
  const user_id = url.searchParams.get('user_id')
  const period = url.searchParams.get('period')

  if (!position_id) {
    return new Response(JSON.stringify({ error: 'position_id requis' }), { status: 400 })
  }
  if (!user_id) {
    return new Response(JSON.stringify({ error: 'user_id requis' }), { status: 400 })
  }

  try {
    // Vérifier que la position existe
    const { data: position, error: posErr } = await supabase
      .from('openedpositions')
      .select('*')
      .eq('id', position_id)
      .single()

    if (posErr || !position) {
      return new Response(JSON.stringify({ error: 'Position non trouvée' }), { status: 404 })
    }

    // Construire la requête pour les candidats de cette position
    let query = supabase
      .from('position_to_candidat')
      .select(`
        created_at,
        candidat_score,
        source,
        candidats (
          candidat_firstname,
          candidat_lastname
        )
      `)
      .eq('position_id', position_id)

    // Appliquer le filtre temporel si spécifié
    if (period && period !== 'all') {
      const days = parseInt(period.replace('d', ''))
      if (!isNaN(days)) {
        const filterDate = new Date()
        filterDate.setDate(filterDate.getDate() - days)
        query = query.gte('created_at', filterDate.toISOString())
      }
    }

    const { data: candidateData, error: candidateError } = await query

    if (candidateError) {
      console.error('Erreur lors de la récupération des candidats:', candidateError)
      return new Response(JSON.stringify({ error: 'Erreur lors de la récupération des candidats' }), { status: 500 })
    }

    // Formater les données avec typage correct
    const formattedCandidates = (candidateData as PositionToCandidatItem[])?.map(item => ({
      created_at: item.created_at,
      candidat_score: item.candidat_score,
      source: item.source || 'upload manuel',
      candidat_firstname: item.candidats?.candidat_firstname || '',
      candidat_lastname: item.candidats?.candidat_lastname || ''
    })) || []

    return new Response(JSON.stringify({ 
      candidates: formattedCandidates,
      position: position
    }), { status: 200 })

  } catch (err) {
    console.error('Erreur API:', err)
    return new Response(JSON.stringify({ error: 'Erreur serveur interne' }), { status: 500 })
  }
}
```
</details>

---

## `src/app/api/positions/list.ts`

```
Folder: src/app/api/positions
Type: ts | Lines:       71
Top definitions:
--- Exports ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

--- Key Functions/Components ---
interface Position {
```

<details>
<summary>📄 Full content (      71 lines)</summary>

```ts
// pages/api/positions/list.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabaseClient';

interface Position {
  id: number;
  position_name: string;
  position_start_date: string;
  position_end_date: string | null;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vérification de l'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Récupérer l'ID de la compagnie via la fonction get_company_candidates
    // Note: Nous utilisons cette fonction pour obtenir l'ID de la compagnie
    const { data: companyData, error: companyError } = await supabase
      .rpc('get_company_candidates', { 
        user_id_param: user_id as string 
      });

    if (companyError) {
      console.error('Error getting company:', companyError);
      return res.status(403).json({ error: 'No company associated with user' });
    }

    // Extraire l'ID de la compagnie (assuming the function returns company info)
    // Vous devrez adapter cette partie selon le retour exact de votre fonction
    const companyId = companyData?.[0]?.company_id;
    
    if (!companyId) {
      return res.status(403).json({ error: 'No company found for user' });
    }

    // Récupérer les positions de la compagnie
    const { data: positions, error: positionsError } = await supabase
      .from('openedpositions')
      .select('id, position_name, position_start_date, position_end_date, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return res.status(500).json({ error: 'Error fetching positions' });
    }

    return res.status(200).json({
      positions: positions || []
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```
</details>

---

## `src/app/api/recruitment-step/route.ts`

```
Folder: src/app/api/recruitment-step
Type: ts | Lines:       42
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      42 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get('user_id')

  console.log("user:", user_id)

  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data, error } = await supabase
      .rpc('get_recruitment_steps_for_user', { user_id })

    if (error) {
      console.error('Supabase RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      console.error('Supabase RPC returned no data')
      return NextResponse.json({ error: 'No data returned' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Unexpected error:', error.message)
    } else {
      console.error('Unexpected error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/stats/route/[positionId]/route.ts`

```
Folder: src/app/api/stats/route/[positionId]
Type: ts | Lines:       52
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      52 lines)</summary>

```ts
// src/app/api/stats/[positionId]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // On utilise la service key pour lecture complète
)

/*
export async function GET(
  request: Request,
  { params }: { params: { positionId: string } }
) {
  const { positionId } = params */

  export async function GET(request: Request) {
  const url = new URL(request.url)
  const segments = url.pathname.split('/')
  const positionId = segments[segments.length - 1]

  if (!positionId) {
    return NextResponse.json({ error: 'Position ID manquant' }, { status: 400 })
  }


  const { data, error } = await supabase
    .from('position_to_candidat')
    .select(`
      candidat_score,
      candidat_ai_analyse,
      source,
      candidat_id,
      candidat_comment,
      candidat_next_step,
      source,
      candidats (
        candidat_firstname,
        candidat_lastname,
        cv_text,
        cv_file, 
        created_at
      )
    `)
    .eq('position_id', positionId)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur récupération stats' }, { status: 500 })
  }

  return NextResponse.json({ candidates: data })
}
```
</details>

---

## `src/app/api/stripe/create-credit-session/route.ts`

```
Folder: src/app/api/stripe/create-credit-session
Type: ts | Lines:       57
Top definitions:
--- Exports ---
export const runtime = "nodejs";

--- Key Functions/Components ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

<details>
<summary>📄 Full content (      57 lines)</summary>

```ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { company_id, price_id, credits, return_url } = await req.json();

    if (!company_id || !price_id || !credits) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Fetch Stripe customer ID for this company
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: company, error } = await supabase
      .from("company")
      .select("stripe_customer_id")
      .eq("id", company_id)
      .single();

    if (error || !company?.stripe_customer_id) {
      console.error("Company not found or missing stripe_customer_id", error);
      return NextResponse.json({ error: "Invalid company" }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: company.stripe_customer_id,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${return_url}?success_credit=true`,
      cancel_url: `${return_url}?canceled_credit=true`,
      metadata: {
        company_id,
        credits,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    let message = "Unknown error";

    if (err instanceof Error) {
      message = err.message;
    }

    console.error("create-credit-session error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/stripe/create-portal-session/route.ts`

```
Folder: src/app/api/stripe/create-portal-session
Type: ts | Lines:       55
Top definitions:
--- Exports ---
export const runtime = "nodejs"

--- Key Functions/Components ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

<details>
<summary>📄 Full content (      55 lines)</summary>

```ts
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const { company_id, return_url } = await request.json()

    if (!company_id) return NextResponse.json({ error: "Missing company_id" }, { status: 400 })

    console.log("create-portal-session company_id:", company_id, "return_url:", return_url)

    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    )

    // Load company
    const { data: company, error: companyError } = await supabase
      .from("company")
      .select("stripe_customer_id")
      .eq("id", company_id)
      .single()

    if (companyError || !company) {
      console.error("Supabase error:", companyError)
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (!company.stripe_customer_id) {
      return NextResponse.json({ error: "Company does not have a Stripe customer ID" }, { status: 400 })
    }

    // Create Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripe_customer_id,
      return_url: return_url || process.env.NEXT_PUBLIC_APP_ORIGIN || "https://yourapp.com",
    })

    console.log("Stripe portal session created:", session.id)
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
  console.error("Stripe portal error:", err)

  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  return NextResponse.json({ error: "Unknown error" }, { status: 400 })
}
}
```
</details>

---

## `src/app/api/stripe/create-subscription/route.ts`

```
Folder: src/app/api/stripe/create-subscription
Type: ts | Lines:       67
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

<details>
<summary>📄 Full content (      67 lines)</summary>

```ts
// api/stripe/create-subscription/route.ts
import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { company_id, price_id, return_url } = await req.json()

    if (!company_id || !price_id || !return_url) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Fetch company and create Stripe customer if needed
    const { data: company } = await supabase
      .from('company')
      .select('stripe_customer_id')
      .eq('id', company_id)
      .single()

    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    let customerId = company.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ metadata: { company_id } })
      customerId = customer.id
      await supabase.from('company').update({ stripe_customer_id: customerId }).eq('id', company_id)
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${return_url}${return_url.includes('?') ? '&' : '?'}success=true`,
      cancel_url: `${return_url}${return_url.includes('?') ? '&' : '?'}canceled=true`,
      metadata: {
      company_id: company_id.toString(),
  }
    })

    //return NextResponse.json({ url: session.url })
    return NextResponse.json({ sessionId: session.id })
  } catch (err: unknown) {
    console.error("Stripe checkout creation error:", err)

    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
```
</details>

---

## `src/app/api/stripe/prices/route.ts`

```
Folder: src/app/api/stripe/prices
Type: ts | Lines:       26
Top definitions:
--- Exports ---
export const runtime = "nodejs"

--- Key Functions/Components ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

<details>
<summary>📄 Full content (      26 lines)</summary>

```ts
import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const runtime = "nodejs"

export async function GET() {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 10, expand: ["data.product"] })

    const formatted = prices.data.map(p => ({
      id: p.id,
      name: (p.product as Stripe.Product).name,
      price: p.unit_amount ?? 0,
    }))

    return NextResponse.json({ prices: formatted })
 } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/stripe/subscription-cancel/route.ts`

```
Folder: src/app/api/stripe/subscription-cancel
Type: ts | Lines:       50
Top definitions:
--- Exports ---
export const runtime = "nodejs"

--- Key Functions/Components ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

<details>
<summary>📄 Full content (      50 lines)</summary>

```ts
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { company_id } = await req.json()
  if (!company_id) return NextResponse.json({ error: "Missing company_id" }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1) Get the company's current subscription
  const { data: company } = await supabase
    .from("company")
    .select("stripe_subscription_id")
    .eq("id", company_id)
    .single()

  if (!company?.stripe_subscription_id) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
  }

  // 2) Cancel the subscription immediately
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(company.stripe_subscription_id)

    // 3) Update Supabase
    await supabase.from("company").update({
      stripe_subscription_id: null,
      forfait: null,
    }).eq("id", company_id)

    return NextResponse.json({
      canceled: true,
      canceled_at: canceledSubscription.canceled_at,
    })
  } catch (err: unknown) {
  if (err instanceof Error) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }

  return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
}
}
```
</details>

---

## `src/app/api/stripe/subscription/route.ts`

```
Folder: src/app/api/stripe/subscription
Type: ts | Lines:       52
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      52 lines)</summary>

```ts
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const company_id = url.searchParams.get("company_id")
    
    if (!company_id) {
      return NextResponse.json({ error: "Missing company_id" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: company, error: supabaseError } = await supabase
      .from("company")
      .select("forfait, stripe_subscription_id")
      .eq("id", company_id)
      .single()

    if (supabaseError) {
      console.error("Supabase error:", supabaseError)
      return NextResponse.json({ error: supabaseError.message }, { status: 500 })
    }

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    let status: "Active" | "Pending" | "Inactive" = "Inactive"

    if (company.forfait) {
      status = company.stripe_subscription_id ? "Active" : "Pending"
    }

    return NextResponse.json({
      subscription: {
        plan: company.forfait || "None",
        status,
      }
    })

  } catch (error) {
    console.error("Unexpected error in subscription endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
```
</details>

---

## `src/app/api/stripe/webhook/route.ts`

```
Folder: src/app/api/stripe/webhook
Type: ts | Lines:      211
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     211 lines)</summary>

```ts
  // app/api/stripe/webhook/route.ts
  import Stripe from "stripe"
  import { NextResponse } from "next/server"
  import { createClient } from "@supabase/supabase-js"

  export const runtime = "nodejs"

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  export async function POST(req: Request) {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature") as string

    // Verify Stripe webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Webhook signature unknown error"
      console.error("❌ Webhook signature verification failed:", msg)
      return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Idempotency guard
    const { data: existing } = await supabase
      .from("stripe_events")
      .select("id")
      .eq("id", event.id)
      .maybeSingle()

    if (existing) {
      console.log("ℹ️ Stripe event already processed:", event.id)
      return NextResponse.json({ received: true })
    }

    await supabase.from("stripe_events").insert({ id: event.id, type: event.type }).select()

    try {
      // ----------------------------
      // Checkout Session Completed
      // ----------------------------
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        // Fetch metadata
        const companyId = session.metadata?.company_id
        const credits = session.metadata?.credits ? parseInt(session.metadata.credits) : null
        const subscriptionId = session.subscription as string | undefined
        const customerId = session.customer as string | undefined

        if (!companyId) {
          console.log("ℹ️ No company_id in session metadata, skipping")
        } else {
          // ----- Handle AI Credits Purchase -----
          if (credits) {
            const { data: company, error } = await supabase
              .from("company")
              .select("used_ai_credits")
              .eq("id", companyId)
              .single()
            console.log("credits bought:", credits)
            console.log("current credits:" , company?.used_ai_credits)

            if (!error && company) {
              const currentCredits = company.used_ai_credits || 0
              await supabase
                .from("company")
                .update({ used_ai_credits: currentCredits - credits })
                .eq("id", companyId)

              console.log(`✅ Added ${credits} AI credits to company ${companyId}`)
            }
          }

          // ----- Handle Subscription Purchase -----
          if (subscriptionId && customerId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const priceId = subscription.items.data[0]?.price.id

            const { data: forfait } = await supabase
              .from("forfait")
              .select("id, forfait_name")
              .eq("stripe_price_id", priceId)
              .single()

            if (forfait) {
              await supabase
                .from("company")
                .update({
                  forfait: forfait.forfait_name,
                  stripe_subscription_id: subscriptionId,
                  stripe_customer_id: customerId,
                  grace_until: null,
                })
                .eq("id", companyId)

              console.log(`✅ Company ${companyId} subscribed to ${forfait.forfait_name}`)
            } else {
              console.log("ℹ️ No matching forfait found for priceId", priceId)
            }
          }
        }
      }

      // ----------------------------
      // Invoice Payment Succeeded
      // ----------------------------
      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | Stripe.Subscription | null
        }

        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

        if (!subscriptionId || !customerId) return NextResponse.json({ received: true })

        // Find company by customer metadata or database
        let companyId: string | null = null
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer.deleted) companyId = customer.metadata?.company_id || null

        if (!companyId) {
          const { data: company } = await supabase
            .from("company")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()
          if (company) companyId = company.id.toString()
        }

        // Update subscription info
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id

        const { data: forfait } = await supabase
          .from("forfait")
          .select("forfait_name")
          .eq("stripe_price_id", priceId)
          .single()

        if (companyId && forfait) {
          await supabase
            .from("company")
            .update({
              forfait: forfait.forfait_name,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              grace_until: null,
            })
            .eq("id", companyId)

          console.log(`✅ Updated company ${companyId} to plan: ${forfait.forfait_name}`)
        }
      }

      // ----------------------------
      // Invoice Payment Failed
      // ----------------------------
      if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

        if (!customerId) return NextResponse.json({ received: true })

        // Find company
        let companyId: string | null = null
        const customer = await stripe.customers.retrieve(customerId)
        if (!customer.deleted) companyId = customer.metadata?.company_id || null

        if (!companyId) {
          const { data: company } = await supabase
            .from("company")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single()
          if (company) companyId = company.id.toString()
        }

        if (companyId) {
          const graceUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          await supabase.from("company").update({ grace_until: graceUntil }).eq("id", companyId)

          console.log(`⚠️ Payment failed → company ${companyId} has grace until ${graceUntil}`)
        }
      }
    } catch (err: unknown) {
      console.error("❌ Webhook handling error:", err)
      return NextResponse.json({ error: "Internal webhook error" }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  }
```
</details>

---

## `src/app/api/tickets/upload/route.ts`

```
Folder: src/app/api/tickets/upload
Type: ts | Lines:      121
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface CompanyUser {
interface Ticket {
```

<details>
<summary>📄 Full content (     121 lines)</summary>

```ts
// app/api/tickets/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CompanyUser {
  user_id: string;
}

interface Ticket {
  id: string;
  user_id: string;
  company: {
    company_to_users: CompanyUser[];
  };
}

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const ticketId = formData.get('ticketId') as string;

    if (!file || !ticketId) {
      return NextResponse.json({ error: 'Missing file or ticketId' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Verify user has access to this ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        company:company_id(
          company_to_users(user_id)
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user has access to this ticket
    const hasAccess = ticket.user_id === user.id || 
    ticket.company.company_to_users.some((cu: CompanyUser) => cu.user_id === user.id);


    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Generate unique filename
    const fileName = `${user.id}/${ticketId}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    // Save attachment record to database
    const { data: attachmentData, error: dbError } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('ticket-attachments')
        .remove([uploadData.path]);
      throw dbError;
    }

    return NextResponse.json({ 
      success: true, 
      attachment: attachmentData 
    });

  } catch (error: unknown) {
    console.error('File upload error:', error);
    return NextResponse.json(
       { error: error instanceof Error ? error.message : 'Failed to upload file' },
       { status: 500 }
    );
  }
}
```
</details>

---

## `src/app/api/timeclock/manager/route.ts`

```
Folder: src/app/api/timeclock/manager
Type: ts | Lines:      265
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase: SupabaseClient = createClient(
interface TeamMember {
interface PendingEntry {
```

<details>
<summary>📄 Full content (     265 lines)</summary>

```ts
// /app/api/timeclock/manager/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// -------------------
// TypeScript types
// -------------------
interface TeamMember {
  user_id: string;
  first_name: string;
  last_name: string;
  manager_id: string;
  todayStatus?: 'clocked_in' | 'clocked_out' | 'not_started';
  todayEntry?: {
    id: number;
    clock_in: string;
    clock_out: string | null;
    total_hours: number | null;
    is_late: boolean;
  } | null;
  weeklyHours?: number;
}

interface PendingEntry {
  id: number;
  user_id: string;
  clock_in: string;
  clock_out: string;
  total_hours: number;
  is_late: boolean;
  is_overtime: boolean;
  employee_notes: string | null;
  user_profiles: {
    first_name: string;
    last_name: string;
  };
}

// -------------------
// Helper: get team members via Supabase function
// -------------------
async function getTeamMembers(managerId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .rpc('get_team_members_by_manager', { manager_uuid: managerId });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  // Ensure data is an array
  if (!data) return [];
  return Array.isArray(data) ? data : [];
}

// -------------------
// GET Handler
// -------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId');
    const action = searchParams.get('action');

    if (!managerId) return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });

    // -------------------
    // Team Today
    // -------------------
    if (action === 'team-today') {
      const teamMembers = await getTeamMembers(managerId);

      if (teamMembers.length === 0) {
        return NextResponse.json({ success: true, teamMembers: [] });
      }

      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const userIds = teamMembers.map((m) => m.user_id);

      const { data: todayEntries } = await supabase
        .from('time_entries')
        .select('*')
        .in('user_id', userIds)
        .gte('clock_in', startOfDay.toISOString())
        .lte('clock_in', endOfDay.toISOString());

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyEntries } = await supabase
        .from('time_entries')
        .select('user_id, total_hours')
        .in('user_id', userIds)
        .gte('clock_in', startOfWeek.toISOString())
        .not('clock_out', 'is', null);

      const teamData: TeamMember[] = teamMembers.map((m: TeamMember) => {
        const todayEntry = todayEntries?.find((e) => e.user_id === m.user_id) ?? null;
        const weeklyHours =
          weeklyEntries
            ?.filter((e) => e.user_id === m.user_id)
            .reduce((sum, e) => sum + (Number(e.total_hours) || 0), 0) ?? 0;

        const todayStatus: 'clocked_in' | 'clocked_out' | 'not_started' = todayEntry
          ? todayEntry.clock_out
            ? 'clocked_out'
            : 'clocked_in'
          : 'not_started';

        return {
          ...m,
          todayEntry,
          weeklyHours,
          todayStatus,
        };
      });

      return NextResponse.json({ success: true, teamMembers: teamData });
    }

    // -------------------
    // Pending Approvals
    // -------------------
   if (action === 'pending-approvals') {
  const teamMembers = await getTeamMembers(managerId);
  if (teamMembers.length === 0) return NextResponse.json({ success: true, entries: [] });

  const userIds = teamMembers.map((m) => m.user_id);

  // Récupère SEULEMENT les time_entries, sans join
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .in('user_id', userIds)
    .eq('status', 'pending')
    .not('clock_out', 'is', null)
    .order('clock_in', { ascending: false })
    .limit(50);

  if (error) throw error;

  // Map manuellement avec les données de teamMembers
  const entries: PendingEntry[] = data.map((e) => {
    const member = teamMembers.find(m => m.user_id === e.user_id);
    return {
      ...e,
      user_profiles: {
        first_name: member?.first_name || 'Unknown',
        last_name: member?.last_name || 'User',
      },
    };
  });

  return NextResponse.json({ success: true, entries });
}

    // -------------------
    // Team Summary
    // -------------------
    if (action === 'team-summary') {
      const teamMembers = await getTeamMembers(managerId);
      if (teamMembers.length === 0) {
        return NextResponse.json({
          success: true,
          summary: { totalEmployees: 0, totalHours: 0, avgHoursPerEmployee: 0, lateCount: 0, overtimeCount: 0 },
        });
      }

      const userIds = teamMembers.map((m) => m.user_id);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data: weeklyData } = await supabase
        .from('time_entries')
        .select('total_hours, is_late, is_overtime')
        .in('user_id', userIds)
        .gte('clock_in', startOfWeek.toISOString())
        .not('clock_out', 'is', null);

      const summary = {
        totalEmployees: teamMembers.length,
        totalHours: weeklyData?.reduce((sum, e) => sum + (Number(e.total_hours) || 0), 0) ?? 0,
        avgHoursPerEmployee: 0,
        lateCount: weeklyData?.filter((e) => e.is_late).length ?? 0,
        overtimeCount: weeklyData?.filter((e) => e.is_overtime).length ?? 0,
      };
      summary.avgHoursPerEmployee = summary.totalHours / (teamMembers.length || 1);

      return NextResponse.json({ success: true, summary });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/timeclock/manager error:', error);
    return NextResponse.json({ error: 'Failed to fetch manager data' }, { status: 500 });
  }
}

// -------------------
// POST Handler
// -------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { managerId, action, entryId, status, managerNotes } = body as {
      managerId: string;
      action: string;
      entryId: number;
      status: 'approved' | 'rejected';
      managerNotes?: string;
    };

    if (!managerId) return NextResponse.json({ error: 'Manager ID required' }, { status: 400 });

    if (action === 'approve-entry') {
      if (!entryId || !status) return NextResponse.json({ error: 'Entry ID and status required' }, { status: 400 });

      const { data: entry } = await supabase
        .from('time_entries')
        .select('user_id')
        .eq('id', entryId)
        .single();

      if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

      const teamMembers = await getTeamMembers(managerId);
      if (!teamMembers.some((m) => m.user_id === entry.user_id)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const { data, error } = await supabase
        .from('time_entries')
        .update({
          status,
          manager_notes: managerNotes || null,
          approved_by: managerId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ success: true, message: `Time entry ${status}`, entry: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/timeclock/manager error:', error);
    return NextResponse.json({ error: 'Failed to process manager action' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/timeclock/route.ts`

```
Folder: src/app/api/timeclock
Type: ts | Lines:      327
Top definitions:
--- Exports ---

--- Key Functions/Components ---
interface WorkShift {
interface TimeEntry {
const supabase = createClient(
const DEFAULT_SHIFT: WorkShift = {
function isObject(v: unknown): v is Record<string, unknown> {
function calculateExpectedTimes(shift: WorkShift) {
```

<details>
<summary>📄 Preview (first 100 lines of      327)</summary>

```ts
// /app/api/timeclock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// -------------------
// Types
// -------------------
interface WorkShift {
  start_time: string;
  end_time: string;
  shift_name?: string;
}

interface TimeEntry {
  id: string;
  user_id: string;
  company_id?: string;
  clock_in: string;
  clock_out?: string | null;
  expected_clock_in?: string;
  expected_clock_out?: string;
  total_hours?: number;
  regular_hours?: number;
  overtime_hours?: number;
  is_late?: boolean;
  status?: string;
}

// -------------------
// Supabase Client
// -------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Default shift if none assigned
const DEFAULT_SHIFT: WorkShift = {
  start_time: '09:00:00',
  end_time: '17:00:00'
};

// -------------------
// Helper Functions
// -------------------

// Type guard
function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object';
}

async function getUserCompany(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single();

  if (error || !data?.company_id) throw new Error('User company not found');
  return data.company_id;
}

// Safely handle relation returning array or object
async function getUserActiveShift(userId: string): Promise<WorkShift> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('user_shifts')
    .select(`
      shift_id,
      work_shifts (
        start_time,
        end_time,
        shift_name
      )
    `)
    .eq('user_id', userId)
    .lte('effective_from', today)
    .or(`effective_until.is.null,effective_until.gte.${today}`)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user shift:', error);
    return DEFAULT_SHIFT;
  }

  if (!data || !('work_shifts' in data)) {
    return DEFAULT_SHIFT;
  }

  const rawWorkShifts = (data as Record<string, unknown>).work_shifts;

  // Case 1: Array
  if (Array.isArray(rawWorkShifts) && rawWorkShifts.length > 0 && isObject(rawWorkShifts[0])) {
    const raw = rawWorkShifts[0];
    const start_time =
      typeof raw.start_time === 'string' ? raw.start_time : DEFAULT_SHIFT.start_time;
    const end_time =
      typeof raw.end_time === 'string' ? raw.end_time : DEFAULT_SHIFT.end_time;
    const shift_name =
... (truncated,      327 total lines)
```
</details>

---

## `src/app/api/unsubscribe/route.tsx`

```
Folder: src/app/api/unsubscribe
Type: tsx | Lines:       37
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      37 lines)</summary>

```tsx
// Create: src/app/api/unsubscribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Update contact_submissions to unsubscribe
    const { error } = await supabase
      .from('contact_submissions')
      .update({ 
        marketing_consent: false,
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Unsubscribe error:', error);
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```
</details>

---

## `src/app/api/update-comment/route.ts`

```
Folder: src/app/api/update-comment
Type: ts | Lines:       23
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      23 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabaseServerClient'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { candidat_id, comment } = await request.json()

  if (!candidat_id) {
    return NextResponse.json({ error: 'Missing candidat_id' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { error } = await supabase
    .from('position_to_candidat')
    .update({ candidat_comment: comment })
    .eq('candidat_id', candidat_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Comment updated successfully' })
}
```
</details>

---

## `src/app/api/update-next-step/route.ts`

```
Folder: src/app/api/update-next-step
Type: ts | Lines:       31
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      31 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { candidat_id, step_id } = await request.json()  // Changed from step_name to step_id

    if (!candidat_id) {
      return NextResponse.json({ error: 'candidat_id manquant' }, { status: 400 })
    }

    const { error } = await supabase
      .from('position_to_candidat')
      .update({ candidat_next_step: step_id === null ? null : step_id })  // Use step_id instead
      .eq('candidat_id', candidat_id)

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Mise à jour réussie' })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
```
</details>

---

## `src/app/api/user-role/route.ts`

```
Folder: src/app/api/user-role
Type: ts | Lines:       53
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      53 lines)</summary>

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user information from the database
    const { data: user, error } = await supabase
      .from('users')
      .select('is_manager, is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user role' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      is_manager: user.is_manager || false,
      is_admin: user.is_admin || false,
    });
  } catch (error) {
    console.error('Unexpected error in user-role API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```
</details>

---

## `src/app/api/users/update-manager/route.ts`

```
Folder: src/app/api/users/update-manager
Type: ts | Lines:       71
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      71 lines)</summary>

```ts
// app/api/users/update-manager/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, managerId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!managerId) {
      return NextResponse.json(
        { error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    // Check if user_profiles record exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          manager_id: managerId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message || 'Failed to update manager');
      }
    } else {
      // Create new profile if it doesn't exist
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          manager_id: managerId,
        });

      if (error) {
        throw new Error(error.message || 'Failed to create user profile');
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error updating manager:', err);

    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 400 });
  }
}
```
</details>

---

## `src/app/api/users/update-status/route.ts`

```
Folder: src/app/api/users/update-status
Type: ts | Lines:       61
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (      61 lines)</summary>

```ts
// app/api/users/update-status/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId,companyId, isActive } = body;

    console.log('Update status request:', { userId, isActive });

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'User ID and active status are required' },
        { status: 400 }
      );
    }

    // Update the user's active status in company_to_users table
    const { data, error } = await supabase
      .from('company_to_users')
      .update({ is_active: isActive })
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to update user status',
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('Update successful:', data);

    return NextResponse.json({ 
      success: true, 
      data,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```
</details>

---

## `src/app/api/users/users-creation/route.ts`

```
Folder: src/app/api/users/users-creation
Type: ts | Lines:      100
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (     100 lines)</summary>

```ts
// app/api/users-creation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      companyId,
      managerId,
      employmentStartDate,
      isManager = false, // ✅ New field with default false
    } = body;

    // Validate required fields
    if (!managerId) {
      return NextResponse.json(
        { error: 'Manager ID is required' },
        { status: 400 }
      );
    }

    if (!employmentStartDate) {
      return NextResponse.json(
        { error: 'Employment start date is required' },
        { status: 400 }
      );
    }

    // 1️⃣ Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create user account');
    }

    const userId = authData.user.id;

    // 2️⃣ Insert into users table with is_manager flag
    const { error: userError } = await supabase.from('users').insert({
      id: userId,
      user_firstname: firstName,
      user_lastname: lastName,
      is_admin: false,
      is_manager: isManager, // ✅ Set the is_manager field
    });

    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(userError.message || 'Failed to create user profile');
    }

    // 3️⃣ Link user to company
    const { error: linkError } = await supabase.from('company_to_users').insert({
      user_id: userId,
      company_id: parseInt(companyId, 10),
    });

    if (linkError) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('users').delete().eq('id', userId);
      throw new Error(linkError.message || 'Failed to link user to company');
    }

    // 4️⃣ Insert into user_profiles with manager and employment date
    const { error: profileError } = await supabase.from('user_profiles').insert({
      user_id: userId,
      manager_id: managerId,
      employment_start_date: employmentStartDate,
    });

    if (profileError) {
      // Rollback: delete user from all tables
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from('company_to_users').delete().eq('user_id', userId);
      await supabase.from('users').delete().eq('id', userId);
      throw new Error(profileError.message || 'Failed to create user profile');
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: unknown) {
    console.error('Error creating user:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 400 });
  }
}
```
</details>

---

## `src/app/ObsoleteHome/page copy.tsx`

```
Folder: src/app/ObsoleteHome
Type: tsx | Lines:      138
Top definitions:
--- Exports ---
export default function HomePage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     138 lines)</summary>

```tsx
'use client'

import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 w-full">
        
        {/* Logo Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <img
              src="/HRInnoLogo.jpeg"
              alt="HRInno"
              width="450"
              height="450"
              className="rounded-full shadow-lg mx-auto mb-4"
            />
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12 max-w-6xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            HR was never as
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> easy </span>
            as now!
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
            Revolutionize your human resources with AI-powered tools for recruitment, 
            employee wellness, and workplace happiness assessment.
          </p>

          {/* Animated Decoration */}
          <div className="flex justify-center gap-3 mb-8">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></span>
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-4 pb-16">
        
        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          
          {/* Feature 1 - CV Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">AI CV Analysis</h3>
              <p className="text-gray-600 mb-4">
                Intelligent resume screening with detailed compatibility scoring and automated candidate evaluation.
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Smart Matching</span>
              </div>
            </div>
          </div>

          {/* Feature 2 - Happiness Assessment */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Workplace Wellness</h3>
              <p className="text-gray-600 mb-4">
                Anonymous employee happiness assessment based on the scientific PERMA-W model for better workplace culture.
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Anonymous & Secure</span>
              </div>
            </div>
          </div>

          {/* Feature 3 - Team Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">HR Team powered</h3>
              <p className="text-gray-600 mb-4">
                Streamlined hiring process with position management, applicant tracking, candidates database AI analyze and detailed analytics dashboard.
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Full Pipeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Ready to Transform Your HR?
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Join the future of human resources with our AI-powered platform. 
              Start optimizing your recruitment and employee wellness today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => window.location.href = 'http://localhost:3000/jobs/demo/contact'}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>

       

    
      </div>
    </div>
  )
}
```
</details>

---

## `src/app/ObsoleteHome/page.tsx`

```
Folder: src/app/ObsoleteHome
Type: tsx | Lines:      143
Top definitions:
--- Exports ---
export default function HomePage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     143 lines)</summary>

```tsx
'use client';

import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleProvider';

export default function HomePage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 w-full">
        
        {/* Logo Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <img
              src="/HRInnoLogo.jpeg"
              alt="InnoHR"
              width="450"
              height="450"
              className="rounded-full shadow-lg mx-auto mb-4"
            />
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12 max-w-6xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            {t('home.hero.title')}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}{t('home.hero.titleHighlight')}{' '}
            </span>
            {t('home.hero.titleEnd')}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
            {t('home.hero.subtitle')}
          </p>

          {/* Animated Decoration */}
          <div className="flex justify-center gap-3 mb-8">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></span>
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-4 pb-16">
        
        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          
          {/* Feature 1 - CV Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t('home.features.cvAnalysis.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('home.features.cvAnalysis.description')}
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>{t('home.features.cvAnalysis.badge')}</span>
              </div>
            </div>
          </div>

          {/* Feature 2 - Happiness Assessment */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t('home.features.wellness.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('home.features.wellness.description')}
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>{t('home.features.wellness.badge')}</span>
              </div>
            </div>
          </div>

          {/* Feature 3 - Team Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t('home.features.teamManagement.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('home.features.teamManagement.description')}
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>{t('home.features.teamManagement.badge')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {t('home.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center">
                {t('home.cta.getStarted')}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => window.location.href = './contact'}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
              >
                {t('home.cta.contactUs')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```
</details>

---

## `src/app/layout.tsx`

```
Folder: src/app
Type: tsx | Lines:       37
Top definitions:
--- Exports ---
export const metadata: Metadata = {
export default function RootLayout({

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      37 lines)</summary>

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ClientProvider from "./ClientProvider";
import { LocaleProvider } from "../i18n/LocaleProvider";
import { messages } from "../i18n/messages";
import CookieConsent from "../../components/CookieConsent";
import { SpeedInsights } from "@vercel/speed-insights/next"


export const metadata: Metadata = {
  title: "HRInno",
  description: "HR was never as easy as NOW",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LocaleProvider messages={messages}>
          <ClientProvider>
            {/*}<DemoWarningBanner /> {*/}
            <Header />
            <main style={{ padding: "2rem" }}>{children}</main>
            <Footer />
            <CookieConsent /> {/* ✅ Add here, after Footer */}
          </ClientProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
```
</details>

---

## `src/app/reset-password/page.tsx`

```
Folder: src/app/reset-password
Type: tsx | Lines:      176
Top definitions:
--- Exports ---
export default function ResetPasswordPage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     176 lines)</summary>

```tsx
'use client'

// pages/reset-password.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useLocale } from 'i18n/LocaleProvider';

export default function ResetPasswordPage() {
  const { t } = useLocale();

  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  // Handle the auth callback and establish session
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have a hash fragment with token info
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'recovery' && accessToken) {
          // Set the session using the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            setError(error.message);
          } else {
            setSessionReady(true);
          }
        } else {
          // Check if there's already an active session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setSessionReady(true);
          } else {
            setError(t('resetPage.errors.noSession') || 'No valid session found. Please request a new password reset link.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [t]);

  const handleUpdate = async () => {
    setError('');
    setSuccess(false);

    if (!password) {
      setError(t('resetPage.errors.missingPassword'));
      return;
    }

    if (password.length < 6) {
      setError(t('resetPage.errors.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  const handleBackToApp = () => {
    // Get the stored slug from localStorage
    const storedSlug = localStorage.getItem('reset_password_slug');
    
    if (storedSlug) {
      // Clean up the stored slug
      localStorage.removeItem('reset_password_slug');
      // Redirect to the company-specific URL
      window.location.href = `/jobs/${storedSlug}`;
    } else {
      // Fallback to home
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('resetPage.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-900 mb-2">
            {t('resetPage.errors.sessionError') || 'Session Error'}
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleBackToApp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
          >
            {t('resetPage.buttons.backToHome') || 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {t('resetPage.title')}
      </h1>

      <input
        type="password"
        placeholder={t('resetPage.fields.newPasswordPlaceholder')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
        className="w-full px-4 py-3 border rounded-lg mb-3"
        disabled={success}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-green-700 text-sm">
            {t('resetPage.messages.passwordUpdated')}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleUpdate}
          disabled={success}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('resetPage.buttons.save')}
        </button>

        {success && (
          <button
            onClick={handleBackToApp}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
          >
            {t('resetPage.buttons.backToApp') || 'Back to Application'}
          </button>
        )}
      </div>
    </div>
  );
}
```
</details>

---

## `src/app/jobs/[slug]/openedpositions/new/page.tsx`

```
Folder: src/app/jobs/[slug]/openedpositions/new
Type: tsx | Lines:      804
Top definitions:
--- Exports ---
export default function NewOpenedPositionPage() {

--- Key Functions/Components ---
const supabase = createClient(
interface CompanyUser {
interface TranslationFunction {
interface ManagerDropdownProps {
function ManagerDropdown({ selectedManager, onSelect, companyId, t }: ManagerDropdownProps) {
interface ConfirmAnalysisModalProps {
function ConfirmAnalysisModal({
```

<details>
<summary>📄 Preview (first 100 lines of      804)</summary>

```tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Calendar, FileText, Briefcase, BarChart3, CheckCircle, AlertCircle, Activity, Lock, X, Clock, Users, ChevronDown, Search, User } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface CompanyUser {
  user_id: string
  first_name: string
  last_name: string
  email: string
  is_admin: boolean
  is_super_admin: boolean
  is_manager: boolean
  manager_id: string | null
  manager_first_name: string | null
  manager_last_name: string | null
  employment_start_date: string | null
}

// Define the translation function type
interface TranslationFunction {
  (key: string): string
}

interface ManagerDropdownProps {
  selectedManager: CompanyUser | null
  onSelect: (manager: CompanyUser | null) => void
  companyId: string
  t: TranslationFunction
}

function ManagerDropdown({ selectedManager, onSelect, companyId, t }: ManagerDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [managers, setManagers] = useState<CompanyUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data, error } = await supabase
          .rpc('get_company_users', { company_id_input: companyId })
        
        if (error) {
          console.error('Error fetching company users:', error)
          setError(t('managerDropdown.errorLoading'))
          setManagers([])
          return
        }
        
        if (!data || data.length === 0) {
          setError(t('managerDropdown.noUsers'))
          setManagers([])
          return
        }
        
        setManagers(data)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError(t('managerDropdown.errorLoading'))
        setManagers([])
      } finally {
        setLoading(false)
      }
    }

    if (companyId) {
      fetchManagers()
    }
  }, [companyId, t])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredManagers = managers.filter(manager => {
    const fullName = `${manager.first_name} ${manager.last_name}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })
... (truncated,      804 total lines)
```
</details>

---

## `src/app/jobs/[slug]/openedpositions/page.tsx`

```
Folder: src/app/jobs/[slug]/openedpositions
Type: tsx | Lines:       78
Top definitions:
--- Exports ---
export default async function JobPage({

--- Key Functions/Components ---
type Position = {
type ApiResponse = { positions?: Position[] };
```

<details>
<summary>📄 Full content (      78 lines)</summary>

```tsx
// src/app/jobs/[slug]/page.tsx
import PositionsList from "./PositionList";
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from 'next'

type Position = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company?: {
    company_logo?: string;
    company_name?: string;
    slug?: string;
  };
};

type ApiResponse = { positions?: Position[] };

// Generate dynamic metadata for better SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `Jobs at ${slug} | Job Board`,
    description: `Browse available positions at ${slug}. Find your next career opportunity.`,
    openGraph: {
      title: `Jobs at ${slug}`,
      description: `Browse available positions at ${slug}`,
    },
  }
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const baseUrl = process.env.NODE_ENV === 'development'
  ? "http://localhost:3000"
  : (process.env.NEXT_PUBLIC_SITE_URL || 
     (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"));



  let positions: Position[] = [];

  try {
    const res = await fetch(`${baseUrl}/api/positions-public?slug=${slug}`, {
      // Use revalidation instead of no-store for better performance
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    
    if (!res.ok) {
      console.error('Failed to fetch positions:', res.status, res.statusText);
      // Don't throw here, just use empty array
    } else {
      const data: ApiResponse = await res.json();
      positions = data.positions ?? [];
    }
  } catch (err) {
    console.error('Error fetching positions:', err);
    // Continue with empty array
  }

  return (
    <>
      {/* Remove the main wrapper with fixed max-width and padding */}
      <PositionsList initialPositions={positions} companySlug={slug} />
      <Analytics />
    </>
  );
}
```
</details>

---

## `src/app/jobs/[slug]/openedpositions/analytics/page.tsx`

```
Folder: src/app/jobs/[slug]/openedpositions/analytics
Type: tsx | Lines:      565
Top definitions:
--- Exports ---
export default PositionAnalytics;

--- Key Functions/Components ---
interface Position {
interface PositionCandidate {
interface AnalyticsData {
type SupabaseCandidateRow = {
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const TIME_FILTERS = ['7d', '30d', '90d', 'all'] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];
function getErrorMessage(err: unknown): string {
const PositionAnalytics: React.FC = () => {
```

<details>
<summary>📄 Preview (first 100 lines of      565)</summary>

```tsx
'use client'

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieLabelRenderProps
} from 'recharts';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useLocale } from 'i18n/LocaleProvider';

interface Position {
  id: number;
  position_name: string;
  position_start_date: string;
  position_end_date: string | null;
  created_at: string;
}

interface PositionCandidate {
  created_at: string;
  candidat_score: number | null;
  source: string;
  candidat_firstname: string;
  candidat_lastname: string;
}

interface AnalyticsData {
  totalCandidates: number;
  averageScore: number;
  medianScore: number;
  daysOpen: number;
  candidatesPerDay: number;
  timelineData: Array<{ date: string; candidates: number; avgScore: number }>;
  scoreDistribution: Array<{ score: string; count: number }>;
  sourceDistribution: Array<{ name: string; value: number; avgScore: number }>;
}

type SupabaseCandidateRow = {
  created_at: string;
  candidat_score: number | null;
  source: string | null;
  candidats: {
    candidat_firstname: string | null;
    candidat_lastname: string | null;
  } | null;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TIME_FILTERS = ['7d', '30d', '90d', 'all'] as const;
type TimeFilter = (typeof TIME_FILTERS)[number];

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;

  // Type guard for objects with a message string
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message?: unknown }).message === 'string'
  ) {
    return (err as { message: string }).message;
  }

  try {
    return JSON.stringify(err);
  } catch {
    return 'An error occurred';
  }
}

const PositionAnalytics: React.FC = () => {
  const { t } = useLocale();

  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [candidates, setCandidates] = useState<PositionCandidate[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [error, setError] = useState<string | null>(null);
  const session = useSession();
  const supabase = useSupabaseClient()

  useEffect(() => {
    loadPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedPosition) {
      loadCandidates();
    } else {
      setCandidates([]);
      setAnalytics(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
... (truncated,      565 total lines)
```
</details>

---

## `src/app/jobs/[slug]/Home/page.tsx`

```
Folder: src/app/jobs/[slug]/Home
Type: tsx | Lines:      259
Top definitions:
--- Exports ---
export default function HomePage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     259 lines)</summary>

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useLocale } from '../../../../i18n/LocaleProvider';
import { useParams } from 'next/navigation';

export default function HomePage() {
  const { t } = useLocale();
  const params = useParams();
  const slug = params?.slug as string;
  
  const [showDemoDisclaimer, setShowDemoDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    // Check if slug is "demo" and if disclaimer hasn't been accepted in this session
    if (slug === 'demo') {
      const sessionKey = 'demo_disclaimer_accepted';
      const hasAccepted = sessionStorage.getItem(sessionKey);
      
      if (!hasAccepted) {
        setShowDemoDisclaimer(true);
      }
    }
  }, [slug]);

  const handleAcceptDisclaimer = () => {
    sessionStorage.setItem('demo_disclaimer_accepted', 'true');
    setShowDemoDisclaimer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Demo Disclaimer Modal */}
      {showDemoDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3 text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {t('home.demo.disclaimer.title')}
                  </h2>
                  <p className="text-white text-opacity-90 text-sm">
                    {t('home.demo.disclaimer.subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">
                  {t('home.demo.disclaimer.message')}
                </p>
              </div>

              {/* Key Points */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {t('home.demo.disclaimer.point1')}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {t('home.demo.disclaimer.point2')}
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">3</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {t('home.demo.disclaimer.point3')}
                  </p>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                <input
                  id="demo-consent"
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded flex-shrink-0"
                />
                <label htmlFor="demo-consent" className="text-sm text-gray-700 cursor-pointer">
                  {t('home.demo.disclaimer.consent')}
                </label>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAcceptDisclaimer}
                disabled={!disclaimerAccepted}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
              >
                <CheckCircle className="w-5 h-5" />
                {t('home.demo.disclaimer.accept')}
              </button>

              <p className="text-xs text-gray-500 text-center">
                {t('home.demo.disclaimer.footer')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 w-full">
        
        {/* Logo Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <img
              src="/HRInnoLogo.jpeg"
              alt="InnoHR"
              width="450"
              height="450"
              className="rounded-full shadow-lg mx-auto mb-4"
            />
          </div>
        </div>

        {/* Main Title */}
        <div className="text-center mb-12 max-w-6xl w-full">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            {t('home.hero.title')}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}{t('home.hero.titleHighlight')}{' '}
            </span>
            {t('home.hero.titleEnd')}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
            {t('home.hero.subtitle')}
          </p>

          {/* Animated Decoration */}
          <div className="flex justify-center gap-3 mb-8">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse delay-150"></span>
            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse delay-300"></span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full px-4 pb-16">
        
        {/* Features Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          
          {/* Feature 1 - CV Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t('home.features.cvAnalysis.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('home.features.cvAnalysis.description')}
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>{t('home.features.cvAnalysis.badge')}</span>
              </div>
            </div>
          </div>

          {/* Feature 2 - Happiness Assessment */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t('home.features.wellness.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('home.features.wellness.description')}
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>{t('home.features.wellness.badge')}</span>
              </div>
            </div>
          </div>

          {/* Feature 3 - Team Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t('home.features.teamManagement.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('home.features.teamManagement.description')}
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>{t('home.features.teamManagement.badge')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section - Commented out as in original
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {t('home.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center">
                {t('home.cta.getStarted')}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => window.location.href = './contact'}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
              >
                {t('home.cta.contactUs')}
              </button>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}
```
</details>

---

## `src/app/jobs/[slug]/tickets/[ticketId]/page.tsx`

```
Folder: src/app/jobs/[slug]/tickets/[ticketId]
Type: tsx | Lines:      681
Top definitions:
--- Exports ---
export default function TicketDetailPage() {

--- Key Functions/Components ---
const supabase = createClient(
interface TicketData {
interface MessageData {
interface AttachmentData {
interface UserData {
```

<details>
<summary>📄 Preview (first 100 lines of      681)</summary>

```tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowLeft,
  Send,
  Loader2,
  AlertCircle,
  User,
  Clock,
  Paperclip,
  Download,
  Settings,
  Building,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useLocale } from '../../../../../i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  company_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  company: {
    company_name: string;
    slug: string;
  };
}

interface MessageData {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'admin';
  sender_id: string | null;
  sender_email: string | null;
  sender_name: string | null;
  message: string;
  created_at: string;
}

interface AttachmentData {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface UserData {
  auth_id: string;
  auth_email: string;
  user_firstname: string | null;
  user_lastname: string | null;
  is_admin: boolean;
  company: {
    id: string;
    slug: string;
    company_name: string;
  } | null;
  company_id: string;
}

export default function TicketDetailPage() {
  const params = useParams<{ slug: string; ticketId: string }>();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
... (truncated,      681 total lines)
```
</details>

---

## `src/app/jobs/[slug]/tickets/page.tsx`

```
Folder: src/app/jobs/[slug]/tickets
Type: tsx | Lines:      551
Top definitions:
--- Exports ---
export default function TicketsPage() {

--- Key Functions/Components ---
const supabase = createClient(
interface TicketData {
interface UserData {
```

<details>
<summary>📄 Preview (first 100 lines of      551)</summary>

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Clock,
  User,
  Building,
  ArrowUpCircle,
  Calendar,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { useLocale } from '../../../../i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  company_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
  company?: {
    name: string;
    slug: string;
  } | null;
  ticket_messages?: { count: number }[];
  ticket_attachments?: { count: number }[];
  message_count: number;
  attachment_count: number;
}

interface UserData {
  id: string;
  email: string;
  user_firstname: string;
  user_lastname: string;
  company_to_users?: {
    company_id: string;
    company?: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

export default function TicketsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const companySlug = params.slug;
  const { t } = useLocale();

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);

  const statusColors = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  };

  const fetchCurrentUser = useCallback(async () => {
    setIsHrinnoAdmin(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
... (truncated,      551 total lines)
```
</details>

---

## `src/app/jobs/[slug]/tickets/create/page.tsx`

```
Folder: src/app/jobs/[slug]/tickets/create
Type: tsx | Lines:      446
Top definitions:
--- Exports ---
export default function CreateTicketPage() {

--- Key Functions/Components ---
const supabase = createClient(
interface AttachmentFile extends File {
interface User {
```

<details>
<summary>📄 Preview (first 100 lines of      446)</summary>

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Ticket,
  ArrowLeft,
  Upload,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';
import { useLocale } from '../../../../../i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AttachmentFile extends File {
  id: string;
}

interface User {
  id: string;
  email: string;
  user_firstname: string;
  user_lastname: string;
}

export default function CreateTicketPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const companySlug = params.slug;
  const { t } = useLocale();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: ''
  });
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Categories for the dropdown
  const categories = [
    'Technical Support',
    'Bug Report',
    'Feature Request',
    'Account Issue',
    'Billing',
    'General Inquiry',
    'Other'
  ];

  // Fetch company ID and current user
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/jobs/${companySlug}/login`);
          return;
        }

        // Get user details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          setError(t('createTicket.errors.userNotFound'));
          return;
        }

        setCurrentUser(userData);

        // Get company ID
        const { data: companyData, error: companyError } = await supabase
          .from('company')
          .select('id')
          .eq('slug', companySlug)
          .single();

        if (companyError || !companyData) {
          setError(t('createTicket.errors.companyNotFound'));
          return;
        }
... (truncated,      446 total lines)
```
</details>

---

## `src/app/jobs/[slug]/contact/page.tsx`

```
Folder: src/app/jobs/[slug]/contact
Type: tsx | Lines:       20
Top definitions:
--- Exports ---
export default function ContactPage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      20 lines)</summary>

```tsx
'use client';

import ContactForm from '../../../../../components/ContactForm';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ContactPage() {
  const [isOpen, setIsOpen] = useState(true);
  const params = useParams();
    const slug = typeof params.slug === 'string' ? params.slug : '';

  return (
    <ContactForm
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={slug === 'demo' ? 'demo' : 'other'}
      slug={slug} // <-- pass slug here for redirection
    />
  );
}
```
</details>

---

## `src/app/jobs/[slug]/absences/calendar/page.tsx`

```
Folder: src/app/jobs/[slug]/absences/calendar
Type: tsx | Lines:      322
Top definitions:
--- Exports ---
export default CalendarPage;

--- Key Functions/Components ---
const supabase = createClient(
interface CalendarDataForGrid {
interface TeamDataForGrid {
interface CalendarData {
interface TeamLeaveFromDB {
interface TeamData {
const CalendarPage: React.FC = () => {
```

<details>
<summary>📄 Preview (first 100 lines of      322)</summary>

```tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { createClient, User } from '@supabase/supabase-js';
import { Calendar, Download, ArrowLeft, Loader2, Users, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import YearCalendarGrid from '../../../../../../components/absence/Calendar/year_calendar_grid';
import CalendarLegend from '../../../../../../components/absence/Calendar/calendar_legend';
import CalendarLeaveModal from '../../../../../../components/absence/Calendar/calendar_leave_modal';
import { LeaveBalance, LeaveRequest } from '../../../../../../types/absence';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Match the types that YearCalendarGrid expects internally
interface CalendarDataForGrid {
  leave_requests: {
    id: string;
    start_date: string;
    end_date: string;
    leave_type_color?: string;
    leave_type_name_hu?: string;
    status?: 'pending' | 'approved';
    reason?: string;
  }[];
}

interface TeamDataForGrid {
  team_size: number;
  team_leaves: {
    user_id: string;
    employee_name: string;
    start_date: string;
    end_date: string;
    leave_type_name_hu?: string;
    status?: 'pending' | 'approved';
  }[];
}

// For internal state, use the full types from absence.ts
interface CalendarData {
  leave_requests: LeaveRequest[];
  leave_balances: LeaveBalance[];
}

interface TeamLeaveFromDB {
  user_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  leave_type_name_hu?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

interface TeamData {
  team_size: number;
  team_leaves: TeamLeaveFromDB[];
}

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'my' | 'manager'>('my');
  const [isManager, setIsManager] = useState(false);
  const [companyId, setCompanyId] = useState<string | undefined>();

  const [calendarData, setCalendarData] = useState<CalendarData | undefined>();
  const [teamData, setTeamData] = useState<TeamData | undefined>();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ start: Date; end: Date } | undefined>();

  // --- Fetch current user ---
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data: directReports } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('manager_id', user.id)
        .limit(1);
      setIsManager((directReports?.length || 0) > 0);

      const { data: companyData } = await supabase
        .from('company_to_users')
        .select('company_id')
        .eq('user_id', user.id)
        .single();
      setCompanyId(companyData?.company_id?.toString() || undefined);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  }, []);
... (truncated,      322 total lines)
```
</details>

---

## `src/app/jobs/[slug]/absences/page.tsx`

```
Folder: src/app/jobs/[slug]/absences
Type: tsx | Lines:      539
Top definitions:
--- Exports ---
export default AbsenceManagement;

--- Key Functions/Components ---
interface CertificateData {
interface CompanyToUser {
interface LeaveRequestInsertData {
const AbsenceManagement: React.FC = () => {
```

<details>
<summary>📄 Preview (first 100 lines of      539)</summary>

```tsx
// File: app/absence-management/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { User } from '@supabase/supabase-js';
import {
  Calendar,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  Users,
  Bell
} from 'lucide-react';

import { supabase } from '../../../../../lib/supabaseClient';
import { LeaveBalance, LeaveRequest, LeaveType, PendingApproval } from '../../../../../types/absence';
import { formatDate as utilFormatDate } from '../../../../../utils/formatDate';
import { useRouter, useParams } from 'next/navigation';
import { useLocale } from 'i18n/LocaleProvider';

import CertificateUploadModal from '../../../../../components/CertificateUploadModal';
import { CertificateStatusBadge } from '../../../../../components/CertificateStatusBadge';

import StatusBadge from '../../../../../components/absence/StatusBadge';
import LeaveBalances from '../../../../../components/absence/LeaveBalances';
import RecentRequests from '../../../../../components/absence/RecentRequests';
import PendingApprovals from '../../../../../components/absence/PendingApprovals';
import RequestLeaveModal from '../../../../../components/absence/RequestLeaveModal2';

// Type for certificate data (matching what CertificateUploadModal returns)
interface CertificateData {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  comment?: string;
  certificate_file: string;
  medical_certificate_id: number;
}

// Type for company data from database
interface CompanyToUser {
  company_id: string;
}

// Type for insert data
interface LeaveRequestInsertData {
  user_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  manager_id?: string;
  medical_certificate_id?: number;
}

const AbsenceManagement: React.FC = () => {
  const { t } = useLocale();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals'>('overview');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const router = useRouter();

  // Certificate upload states
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedLeaveRequestId, setSelectedLeaveRequestId] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [uploadMode, setUploadMode] = useState<'new' | 'existing'>('new');

  // Extract CompanySlug:
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;

  // Request form state
  const [requestForm, setRequestForm] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch current user and check if manager
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
... (truncated,      539 total lines)
```
</details>

---

## `src/app/jobs/[slug]/terms-demo/page.tsx`

```
Folder: src/app/jobs/[slug]/terms-demo
Type: tsx | Lines:       90
Top definitions:
--- Exports ---
export default function TermsDemoPage({ params }: TermsDemoPageProps) {

--- Key Functions/Components ---
interface TermsDemoPageProps {
```

<details>
<summary>📄 Full content (      90 lines)</summary>

```tsx
// src/app/terms-demo/page.tsx

'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import Link from 'next/link';


interface TermsDemoPageProps {
  params: Promise<{ slug: string }>;
}

export default function TermsDemoPage({ params }: TermsDemoPageProps) {
  const { t } = useLocale();
  const { slug } = React.use(params); 
  const currentDate = '2025. január 29.'; // Or use Date object

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">
        {t('termsDemo.title')}
      </h1>
      
      <div className="prose prose-blue max-w-none">
        {/* Section 1: Demo Features */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.demoFeatures.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.demoFeatures.content')}
        </p>

        {/* Section 2: Liability */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.liability.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.liability.content')}
        </p>

        {/* Section 3: Data Processing */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.dataProcessing.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.dataProcessing.content')}{' '}
          {t('termsDemo.sections.dataProcessing.detailsLink')}{' '}
          <Link href={`/jobs/${slug}/privacy-demo`} className="text-blue-600 underline hover:text-blue-800">
            {t('termsDemo.sections.dataProcessing.privacyPolicy')}
          </Link>
        </p>

        {/* Section 4: AI Content */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.aiContent.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.aiContent.content')}
        </p>

        {/* Section 5: Termination */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.termination.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.termination.content')}
        </p>

        {/* Section 6: Contact */}
        <h2 className="text-xl font-semibold mt-6 mb-3">
          {t('termsDemo.sections.contact.title')}
        </h2>
        <p className="mb-4">
          {t('termsDemo.sections.contact.content')}{' '}
          <a 
            href="mailto:privacy@innohr.hu" 
            className="text-blue-600 underline hover:text-blue-800"
          >
            privacy@innohr.hu
          </a>
        </p>

        {/* Last Updated */}
        <p className="text-sm text-gray-500 mt-8 pt-4 border-t">
          {t('termsDemo.lastUpdated', { date: currentDate })}
        </p>
      </div>
    </div>
  );
}
```
</details>

---

## `src/app/jobs/[slug]/happiness-check/page.tsx`

```
Folder: src/app/jobs/[slug]/happiness-check
Type: tsx | Lines:        5
Top definitions:
--- Exports ---
export default function CompanyHappinessCheckPage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (       5 lines)</summary>

```tsx
// app/jobs/[slug]/happiness-check/page.tsx
import HappinessCheck from '../../../../../components/HappinessCheck';

export default function CompanyHappinessCheckPage() {
  return <HappinessCheck />;
}
```
</details>

---

## `src/app/jobs/[slug]/admin/import-users/page.tsx`

```
Folder: src/app/jobs/[slug]/admin/import-users
Type: tsx | Lines:       80
Top definitions:
--- Exports ---
export default function AdminImportUsersPage() {

--- Key Functions/Components ---
interface ImportResult {
```

<details>
<summary>📄 Full content (      80 lines)</summary>

```tsx
'use client'

import { useState } from 'react'

// Define the result type to match what the API returns
interface ImportResult {
  email?: string
  success?: boolean
  error?: string
}

export default function AdminImportUsersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResults(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/import-users', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setResults(data.results)
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">Import Users</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Upload CSV or XLSX</label>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Start Import'}
          </button>
        </form>

        {results && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="bg-gray-100 rounded-xl p-4 max-h-80 overflow-auto">
              {results.map((r, i) => (
                <div key={i} className="p-2 border-b border-gray-300">
                  {r.success ? (
                    <span className="text-green-600 font-medium">✔ {r.email} imported</span>
                  ) : (
                    <span className="text-red-600 font-medium">✖ {r.email} — {r.error}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```
</details>

---

## `src/app/jobs/[slug]/medical-certificate/download/page.tsx`

```
Folder: src/app/jobs/[slug]/medical-certificate/download
Type: tsx | Lines:      382
Top definitions:
--- Exports ---
export default function CertificateDownloadPage() {

--- Key Functions/Components ---
interface MedicalCertificate {
const supabase = createClient(
```

<details>
<summary>📄 Preview (first 100 lines of      382)</summary>

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLocale } from 'i18n/LocaleProvider';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Download, Search, Calendar, FileText, Users, AlertCircle, CheckCircle, User, Clock } from 'lucide-react';

// Define the type for one row of medical_certificates
interface MedicalCertificate {
  id: number;
  employee_name: string | null;
  absence_start_date: string | null;
  absence_end_date: string | null;
  hr_comment: string | null;
  treated: boolean;
  certificate_file: string | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CertificateDownloadPage() {
  const { t } = useLocale();
  
  // today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noResults, setNoResults] = useState(false);

  const fetchCertificates = async () => {
    if (!startDate || !endDate) {
      setError(t('certificateDownload.errors.selectDates'));
      return;
    }

    setError('');
    setNoResults(false);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('medical_certificates')
        .select(
          'id, employee_name, absence_start_date, absence_end_date, hr_comment, treated, certificate_file'
        )
        .gte('absence_start_date', startDate)
        .lte('absence_end_date', endDate);

      if (error) throw error;

      if (!data || data.length === 0) {
        setNoResults(true);
        setCertificates([]);
      } else {
        setCertificates(data);
      }
    } catch (e) {
      console.error(e);
      setError(t('certificateDownload.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch today's certificates when the page loads
    fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (certificates.length === 0) {
      setError(t('certificateDownload.errors.noDownload'));
      return;
    }

    setError('');
    setLoading(true);

    try {
... (truncated,      382 total lines)
```
</details>

---

## `src/app/jobs/[slug]/medical-certificate/list/page.tsx`

```
Folder: src/app/jobs/[slug]/medical-certificate/list
Type: tsx | Lines:      499
Top definitions:
--- Exports ---
export default function MedicalCertificatesPage() {

--- Key Functions/Components ---
type MedicalCertificate = {
```

<details>
<summary>📄 Preview (first 100 lines of      499)</summary>

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useLocale } from 'i18n/LocaleProvider'
import * as Popover from '@radix-ui/react-popover'
import { Search, FileText, User, Calendar, MessageCircle, CheckCircle, Clock, Filter, Eye, Upload } from 'lucide-react'

type MedicalCertificate = {
  id: number
  employee_name: string
  certificate_file: string
  absence_start_date: string
  absence_end_date: string
  employee_comment: string | null
  created_at: string
  treated: boolean
  treatment_date: string | null
  document_url?: string | null
  company_id?: number
}

export default function MedicalCertificatesPage() {
  const { t } = useLocale()
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [showAll, setShowAll] = useState<boolean>(false)
  const [companyId, setCompanyId] = useState<number | null>(null)

  const session = useSession()
  const supabase = useSupabaseClient()

  useEffect(() => {
    if (!session) return

    const fetchCompanyIdAndCertificates = async () => {
      setLoading(true)
      try {
        const { data: userProfile, error: userError } = await supabase
          .from('company_to_users')
          .select('company_id')
          .eq('user_id', session.user.id)
          .single()

        if (userError) {
          console.error(t('medicalCertificates.errors.fetchCompanyId'), userError.message)
          setCertificates([])
          setLoading(false)
          return
        }

        if (!userProfile || !userProfile.company_id) {
          console.warn(t('medicalCertificates.errors.userWithoutCompany'))
          setCertificates([])
          setLoading(false)
          return
        }

        const currentCompanyId = userProfile.company_id
        setCompanyId(currentCompanyId)

        const { data, error } = await supabase
          .from('medical_certificates')
          .select('*')
          .eq('company_id', currentCompanyId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error(t('medicalCertificates.errors.loadCertificates'), error.message)
          setCertificates([])
          return
        }

        const certificatesWithUrl: MedicalCertificate[] = (data || []).map(
          (cert: MedicalCertificate) => {
            let documentUrl = null;
            
            // Extract file path from certificate_file
            let filePath = cert.certificate_file;
            
            if (typeof cert.certificate_file === 'string' && cert.certificate_file.startsWith('{')) {
              try {
                const parsed = JSON.parse(cert.certificate_file);
                filePath = parsed.path || parsed.signedUrl || cert.certificate_file;
              } catch (e) {
                console.error('Error parsing certificate_file:', e);
              }
            }
            
            // Generate public URL
            if (filePath) {
              const { data: publicData } = supabase.storage
                .from('medical-certificates')
                .getPublicUrl(filePath);
              
              documentUrl = publicData.publicUrl;
            }
            
            return {
... (truncated,      499 total lines)
```
</details>

---

## `src/app/jobs/[slug]/medical-certificate/upload/page.tsx`

```
Folder: src/app/jobs/[slug]/medical-certificate/upload
Type: tsx | Lines:      177
Top definitions:
--- Exports ---
export default function UploadCertificatePage() {

--- Key Functions/Components ---
const supabase = createClient(
function UploadCertificatePageContent() {
```

<details>
<summary>📄 Full content (     177 lines)</summary>

```tsx
// src/app/medical-certificate/upload/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import UploadCertificateClient from './UploadCertificateClient';
import { useLocale } from '../../../../../i18n/LocaleProvider';

// Initialize Supabase client (adjust these values according to your setup)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function UploadCertificatePageContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company_id');
  const [canAddCertificate, setCanAddCertificate] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const certificateAccessChecked = useRef(false);
  const { t } = useLocale();

  // Check if user can add medical certificate
  const checkCertificateAccess = useCallback(async () => {
    console.log('🎯 checkCertificateAccess called with:', {
      companyId,
      alreadyChecked: certificateAccessChecked.current
    });
    
    if (!companyId) {
      console.log('❌ No companyId available, cannot check access');
      setIsLoading(false);
      return;
    }
    
    if (certificateAccessChecked.current) {
      console.log('❌ Access already checked, skipping');
      return;
    }
    
    console.log('🔍 Checking certificate access for company_id:', companyId);
    certificateAccessChecked.current = true;
    
    try {
      console.log('📞 Calling supabase.rpc with params:', { p_company_id: companyId });
      
      const { data, error } = await supabase.rpc('can_add_medical_certificate', { p_company_id: companyId });
      
      console.log('📨 RPC Response:', { data, error, dataType: typeof data });
      
      if (error) {
        console.log('❌ RPC Error:', error);
        setCanAddCertificate(false);
        setIsLoading(false);
        return;
      }
      
      if (data === null || data === undefined) {
        console.log('❌ Data is null/undefined, setting access to false');
        setCanAddCertificate(false);
        setIsLoading(false);
        return;
      }
      
      // Handle different possible return formats
      let hasAccess = false;
      
      if (typeof data === 'boolean') {
        console.log('🔧 Data is boolean:', data);
        hasAccess = data;
      } else if (typeof data === 'string') {
        console.log('🔧 Data is string:', data);
        hasAccess = data === 'true' || data === 'True' || data === 'TRUE';
      } else if (typeof data === 'number') {
        console.log('🔧 Data is number:', data);
        hasAccess = data === 1;
      } else if (typeof data === 'object' && data !== null) {
        console.log('🔧 Data is object:', data);
        // Sometimes Supabase functions return objects, check if there's a result property
        hasAccess = data.result === true || data.result === 'true' || 
                   data.can_access === true || data.can_access === 'true' ||
                   data[0] === true || data[0] === 'true' || // Sometimes it's an array
                   data === true; // Sometimes the object itself is the boolean
      }
      
      console.log('✅ Final access decision:', hasAccess);
      setCanAddCertificate(hasAccess);
      setIsLoading(false);
      
    } catch (error) {
      console.error('💥 Catch block error:', error);
      setCanAddCertificate(false);
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    checkCertificateAccess();
  }, [checkCertificateAccess]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('uploadCertificate.loading')}</p>
        </div>
      </div>
    );
  }

  // Show error if no company ID
  if (!companyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('uploadCertificate.error.title')}</h1>
          <p className="text-gray-700 mb-4">
            {t('uploadCertificate.error.noCompanyId')}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            {t('uploadCertificate.buttons.back')}
          </button>
        </div>
      </div>
    );
  }

  // Show plan limit reached message if access is denied
  if (canAddCertificate === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('uploadCertificate.planLimit.title')}</h1>
          <p className="text-gray-700 mb-6">
            {t('uploadCertificate.planLimit.message')}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            {t('uploadCertificate.buttons.home')}
          </button>
        </div>
      </div>
    );
  }

  // Show the upload component if access is granted
  return <UploadCertificateClient companyId={companyId} />;
}

export default function UploadCertificatePage() {
  const { t } = useLocale();
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{t('uploadCertificate.loading')}</p>
        </div>
      </div>
    }>
      <UploadCertificatePageContent />
    </Suspense>
  );
}
```
</details>

---

## `src/app/jobs/[slug]/feedback/page.tsx`

```
Folder: src/app/jobs/[slug]/feedback
Type: tsx | Lines:       10
Top definitions:
--- Exports ---
export const metadata = {
export default function Page() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      10 lines)</summary>

```tsx
// app/feedback/page.js
import FeedbackPage from './FeedbackPage'

export const metadata = {
  title: 'Demo Feedback | InnoHR',
  description: 'Share your experience with our HR platform demo',
}

export default function Page() {
  return <FeedbackPage />
}
```
</details>

---

## `src/app/jobs/[slug]/subscription/page.tsx`

```
Folder: src/app/jobs/[slug]/subscription
Type: tsx | Lines:      614
Top definitions:
--- Exports ---
export default function ManageSubscription() {

--- Key Functions/Components ---
const supabase = createClient(
type Plan = { 
type Subscription = { 
type Toast = { 
interface ForfaitData {
interface StripePriceData {
interface AICreditPack {
const fetchCompanyDetails = useCallback(async (companyId: string) => {
const remainingAICredits = (includedAICredits ?? 0) - (currentAICredits ?? 0)
```

<details>
<summary>📄 Preview (first 100 lines of      614)</summary>

```tsx
'use client'

import { useEffect, useState, useCallback } from "react"
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@supabase/auth-helpers-react'
import { useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Check, X, Star, Zap, Shield, Crown } from 'lucide-react'
import { loadStripe } from "@stripe/stripe-js"
import { useLocale } from '../../../../i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Plan = { 
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  priceId?: string | null
  includedAICredits?: number
}

type Subscription = { 
  plan: string
  status: string
}

type Toast = { 
  id: string
  message: string
  type: 'success' | 'error' 
}

interface ForfaitData {
  id: number
  forfait_name?: string
  description?: string
  max_opened_position?: number
  max_medical_certificates?: number
  access_happy_check?: boolean
  stripe_price_id?: string | null
  included_ai_credits?: number
}

interface StripePriceData {
  id: string
  name: string
  price?: number
}

interface AICreditPack {
  id: string
  credits: number
  stripe_price_id: string
  price: number
  currency: string
}

export default function ManageSubscription() {
  const session = useSession()
  const searchParams = useSearchParams()
  const { t } = useLocale()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  const [currentAICredits, setCurrentAICredits] = useState<number | null>(null)
  const [aiCreditPacks, setAICreditPacks] = useState<AICreditPack[]>([])
  const [includedAICredits, setIncludedAICredits] = useState<number>(0)


  const addToast = (message: string, type: 'success' | 'error' = 'error') => {
    const id = uuidv4()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  // --- Fetch AI credit packs dynamically
  const fetchAICreditPacks = useCallback(async () => {
    try {
      console.log("Fetching AI credit packs...")
      const { data: creditPacks, error } = await supabase
        .from('ai_credit_packs')
        .select('*')
        .order('credits')
        console.log("AI credit packs data:", creditPacks, "Error:", error)


      if (error || !creditPacks) {
        addToast(t('subscription.errors.fetchCreditPacks'), "error")
... (truncated,      614 total lines)
```
</details>

---

## `src/app/jobs/[slug]/privacy-demo/page.tsx`

```
Folder: src/app/jobs/[slug]/privacy-demo
Type: tsx | Lines:      130
Top definitions:
--- Exports ---
export default PrivacyDemoPage;

--- Key Functions/Components ---
const PrivacyDemoPage: React.FC = () => {
const ThirdPartyServices = () => {
const DataControllerInfo = () => {
```

<details>
<summary>📄 Full content (     130 lines)</summary>

```tsx
'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

const PrivacyDemoPage: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">{t('privacyDemo.title')}</h1>

      <DataControllerInfo />

      <p className="mb-4">{t('privacyDemo.intro')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.dataCollected.title')}
      </h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>{t('privacyDemo.sections.dataCollected.items.0')}</li>
        <li>{t('privacyDemo.sections.dataCollected.items.1')}</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.purpose.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.purpose.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.storage.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.storage.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.aiProcessing.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.aiProcessing.text')}</p>

      <ThirdPartyServices />

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.userRights.title')}
      </h2>
      <p className="mb-4">{t('privacyDemo.sections.userRights.text')}</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        {t('privacyDemo.sections.contact.title')}
      </h2>
      <p className="mb-2">{t('privacyDemo.sections.contact.text')}</p>

      <a
        href="mailto:privacy@innohr.hu"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {t('privacyDemo.sections.contact.email')}
      </a>

      <p className="text-sm text-gray-500 mt-8">
        {t('privacyDemo.lastUpdated')}
      </p>
    </div>
  );
};

const ThirdPartyServices = () => {
  const { t } = useLocale();

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-3">
        {t('privacyDemo.sections.thirdParty.title')}
      </h2>
      <div className="space-y-3">
        {['supabase', 'openai', 'vercel', 'stripe'].map((key) => (
          <div
            key={key}
            className={`border-l-4 pl-4 ${t(
              `privacyDemo.sections.thirdParty.items.${key}.color`
            )}`}
          >
            <h3 className="font-semibold">
              {t(`privacyDemo.sections.thirdParty.items.${key}.name`)}
            </h3>
            <p className="text-sm text-gray-600">
              {t(`privacyDemo.sections.thirdParty.items.${key}.desc`)} <br />
              <a
                href={t(`privacyDemo.sections.thirdParty.items.${key}.linkHref`)}
                className="text-blue-600 underline"
              >
                {t(`privacyDemo.sections.thirdParty.items.${key}.linkText`)}
              </a>
            </p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-600 mt-4 bg-yellow-50 p-3 rounded">
        ⚠️ <strong>{t('privacyDemo.sections.thirdParty.noticeTitle')}</strong>{' '}
        {t('privacyDemo.sections.thirdParty.noticeText')}
      </p>
    </div>
  );
};

const DataControllerInfo = () => {
  const { t } = useLocale();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-2">
        {t('privacyDemo.sections.dataController.title')}
      </h3>
      <p className="text-sm text-blue-800">
        <strong>{t('privacyDemo.sections.dataController.nameLabel')}</strong>{' '}
        {t('privacyDemo.sections.dataController.name')} <br />
        <strong>{t('privacyDemo.sections.dataController.emailLabel')}</strong>{' '}
        {t('privacyDemo.sections.dataController.email')} <br />
        <strong>{t('privacyDemo.sections.dataController.addressLabel')}</strong>{' '}
        {t('privacyDemo.sections.dataController.address')} <br />
        <strong>
          {t('privacyDemo.sections.dataController.dpoLabel')}
        </strong>{' '}
        {t('privacyDemo.sections.dataController.dpo')}
      </p>
    </div>
  );
};

export default PrivacyDemoPage;
```
</details>

---

## `src/app/jobs/[slug]/cv-analyse/page.tsx`

```
Folder: src/app/jobs/[slug]/cv-analyse
Type: tsx | Lines:      227
Top definitions:
--- Exports ---
export default async function CVAnalysePage({
export const revalidate = 300; // Revalidate every 5 minutes

--- Key Functions/Components ---
const supabase = createClient(
type Params = {
type PositionData = {
type SupabaseCompany = {
type RawSupabaseResponse = {
```

<details>
<summary>📄 Full content (     227 lines)</summary>

```tsx
// src/app/jobs/[slug]/cv-analyse/page.tsx
import CVAnalyseClient from './CVAnalyseClient';
import { createClient } from '@supabase/supabase-js';
import { Analytics } from "@vercel/analytics/next"
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

type Params = {
  id?: string | string[];
};

type PositionData = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company_id: number;
  company: {
    company_name: string;
    slug: string;
    gdpr_file_url: string | null;
  } | null;
};

// Type pour la réponse brute de Supabase (peut être objet ou tableau)
type SupabaseCompany = {
  company_name: string;
  slug: string;
  gdpr_file_url: string | null;
};

type RawSupabaseResponse = {
  id: number;
  position_name: string;
  position_description: string;
  position_description_detailed: string;
  company_id: number;
  company: SupabaseCompany | SupabaseCompany[] | null;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const positionId = Array.isArray(searchParamsResolved?.id) 
    ? searchParamsResolved.id[0] 
    : searchParamsResolved?.id;

  if (positionId) {
    try {
      const position = await fetchPositionData(positionId, slug);
      if (position) {
        return {
          title: `Apply for ${position.position_name} | ${position.company?.company_name || slug}`,
          description: `Apply for the ${position.position_name} position. ${position.position_description}`,
          openGraph: {
            title: `Apply for ${position.position_name}`,
            description: position.position_description,
          },
        };
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
    }
  }

  return {
    title: `Apply for Position | ${slug}`,
    description: `Submit your CV for analysis and application.`,
  };
}

// Cached data fetching function
async function fetchPositionData(positionId: string, companySlug: string): Promise<PositionData | null> {
  try {
    //console.log('Fetching position data for:', { positionId, companySlug });

    // Single query with join to get all needed data
    const { data: position, error } = await supabase
      .from('openedpositions')
      .select(`
        id,
        position_name,
        position_description,
        position_description_detailed,
        company_id,
        company:company_id (
          company_name,
          slug,
          gdpr_file_url
        )
      `)
      .eq('id', positionId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    //console.log('Raw position data:', position);

    // Cast to our raw response type to handle TypeScript properly
    const rawPosition = position as RawSupabaseResponse;

    // Normalize company data - handle both object and array cases
    let company: SupabaseCompany | null = null;
    
    if (rawPosition.company) {
      if (Array.isArray(rawPosition.company)) {
        // If it's an array, take the first element
        company = rawPosition.company.length > 0 ? rawPosition.company[0] : null;
      } else {
        // If it's an object, use it directly
        company = rawPosition.company;
      }
    }


    // Return the properly typed data
    const transformedPosition: PositionData = {
      id: rawPosition.id,
      position_name: rawPosition.position_name,
      position_description: rawPosition.position_description,
      position_description_detailed: rawPosition.position_description_detailed,
      company_id: rawPosition.company_id,
      company: company
    };

    return transformedPosition;
  } catch (error) {
    console.error('Error fetching position data:', error);
    return null;
  }
}

export default async function CVAnalysePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Params>;
}) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  
  const positionId = Array.isArray(searchParamsResolved?.id) 
    ? searchParamsResolved.id[0] 
    : searchParamsResolved?.id;

  // If no position ID provided, show error
  if (!positionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid Application Link</h1>
          <p className="text-gray-600 mb-4">
            The application link appears to be incomplete or invalid.
          </p>
          <a
            href={`/jobs/${slug}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Positions
          </a>
        </div>
      </div>
    );
  }

  // Fetch position data with caching
  const position = await fetchPositionData(positionId, slug);

  // If position not found or doesn't belong to company, show error
  if (!position) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Position Not Found</h1>
          <p className="text-gray-600 mb-4">
            The position you&apos;re trying to apply for doesn&apos;t exist or is no longer available.
          </p>
          <a
            href={`/jobs/${slug}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Positions
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <CVAnalyseClient
        positionName={position.position_name}
        jobDescription={position.position_description}
        jobDescriptionDetailed={position.position_description_detailed}
        positionId={position.id.toString()}
        gdpr_file_url={position.company?.gdpr_file_url || ''}
        companyName={position.company?.company_name || ''}
      />
      <Analytics />
    </>
  );
}

// Add this to your Next.js config for ISR caching
export const revalidate = 300; // Revalidate every 5 minutes
```
</details>

---

## `src/app/jobs/[slug]/happiness-dashboard/page.tsx`

```
Folder: src/app/jobs/[slug]/happiness-dashboard
Type: tsx | Lines:      483
Top definitions:
--- Exports ---
export default HRDashboard;

--- Key Functions/Components ---
interface DashboardData {
type PermaKey = keyof DashboardData['permaAverages'];
const HRDashboard = () => {
```

<details>
<summary>📄 Preview (first 100 lines of      483)</summary>

```tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  BarChart3, 
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  Smile,
  Meh,
  Frown,
  Lock,
  LogIn
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLocale } from 'i18n/LocaleProvider';

interface DashboardData {
  summary: {
    totalSessions: number;
    avgHappiness: number;
    participationTrend: number;
  };
  permaAverages: {
    positive: number;
    engagement: number;
    relationships: number;
    meaning: number;
    accomplishment: number;
    work_life_balance: number;
  };
  areasForImprovement: Array<{
    area: string;
    score: number;
  }>;
  period: string;
  companyId?: number;
  companyName?: string;
}

type PermaKey = keyof DashboardData['permaAverages'];

const HRDashboard = () => {
  const { t, locale } = useLocale();
  
  // Debug: Check if translations are working
  console.log('Dashboard - Current locale:', locale);
  console.log('Dashboard - Translation test (simple):', t('dashboard.title'));
  console.log('Dashboard - Translation test (nested):', t('dashboard.charts.permaAnalysis'));
  console.log('Dashboard - Translation test (with vars):', t('dashboard.period.days', { count: '30' }));
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const session = useSession()
  const supabase = useSupabaseClient()

  const fetchData = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      const userId = session.user.id
      
      const response = await fetch(`/api/happiness/dashboard?days=${selectedPeriod}&user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${currentSession?.access_token}`,
          'Content-Type': 'application/json',
          'x-lang': locale
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t('dashboard.errors.notAuthenticated'));
        } else if (response.status === 403) {
          throw new Error(t('dashboard.errors.accessDenied'));
        }
        throw new Error(t('dashboard.errors.loadingData'));
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dashboard.errors.unknown'));
... (truncated,      483 total lines)
```
</details>

---

## `src/app/jobs/[slug]/impressum-demo/page.tsx`

```
Folder: src/app/jobs/[slug]/impressum-demo
Type: tsx | Lines:       34
Top definitions:
--- Exports ---
export default function ImpressumDemo() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      34 lines)</summary>

```tsx
'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

export default function ImpressumDemo() {
  const { t } = useLocale();

  return (
    <main className="max-w-3xl mx-auto py-10 px-4 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">{t('impressumDemo.title')}</h1>
      <p className="mb-4">{t('impressumDemo.intro')}</p>

      <ul className="space-y-2 mb-6">
        <li><strong>{t('impressumDemo.fields.operator')}:</strong> Saussez Grégory</li>
        <li><strong>{t('impressumDemo.fields.address')}:</strong> Budapest, Hungary</li>
        <li><strong>{t('impressumDemo.fields.email')}:</strong> <a href="mailto:privacy@hrinno.hu" className="underline text-blue-600">privacy@innohr.hu</a></li>
        <li><strong>{t('impressumDemo.fields.website')}:</strong> https://www.hrinno.hu</li>
      </ul>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{t('impressumDemo.sections.liability.title')}</h2>
        <p>{t('impressumDemo.sections.liability.text')}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">{t('impressumDemo.sections.copyright.title')}</h2>
        <p>{t('impressumDemo.sections.copyright.text')}</p>
      </section>

      <p className="text-sm text-gray-500 mt-8">{t('impressumDemo.lastUpdated')}</p>
    </main>
  );
}
```
</details>

---

## `src/app/jobs/[slug]/payroll/employee/[employeeId]/page.tsx`

```
Folder: src/app/jobs/[slug]/payroll/employee/[employeeId]
Type: tsx | Lines:      647
Top definitions:
--- Exports ---
export default function EmployeePayrollDetailPage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Preview (first 100 lines of      647)</summary>

```tsx
// src/app/jobs/[slug]/payroll/employee/[employeeId]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { EmployeePayroll, PayrollHistory, HungarianPayrollData } from '../../../../../../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import { createClient, User } from '@supabase/supabase-js';


export default function EmployeePayrollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const employeeId = params.employeeId as string;

  const [payroll, setPayroll] = useState<EmployeePayroll | null>(null);
  const [history, setHistory] = useState<PayrollHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { t } = useLocale();
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  // Form state for editing
  const [formData, setFormData] = useState<EmployeePayroll | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

 const fetchCurrentUser = useCallback(async () => {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
       setCurrentUser(user);
 
     } catch (err) {
       console.error('Error fetching current user:', err);
     }
   }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser && employeeId) {
      fetchPayrollData();
    }
  }, [employeeId, currentUser]);

  const fetchPayrollData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Pass current_user_id as query parameter
      console.log('current user:', currentUser.id);
      const response = await fetch(`/api/payroll?user_id=${employeeId}&current_user_id=${currentUser.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payroll data');
      }

      const result = await response.json();
      if (result.data && result.data.length > 0) {
        const payrollData = result.data[0] as EmployeePayroll;
        setPayroll(payrollData);
        setFormData(payrollData);

        // Fetch history with current_user_id
        const historyResponse = await fetch(`/api/payroll/${payrollData.id}?current_user_id=${currentUser.id}`);
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          setHistory(historyResult.history || []);
        }
      } else {
        setError('No payroll data found for this employee');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!payroll || !currentUser) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/payroll/${payroll.id}?current_user_id=${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
... (truncated,      647 total lines)
```
</details>

---

## `src/app/jobs/[slug]/payroll/page.tsx`

```
Folder: src/app/jobs/[slug]/payroll
Type: tsx | Lines:      197
Top definitions:
--- Exports ---
export default function PayrollPage() {

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (     197 lines)</summary>

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient, User } from '@supabase/supabase-js';
import { List, Grid } from 'lucide-react';
import PayrollList from '../../../../../components/payroll/PayrollList';
import PayrollForm from '../../../../../components/payroll/PayrollForm';
import PayrollExportModal from '../../../../../components/payroll/PayrollExportModal';
import PayrollGridView from '../../../../../components/payroll/PayrollGridView';
import type { GridEmployee } from '../../../../../components/payroll/PayrollGridView';
import type { EmployeePayroll } from '../../../../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PayrollPage() {
    const { t } = useLocale();
    const params = useParams();
    const slug = params.slug as string;

    // View mode state
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Existing states
    const [showForm, setShowForm] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [selectedPayroll, setSelectedPayroll] =  useState<EmployeePayroll | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | undefined>();
    const [loading, setLoading] = useState(true);

    // Grid view edit state
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // Fetch full payroll by ID (used when editing from grid)
    const fetchPayrollById = async (id: string): Promise<EmployeePayroll> => {
        const response = await fetch(`/api/payroll/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch payroll');
        }
        return response.json();
    };




    const fetchCurrentUser = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.warn(t('payroll.noUser'));
                return;
            }
            setCurrentUser(user);
            console.log('User ID fetched:', user.id);
        } catch (err) {
            console.error(t('payroll.fetchError'), err);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    const handleEdit = (payroll: EmployeePayroll) => {
        setSelectedPayroll(payroll);
        setShowForm(true);
    };

    const handleNew = () => {
        setSelectedPayroll(null);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setSelectedPayroll(null);
        setIsEditModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    const handleExport = () => {
        if (!currentUser) {
            alert(t('payroll.verifySession'));
            return;
        }
        setShowExport(true);
    };

    // Grid view edit handler
    const handleEditEmployee = (userId: string) => {
        setEditingUserId(userId);
        setShowEditModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-center">{t('payroll.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('payroll.title')}</h1>
                        <p className="text-gray-600 mt-1">{t('payroll.subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'list'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                {t('payroll.listView') || 'List View'}
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === 'grid'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Grid className="w-4 h-4" />
                                {t('payroll.gridView') || 'Grid View'}
                            </button>
                        </div>

                        {/* Add Employee Button */}
                        <button
                            onClick={handleNew}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('payroll.addEmployeePayroll')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Conditional Rendering based on view mode and form state */}
            {showForm || isEditModalOpen ? (
                <PayrollForm
                    payroll={selectedPayroll}
                    onClose={handleCloseForm}
                />
            ) : viewMode === 'list' ? (
                <PayrollList
                    key={refreshKey}
                    onEdit={handleEdit}
                    onExport={handleExport}
                />
            ) : (
                <PayrollGridView
                    key={refreshKey}
                    countryCode="HU"
                    currentUserId={currentUser?.id || ''}
                    periodClosed={false}
                    onEditEmployee={async (employee) => {
                        const fullPayroll = await fetchPayrollById(employee.id);
                        setSelectedPayroll(fullPayroll);
                        setIsEditModalOpen(true);
                    }}
                />
            )}

            {/* Export Modal */}
            {showExport && currentUser && (
                <PayrollExportModal
                    isOpen={showExport}
                    onClose={() => setShowExport(false)}
                    userId={currentUser.id}
                />
            )}
        </div>
    );
}
```
</details>

---

## `src/app/jobs/[slug]/performance/goals/[goalId]/page.tsx`

```
Folder: src/app/jobs/[slug]/performance/goals/[goalId]
Type: tsx | Lines:      447
Top definitions:
--- Exports ---
export default function GoalDetailPage() {

--- Key Functions/Components ---
const supabase = createClient(
interface Goal {
interface Update {
```

<details>
<summary>📄 Preview (first 100 lines of      447)</summary>

```tsx
// app/jobs/[slug]/performance/goals/[goalId]/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Target, Calendar, TrendingUp, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  employee_id: string
  manager_id: string
  goal_title: string
  goal_description: string
  success_criteria: string
  quarter: string
  year: number
  status: string
  created_by: string
  employee_name: string
  manager_name: string
  created_at: string
}

interface Update {
  id: string
  status: 'green' | 'yellow' | 'red'
  progress_comment: string | null
  blockers: string | null
  week_start_date: string
  created_at: string
}

export default function GoalDetailPage() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string
  const goalId = params.goalId as string

  const [goal, setGoal] = useState<Goal | null>(null)
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [isManager, setIsManager] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    fetchGoalDetails()
  }, [session, router, goalId])

  const fetchGoalDetails = async () => {
    setLoading(true)
    try {
      // Fetch goal
      const { data: goalData, error: goalError } = await supabase
        .from('v_goals_with_status')
        .select('*')
        .eq('id', goalId)
        .single()

      if (goalError || !goalData) {
        console.error('Error fetching goal:', goalError)
        setLoading(false)
        return
      }

      setGoal(goalData)
      setIsManager(session?.user.id === goalData.manager_id)

      // Fetch all updates for this goal
      const { data: updatesData, error: updatesError } = await supabase
        .from('goal_updates')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false })

      if (!updatesError && updatesData) {
        setUpdates(updatesData)
      }
    } catch (error) {
      console.error('Error fetching goal details:', error)
    }
    setLoading(false)
  }

  const handleApprove = async () => {
    if (!session?.user?.id) {
... (truncated,      447 total lines)
```
</details>

---

## `src/app/jobs/[slug]/performance/goals/new/page.tsx`

```
Folder: src/app/jobs/[slug]/performance/goals/new
Type: tsx | Lines:      202
Top definitions:
--- Exports ---
export default function NewGoalPage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     202 lines)</summary>

```tsx
// app/jobs/[slug]/performance/goals/new/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Target, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useLocale } from 'i18n/LocaleProvider'

export default function NewGoalPage() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [successCriteria, setSuccessCriteria] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/performance/goals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: session?.user.id,
          goal_title: goalTitle,
          goal_description: goalDescription,
          success_criteria: successCriteria,
          created_by: 'employee'
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error || t('newGoalPage.messages.createError'), type: 'error' })
      } else {
        setMessage({ text: t('newGoalPage.messages.createSuccess'), type: 'success' })
        setTimeout(() => {
          router.push(`/jobs/${companySlug}/performance`)
        }, 1500)
      }
    } catch (error) {
      setMessage({ text: t('newGoalPage.messages.error', { message: (error as Error).message }), type: 'error' })
    }

    setLoading(false)
  }

  if (!session) {
    return null
  }

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <button
            onClick={() => router.push(`/jobs/${companySlug}/performance`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('newGoalPage.header.backButton')}
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-lg p-3">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t('newGoalPage.header.title')}</h1>
              <p className="text-gray-600">{t('newGoalPage.header.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">{t('newGoalPage.infoBox.title')}</p>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('newGoalPage.infoBox.tips.specific')}</li>
                <li>{t('newGoalPage.infoBox.tips.criteria')}</li>
                <li>{t('newGoalPage.infoBox.tips.approval')}</li>
              </ul>
            </div>
          </div>
        </div>

        {message && (
          <div className={`rounded-xl p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Goal Title */}
              <div>
                <label htmlFor="goalTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('newGoalPage.form.goalTitle.label')} {t('newGoalPage.form.goalTitle.required')}
                </label>
                <input
                  id="goalTitle"
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('newGoalPage.form.goalTitle.placeholder')}
                />
              </div>

              {/* Goal Description */}
              <div>
                <label htmlFor="goalDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('newGoalPage.form.goalDescription.label')}
                </label>
                <textarea
                  id="goalDescription"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                  placeholder={t('newGoalPage.form.goalDescription.placeholder')}
                />
              </div>

              {/* Success Criteria */}
              <div>
                <label htmlFor="successCriteria" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('newGoalPage.form.successCriteria.label')}
                </label>
                <textarea
                  id="successCriteria"
                  value={successCriteria}
                  onChange={(e) => setSuccessCriteria(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder={t('newGoalPage.form.successCriteria.placeholder')}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    {t('newGoalPage.form.submitButton.creating')}
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5" />
                    {t('newGoalPage.form.submitButton.create')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
```
</details>

---

## `components/AddUserModal.tsx`

```
Folder: components
Type: tsx | Lines:      489
Top definitions:
--- Exports ---
export const AddUserModal = ({ isOpen, onClose, onSuccess, companyId }: AddUserModalProps) => {

--- Key Functions/Components ---
interface AddUserModalProps {
interface CompanyUser {
const supabase = createClient(
```

<details>
<summary>📄 Preview (first 100 lines of      489)</summary>

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, Loader2, Search, Calendar, UserCircle, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useLocale } from 'i18n/LocaleProvider';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
}

interface CompanyUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const AddUserModal = ({ isOpen, onClose, onSuccess, companyId }: AddUserModalProps) => {
  const { t } = useLocale();
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    managerId: '',
    employmentStartDate: '',
    isManager: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Manager dropdown states
  const [managers, setManagers] = useState<CompanyUser[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Fetch managers when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!formData.password) {
        const newPassword = generatePassword();
        setFormData(prev => ({ ...prev, password: newPassword }));
      }
      fetchManagers();
    }
  }, [isOpen]);

  const fetchManagers = async () => {
    if (!companyId) return;
    
    setLoadingManagers(true);
    try {
      const { data, error } = await supabase.rpc('get_company_users', {
        company_id_input: companyId,
      });

      if (error) {
        console.error('Error fetching managers:', error);
        setError(t('addUserModal.errors.failedToLoadManagers'));
        return;
      }

      setManagers(Array.isArray(data) ? (data as CompanyUser[]) : []);
      
      // Check if there are no managers available
      if (!data || data.length === 0) {
        setError(t('addUserModal.errors.noUsersFound'));
      }
    } catch (err) {
      console.error('Error fetching managers:', err);
      setError(t('addUserModal.errors.failedToLoadManagers'));
    } finally {
      setLoadingManagers(false);
    }
  };
... (truncated,      489 total lines)
```
</details>

---

## `components/CertificateStatusBadge.tsx`

```
Folder: components
Type: tsx | Lines:       91
Top definitions:
--- Exports ---
export const CertificateStatusBadge: React.FC<CertificateStatusBadgeProps> = ({
export const DateMismatchAlert: React.FC<DateMismatchAlertProps> = ({

--- Key Functions/Components ---
interface CertificateStatusBadgeProps {
interface DateMismatchAlertProps {
```

<details>
<summary>📄 Full content (      91 lines)</summary>

```tsx
// components/CertificateStatusBadge.tsx
import React from 'react';
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

interface CertificateStatusBadgeProps {
  hasCertificate?: boolean;
  certificateTreated?: boolean;
  isHrValidated?: boolean;
  isMedicalConfirmed?: boolean;
}

export const CertificateStatusBadge: React.FC<CertificateStatusBadgeProps> = ({
  hasCertificate,
  certificateTreated,
  isHrValidated,
  isMedicalConfirmed
}) => {
  const { t } = useLocale();

  if (!hasCertificate) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
        <FileText className="w-3 h-3 mr-1" />
        {t('certificateStatusBadge.noCertificate')}
      </span>
    );
  }

  if (isHrValidated && certificateTreated) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t('certificateStatusBadge.certificateConfirmed')}
      </span>
    );
  }

  if (hasCertificate && !certificateTreated) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
        <Clock className="w-3 h-3 mr-1" />
        {t('certificateStatusBadge.pendingHrReview')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
      <FileText className="w-3 h-3 mr-1" />
      {t('certificateStatusBadge.certificateUploaded')}
    </span>
  );
};

// Date Mismatch Alert Component
interface DateMismatchAlertProps {
  certificateStart: string;
  certificateEnd: string;
  leaveStart: string;
  leaveEnd: string;
}

export const DateMismatchAlert: React.FC<DateMismatchAlertProps> = ({
  certificateStart,
  certificateEnd,
  leaveStart,
  leaveEnd
}) => {
  const { t } = useLocale();

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800 mb-1">
            {t('dateMismatchAlert.title')}
          </p>
          <p className="text-yellow-700">
            {t('dateMismatchAlert.description', {
              certificateStart,
              certificateEnd,
              leaveStart,
              leaveEnd
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
```
</details>

---

## `components/CertificateUploadModal.tsx`

```
Folder: components
Type: tsx | Lines:      469
Top definitions:
--- Exports ---
export default CertificateUploadModal;

--- Key Functions/Components ---
interface CertificateUploadModalProps {
interface CertificateData {
interface ExtractedData {
const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({
```

<details>
<summary>📄 Preview (first 100 lines of      469)</summary>

```tsx
import React, { useState } from 'react';
import { Upload, FileText, X, AlertTriangle, CheckCircle, Loader2, Calendar, User } from 'lucide-react';

interface CertificateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (certificateData: CertificateData) => void;
  companyId: string;
  existingLeaveRequestId?: string;
  prefilledData?: {
    employee_name: string;
    start_date?: string;
    end_date?: string;
  };
}

interface CertificateData {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  comment?: string;
  certificate_file: string;
  medical_certificate_id: number;
}

interface ExtractedData {
  employee_name?: string;
  sickness_start_date?: string;
  sickness_end_date?: string;
  storage_path?: string;
  public_url?: string;
}

const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  existingLeaveRequestId,
  prefilledData
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiConsentAccepted, setAiConsentAccepted] = useState(false);


  // Manual correction state
  const [manualData, setManualData] = useState({
    employee_name: '',
    sickness_start_date: '',
    sickness_end_date: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (selectedFile: File | null) => {
    setError('');
     setAiConsentAccepted(false);
    if (!selectedFile) return setFile(null);
    
    if (selectedFile.size > MAX_SIZE) {
      setError('File is too large. Maximum allowed size is 1MB.');
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const isFieldUnrecognised = (value?: string) => {
    return value && ['non recognised', 'not recognised'].some(v => value.trim().toLowerCase().includes(v));
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file');
    
    setLoading(true);
    setError('');
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('company_id', companyId);
      formData.append(
  'employee_ai_consent_date',
  aiConsentAccepted ? new Date().toISOString() : ''
);

      const res = await fetch('/api/medical-certificates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
... (truncated,      469 total lines)
```
</details>

---

## `components/ContactForm.tsx`

```
Folder: components
Type: tsx | Lines:      264
Top definitions:
--- Exports ---
export default ContactForm;

--- Key Functions/Components ---
interface ContactFormProps {
interface FormData {
interface FormErrors {
const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose, trigger = 'other', slug }) => {
```

<details>
<summary>📄 Full content (     264 lines)</summary>

```tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X, Send, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'demo' | 'logo' | 'other';
  slug: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  comment: string;
  gdprConsent: boolean;
  marketingConsent: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  comment?: string;
  gdprConsent?: string;
  marketingConsent?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose, trigger = 'other', slug }) => {
  const { t } = useLocale();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    companyName: '',
    comment: '',
    gdprConsent: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    onClose();
    router.push(`/jobs/${slug}/Home`);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('contactForm.validation.firstName');
    if (!formData.lastName.trim()) newErrors.lastName = t('contactForm.validation.lastName');
    if (!formData.email.trim()) newErrors.email = t('contactForm.validation.emailRequired');
    if (!formData.companyName.trim()) newErrors.companyName = t('contactForm.validation.companyName');
    if (!formData.gdprConsent) newErrors.gdprConsent = t('contactForm.validation.gdprConsent');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = t('contactForm.validation.emailInvalid');
    }

    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{8,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('contactForm.validation.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          trigger,
          submittedAt: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSubmitStatus('success');

      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        companyName: '',
        comment: '',
        gdprConsent: false,
        marketingConsent: false,
      });

      onClose();
      router.push(`/jobs/${slug}/Home`);
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('contactForm.header.title')}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {trigger === 'demo'
                ? t('contactForm.header.subtitleDemo')
                : t('contactForm.header.subtitleOther')}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={isSubmitting}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success / Error Messages */}
        {submitStatus === 'success' && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-green-800 font-medium">{t('contactForm.success.title')}</h3>
              <p className="text-green-700 text-sm">{t('contactForm.success.description')}</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">{t('contactForm.error.title')}</h3>
              <p className="text-red-700 text-sm">{t('contactForm.error.description')}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('contactForm.labels.firstName')}</label>
              <input type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`${inputClasses} ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`} disabled={isSubmitting} />
              {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('contactForm.labels.lastName')}</label>
              <input type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`${inputClasses} ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`} disabled={isSubmitting} />
              {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('contactForm.labels.email')}</label>
            <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
              className={`${inputClasses} ${errors.email ? 'border-red-300' : 'border-gray-300'}`} disabled={isSubmitting} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('contactForm.labels.phone')}</label>
            <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`${inputClasses} ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
              placeholder={t('contactForm.placeholders.phone')} disabled={isSubmitting} />
            {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('contactForm.labels.companyName')}</label>
            <input type="text" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={`${inputClasses} ${errors.companyName ? 'border-red-300' : 'border-gray-300'}`} disabled={isSubmitting} />
            {errors.companyName && <p className="text-red-600 text-xs mt-1">{errors.companyName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('contactForm.labels.comment')}</label>
            <textarea value={formData.comment} onChange={(e) => handleInputChange('comment', e.target.value)}
              rows={4} className={inputClasses} disabled={isSubmitting} />
          </div>

          {/* GDPR Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{t('contactForm.labels.gdprTitle')}</span>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.gdprConsent} onChange={(e) => handleInputChange('gdprConsent', e.target.checked)}
                className={`mt-0.5 w-4 h-4 text-blue-600 border-2 rounded focus:ring-blue-500 ${errors.gdprConsent ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isSubmitting} />
              <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{t('contactForm.labels.gdprText')}</div>
            </label>
            {errors.gdprConsent && <p className="text-red-600 text-xs">{errors.gdprConsent}</p>}

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.marketingConsent} onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting} />
              <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                <strong>{t('contactForm.labels.marketingTitle')}</strong><br />{t('contactForm.labels.marketingText')}
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" disabled={isSubmitting || submitStatus === 'success'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> :
               submitStatus === 'success' ? <CheckCircle className="w-4 h-4" /> :
               <Send className="w-4 h-4" />}
              {isSubmitting ? t('contactForm.buttons.sending') :
               submitStatus === 'success' ? t('contactForm.buttons.sent') :
               t('contactForm.buttons.send')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
```
</details>

---

## `components/CookieConsent.tsx`

```
Folder: components
Type: tsx | Lines:       58
Top definitions:
--- Exports ---
export default CookieConsent;

--- Key Functions/Components ---
const CookieConsent: React.FC = () => {
```

<details>
<summary>📄 Full content (      58 lines)</summary>

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { X, Check } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner only if no previous choice
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3 animate-fade-in">
      <div className="text-sm text-gray-700 leading-snug">
        <strong className="block mb-1">{t('cookies.title')}</strong>
        <p className="text-xs text-gray-600">{t('cookies.text')}</p>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center">
        <button
          onClick={declineCookies}
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          {t('cookies.reject')}
        </button>
        <button
          onClick={acceptCookies}
          className="px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          {t('cookies.accept')}
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
```
</details>

---

## `components/DemoWarningBanner.tsx`

```
Folder: components
Type: tsx | Lines:       32
Top definitions:
--- Exports ---
export default function DemoWarningBanner() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      32 lines)</summary>

```tsx
'use client';

import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { AlertTriangle, X } from 'lucide-react';

export default function DemoWarningBanner() {
  const [visible, setVisible] = useState(true);
  const { t } = useLocale();

  if (!visible) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>{t('demoBanner.title')}</strong>{' '}
            {t('demoBanner.text')}
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-yellow-600 hover:text-yellow-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```
</details>

---

## `components/Footer.tsx`

```
Folder: components
Type: tsx | Lines:       54
Top definitions:
--- Exports ---
export default Footer;

--- Key Functions/Components ---
const Footer: React.FC = () => {
```

<details>
<summary>📄 Full content (      54 lines)</summary>

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'i18n/LocaleProvider';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
  const { t } = useLocale();
  const pathname = usePathname();

  // Extract the job slug if the current path matches /jobs/[slug]/*
  const match = pathname.match(/^\/jobs\/([^/]+)/);
  const jobSlug = match ? match[1] : null;

  // Helper to generate the proper path
  const makePath = (subpath: string) =>
    jobSlug ? `/jobs/${jobSlug}/${subpath}` : `/${subpath}`;

  return (
    <footer className="text-center text-sm text-gray-500 mt-8 py-6 border-t border-gray-200">
      <p>© 2025 HRinno Demo – {t('footer.operatedBy')}</p>

      <div className="flex justify-center gap-4 mt-2 flex-wrap">
        <Link href={makePath('privacy-demo')} className="underline hover:text-blue-600">
          {t('footer.privacyLink')}
        </Link>
        <Link href={makePath('terms-demo')} className="underline hover:text-blue-600">
          {t('footer.termsLink')}
        </Link>
        <Link href={makePath('cookies')} className="underline hover:text-blue-600">
          {t('footer.cookiesLink')}
        </Link>
        <Link href={makePath('impressum-demo')} className="underline hover:text-blue-600">
          {t('footer.impressumLink')}
        </Link>
      </div>

      <p className="mt-2">
        {t('footer.contact')}{' '}
        <a
          href="mailto:privacy@innohr.hu"
          className="underline hover:text-blue-600"
        >
          privacy@innohr.hu
        </a>
      </p>

      <p className="mt-2 text-xs">{t('footer.aiDisclaimer')}</p>
    </footer>
  );
};

export default Footer;
```
</details>

---

## `components/HappinessCheck.tsx`

```
Folder: components
Type: tsx | Lines:      617
Top definitions:
--- Exports ---
export default HappinessCheck;

--- Key Functions/Components ---
const supabase = createClient(
interface Message {
interface PermaScores {
interface CreateSessionRequest {
const HappinessCheckInner: React.FC = () => {
const HappinessCheck: React.FC = () => {
```

<details>
<summary>📄 Preview (first 100 lines of      617)</summary>

```tsx
'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Send, MessageCircle, Heart, BarChart3, CheckCircle, ArrowLeft } from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  typing?: boolean;
}

interface PermaScores {
  positive?: number;
  engagement?: number;
  relationships?: number;
  meaning?: number;
  accomplishment?: number;
  work_life_balance?: number;
}

interface CreateSessionRequest {
  company_id?: number;
}

const HappinessCheckInner: React.FC = () => {
  const { t, locale } = useLocale();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [permaScores, setPermaScores] = useState<PermaScores>({});
  const [sessionStarted, setSessionStarted] = useState(false);
  const [personalizedAdvice, setPersonalizedAdvice] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Refs for scroll + focus control
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract company info from URL or search params
  useEffect(() => {
    const extractCompanyInfo = async () => {
      try {
        const slugMatch = pathname?.match(/^\/jobs\/([^/]+)/);
        const companySlug = slugMatch ? slugMatch[1] : null;
        const companyIdFromParams = searchParams?.get('company_id');

        if (companyIdFromParams) {
          setCompanyId(companyIdFromParams);
          await fetchCompanyName(companyIdFromParams);
        } else if (companySlug && companySlug !== 'demo') {
          await fetchCompanyFromSlug(companySlug);
        }
      } catch (err) {
        console.error('Error extracting company info:', err);
      }
    };

    extractCompanyInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  const fetchCompanyFromSlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('company')
        .select('id, company_name')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Supabase error fetching company by slug:', error);
        return;
      }

      if (data) {
        setCompanyId(data.id.toString());
        setCompanyName(data.company_name || '');
      }
    } catch (error) {
      console.error('Error fetching company from slug:', error);
    }
... (truncated,      617 total lines)
```
</details>

---

## `components/Header.tsx`

```
Folder: components
Type: tsx | Lines:      801
Top definitions:
--- Exports ---
export default function Header() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Preview (first 100 lines of      801)</summary>

```tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import {
  Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown,
  User, LogOut, Clock, CreditCard, UserCog, TicketPlus, CalendarClock, Target, Users,Users2,BanknoteArrowDown
} from 'lucide-react';
import { useHeaderLogic } from '../hooks/useHeaderLogic';
import {
  LoginModal, HappyCheckMenuItem, DemoAwareMenuItem, DemoTimer, ForfaitBadge
} from './header/';
import NotificationComponent from './NotificationComponent';
import TimeClockModal from '../components/timeclock/TimeClockModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useLocale } from 'i18n/LocaleProvider';

export default function Header() {
  const { t } = useLocale();

  const {
    // State
    isLoginOpen, setIsLoginOpen,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isHRToolsMenuOpen, setIsHRToolsMenuOpen,
    isAccountMenuOpen, setIsAccountMenuOpen,
    isUserMenuOpen, setIsUserMenuOpen,
    login, setLogin,
    password, setPassword,
    user,
    error,
    companyLogo,
    companyId,
    companyForfait,
    canAccessHappyCheck,
    demoTimeLeft,
    isDemoMode,
    isDemoExpired,

    // Refs
    hrToolsMenuRef,
    accountMenuRef,
    userMenuRef,

    // Computed values
    companySlug,
    buildLink,

    // Functions
    handleLogin,
    handleLogout,
    formatTime,
  } = useHeaderLogic();

  const [isTimeClockOpen, setIsTimeClockOpen] = React.useState(false);
  const [isMobileHRToolsOpen, setIsMobileHRToolsOpen] = React.useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = React.useState(false);

  // Helper functions to determine user roles
  const isRegularUser = useMemo(() =>
    user && !user.is_manager && !user.is_admin,
    [user]
  );

  const isManager = useMemo(() =>
    user && user.is_manager && !user.is_admin,
    [user]
  );

  const isAdmin = useMemo(() =>
    user && user.is_admin,
    [user]
  );

  const isSuperAdmin = useMemo(() => 
  user && user.is_super_admin === true, 
  [user]
);

  // Memoized values
  const buttonBaseClasses = useMemo(() =>
    'flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md whitespace-nowrap',
    []
  );

  const happyCheckLink = useMemo(() => buildLink('/happiness-check'), [buildLink]);
  const uploadCertificateLink = useMemo(() => buildLink('/medical-certificate/upload'), [buildLink]);
  const manageSubscriptionLink = useMemo(() => buildLink('/subscription'), [buildLink]);
  const manageUsersLink = useMemo(() => buildLink('/users-creation'), [buildLink]);
  const manageticketsLink = useMemo(() => buildLink('/tickets'), [buildLink]);
  const manageabsencesLink = useMemo(() => buildLink('/absences'), [buildLink]);
  const timeclockmanager = useMemo(() => buildLink('/time-clock/manager'), [buildLink]);
  const myperformance = useMemo(() => buildLink('/performance'), [buildLink]);
  const teamperformance = useMemo(() => buildLink('/performance/team'), [buildLink]);
  const manageContactsLink = useMemo(() => buildLink('/contact-submissions'), [buildLink]);
  const manageUsersUpload = useMemo(() => buildLink('/admin/import-users'), [buildLink]);
  const payRoll = useMemo(() => buildLink('/payroll'), [buildLink]);
... (truncated,      801 total lines)
```
</details>

---

## `components/InterviewAssistantModal.tsx`

```
Folder: components
Type: tsx | Lines:      163
Top definitions:
--- Exports ---
export default function InterviewAssistantModal({

--- Key Functions/Components ---
type InterviewQuestion = {
type InterviewSummary = {
```

<details>
<summary>📄 Full content (     163 lines)</summary>

```tsx
'use client'

import { useState } from 'react'
import { useLocale } from 'i18n/LocaleProvider'

type InterviewQuestion = {
  category: string
  text: string
}

type InterviewSummary = {
  summary: string
  strengths?: string[]
  weaknesses?: string[]
  cultural_fit?: string
  recommendation: string
  score: number 
  next_step_recommendation: string
}

export default function InterviewAssistantModal({
  candidatId,
  positionId,
  onClose
}: {
  candidatId: number
  positionId: number | null
  onClose: () => void
}) {
  const { t } = useLocale()
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null)
  const [interviewNotes, setInterviewNotes] = useState('')
  const [interviewSummary, setInterviewSummary] = useState<InterviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'questions' | 'summary'>('questions')

  async function handleGenerateQuestions() {
    setIsLoading(true)
    setStep('questions')
    try {
      const res = await fetch('/api/interview-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'questions',
          candidat_id: candidatId,
          position_id: positionId,
        }),
      })
      const data: { questions: InterviewQuestion[] } = await res.json()
      setInterviewQuestions(data.questions)
    } catch (err) {
      console.error('Failed to generate questions', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateSummary() {
    setIsLoading(true)
    setStep('summary')
    try {
      const res = await fetch('/api/interview-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'summary',
          candidat_id: candidatId,
          position_id: positionId,
          notes: interviewNotes,
          status: 'Done',
        }),
      })
      const data: InterviewSummary = await res.json()
      setInterviewSummary(data)
    } catch (err) {
      console.error('Failed to generate summary', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('interviewAssistant.title')}</h2>

        {/* Step 1: Questions */}
        {!interviewQuestions && step === 'questions' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('interviewAssistant.step1.description')}
            </p>
            <button
              onClick={handleGenerateQuestions}
              disabled={isLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all"
            >
              {isLoading ? t('interviewAssistant.step1.generating') : t('interviewAssistant.step1.generateButton')}
            </button>
          </div>
        )}

        {/* Show questions */}
        {interviewQuestions && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-800">{t('interviewAssistant.questions.title')}</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              {interviewQuestions.map((q: InterviewQuestion, i: number) => (
                <li key={i}>
                  <span className="font-semibold capitalize">{q.category}:</span> {q.text}
                </li>
              ))}
            </ul>

            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder={t('interviewAssistant.questions.notesPlaceholder')}
              className="w-full border rounded-lg p-3 text-sm mt-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
            />

            <button
              onClick={handleGenerateSummary}
              disabled={isLoading || !interviewNotes}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
            >
              {isLoading ? t('interviewAssistant.questions.analyzing') : t('interviewAssistant.questions.generateSummaryButton')}
            </button>
          </div>
        )}

        {/* Show summary */}
        {interviewSummary && (
          <div className="mt-6 space-y-2 text-gray-800 text-sm">
            <h3 className="text-lg font-semibold text-green-800">{t('interviewAssistant.summary.title')}</h3>
            <p><strong>{t('interviewAssistant.summary.summaryLabel')}:</strong> {interviewSummary.summary}</p>
            <p><strong>{t('interviewAssistant.summary.strengthsLabel')}:</strong> {interviewSummary.strengths?.join(', ')}</p>
            <p><strong>{t('interviewAssistant.summary.weaknessesLabel')}:</strong> {interviewSummary.weaknesses?.join(', ')}</p>
            {interviewSummary.cultural_fit && (
              <p><strong>{t('interviewAssistant.summary.culturalFitLabel')}:</strong> {interviewSummary.cultural_fit}</p>
            )}
            <p><strong>{t('interviewAssistant.summary.recommendationLabel')}:</strong> {interviewSummary.recommendation}</p>
            {/* ✅ Fixed: Use the correct field name with spaces */}
            <p><strong>{t('interviewAssistant.summary.scoreLabel')}:</strong> {interviewSummary.score}/10</p>
            {interviewSummary.next_step_recommendation && (
              <p><strong>{t('interviewAssistant.summary.nextStepsLabel')}:</strong> {interviewSummary.next_step_recommendation}</p>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
          >
            {t('interviewAssistant.buttons.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
```
</details>

---

## `components/InterviewList.tsx`

```
Folder: components
Type: tsx | Lines:      644
Top definitions:
--- Exports ---
export default function InterviewList({

--- Key Functions/Components ---
interface InterviewSummary {
interface Interview {
interface Question {
function CancelInterviewModal({ 
function InterviewSummaryModal({ 
function InterviewAssistantModal({
```

<details>
<summary>📄 Preview (first 100 lines of      644)</summary>

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { useLocale } from 'i18n/LocaleProvider'
import { Calendar, MapPin, PlusCircle, Trash, Eye, MessageSquare } from 'lucide-react'

// Define types
interface InterviewSummary {
  summary: string
  strengths: string[]
  weaknesses: string[]
  cultural_fit: string
  recommendation: string
  score: number
}

interface Interview {
  id: number
  candidat_id: number
  position_id: number | null
  recruiter_id: string
  interview_datetime: string
  location?: string
  status: 'pending' | 'done' | 'cancelled'
  notes?: string
  summary?: InterviewSummary
  recruitment_step_id?: number | null
  recruitment_steps?: {
    step_name: string
  }
}

interface Question {
  category: string
  text: string
}

export default function InterviewList({
  candidatId,
  positionId,
  stepId,
}: {
  candidatId: number
  positionId: number | null
  stepId: string | null
}) {
  const { t, locale } = useLocale()  // ⭐ Added: Get locale from context
  const session = useSession()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [location, setLocation] = useState('')
  const [showAssistantModal, setShowAssistantModal] = useState(false)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)

  const loadInterviews = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/interviews?candidat_id=${candidatId}`)
    const data = await res.json()

    // Sort interviews chronologically
    data.sort(
      (a: Interview, b: Interview) =>
        new Date(a.interview_datetime).getTime() -
        new Date(b.interview_datetime).getTime()
    )

    setInterviews(data)
    setLoading(false)
  }, [candidatId])

  useEffect(() => {
    loadInterviews()
  }, [loadInterviews])

  const createInterview = async () => {
    if (!session?.user?.id) {
      alert(t('interviewList.loginRequired'))
      return
    }

    const recruiterId = session.user.id
    const datetime = new Date(`${newDate}T${newTime}`).toISOString()

    const body = {
      candidat_id: candidatId,
      position_id: positionId,
      recruiter_id: recruiterId,
      interview_datetime: datetime,
      location,
      locale,  // ⭐ Added: Pass current locale to API
    }

    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
... (truncated,      644 total lines)
```
</details>

---

## `components/LanguageSwitcher.tsx`

```
Folder: components
Type: tsx | Lines:       88
Top definitions:
--- Exports ---
export default LanguageSwitcher;

--- Key Functions/Components ---
type Props = {
const FLAGS: Record<string, string> = {
const LanguageSwitcher: React.FC<Props> = ({ compact = false }) => {
```

<details>
<summary>📄 Full content (      88 lines)</summary>

```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLocale } from '../src/i18n/LocaleProvider';
import { locales } from '../src/i18n/config';

type Props = {
  compact?: boolean; // mobile version
};

const FLAGS: Record<string, string> = {
  en: '🇬🇧',
  hu: '🇭🇺',
  fr: '🇫🇷',
};

const LanguageSwitcher: React.FC<Props> = ({ compact = false }) => {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mobile/compact version: cycle languages
  if (compact) {
    return (
      <button
        onClick={() => {
          const index = locales.indexOf(locale);
          const next = locales[(index + 1) % locales.length];
          setLocale(next);
        }}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Change language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  // Desktop/full version: dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
      >
        <span className="text-lg">{FLAGS[locale]}</span>
        <span>{locale.toUpperCase()}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
          {locales.map((code) => (
            <button
              key={code}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                locale === code
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <span className="text-lg">{FLAGS[code]}</span>
              <span>{code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
```
</details>

---

## `components/MassAnalysisConfirmationModal.tsx`

```
Folder: components
Type: tsx | Lines:      131
Top definitions:
--- Exports ---
export default function ConfirmAnalysisModal({

--- Key Functions/Components ---
interface ConfirmAnalysisModalProps {
```

<details>
<summary>📄 Full content (     131 lines)</summary>

```tsx
import { X, AlertCircle, Clock, Users } from 'lucide-react'
import { useLocale } from 'i18n/LocaleProvider'

interface ConfirmAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCreateWithoutAnalysis: () => void
  candidateCount: number
  loading?: boolean
}

export default function ConfirmAnalysisModal({
  isOpen,
  onClose,
  onConfirm,
  onCreateWithoutAnalysis,
  candidateCount,
  loading = false
}: ConfirmAnalysisModalProps) {
  const { t } = useLocale()

  if (!isOpen) return null

  const estimatedMinutes = Math.ceil((candidateCount * 5) / 60)
  
  const getEstimatedTime = () => {
    if (estimatedMinutes < 1) {
      return t('confirmAnalysisModal.content.timeFormat.seconds', { count: candidateCount * 5 })
    }
    return estimatedMinutes === 1
      ? t('confirmAnalysisModal.content.timeFormat.minute', { count: estimatedMinutes })
      : t('confirmAnalysisModal.content.timeFormat.minutes', { count: estimatedMinutes })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
          <AlertCircle className="w-12 h-12 text-white mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white text-center">
            {t('confirmAnalysisModal.header.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-center">
            {t('confirmAnalysisModal.content.description')}
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">
                {t('confirmAnalysisModal.content.stats.candidates')}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-100">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">
                {t('confirmAnalysisModal.content.stats.aiCredits')}
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 justify-center text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('confirmAnalysisModal.content.estimatedTime', { time: getEstimatedTime() })}
              </span>
            </div>
          </div>

          {/* Warning Text */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {t('confirmAnalysisModal.content.warning', { count: candidateCount })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                {t('confirmAnalysisModal.actions.processing')}
              </>
            ) : (
              t('confirmAnalysisModal.actions.confirm')
            )}
          </button>
          
          <button
            onClick={onCreateWithoutAnalysis}
            disabled={loading}
            className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('confirmAnalysisModal.actions.createWithout')}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full text-gray-500 py-2 px-6 rounded-lg font-medium hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('confirmAnalysisModal.actions.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
```
</details>

---

## `components/NotificationComponent.tsx`

```
Folder: components
Type: tsx | Lines:      601
Top definitions:
--- Exports ---
export default function NotificationComponent({

--- Key Functions/Components ---
const supabase = createClient(
interface NotificationData {
interface NotificationComponentProps {
interface TicketPayload {
interface TicketMessagePayload {
interface PostgresChangePayload<T = Record<string, unknown>> {
```

<details>
<summary>📄 Preview (first 100 lines of      601)</summary>

```tsx
// components/NotificationComponent.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Bell,
  X,
  MessageSquare,
  Ticket,
  Check,
  Calendar,
  CheckCircle,
  XCircle,
  Target,
  AlertTriangle,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'i18n/LocaleProvider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NotificationData {
  id: string;
  type:
    | 'ticket_created'
    | 'ticket_status_changed'
    | 'ticket_message'
    | 'leave_request_created'
    | 'leave_request_approved'
    | 'leave_request_rejected'
    | 'leave_request_cancelled'
    | 'goal_created'
    | 'goal_approved'
    | 'goal_red_flag'
    | 'pulse_reminder'
    | 'one_on_one_scheduled'
    | 'cv_uploaded';
  title: string;
  message: string;
  ticket_id?: string;
  leave_request_id?: string;
  goal_id?: string;
  one_on_one_id?: string;
  position_id?: string;
  created_at: string;
  read: boolean;
  sender_id?: string | null;
  recipient_id?: string | null;
}

interface NotificationComponentProps {
  currentUser: { id: string; is_super_admin?: boolean } | null;
  companySlug: string | null;
}

interface TicketPayload {
  id: string;
  title?: string;
  user_id?: string;
  user_name?: string;
  created_at: string;
  status?: string;
  assigned_to?: string;
}

interface TicketMessagePayload {
  id: string;
  ticket_id: string;
  sender_id?: string;
  sender_name?: string;
  created_at: string;
}

interface PostgresChangePayload<T = Record<string, unknown>> {
  new: T;
  old?: Partial<T>;
  eventType?: 'INSERT' | 'UPDATE' | 'DELETE';
}

export default function NotificationComponent({
  currentUser,
  companySlug,
}: NotificationComponentProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [toasts, setToasts] = useState<NotificationData[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isHrinnoAdmin, setIsHrinnoAdmin] = useState(false);
  const [adminStatusChecked, setAdminStatusChecked] = useState(false);
  const subscriptionsRef = useRef<ReturnType<(typeof supabase)['channel']>[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;
... (truncated,      601 total lines)
```
</details>

---

## `components/absence/ApprovalModal.tsx`

```
Folder: components/absence
Type: tsx | Lines:      143
Top definitions:
--- Exports ---
export default ApprovalModal;

--- Key Functions/Components ---
type ApprovalModalProps = {
const ApprovalModal: React.FC<ApprovalModalProps> = ({
```

<details>
<summary>📄 Full content (     143 lines)</summary>

```tsx
// File: components/absence/ApprovalModal.tsx
import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { X } from 'lucide-react';
import { PendingApproval } from '../../types/absence';

type ApprovalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  type: 'approve' | 'reject' | null;
  approval: PendingApproval | null;
};

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  approval
}) => {
  const { t } = useLocale();
  const [notes, setNotes] = useState('');
  const isReject = type === 'reject';

  if (!isOpen || !approval) return null;

  const handleSubmit = () => {
    if (isReject && !notes.trim()) {
      return;
    }
    onConfirm(notes || undefined);
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .modal-overlay {
          animation: fadeIn 0.2s ease-out;
        }
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
      
      <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="modal-content bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isReject ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <h3 className={`text-xl font-bold ${
              isReject ? 'text-red-900' : 'text-green-900'
            }`}>
              {isReject ? t('approvalModal.titles.reject') : t('approvalModal.titles.approve')}
            </h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('approvalModal.fields.employee')}</p>
              <p className="font-semibold text-gray-900">{approval.employee_name}</p>
              <p className="text-sm text-gray-600 mt-2">{t('approvalModal.fields.leaveType')}</p>
              <p className="font-medium text-gray-800">{approval.leave_type_name_hu}</p>
              <p className="text-sm text-gray-600 mt-2">{t('approvalModal.fields.duration')}</p>
              <p className="font-medium text-gray-800">{approval.total_days} {t('approvalModal.fields.days')}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isReject ? t('approvalModal.fields.rejectionReasonLabel') : t('approvalModal.fields.notesLabel')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                placeholder={isReject ? t('approvalModal.fields.rejectionReasonPlaceholder') : t('approvalModal.fields.notesPlaceholder')}
              />
              {isReject && !notes.trim() && (
                <p className="text-xs text-red-600 mt-1">{t('approvalModal.fields.rejectionRequired')}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {t('approvalModal.buttons.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isReject && !notes.trim()}
                className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                  isReject && !notes.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isReject
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isReject ? t('approvalModal.buttons.reject') : t('approvalModal.buttons.approve')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovalModal;
```
</details>

---

## `components/absence/Calendar/calendar_day.tsx`

```
Folder: components/absence/Calendar
Type: tsx | Lines:      180
Top definitions:
--- Exports ---
export interface CalendarLeave {
export default CalendarDay;

--- Key Functions/Components ---
interface CalendarDayProps {
interface Leave {
const CalendarDay: React.FC<CalendarDayProps> = ({
```

<details>
<summary>📄 Full content (     180 lines)</summary>

```tsx
import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';

interface CalendarDayProps {
  date: Date;
  leaves: Leave[];
  isWeekend: boolean;
  isHoliday: boolean;
  isInDragRange: boolean;
  isDragging: boolean;
  isToday: boolean;
  onMouseDown: (date: Date) => void;
  onMouseEnter: (date: Date) => void;
}

interface Leave {
  leave_type_color: string;
  status: 'pending' | 'approved'; // expand if you have more statuses
  leave_type_name_hu: string;
  reason?: string;
}

export interface CalendarLeave {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  leave_type_color: string;
  leave_type_name_hu: string;
  status: 'pending' | 'approved';
  reason?: string;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  leaves,
  isWeekend,
  isHoliday,
  isInDragRange,
  isDragging,
  isToday,
  onMouseDown,
  onMouseEnter
}) => {
  const { t } = useLocale();
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if there are overlapping leaves (error state)
  const hasOverlap = leaves.length > 1;

  // Get the primary leave color
  const getBackgroundColor = () => {
    if (hasOverlap) {
      return '#ff0000'; // Bright red for overlap error
    }
    
    if (leaves.length === 1) {
      return leaves[0].leave_type_color;
    }
    
    if (isHoliday) {
      return '#e9d5ff'; // Purple for holidays
    }
    
    if (isWeekend) {
      return '#f3f4f6'; // Gray for weekends
    }
    
    return '#ffffff'; // White for regular days
  };

  // Get border style based on status
  const getBorderStyle = () => {
    if (hasOverlap) {
      return '2px solid #dc2626'; // Red border for overlap
    }
    
    if (leaves.length === 1) {
      const leave = leaves[0];
      if (leave.status === 'pending') {
        return '2px dashed #9ca3af'; // Dashed for pending
      }
      return '2px solid #d1d5db'; // Solid for approved
    }
    
    return '1px solid #e5e7eb'; // Default border
  };

  // Format date for tooltip
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const dayNumber = date.getDate();
  const backgroundColor = getBackgroundColor();
  const borderStyle = getBorderStyle();

  // Check if date is in the past
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className="relative aspect-square"
      onMouseDown={() => onMouseDown(date)}
      onMouseEnter={() => onMouseEnter(date)}
      onMouseOver={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`
          w-full h-full rounded flex items-center justify-center text-xs font-medium
          transition-all duration-150 cursor-pointer select-none
          ${isInDragRange ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
          ${isDragging ? 'cursor-grabbing' : 'hover:shadow-md'}
          ${isPast ? 'opacity-60' : ''}
          ${isToday ? 'bg-green-700 text-white font-bold' : ''}
          print:cursor-default
        `}
        style={{
          backgroundColor,
          border: borderStyle
        }}
      >
        <span className={`
          ${isWeekend || isHoliday ? 'text-gray-600' : 'text-gray-900'}
          ${hasOverlap ? 'text-white font-bold' : ''}
        `}>
          {dayNumber}
        </span>

        {/* Holiday indicator */}
        {isHoliday && !hasOverlap && (
          <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-purple-600">
            {t('calendarDay.holidayIndicator')}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (leaves.length > 0 || isHoliday) && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap pointer-events-none print:hidden">
          <div className="space-y-1">
            <p className="font-semibold">{formatDate(date)}</p>
            
            {isHoliday && (
              <p className="text-purple-300">{t('calendarDay.tooltip.publicHoliday')}</p>
            )}
            
            {hasOverlap && (
              <p className="text-red-300 font-bold">{t('calendarDay.tooltip.overlappingLeaves')}</p>
            )}
            
            {leaves.map((leave, index) => (
              <div key={index} className="space-y-0.5">
                <p className="font-medium">{leave.leave_type_name_hu}</p>
                <p className="text-gray-300 text-[10px]">
                  {leave.status === 'pending' 
                    ? t('calendarDay.tooltip.statusPending') 
                    : t('calendarDay.tooltip.statusApproved')}
                </p>
                {leave.reason && (
                  <p className="text-gray-400 text-[10px] italic">{leave.reason}</p>
                )}
              </div>
            ))}
          </div>
          
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDay;
```
</details>

---

## `components/absence/Calendar/calendar_leave_modal.tsx`

```
Folder: components/absence/Calendar
Type: tsx | Lines:      362
Top definitions:
--- Exports ---
export default CalendarLeaveModal;

--- Key Functions/Components ---
interface LeaveType {
interface UserProfile {
interface CurrentUser {
interface CertificateData {
interface CalendarLeaveModalProps {
function formatDateForInput(date: Date): string {
const supabase = createClient(
const CalendarLeaveModal: React.FC<CalendarLeaveModalProps> = ({
```

<details>
<summary>📄 Preview (first 100 lines of      362)</summary>

```tsx
// components/CalendarLeaveModal.tsx
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useLocale } from 'i18n/LocaleProvider';
import { X, Loader2, CheckCircle, Upload } from 'lucide-react';
import CertificateUploadModal from '../../CertificateUploadModal';
import { createLeaveRequestNotification } from '../../../utils/absenceNotifications';

// --- Types ---
interface LeaveType {
  id: string;
  name: string;
  name_hu?: string;
}

interface UserProfile {
  manager_id: string | null;
}

interface CurrentUser {
  id: string;
  email?: string;
  user_firstname?: string;
  user_lastname?: string;
}

interface CertificateData {
  medical_certificate_id: number; // ✅ number, matches Supabase
  sickness_start_date: string;
  sickness_end_date: string;
  comment?: string;
}

interface CalendarLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
  currentUser: CurrentUser;
  prefilledDates: { start: Date; end: Date };
}

// --- Helpers ---
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CalendarLeaveModal: React.FC<CalendarLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  currentUser,
  prefilledDates
}) => {
  const { t } = useLocale();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: formatDateForInput(prefilledDates.start),
    end_date: formatDateForInput(prefilledDates.end),
    reason: ''
  });

  // Update form dates when prefilledDates changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      start_date: formatDateForInput(prefilledDates.start),
      end_date: formatDateForInput(prefilledDates.end)
    }));
  }, [prefilledDates]);

  // Fetch leave types when modal opens
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('leave_types')
          .select('*')
          .order('name');
        if (error) throw error;
        setLeaveTypes(data || []);
      } catch (err) {
        console.error(t('calendarLeaveModal.console.fetchError'), err);
      }
    };
    if (isOpen) fetchLeaveTypes();
... (truncated,      362 total lines)
```
</details>

---

## `components/absence/Calendar/calendar_legend.tsx`

```
Folder: components/absence/Calendar
Type: tsx | Lines:      107
Top definitions:
--- Exports ---
export default CalendarLegend;

--- Key Functions/Components ---
interface LeaveType {
interface CalendarLegendProps {
const CalendarLegend: React.FC<CalendarLegendProps> = ({ viewMode, leaveTypes }) => {
```

<details>
<summary>📄 Full content (     107 lines)</summary>

```tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

interface LeaveType {
  leave_type_id: string;
  leave_type_color: string;
  leave_type_name_hu: string;
}

interface CalendarLegendProps {
  viewMode: 'my' | 'manager';
  leaveTypes: LeaveType[];
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({ viewMode, leaveTypes }) => {
  const { t } = useLocale();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{t('calendarLegend.title')}</h3>
      
      {viewMode === 'my' ? (
        <div className="space-y-3">
          {/* Leave Type Colors */}
          <div>
            <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.myView.leaveTypes')}</p>
            <div className="flex flex-wrap gap-3">
              {leaveTypes.map((type) => (
                <div key={type.leave_type_id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-200"
                    style={{ backgroundColor: type.leave_type_color }}
                  />
                  <span className="text-xs text-gray-700">{type.leave_type_name_hu}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Indicators */}
          <div>
            <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.myView.status')}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-blue-100" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.statusApproved')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-dashed border-gray-400 bg-yellow-50" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.statusPending')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-100" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.statusOverlapError')}</span>
              </div>
            </div>
          </div>

          {/* Special Days */}
          <div>
            <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.myView.specialDays')}</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.weekend')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-purple-600">H</span>
                </div>
                <span className="text-xs text-gray-700">{t('calendarLegend.myView.publicHoliday')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-500 mb-2">{t('calendarLegend.managerView.teamAbsenceLevels')}</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border border-gray-300" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.noAbsences')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.lowAbsence')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-300 border border-orange-400" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.mediumAbsence')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-400 border border-red-500" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.highAbsence')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
              <span className="text-xs text-gray-700">{t('calendarLegend.managerView.weekend')}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">{t('calendarLegend.managerView.hoverHint')}</p>
        </div>
      )}
    </div>
  );
};

export default CalendarLegend;
```
</details>

---

## `components/absence/Calendar/manager_heatmap_cell.tsx`

```
Folder: components/absence/Calendar
Type: tsx | Lines:      139
Top definitions:
--- Exports ---
export interface TeamLeave {
export default ManagerHeatmapCell;

--- Key Functions/Components ---
interface Absence {
interface AbsentEmployee {
interface ManagerHeatmapCellProps {
const ManagerHeatmapCell: React.FC<ManagerHeatmapCellProps> = ({
```

<details>
<summary>📄 Full content (     139 lines)</summary>

```tsx
import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';

interface Absence {
  user_id: string;
  employee_name: string;
  leave_type_name_hu: string;
  status: 'pending' | 'approved';
}

interface AbsentEmployee {
  name: string;
  leaves: TeamLeave[];
}

interface ManagerHeatmapCellProps {
  date: Date;
  teamSize: number;
  absences: TeamLeave[];
  isWeekend: boolean;
  isHoliday?: boolean; // optional if not used
  isToday?: boolean;   // optional if not used
}

// Export this interface so it can be imported by year_calendar_grid
export interface TeamLeave {
  user_id: string;
  employee_name: string;
  start_date: string;
  end_date: string;
  leave_type_name_hu?: string;
  status?: 'pending' | 'approved';
}

const ManagerHeatmapCell: React.FC<ManagerHeatmapCellProps> = ({
  date,
  teamSize,
  absences,
  isWeekend
}) => {
  const { t } = useLocale();
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate absence percentage
  const calculateAbsencePercentage = (): number => {
    if (teamSize === 0) return 0;
    const uniqueEmployees = new Set(absences.map(a => a.user_id));
    return (uniqueEmployees.size / teamSize) * 100;
  };

  // Get background color based on percentage
  const getBackgroundColor = (percentage: number): string => {
    if (isWeekend) return '#f3f4f6';
    if (percentage === 0) return '#ffffff';
    if (percentage <= 20) return '#fed7aa';
    if (percentage <= 40) return '#fb923c';
    return '#f87171';
  };

  const percentage = calculateAbsencePercentage();
  const backgroundColor = getBackgroundColor(percentage);
  const dayNumber = date.getDate();

  const formatDate = (date: Date) =>
    date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  // Group absences by employee
  const getAbsentEmployees = (): AbsentEmployee[] => {
    const employeeMap = new Map<string, AbsentEmployee>();
    
    absences.forEach(absence => {
      if (!employeeMap.has(absence.user_id)) {
        employeeMap.set(absence.user_id, { name: absence.employee_name, leaves: [] });
      }
      employeeMap.get(absence.user_id)!.leaves.push(absence);
    });
    
    return Array.from(employeeMap.values());
  };

  const absentEmployees = getAbsentEmployees();

  return (
    <div
      className="relative aspect-square"
      onMouseOver={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="w-full h-full rounded flex items-center justify-center text-xs font-medium border border-gray-200 transition-all"
        style={{ backgroundColor }}
      >
        <span className={`${isWeekend ? 'text-gray-600' : 'text-gray-900'}`}>
          {dayNumber}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && absences.length > 0 && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-max pointer-events-none print:hidden">
          <div className="space-y-1">
            <p className="font-semibold">{formatDate(date)}</p>
            <p className="text-orange-300">
              {t('managerHeatmapCell.tooltip.absent', {
                count: absentEmployees.length,
                total: teamSize,
                percentage: Math.round(percentage)
              })}
            </p>
            
            <div className="border-t border-gray-700 mt-2 pt-2 space-y-1.5">
              {absentEmployees.map((employee, index) => (
                <div key={index}>
                  <p className="font-medium">{employee.name}</p>
                  {employee.leaves.map((leave, leaveIndex) => (
                    <p key={leaveIndex} className="text-gray-400 text-[10px]">
                      • {leave.leave_type_name_hu} 
                      {leave.status === 'pending' && ` ${t('managerHeatmapCell.tooltip.pending')}`}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerHeatmapCell;
```
</details>

---

## `components/absence/Calendar/year_calendar_grid.tsx`

```
Folder: components/absence/Calendar
Type: tsx | Lines:      287
Top definitions:
--- Exports ---
export default YearCalendarGrid;

--- Key Functions/Components ---
interface LeaveRequest {
interface TeamLeaveRequest {
interface CalendarData {
interface TeamData {
interface YearCalendarGridProps {
const YearCalendarGrid: React.FC<YearCalendarGridProps> = ({
```

<details>
<summary>📄 Full content (     287 lines)</summary>

```tsx
// File: components/absence/Calendar/year_calendar_grid.tsx
import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import CalendarDay, { CalendarLeave } from './calendar_day';
import ManagerHeatmapCell, { TeamLeave } from './manager_heatmap_cell';

interface LeaveRequest {
  id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  leave_type_color?: string;
  leave_type_name_hu?: string;
  status?: 'pending' | 'approved';
  reason?: string;
}

interface TeamLeaveRequest {
  user_id: string;
  employee_name: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  leave_type_name_hu?: string;
  status?: 'pending' | 'approved';
}

interface CalendarData {
  leave_requests: LeaveRequest[];
}

interface TeamData {
  team_size: number;
  team_leaves: TeamLeaveRequest[];
}

interface YearCalendarGridProps {
  year: number;
  viewMode: 'my' | 'manager';
  calendarData?: CalendarData;
  teamData?: TeamData;
  onDateSelection: (start: Date, end: Date) => void;
}

const YearCalendarGrid: React.FC<YearCalendarGridProps> = ({
  year,
  viewMode,
  calendarData,
  teamData,
  onDateSelection
}) => {
  const { t } = useLocale();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);

  const months = [
    t('yearCalendarGrid.months.january'),
    t('yearCalendarGrid.months.february'),
    t('yearCalendarGrid.months.march'),
    t('yearCalendarGrid.months.april'),
    t('yearCalendarGrid.months.may'),
    t('yearCalendarGrid.months.june'),
    t('yearCalendarGrid.months.july'),
    t('yearCalendarGrid.months.august'),
    t('yearCalendarGrid.months.september'),
    t('yearCalendarGrid.months.october'),
    t('yearCalendarGrid.months.november'),
    t('yearCalendarGrid.months.december')
  ];

  const weekDays = [
    t('yearCalendarGrid.weekDays.monday'),
    t('yearCalendarGrid.weekDays.tuesday'),
    t('yearCalendarGrid.weekDays.wednesday'),
    t('yearCalendarGrid.weekDays.thursday'),
    t('yearCalendarGrid.weekDays.friday'),
    t('yearCalendarGrid.weekDays.saturday'),
    t('yearCalendarGrid.weekDays.sunday')
  ];

  const today = new Date();

  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Hungarian public holidays
  const getHungarianHolidays = (year: number): Date[] => {
    const holidays: Date[] = [
      new Date(year, 0, 1),
      new Date(year, 2, 15),
      new Date(year, 4, 1),
      new Date(year, 7, 20),
      new Date(year, 9, 23),
      new Date(year, 10, 1),
      new Date(year, 11, 25),
      new Date(year, 11, 26),
    ];

    const easter = calculateEaster(year);
    holidays.push(
      new Date(easter.getTime() + 86400000), // Easter Monday
      new Date(easter.getTime() + 49 * 86400000) // Whit Monday
    );

    return holidays;
  };

  const calculateEaster = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  };

  const holidays = getHungarianHolidays(year);
  const isHoliday = (date: Date): boolean => holidays.some(h => h.getDate() === date.getDate() && h.getMonth() === date.getMonth());

  const getDaysInMonth = (month: number): (Date | null)[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleMouseDown = (date: Date | null) => {
    if (!date || viewMode === 'manager') return;
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  const handleMouseEnter = (date: Date | null) => {
    if (!isDragging || !date || !dragStart) return;
    setDragEnd(date);
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;

    setIsDragging(false);

    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;

    onDateSelection(start, end);

    setDragStart(null);
    setDragEnd(null);
  };

  const isInDragRange = (date: Date | null): boolean => {
    if (!date || !dragStart || !dragEnd) return false;
    const start = dragStart < dragEnd ? dragStart : dragEnd;
    const end = dragStart < dragEnd ? dragEnd : dragStart;
    return date >= start && date <= end;
  };

  const getLeaveForDate = (date: Date): CalendarLeave[] => {
    if (!calendarData?.leave_requests) return [];

    return calendarData.leave_requests
      .filter(req => {
        const start = parseLocalDate(req.start_date);
        const end = parseLocalDate(req.end_date);
        return date >= start && date <= end;
      })
      .map(req => ({
        id: req.id,
        start_date: req.start_date,
        end_date: req.end_date,
        leave_type_color: req.leave_type_color || '#ffffff',
        leave_type_name_hu: req.leave_type_name_hu || t('yearCalendarGrid.defaults.unknownLeaveType'),
        status: req.status || 'approved',
        reason: req.reason,
      }));
  };

  const getTeamAbsenceForDate = (date: Date): TeamLeave[] => {
    if (!teamData?.team_leaves) return [];
    return teamData.team_leaves
      .filter(leave => {
        const start = parseLocalDate(leave.start_date);
        const end = parseLocalDate(leave.end_date);
        return date >= start && date <= end;
      })
      .map(leave => ({
        user_id: leave.user_id,
        employee_name: leave.employee_name,
        start_date: leave.start_date,
        end_date: leave.end_date,
        leave_type_name_hu: leave.leave_type_name_hu || t('yearCalendarGrid.defaults.unknownLeaveType'),
        status: leave.status || 'approved'
      }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4"
         onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      {months.map((monthName, monthIndex) => {
        const days = getDaysInMonth(monthIndex);

        return (
          <div key={monthName} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 print:break-inside-avoid">
            <h3 className="font-bold text-gray-900 mb-3 text-center">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, index) => (
                <div key={`${day}-${index}`} className="text-xs font-medium text-gray-500 text-center">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date, dayIndex) => {
                if (!date) return <div key={`empty-${dayIndex}`} className="aspect-square" />;

                const leaves = viewMode === 'my' ? getLeaveForDate(date) : [];
                const teamAbsences = viewMode === 'manager' ? getTeamAbsenceForDate(date) : [];
                const inRange = isInDragRange(date);
                const todayFlag = isSameDay(date, today);

                if (viewMode === 'manager') {
                  return (
                    <ManagerHeatmapCell
                      key={date.toISOString()}
                      date={date}
                      teamSize={teamData?.team_size || 0}
                      absences={teamAbsences}
                      isWeekend={isWeekend(date)}
                      isHoliday={isHoliday(date)}
                      isToday={todayFlag}
                    />
                  );
                }

                return (
                  <CalendarDay
                    key={date.toISOString()}
                    date={date}
                    leaves={leaves}
                    isWeekend={isWeekend(date)}
                    isHoliday={isHoliday(date)}
                    isInDragRange={inRange}
                    isDragging={isDragging}
                    onMouseDown={handleMouseDown}
                    onMouseEnter={handleMouseEnter}
                    isToday={todayFlag}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default YearCalendarGrid;
```
</details>

---

## `components/absence/LeaveBalances.tsx`

```
Folder: components/absence
Type: tsx | Lines:       61
Top definitions:
--- Exports ---
export default LeaveBalances;

--- Key Functions/Components ---
const LeaveBalances: React.FC<{ balances: LeaveBalance[] }> = ({ balances }) => {
```

<details>
<summary>📄 Full content (      61 lines)</summary>

```tsx
// File: components/absence/LeaveBalances.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { CalendarDays } from 'lucide-react';
import { LeaveBalance } from '../../types/absence';

const LeaveBalances: React.FC<{ balances: LeaveBalance[] }> = ({ balances }) => {
  const { t } = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-blue-600" />
        {t('leaveBalances.title', { year: currentYear })}
      </h2>
      {balances.length === 0 ? (
        <p className="text-gray-500 text-center py-8">{t('leaveBalances.noBalances')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((balance) => (
            <div
              key={balance.leave_type_id}
              className="border rounded-xl p-4 hover:shadow-md transition-shadow"
              style={{ borderColor: balance.leave_type_color + '30' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: balance.leave_type_color }}
                />
                <h3 className="font-semibold text-gray-900 text-sm">
                  {balance.leave_type_name_hu}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('leaveBalances.fields.total')}</span>
                  <span className="font-medium">{balance.total_days} {t('leaveBalances.fields.days')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('leaveBalances.fields.used')}</span>
                  <span className="font-medium text-red-600">{balance.used_days} {t('leaveBalances.fields.days')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('leaveBalances.fields.pending')}</span>
                  <span className="font-medium text-orange-600">{balance.pending_days} {t('leaveBalances.fields.days')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">{t('leaveBalances.fields.remaining')}</span>
                  <span className="font-bold text-green-600">{balance.remaining_days} {t('leaveBalances.fields.days')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveBalances;
```
</details>

---

## `components/absence/PendingApprovals.tsx`

```
Folder: components/absence
Type: tsx | Lines:      245
Top definitions:
--- Exports ---
export default PendingApprovals;

--- Key Functions/Components ---
const supabase = createClient(
type Props = {
const PendingApprovals: React.FC<Props> = ({
```

<details>
<summary>📄 Full content (     245 lines)</summary>

```tsx
// File: components/absence/PendingApprovals.tsx
import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { Bell, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { PendingApproval } from '../../types/absence';
import { formatDate as defaultFormatDate } from '../../utils/formatDate';
import { createLeaveReviewNotification, getUserName } from '../../utils/absenceNotifications';
import { createClient } from '@supabase/supabase-js';
import ApprovalModal from './ApprovalModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  approvals: PendingApproval[];
  onRefresh: () => void;
  onReview: (requestId: string, status: 'approved' | 'rejected', notes?: string) => Promise<void> | void;
  formatDate?: (d: string) => string;
  currentUserId: string;
};

const PendingApprovals: React.FC<Props> = ({
  approvals,
  onRefresh,
  onReview,
  formatDate = defaultFormatDate,
  currentUserId
}) => {
  const { t } = useLocale();
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | null;
    approval: PendingApproval | null;
  }>({
    isOpen: false,
    type: null,
    approval: null
  });
  
  // Generate public URL for certificate
  const getCertificateUrl = (certificateFile: string | null | undefined): string | null => {
    if (!certificateFile) return null;
    
    const { data } = supabase.storage
      .from('medical-certificates')
      .getPublicUrl(certificateFile);
    
    return data.publicUrl;
  };

  const handleReviewWithNotification = async (
    approval: PendingApproval,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      console.log('🔍 Full approval object:', approval);
      console.log('🔍 approval.user_id:', approval.user_id);
      console.log('🔍 approval.id:', approval.id);
      console.log('🔍 currentUserId (manager):', currentUserId);

      // First, perform the actual review action
      await onReview(approval.id, status, notes);
      console.log(t('pendingApprovals.console.reviewCompleted'));
      
      // Then send the notification to the employee
      const { name: managerName, error: nameError } = await getUserName(currentUserId);
      console.log(t('pendingApprovals.console.managerNameRetrieved'), managerName, 'Error:', nameError);
      
      const notificationData = {
        leaveRequestId: approval.id,
        userId: approval.user_id,
        managerId: currentUserId,
        managerName,
        leaveTypeName: approval.leave_type_name_hu || approval.leave_type_name,
        status,
        reviewNotes: notes
      };
      console.log(t('pendingApprovals.console.sendingNotification'), notificationData);
      
      const result = await createLeaveReviewNotification(notificationData);
      console.log('📬 Notification result:', result);
      
      if (result.success) {
        console.log(t('pendingApprovals.console.notificationSuccess', { 
          status, 
          userId: approval.user_id 
        }));
      } else {
        console.error(t('pendingApprovals.console.notificationFailed'), result.error);
      }
    } catch (error) {
      console.error(t('pendingApprovals.console.reviewError'), error);
      // The review itself might have succeeded, so we don't re-throw
    }
  };

  const handleApprove = (approval: PendingApproval) => {
    setModalState({
      isOpen: true,
      type: 'approve',
      approval
    });
  };

  const handleReject = (approval: PendingApproval) => {
    setModalState({
      isOpen: true,
      type: 'reject',
      approval
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      approval: null
    });
  };

  const handleModalConfirm = (notes?: string) => {
    if (!modalState.approval) return;
    
    const status = modalState.type === 'reject' ? 'rejected' : 'approved';
    handleReviewWithNotification(modalState.approval, status, notes);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            {t('pendingApprovals.title')}
          </h2>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {approvals.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('pendingApprovals.noApprovals')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => {
              const certificateUrl = getCertificateUrl(approval.certificate_file);
              
              return (
                <div
                  key={approval.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: approval.leave_type_color }}
                        />
                        <h3 className="font-semibold text-gray-900">
                          {approval.employee_name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({approval.leave_type_name_hu})
                        </span>
                        {certificateUrl && (
                          <a
                            href={certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 rounded-lg transition-colors text-xs font-medium"
                            title={t('pendingApprovals.fields.viewCertificate')}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{t('pendingApprovals.fields.certificate')}</span>
                          </a>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">{t('pendingApprovals.fields.period')}</span>{' '}
                          {formatDate(approval.start_date)} - {formatDate(approval.end_date)}
                        </p>
                        <p>
                          <span className="font-medium">{t('pendingApprovals.fields.duration')}</span>{' '}
                          {approval.total_days} {approval.total_days !== 1 
                            ? t('pendingApprovals.fields.days') 
                            : t('pendingApprovals.fields.day')}
                        </p>
                        {approval.reason && (
                          <p>
                            <span className="font-medium">{t('pendingApprovals.fields.reason')}</span> {approval.reason}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {t('pendingApprovals.fields.requested')} {formatDate(approval.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(approval)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('pendingApprovals.buttons.approve')}
                      </button>
                      <button
                        onClick={() => handleReject(approval)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('pendingApprovals.buttons.reject')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal component */}
      <ApprovalModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        type={modalState.type}
        approval={modalState.approval}
      />
    </>
  );
};

export default PendingApprovals;
```
</details>

---

## `components/absence/RecentRequests.tsx`

```
Folder: components/absence
Type: tsx | Lines:      323
Top definitions:
--- Exports ---
export default RecentRequests;

--- Key Functions/Components ---
const supabase = createClient(
type Props = {
const RecentRequests: React.FC<Props> = ({
```

<details>
<summary>📄 Preview (first 100 lines of      323)</summary>

```tsx
// File: components/absence/RecentRequests.tsx
import React, { useState } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { RefreshCw, Calendar, FileText, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { LeaveRequest } from '../../types/absence';
import { CertificateStatusBadge } from './../CertificateStatusBadge';
import { formatDate as defaultFormatDate } from '../../utils/formatDate';
import { createClient } from '@supabase/supabase-js';
import { getUserManager, getUserName } from '../../utils/absenceNotifications';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Props = {
  requests: LeaveRequest[];
  onRefresh: () => void | Promise<void>; // Update to allow both sync and async
  onOpenRequestModal: () => void;
  onUploadCertificateForRequest: (id: string) => void;
  isSickLeaveType: (leaveTypeId: string) => boolean;
  formatDate?: (d: string) => string;
  currentUserId: string; // Add this prop
};

const RecentRequests: React.FC<Props> = ({
  requests,
  onRefresh,
  onOpenRequestModal,
  onUploadCertificateForRequest,
  isSickLeaveType,
  formatDate = defaultFormatDate,
  currentUserId // Add this
}) => {
  const { t } = useLocale();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  // Debug log
  console.log('RecentRequests - currentUserId received:', currentUserId, typeof currentUserId);

  // Check if request can be cancelled
  const canCancelRequest = (request: LeaveRequest): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(request.start_date);
    startDate.setHours(0, 0, 0, 0);

    // Can cancel if: (pending OR approved) AND start date is in the future
    const isNotStarted = startDate > today;
    const isCancellableStatus = request.status === 'pending' || request.status === 'approved';
    
    return isNotStarted && isCancellableStatus;
  };

  // Handle cancel request
  const handleCancelRequest = async (request: LeaveRequest, currentUserId: string) => {
    setCancellingId(request.id);
    
    try {
      // Validate currentUserId
      if (!currentUserId || currentUserId === 'undefined') {
        console.error('Invalid currentUserId:', currentUserId);
        alert('Unable to cancel: User ID not found. Please refresh the page.');
        setCancellingId(null);
        return;
      }

      console.log('Cancelling request for user:', currentUserId);

      // Get manager info for notification
      const { managerId } = await getUserManager(currentUserId);
      
      if (!managerId) {
        console.warn('No manager found for user');
      }

      // Get user name
      const { name: userName } = await getUserName(currentUserId);

      // Calculate total days
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Format dates for notification
      const formattedStartDate = formatDate(request.start_date);
      const formattedEndDate = formatDate(request.end_date);

      console.log('Attempting to delete request with ID:', request.id);

      // First, delete any notifications related to this leave request
      console.log('Deleting related notifications...');
      const { error: notificationDeleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('leave_request_id', request.id);
... (truncated,      323 total lines)
```
</details>

---

## `components/absence/RequestLeaveModal.tsx`

```
Folder: components/absence
Type: tsx | Lines:      664
Top definitions:
--- Exports ---
export default RequestLeaveModal;

--- Key Functions/Components ---
const supabase = createClient(
type RequestForm = {
type Props = {
interface ExtractedData {
const RequestLeaveModal: React.FC<Props> = ({
```

<details>
<summary>📄 Preview (first 100 lines of      664)</summary>

```tsx
// File: components/absence/RequestLeaveModal.tsx
import React, { useState, useEffect } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { XCircle, Loader2, Upload, FileText, CheckCircle, AlertTriangle, Calendar, User } from 'lucide-react';
import { LeaveType } from '../../types/absence';
import { createLeaveRequestNotification, getUserManager, getUserName } from '../../utils/absenceNotifications';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RequestForm = {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  requestForm: RequestForm;
  setRequestForm: React.Dispatch<React.SetStateAction<RequestForm>>;
  leaveTypes: LeaveType[];
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  loading: boolean;
  currentUserId: string;
  companyId: string;
  currentUserName: string;
};

interface ExtractedData {
  employee_name?: string;
  sickness_start_date?: string;
  sickness_end_date?: string;
  storage_path?: string;
  public_url?: string;
}

const RequestLeaveModal: React.FC<Props> = ({
  isOpen,
  onClose,
  requestForm,
  setRequestForm,
  leaveTypes,
  onSubmit,
  loading,
  currentUserId,
  companyId,
  currentUserName
}) => {
  const { t } = useLocale();
  
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [certificateComment, setCertificateComment] = useState('');
  const [certificateId, setCertificateId] = useState<number | null>(null);
  const [aiConsentAccepted, setAiConsentAccepted] = useState(false);

  
  const [manualData, setManualData] = useState({
    employee_name: '',
    sickness_start_date: '',
    sickness_end_date: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024;
  
  const selectedLeaveType = leaveTypes.find(lt => lt.id === requestForm.leave_type_id);
  const isSickLeave = selectedLeaveType?.requires_medical_certificate || false;

  useEffect(() => {
    if (!isOpen || !isSickLeave) {
      setCertificateFile(null);
      setExtractedData(null);
      setCertificateError('');
      setCertificateComment('');
      setCertificateId(null);
      setManualData({ employee_name: '', sickness_start_date: '', sickness_end_date: '' });
    }
  }, [isOpen, isSickLeave]);

  const isFieldUnrecognised = (value?: string) => {
    return value && ['non recognised', 'not recognised'].some(v => value.trim().toLowerCase().includes(v));
  };

  const handleFileChange = (selectedFile: File | null) => {
    setCertificateError('');
    setAiConsentAccepted(false); 
    if (!selectedFile) return setCertificateFile(null);
    
    if (selectedFile.size > MAX_SIZE) {
      setCertificateError(t('requestLeaveModal.errors.fileTooLarge'));
      setCertificateFile(null);
    } else {
      setCertificateFile(selectedFile);
... (truncated,      664 total lines)
```
</details>

---

## `components/absence/RequestLeaveModal2.tsx`

```
Folder: components/absence
Type: tsx | Lines:      580
Top definitions:
--- Exports ---
export default RequestLeaveModalManual;

--- Key Functions/Components ---
const supabase = createClient(
type RequestForm = {
type Props = {
interface CertificateData {
const RequestLeaveModalManual: React.FC<Props> = ({
```

<details>
<summary>📄 Preview (first 100 lines of      580)</summary>

```tsx
// File: components/absence/RequestLeaveModalManual2.tsx
import React, { useState, useEffect } from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { XCircle, Loader2, Upload, FileText, CheckCircle, AlertTriangle, Calendar, User } from 'lucide-react';
import { LeaveType } from '../../types/absence';
import { createLeaveRequestNotification, getUserManager, getUserName } from '../../utils/absenceNotifications';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type RequestForm = {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  requestForm: RequestForm;
  setRequestForm: React.Dispatch<React.SetStateAction<RequestForm>>;
  leaveTypes: LeaveType[];
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  loading: boolean;
  currentUserId: string;
  companyId: string;
  currentUserName: string;
};

interface CertificateData {
  employee_name: string;
  sickness_start_date: string;
  sickness_end_date: string;
  comment: string;
}

const RequestLeaveModalManual: React.FC<Props> = ({
  isOpen,
  onClose,
  requestForm,
  setRequestForm,
  leaveTypes,
  onSubmit,
  loading,
  currentUserId,
  companyId,
  currentUserName
}) => {
  const { t } = useLocale();
  
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [certificateId, setCertificateId] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [certificateData, setCertificateData] = useState<CertificateData>({
    employee_name: '',
    sickness_start_date: '',
    sickness_end_date: '',
    comment: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB
  
  const selectedLeaveType = leaveTypes.find(lt => lt.id === requestForm.leave_type_id);
  const isSickLeave = selectedLeaveType?.requires_medical_certificate || false;

  // Reset certificate state when modal closes or leave type changes
  useEffect(() => {
    if (!isOpen || !isSickLeave) {
      resetCertificateState();
    }
  }, [isOpen, isSickLeave]);

  // Pre-fill employee name when modal opens
  useEffect(() => {
    if (isOpen && isSickLeave && !certificateId) {
      setCertificateData(prev => ({
        ...prev,
        employee_name: currentUserName || ''
      }));
    }
  }, [isOpen, isSickLeave, currentUserName, certificateId]);

  const resetCertificateState = () => {
    setCertificateFile(null);
    setError('');
    setCertificateId(null);
    setValidationErrors({});
    setCertificateData({
      employee_name: '',
      sickness_start_date: '',
      sickness_end_date: '',
      comment: ''
    });
... (truncated,      580 total lines)
```
</details>

---

## `components/absence/StatusBadge.tsx`

```
Folder: components/absence
Type: tsx | Lines:       34
Top definitions:
--- Exports ---
export default StatusBadge;

--- Key Functions/Components ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
```

<details>
<summary>📄 Full content (      34 lines)</summary>

```tsx
// File: components/absence/StatusBadge.tsx
import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    pending: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200',
    approved: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
    rejected: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
    cancelled: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
  };

  const icons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    cancelled: XCircle
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
        styles[status as keyof typeof styles]
      }`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;
```
</details>

---

## `components/header/DemoTimer.tsx`

```
Folder: components/header
Type: tsx | Lines:       47
Top definitions:
--- Exports ---
export const DemoTimer: React.FC<DemoTimerProps> = ({

--- Key Functions/Components ---
interface DemoTimerProps {
```

<details>
<summary>📄 Full content (      47 lines)</summary>

```tsx
// components/Header/DemoTimer.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { Clock } from 'lucide-react';

interface DemoTimerProps {
  isDemoMode: boolean;
  isDemoExpired: boolean;
  demoTimeLeft: number | null;
  formatTime: (seconds: number) => string;
}

export const DemoTimer: React.FC<DemoTimerProps> = ({
  isDemoMode,
  isDemoExpired,
  demoTimeLeft,
  formatTime
}) => {
  const { t } = useLocale();

  if (!isDemoMode && !isDemoExpired) return null;

  const timerBarColor = isDemoExpired
    ? 'bg-gradient-to-r from-red-600 to-red-700'
    : demoTimeLeft && demoTimeLeft < 300 // Less than 5 minutes
    ? 'bg-gradient-to-r from-red-400 to-orange-500'
    : 'bg-gradient-to-r from-orange-400 to-red-500';

  const timerMessage = isDemoExpired
    ? t('demoTimer.expired')
    : t('demoTimer.active', { time: demoTimeLeft ? formatTime(demoTimeLeft) : '00:00' });

  return (
    <div className={`${timerBarColor} text-white px-4 py-2`}>
      <div className="max-w-8xl mx-auto flex items-center justify-center gap-3">
        <Clock className="w-4 h-4" />
        <span className="font-semibold text-sm">
          {timerMessage}
        </span>
        {!isDemoExpired && (
          <div className="hidden sm:block text-xs opacity-90">
            {t('demoTimer.autoCloseWarning')}
          </div>
        )}
      </div>
    </div>
  );
};
```
</details>

---

## `components/header/ForfaitBadge.tsx`

```
Folder: components/header
Type: tsx | Lines:       31
Top definitions:
--- Exports ---
export const ForfaitBadge: React.FC<ForfaitBadgeProps> = ({ companyForfait }) => {

--- Key Functions/Components ---
interface ForfaitBadgeProps {
```

<details>
<summary>📄 Full content (      31 lines)</summary>

```tsx
// components/Header/ForfaitBadge.tsx
import React from 'react';

interface ForfaitBadgeProps {
  companyForfait: string | null;
}

export const ForfaitBadge: React.FC<ForfaitBadgeProps> = ({ companyForfait }) => {
  switch (companyForfait) {
    case 'Free':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-gray-500"></div> Free
        </span>
      );
    case 'Momentum':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shadow-md">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div> Momentum
        </span>
      );
    case 'Infinity':
      return (
        <span className="flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 shadow-lg ring-1 ring-yellow-400">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-md"></div> Infinity
        </span>
      );
    default:
      return null;
  }
};
```
</details>

---

## `components/header/LoginModal.tsx`

```
Folder: components/header
Type: tsx | Lines:      261
Top definitions:
--- Exports ---
export const LoginModal: React.FC<LoginModalProps> = ({

--- Key Functions/Components ---
interface LoginModalProps {
```

<details>
<summary>📄 Full content (     261 lines)</summary>

```tsx
// components/Header/LoginModal.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { supabase } from '../../lib/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  login: string;
  setLogin: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  onLogin: (email?: string, pwd?: string) => void | Promise<void>;
  isDemoExpired: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  login,
  setLogin,
  password,
  setPassword,
  error,
  onLogin,
  isDemoExpired
}) => {
  const { t } = useLocale();

  const [isResetMode, setIsResetMode] = React.useState(false);
  const [resetError, setResetError] = React.useState('');
  const [resetSuccess, setResetSuccess] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  if (!isOpen || isDemoExpired) return null;

  // Extract slug from URL (format: app/jobs/slug)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const slug = pathSegments[1] || '';
  const isDemoMode = slug === 'demo';

  const handleDemoLogin = (email: string, pwd: string) => {
    return () => {
      onLogin(email, pwd);
    };
  };

  // --- RESET PASSWORD HANDLER ---
  const handleResetPassword = async () => {
    setResetError('');
    setResetSuccess(false);

    if (!login) {
      setResetError(t('loginModal.messages.missingEmail'));
      return;
    }

    setIsSending(true);

    // Store the slug in localStorage so we can redirect back to it
    if (slug && slug !== 'demo') {
      localStorage.setItem('reset_password_slug', slug);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(login, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    setIsSending(false);

    if (error) {
      setResetError(error.message);
    } else {
      setResetSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isResetMode ? t('loginModal.resetTitle') : t('loginModal.title')}
          </h2>
          {!isResetMode && (
            <p className="text-gray-600 mt-1">
              {isDemoMode ? t('loginModal.subtitle.demo') : t('loginModal.subtitle.normal')}
            </p>
          )}
        </div>

        {/* DEMO MODE -------------------------------------------------------- */}
        {!isResetMode && isDemoMode && (
          <div className="p-6 space-y-3">
            <button
              onClick={handleDemoLogin('user@hrinno.hu', 'password')}
              className="w-full px-4 py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors text-left"
            >
              <div className="font-semibold text-blue-900">{t('loginModal.demoAccounts.user')}</div>
              <div className="text-sm text-blue-700 mt-1">user@hrinno.hu</div>
            </button>

            <button
              onClick={handleDemoLogin('demo@hrinno.hu', 'demo')}
              className="w-full px-4 py-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors text-left"
            >
              <div className="font-semibold text-green-900">{t('loginModal.demoAccounts.manager')}</div>
              <div className="text-sm text-green-700 mt-1">manager@hrinno.hu</div>
            </button>

            <button
              onClick={handleDemoLogin('hrmanager@hrinno.hu', 'password')}
              className="w-full px-4 py-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg transition-colors text-left"
            >
              <div className="font-semibold text-purple-900">{t('loginModal.demoAccounts.hrManager')}</div>
              <div className="text-sm text-purple-700 mt-1">hrmanager@hrinno.hu</div>
            </button>
          </div>
        )}

        {/* NORMAL LOGIN ----------------------------------------------------- */}
        {!isResetMode && !isDemoMode && (
          <div className="p-6 space-y-4">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loginModal.fields.email')}
              </label>
              <input
                type="email"
                placeholder={t('loginModal.fields.emailPlaceholder')}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loginModal.fields.password')}
              </label>
              <input
                type="password"
                placeholder={t('loginModal.fields.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <button
                onClick={() => setIsResetMode(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                {t('loginModal.buttons.forgotPassword')}
              </button>
            </div>
          </div>
        )}

        {/* RESET PASSWORD MODE -------------------------------------------- */}
        {isResetMode && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              {t('loginModal.resetDescription')}
            </p>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('loginModal.fields.email')}
              </label>
              <input
                type="email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder={t('loginModal.fields.emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            {/* ERROR */}
            {resetError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{resetError}</p>
              </div>
            )}

            {/* SUCCESS */}
            {resetSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">
                  {t('loginModal.messages.resetEmailSent')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* FOOTER ----------------------------------------------------------- */}
        <div className="p-6 border-t border-gray-200 flex gap-3">

          {/* CANCEL OR BACK */}
          <button
            onClick={() => {
              if (isResetMode) {
                setIsResetMode(false);
                setResetError('');
                setResetSuccess(false);
              } else {
                onClose();
              }
            }}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            {isResetMode
              ? t('loginModal.buttons.backToLogin')
              : t('loginModal.buttons.cancel')}
          </button>

          {/* MAIN ACTION BUTTON */}
          {!isDemoMode && (
            <>
              {!isResetMode ? (
                <button
                  onClick={() => onLogin()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {t('loginModal.buttons.connect')}
                </button>
              ) : (
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  disabled={isSending}
                >
                  {isSending
                    ? t('loginModal.buttons.sending')
                    : t('loginModal.buttons.resetPassword')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
```
</details>

---

## `components/header/MenuItem.tsx`

```
Folder: components/header
Type: tsx | Lines:       96
Top definitions:
--- Exports ---
export const HappyCheckMenuItem = ({
export const DemoAwareMenuItem = ({

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      96 lines)</summary>

```tsx
// components/Header/MenuItem.tsx
import React from 'react';
import Link from 'next/link';
import { useLocale } from 'i18n/LocaleProvider';

// HappyCheckMenuItem for items that require happy check access
export const HappyCheckMenuItem = ({
  href,
  children,
  className,
  onClick,
  canAccessHappyCheck,
  isDemoExpired = false
}: {
  href: string;
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
  canAccessHappyCheck: boolean | null;
  isDemoExpired?: boolean;
}) => {
  const { t } = useLocale();
  
  const isDisabled = canAccessHappyCheck === false || isDemoExpired;
  const isLoading = canAccessHappyCheck === null && !isDemoExpired;

  if (isLoading) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-wait relative`}>
        {children}
        <div className="absolute inset-0 bg-gray-200 opacity-20 rounded-xl"></div>
      </div>
    );
  }

  if (isDisabled) {
    const tooltipMessage = isDemoExpired
      ? t('menuItem.tooltips.demoExpired')
      : t('menuItem.tooltips.notAvailable');

    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-not-allowed relative group`}>
        {children}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {tooltipMessage}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};

// DemoAwareMenuItem for regular menu items that can be disabled during demo expiration
export const DemoAwareMenuItem = ({
  href,
  children,
  className,
  onClick,
  isDemoExpired = false,
  isContactUs = false
}: {
  href: string;
  children: React.ReactNode;
  className: string;
  onClick?: () => void;
  isDemoExpired?: boolean;
  isContactUs?: boolean;
}) => {
  const { t } = useLocale();
  
  // Contact Us is never disabled
  const isDisabled = isDemoExpired && !isContactUs;

  if (isDisabled) {
    return (
      <div className={`${className.replace(/bg-\w+-\d+/, 'bg-gray-100').replace(/text-\w+-\d+/, 'text-gray-400')} cursor-not-allowed relative group`}>
        {children}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {t('menuItem.tooltips.demoExpired')}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
};
```
</details>

---

## `components/header/index.tsx`

```
Folder: components/header
Type: tsx | Lines:        3
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (       3 lines)</summary>

```tsx
export { LoginModal } from './LoginModal';
export { HappyCheckMenuItem, DemoAwareMenuItem } from './MenuItem';
export { DemoTimer } from './DemoTimer';
export { ForfaitBadge } from './ForfaitBadge';
```
</details>

---

## `components/payroll/BulkOperationsModal.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      556
Top definitions:
--- Exports ---
export default function BulkOperationsModal({

--- Key Functions/Components ---
interface BulkOperationsModalProps {
type OperationType = 'salary_increase' | 'add_allowance' | 'add_deduction' | 'change_department';
```

<details>
<summary>📄 Preview (first 100 lines of      556)</summary>

```tsx
// components/payroll/BulkOperationsModal.tsx
'use client';

import { useState } from 'react';
import { X, TrendingUp, DollarSign, Users, Building2, Loader2 } from 'lucide-react';
import type { AllowanceType, DeductionType, TaxTreatment } from '../../types/payroll';
import { HUNGARIAN_ALLOWANCE_CONFIG, getAllowanceTypeLabel, getDeductionTypeLabel } from '../../types/payroll';

interface BulkOperationsModalProps {
  selectedPayrollIds: string[];
  currentUserId: string;
  onClose: () => void;
  onComplete: () => void;
}

type OperationType = 'salary_increase' | 'add_allowance' | 'add_deduction' | 'change_department';

export default function BulkOperationsModal({
  selectedPayrollIds,
  currentUserId,
  onClose,
  onComplete,
}: BulkOperationsModalProps) {
  const [operation, setOperation] = useState<OperationType>('salary_increase');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  // Salary increase state
  const [salaryChangeType, setSalaryChangeType] = useState<'percentage' | 'fixed'>('percentage');
  const [salaryValue, setSalaryValue] = useState<string>('');

  // Allowance state
  const [allowanceType, setAllowanceType] = useState<AllowanceType>('bonus');
  const [allowanceAmount, setAllowanceAmount] = useState<string>('');
  const [allowanceTaxTreatment, setAllowanceTaxTreatment] = useState<TaxTreatment>('fully_taxable');
  const [allowanceRecurring, setAllowanceRecurring] = useState(false);
  const [allowanceMonth, setAllowanceMonth] = useState<number>(new Date().getMonth() + 1);
  const [allowanceYear, setAllowanceYear] = useState<number>(new Date().getFullYear());
  const [allowanceDescription, setAllowanceDescription] = useState<string>('');

  // Deduction state
  const [deductionType, setDeductionType] = useState<DeductionType>('advance_on_salary');
  const [deductionAmount, setDeductionAmount] = useState<string>('');
  const [deductionTotalAmount, setDeductionTotalAmount] = useState<string>('');
  const [deductionInstallments, setDeductionInstallments] = useState<string>('');
  const [deductionStartMonth, setDeductionStartMonth] = useState<number>(new Date().getMonth() + 1);
  const [deductionStartYear, setDeductionStartYear] = useState<number>(new Date().getFullYear());
  const [deductionDescription, setDeductionDescription] = useState<string>('');

  // Department state
  const [newDepartment, setNewDepartment] = useState<string>('');

  // Handle allowance type change - auto-set tax treatment
  const handleAllowanceTypeChange = (type: AllowanceType) => {
    setAllowanceType(type);
    const config = HUNGARIAN_ALLOWANCE_CONFIG[type];
    setAllowanceTaxTreatment(config.defaultTaxTreatment);
  };

  const handleSubmit = async () => {
    try {
      setProcessing(true);
      setResult(null);

      const requestBody: Record<string, unknown> = {
        operation,
        payroll_ids: selectedPayrollIds,
        current_user_id: currentUserId,
      };

      // Build request based on operation type
      switch (operation) {
        case 'salary_increase':
          if (!salaryValue || parseFloat(salaryValue) <= 0) {
            alert('Please enter a valid value');
            return;
          }
          requestBody.salary_change = {
            type: salaryChangeType,
            value: parseFloat(salaryValue),
          };
          break;

        case 'add_allowance':
          if (!allowanceAmount || parseFloat(allowanceAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
          }
          requestBody.allowance = {
            allowance_type: allowanceType,
            amount: parseFloat(allowanceAmount),
            currency: 'HUF',
            tax_treatment: allowanceTaxTreatment,
            is_recurring: allowanceRecurring,
            effective_month: allowanceRecurring ? undefined : allowanceMonth,
            effective_year: allowanceRecurring ? undefined : allowanceYear,
            description: allowanceDescription || undefined,
          };
          break;
... (truncated,      556 total lines)
```
</details>

---

## `components/payroll/CompensationManager.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      838
Top definitions:
--- Exports ---
export default function CompensationManager({

--- Key Functions/Components ---
interface CompensationManagerProps {
interface AllowanceModalProps {
function AllowanceModal({ payrollId, allowance, currentUserId, onClose, onSuccess }: AllowanceModalProps) {
interface DeductionModalProps {
function DeductionModal({ payrollId, deduction, currentUserId, onClose, onSuccess }: DeductionModalProps) {
```

<details>
<summary>📄 Preview (first 100 lines of      838)</summary>

```tsx
// components/payroll/CompensationManager.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';
import type {
  EmployeeAllowance,
  EmployeeDeduction,
  AllowanceType,
  DeductionType,
  TaxTreatment,
  CreateAllowanceRequest,
  CreateDeductionRequest,
} from '../../types/payroll';
import {
  getAllowanceTypeLabel,
  getDeductionTypeLabel,
  getTaxTreatmentLabel,
  formatCompensation,
  HUNGARIAN_ALLOWANCE_CONFIG,
} from '../../types/payroll';

interface CompensationManagerProps {
  payrollId: string;
  baseSalary: number;
  currency: string | undefined;
  currentUserId: string;
  onUpdate?: () => void;
}

export default function CompensationManager({
  payrollId,
  baseSalary,
  currency,
  currentUserId,
  onUpdate,
}: CompensationManagerProps) {
  const [allowances, setAllowances] = useState<EmployeeAllowance[]>([]);
  const [deductions, setDeductions] = useState<EmployeeDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState<EmployeeAllowance | null>(null);
  const [editingDeduction, setEditingDeduction] = useState<EmployeeDeduction | null>(null);

  // Fetch data
  useEffect(() => {
    if (payrollId) {
      fetchCompensation();
    }
  }, [payrollId]);

  const fetchCompensation = async () => {
    try {
      setLoading(true);
      
      // Fetch allowances
      const allowancesRes = await fetch(`/api/payroll/allowances?payroll_id=${payrollId}`);
      if (allowancesRes.ok) {
        const allowancesData: { data: EmployeeAllowance[] } = await allowancesRes.json();
        setAllowances(allowancesData.data || []);
      }
      
      // Fetch deductions
      const deductionsRes = await fetch(`/api/payroll/deductions?payroll_id=${payrollId}`);
      if (deductionsRes.ok) {
        const deductionsData: { data: EmployeeDeduction[] } = await deductionsRes.json();
        setDeductions(deductionsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching compensation:', err);
      setError('Failed to load compensation data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllowance = async (id: string) => {
    if (!confirm('Delete this allowance?')) return;
    
    try {
      const res = await fetch(`/api/payroll/allowances/${id}?current_user_id=${currentUserId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setAllowances(allowances.filter(a => a.id !== id));
... (truncated,      838 total lines)
```
</details>

---

## `components/payroll/PayrollEditModal.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      671
Top definitions:
--- Exports ---
export default function PayrollEditModal({

--- Key Functions/Components ---
interface PayrollEditModalProps {
const EMPTY_COUNTRY_DATA: HungarianPayrollData = {
const createBaseFormData = (userId: string): CreatePayrollRequest => ({
const normalizePayroll = (
```

<details>
<summary>📄 Preview (first 100 lines of      671)</summary>

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Loader2,
    Save,
    Edit3,
    Briefcase,
    CreditCard,
    Building2,
    Shield,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import type {
    EmployeePayroll,
    HungarianPayrollData,
    CreatePayrollRequest,
} from '../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import CompensationManager from './CompensationManager';


interface PayrollEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    currentUserId: string;
    onSuccess?: () => void;
}

/* =========================================================
   Helpers
========================================================= */

const EMPTY_COUNTRY_DATA: HungarianPayrollData = {
    taj_number: '',
    tax_id: '',
    tax_bracket: '1',
    personal_income_tax_rate: 15,
    employee_social_contribution: 18.5,
    employer_social_contribution: 13,
    family_tax_allowance: 0,
    pension_fund: 'government',
};

const createBaseFormData = (userId: string): CreatePayrollRequest => ({
    user_id: userId,
    country_code: 'HU',
    employment_type: 'full_time',
    contract_type: 'permanent',
    contract_start_date: new Date().toISOString().split('T')[0],
    position_title: '',
    department: '',
    work_location: '',
    weekly_hours: 40,
    salary_amount: 0,
    salary_currency: 'HUF',
    salary_period: 'monthly',
    payment_method: 'bank_transfer',
    bank_account_iban: '',
    bank_name: '',
    country_specific_data: EMPTY_COUNTRY_DATA,
    benefits: [],
});


const normalizePayroll = (
    base: CreatePayrollRequest,
    incoming: Partial<CreatePayrollRequest>
): CreatePayrollRequest => ({
    ...base,
    ...incoming,

    position_title: incoming?.position_title ?? '',
    department: incoming?.department ?? '',
    work_location: incoming?.work_location ?? '',
    bank_account_iban: incoming?.bank_account_iban ?? '',
    bank_name: incoming?.bank_name ?? '',

    weekly_hours: incoming?.weekly_hours ?? 40,
    salary_amount: incoming?.salary_amount ?? 0,

    contract_start_date:
        incoming?.contract_start_date ??
        new Date().toISOString().split('T')[0],

    country_specific_data: {
        ...EMPTY_COUNTRY_DATA,
        ...(incoming?.country_specific_data ?? {}),
        taj_number: incoming?.country_specific_data?.taj_number ?? '',
        tax_id: incoming?.country_specific_data?.tax_id ?? '',
        family_tax_allowance:
            incoming?.country_specific_data?.family_tax_allowance ?? 0,
    },
});
... (truncated,      671 total lines)
```
</details>

---

## `components/payroll/PayrollExportModal.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      378
Top definitions:
--- Exports ---
export default function PayrollExportModal({

--- Key Functions/Components ---
interface PayrollExportModalProps {
interface PayrollValidationIssue {
const [validationIssues, setValidationIssues] = useState<PayrollValidationIssue[] | null>(null);
```

<details>
<summary>📄 Preview (first 100 lines of      378)</summary>

```tsx
// components/payroll/PayrollExportModal.tsx
'use client';

import { useState } from 'react';
import {
  X,
  Download,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import { exportAndDownloadPayroll } from '../../lib/payrollExportUtils';
import type { ExportFormat, EmploymentType } from '../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import PeriodStatusWidget from './PeriodStatusWidget';

interface PayrollExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface PayrollValidationIssue {
  message: string;
  suggested_fix?: string;
}


export default function PayrollExportModal({
  isOpen,
  onClose,
  userId,
}: PayrollExportModalProps) {
  const { t } = useLocale();

  const currentDate = new Date();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isBlocked, setIsBlocked] = useState(false);
const [validationIssues, setValidationIssues] = useState<PayrollValidationIssue[] | null>(null);
  const [exportDone, setExportDone] = useState(false);
  const [lastExportId, setLastExportId] = useState<string | undefined>();

  const [formData, setFormData] = useState({
    country_code: 'HU',
    export_month: currentDate.getMonth() + 1,
    export_year: currentDate.getFullYear(),
    export_format: 'nexon' as ExportFormat,
    include_terminated: false,
    department: '',
    employment_types: [] as EmploymentType[],
  });

  const getMonthName = (monthNumber: number) =>
    new Date(2024, monthNumber - 1).toLocaleString(
      t('payrollExportModal.locale'),
      { month: 'long' }
    );

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsBlocked(false);
      setValidationIssues(null);

      const response = await fetch('/api/payroll/export', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validated_by: userId,
        }),
      });

      const result = await response.json();

      if (!response.ok && result.status === 'blocked') {
        setIsBlocked(true);
        setValidationIssues(result.issues || []);
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || t('payrollExportModal.errors.exportFailed')
        );
      }

      await exportAndDownloadPayroll({
        format: formData.export_format,
        month: formData.export_month,
        year: formData.export_year,
        data: result.data,
      });

      // Save the export ID for period closure
... (truncated,      378 total lines)
```
</details>

---

## `components/payroll/PayrollForm.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      783
Top definitions:
--- Exports ---
export default function PayrollForm({ payroll, onClose, onSuccess }: PayrollFormProps) {

--- Key Functions/Components ---
interface PayrollFormProps {
const supabase = createClient(
interface CompanyUser {
```

<details>
<summary>📄 Preview (first 100 lines of      783)</summary>

```tsx
// components/payroll/PayrollForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  X,
  Loader2,
  Save,
  UserPlus,
  Briefcase,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Edit,
} from 'lucide-react';

import type {
  EmployeePayroll,
  CreatePayrollRequest,
  HungarianPayrollData,
} from '../../types/payroll';

import { useLocale } from 'i18n/LocaleProvider';
import { createClient } from '@supabase/supabase-js';

interface PayrollFormProps {
  payroll?: EmployeePayroll | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// CREATE SUPABASE CLIENT OUTSIDE COMPONENT TO PREVENT RE-CREATION
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CompanyUser {
  user_id: string;
  first_name: string;
  last_name: string;
}


export default function PayrollForm({ payroll, onClose, onSuccess }: PayrollFormProps) {
  const { t } = useLocale();

  /* ------------------------------------------------------------------ */
  /* Route params                                                        */
  /* ------------------------------------------------------------------ */
  const params = useParams<{ slug: string }>();
  const companySlug = params.slug;

  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [existingPayroll, setExistingPayroll] = useState<EmployeePayroll | null>(null);
  const [isEditMode, setIsEditMode] = useState(!!payroll);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [formData, setFormData] = useState<CreatePayrollRequest>({
    user_id: payroll?.user_id || '',
    country_code: payroll?.country_code || 'HU',
    employment_type: payroll?.employment_type || 'full_time',
    contract_type: payroll?.contract_type || 'permanent',
    contract_start_date:
      payroll?.contract_start_date || new Date().toISOString().split('T')[0],
    contract_end_date: payroll?.contract_end_date || undefined,
    position_title: payroll?.position_title || '',
    department: payroll?.department || '',
    work_location: payroll?.work_location || '',
    weekly_hours: payroll?.weekly_hours || 40,
    salary_amount: payroll?.salary_amount || 0,
    salary_currency: payroll?.salary_currency || 'HUF',
    salary_period: payroll?.salary_period || 'monthly',
    payment_method: payroll?.payment_method || 'bank_transfer',
    bank_account_iban: payroll?.bank_account_iban || '',
    bank_name: payroll?.bank_name || '',
    country_specific_data: payroll?.country_specific_data || ({
      taj_number: '',
      tax_id: '',
      tax_bracket: '1',
      personal_income_tax_rate: 15,
      employee_social_contribution: 18.5,
      employer_social_contribution: 13,
      family_tax_allowance: 0,
      pension_fund: 'government',
    } as HungarianPayrollData),
    benefits: payroll?.benefits || [],
  });
... (truncated,      783 total lines)
```
</details>

---

## `components/payroll/PayrollGridView.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      762
Top definitions:
--- Exports ---
export interface GridEmployee {
export default function PayrollGridView({

--- Key Functions/Components ---
interface PayrollGridViewProps {
```

<details>
<summary>📄 Preview (first 100 lines of      762)</summary>

```tsx
// components/payroll/PayrollGridView.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Edit2,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
//import type { EmploymentType } from '../../types/payroll';
import { formatHUF, getAllowanceTypeLabel, getDeductionTypeLabel } from '../../types/payroll';
import BulkOperationsModal from './BulkOperationsModal';
import React from 'react';
import type {
  EmploymentType,
  AllowanceType,
  DeductionType,
} from '../../types/payroll';




export interface GridEmployee {
  id: string;
  user_id: string;
  users: {
    user_firstname: string;
    user_lastname: string;
  };
  position_title: string;
  department?: string;
  employment_type: EmploymentType;
  salary_amount: number;
  salary_currency: string;
  weekly_hours: number;
  is_active: boolean;
  total_allowances: number;
  total_deductions: number;
  allowances_count: number;
  deductions_count: number;
  allowances: Array<{
  id: string;
  allowance_type: AllowanceType;
  amount: number;
  description?: string;
  is_recurring: boolean;
}>;

deductions: Array<{
  id: string;
  deduction_type: DeductionType;
  amount: number;
  description?: string;
  remaining_amount?: number;
  installments_remaining?: number;
}>;

  validation_status: 'valid' | 'warning' | 'error';
  validation_issues_count: number;
}

interface PayrollGridViewProps {
  countryCode: string;
  currentUserId: string;
  periodClosed?: boolean;
  onEditEmployee?: (employee: GridEmployee) => void;
}

export default function PayrollGridView({
  countryCode,
  currentUserId,
  periodClosed = false,
  onEditEmployee,
}: PayrollGridViewProps) {
  const [employees, setEmployees] = useState<GridEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
... (truncated,      762 total lines)
```
</details>

---

## `components/payroll/PayrollList.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      417
Top definitions:
--- Exports ---
export default function PayrollList({ onEdit, onExport }: PayrollListProps) {

--- Key Functions/Components ---
interface PayrollListProps {
```

<details>
<summary>📄 Preview (first 100 lines of      417)</summary>

```tsx
// components/payroll/PayrollList.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient, User } from '@supabase/supabase-js';

import { 
  Loader2, 
  AlertCircle, 
  Download, 
  Eye, 
  Edit, 
  XCircle,
  Users,
  UserCheck,
  DollarSign,
  Filter
} from 'lucide-react';
import type { EmployeePayroll, UserWithPayroll } from '../../types/payroll';
import { useLocale } from 'i18n/LocaleProvider';
import PayrollEditModal from './PayrollEditModal';

interface PayrollListProps {
  onEdit?: (payroll: EmployeePayroll) => void;
  onExport?: () => void;
}

export default function PayrollList({ onEdit, onExport }: PayrollListProps) {
  const { t } = useLocale();
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string || '';
  
  const [payrolls, setPayrolls] = useState<EmployeePayroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filter, setFilter] = useState({
    country_code: '',
    is_active: 'true',
    department: ''
  });

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchPayrolls();
  }, [filter]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.country_code) params.append('country_code', filter.country_code);
      if (filter.is_active) params.append('is_active', filter.is_active);
      if (filter.department) params.append('department', filter.department);

      const response = await fetch(`/api/payroll?${params.toString()}`);
      if (!response.ok) {
        throw new Error(t('payrollList.errors.fetchFailed'));
      }

      const result = await response.json();
      setPayrolls(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('payrollList.errors.genericError'));
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('payrollList.confirmations.deactivate'))) {
      return;
... (truncated,      417 total lines)
```
</details>

---

## `components/payroll/PeriodClosureModal.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      295
Top definitions:
--- Exports ---
export default function PeriodClosureModal({

--- Key Functions/Components ---
interface PeriodClosureModalProps {
```

<details>
<summary>📄 Full content (     295 lines)</summary>

```tsx
// components/payroll/PeriodClosureModal.tsx
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  User,
  FileText,
} from 'lucide-react';

interface PeriodClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  countryCode: string;
  year: number;
  month: number;
  currentStatus: 'open' | 'closed' | 'reopened';
  currentUserId: string;
  lastExportId?: string;
}

export default function PeriodClosureModal({
  isOpen,
  onClose,
  onSuccess,
  countryCode,
  year,
  month,
  currentStatus,
  currentUserId,
  lastExportId,
}: PeriodClosureModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const isClosing = currentStatus !== 'closed';
  const isReopening = currentStatus === 'closed';

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isReopening) {
        // Validate reopen reason
        if (reason.trim().length < 10) {
          setError('Reopen reason must be at least 10 characters');
          setLoading(false);
          return;
        }

        // Reopen the period
        const response = await fetch('/api/payroll/periods/close', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country_code: countryCode,
            year,
            month,
            reopened_by: currentUserId,
            reopen_reason: reason,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reopen period');
        }
      } else {
        // Close the period
        const response = await fetch('/api/payroll/periods/close', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country_code: countryCode,
            year,
            month,
            closed_by: currentUserId,
            closed_reason: reason || `${monthName} ${year} payroll finalized`,
            last_export_id: lastExportId,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to close period');
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isReopening 
                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                : 'bg-gradient-to-br from-red-500 to-pink-500'
            }`}>
              {isReopening ? (
                <Unlock className="w-6 h-6 text-white" />
              ) : (
                <Lock className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isReopening ? 'Reopen Period' : 'Close Period'}
              </h2>
              <p className="text-sm text-gray-600">
                {monthName} {year} - {countryCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning/Info Box */}
          <div className={`rounded-lg border p-4 ${
            isReopening
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex gap-3">
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isReopening ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <div>
                <h3 className={`font-semibold mb-1 ${
                  isReopening ? 'text-yellow-900' : 'text-red-900'
                }`}>
                  {isReopening ? 'Reopening a Closed Period' : 'Closing This Period'}
                </h3>
                <p className={`text-sm ${
                  isReopening ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {isReopening ? (
                    <>
                      This will allow editing payroll data and creating new exports for this period. 
                      <strong className="block mt-1">You must provide a reason for reopening.</strong>
                    </>
                  ) : (
                    <>
                      This will prevent further edits to payroll data and exports for this period.
                      You can reopen it later if corrections are needed.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Period Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Period:</span>
              <span className="text-gray-900">{monthName} {year}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">Country:</span>
              <span className="text-gray-900">{countryCode}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                currentStatus === 'closed' 
                  ? 'bg-red-100 text-red-800'
                  : currentStatus === 'reopened'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                Current Status: {currentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason {isReopening && <span className="text-red-500">*</span>}
              {isReopening && (
                <span className="text-gray-500 font-normal ml-1">(min. 10 characters)</span>
              )}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required={isReopening}
              rows={3}
              placeholder={
                isReopening
                  ? 'e.g., Salary correction needed for employee John Doe'
                  : 'e.g., Monthly payroll completed and verified (optional)'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            {isReopening && reason.length > 0 && reason.length < 10 && (
              <p className="text-sm text-red-600 mt-1">
                {10 - reason.length} more characters required
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (isReopening && reason.trim().length < 10)}
              className={`px-6 py-2 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${
                isReopening
                  ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isReopening ? 'Reopening...' : 'Closing...'}
                </>
              ) : (
                <>
                  {isReopening ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      Reopen Period
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Close Period
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
```
</details>

---

## `components/payroll/PeriodStatusWidget.tsx`

```
Folder: components/payroll
Type: tsx | Lines:      276
Top definitions:
--- Exports ---
export default function PeriodStatusWidget({

--- Key Functions/Components ---
interface PeriodStatusWidgetProps {
interface PeriodStatus {
```

<details>
<summary>📄 Full content (     276 lines)</summary>

```tsx
// components/payroll/PeriodStatusWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import PeriodClosureModal from './PeriodClosureModal';

interface PeriodStatusWidgetProps {
  countryCode: string;
  year: number;
  month: number;
  currentUserId: string;
  lastExportId?: string;
  onStatusChange?: () => void;
}

interface PeriodStatus {
  status: 'open' | 'closed' | 'reopened';
  closed_at?: string;
  closed_by?: string;
  closed_by_name?: string;
  closed_reason?: string;
  reopened_at?: string;
  reopened_by?: string;
  reopened_by_name?: string;
  reopen_reason?: string;
}

export default function PeriodStatusWidget({
  countryCode,
  year,
  month,
  currentUserId,
  lastExportId,
  onStatusChange,
}: PeriodStatusWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PeriodStatus | null>(null);
  const [showModal, setShowModal] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1];

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/payroll/periods/status?current_user_id=${currentUserId}&country_code=${countryCode}&year=${year}&month=${month}`
      );

      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching period status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [countryCode, year, month, currentUserId]);

  const handleSuccess = () => {
    fetchStatus();
    if (onStatusChange) {
      onStatusChange();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const currentStatus = status?.status || 'open';
  const isClosed = currentStatus === 'closed';
  const isReopened = currentStatus === 'reopened';

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`p-4 ${
          isClosed 
            ? 'bg-gradient-to-r from-red-50 to-pink-50 border-b border-red-100'
            : isReopened
            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100'
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isClosed
                  ? 'bg-gradient-to-br from-red-500 to-pink-500'
                  : isReopened
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-br from-green-500 to-emerald-500'
              }`}>
                {isClosed ? (
                  <Lock className="w-5 h-5 text-white" />
                ) : isReopened ? (
                  <Unlock className="w-5 h-5 text-white" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {monthName} {year}
                </h3>
                <p className="text-sm text-gray-600">Period Status</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isClosed
                ? 'bg-red-100 text-red-800 border border-red-200'
                : isReopened
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {isClosed ? '🔒 CLOSED' : isReopened ? '🔓 REOPENED' : '✓ OPEN'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Status Information */}
          {isClosed && status?.closed_at && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Closed</p>
                  <p className="text-xs text-gray-600">
                    {new Date(status.closed_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {status.closed_by_name && (
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-600">
                    by <strong className="text-gray-900">{status.closed_by_name}</strong>
                  </span>
                </div>
              )}
              {status.closed_reason && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                    &quot;{status.closed_reason}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {isReopened && status?.reopened_at && (
            <div className="bg-yellow-50 rounded-lg p-4 space-y-2 border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">Reopened for Corrections</p>
                  <p className="text-xs text-yellow-700">
                    {new Date(status.reopened_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              {status.reopened_by_name && (
                <div className="flex items-start gap-2">
                  <span className="text-sm text-yellow-800">
                    by <strong className="text-yellow-900">{status.reopened_by_name}</strong>
                  </span>
                </div>
              )}
              {status.reopen_reason && (
                <div className="pt-2 border-t border-yellow-200">
                  <p className="text-xs text-yellow-700 italic">
                    &quot;{status.reopen_reason}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Message */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              {isClosed ? (
                <>
                  This period is locked. No payroll changes or exports allowed.
                  You can reopen it if corrections are needed.
                </>
              ) : isReopened ? (
                <>
                  This period was reopened for corrections. Remember to close it again
                  after making changes.
                </>
              ) : (
                <>
                  This period is open. You can edit payroll data and create exports.
                  Close it when the month is finalized.
                </>
              )}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowModal(true)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isClosed
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white'
                : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
            }`}
          >
            {isClosed ? (
              <>
                <Unlock className="w-4 h-4" />
                Reopen This Period
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Close This Period
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      <PeriodClosureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        countryCode={countryCode}
        year={year}
        month={month}
        currentStatus={currentStatus}
        currentUserId={currentUserId}
        lastExportId={lastExportId}
      />
    </>
  );
}
```
</details>

---

## `components/timeclock/ManagerTimeClockDashboard.tsx`

```
Folder: components/timeclock
Type: tsx | Lines:      576
Top definitions:
--- Exports ---
export default function ManagerTimeClockDashboard({

--- Key Functions/Components ---
interface ManagerTimeClockDashboardProps {
interface TeamMember {
interface PendingEntry {
```

<details>
<summary>📄 Preview (first 100 lines of      576)</summary>

```tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

interface ManagerTimeClockDashboardProps {
  managerId: string;
  managerName: string;
}

interface TeamMember {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  todayStatus: 'clocked_in' | 'clocked_out' | 'not_started';
  todayEntry?: {
    id: number;
    clock_in: string;
    clock_out: string | null;
    total_hours: number | null;
    is_late: boolean;
  };
  weeklyHours: number;
}

interface PendingEntry {
  id: number;
  user_id: string;
  clock_in: string;
  clock_out: string;
  total_hours: number;
  is_late: boolean;
  is_overtime: boolean;
  employee_notes: string | null;
  user_profiles: {
    first_name: string;
    last_name: string;
  };
}

export default function ManagerTimeClockDashboard({
  managerId,
  managerName,
}: ManagerTimeClockDashboardProps) {
  const { t } = useLocale();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'pending'>('today');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, [managerId]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingEntries();
    }
  }, [activeTab]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/timeclock/manager?managerId=${managerId}&action=team-today`
      );
      const data = await response.json();

      if (data.success) {
        setTeamMembers(data.teamMembers);
      } else {
        showError(t('managerTimeClockDashboard.messages.loadTeamFailed'));
      }
    } catch (err) {
      console.error('Failed to fetch team data:', err);
      showError(t('managerTimeClockDashboard.messages.loadTeamFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEntries = async () => {
    try {
      const response = await fetch(
... (truncated,      576 total lines)
```
</details>

---

## `components/timeclock/TimeClockModal.tsx`

```
Folder: components/timeclock
Type: tsx | Lines:      399
Top definitions:
--- Exports ---
export default function TimeClockModal({

--- Key Functions/Components ---
interface WeeklySummary {
interface TimeEntry {
interface ClockStatusResponse {
interface WeeklySummaryResponse {
interface ClockInOutResponse {
interface TimeClockModalProps {
```

<details>
<summary>📄 Preview (first 100 lines of      399)</summary>

```tsx
// TimeClockModal.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  X,
  LogIn,
  LogOut,
  Loader2,
  TrendingUp,
  Check,
  AlertCircle
} from 'lucide-react';
import { useLocale } from 'i18n/LocaleProvider';

interface WeeklySummary {
  totalHours: number;
  onTimeDays: number;
  overtimeHours: number;
}

interface TimeEntry {
  clock_in?: string;
  clock_out?: string;
}

interface ClockStatusResponse {
  success: boolean;
  clockedIn: boolean;
  todayEntry?: TimeEntry;
}

interface WeeklySummaryResponse {
  success: boolean;
  summary: WeeklySummary;
}

interface ClockInOutResponse {
  success: boolean;
  error?: string;
  entry: {
    clock_in?: string;
    clock_out?: string;
  };
}

interface TimeClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userRole?: string; // 'employee' or 'manager'
  onOpenManagerDashboard?: () => void;
}

export default function TimeClockModal({
  isOpen,
  onClose,
  userId,
  userName,
  userRole,
  onOpenManagerDashboard
}: TimeClockModalProps) {
  const { t } = useLocale();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update clock every second
  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // Fetch clock status
  const fetchClockStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/timeclock?userId=${userId}&action=status`);
      const data: ClockStatusResponse = await response.json();

      if (data.success) {
        setClockedIn(data.clockedIn);
        if (data.todayEntry?.clock_in) {
          setClockInTime(new Date(data.todayEntry.clock_in));
        }
      }
    } catch (err) {
      console.error('Failed to fetch clock status:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);
... (truncated,      399 total lines)
```
</details>

---

## `lib/credit.ts`

```
Folder: lib
Type: ts | Lines:       92
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabaseAdmin = createClient(
interface Forfait {
interface CompanyWithForfait {
```

<details>
<summary>📄 Full content (      92 lines)</summary>

```ts
// src/lib/credits.ts
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define the expected shape of your joined query result
interface Forfait {
  included_ai_credits: number | null;
}

interface CompanyWithForfait {
  id: string;
  forfait_id: number | null;
  used_ai_credits: number;
  forfait?: Forfait | Forfait[] | null;
}

/**
 * Consumes 1 AI credit from the company if available.
 * Returns true if the company still has credits left, false if none remain.
 */
export async function consumeCredit(companyId: string): Promise<boolean> {
  // Fetch company and related forfait
  const { data: company, error: companyErr } = await supabaseAdmin
    .from("company")
    .select(
     "id, forfait, used_ai_credits, forfait:forfait!company_forfait_fkey (included_ai_credits)"
    )
    .eq("id", companyId)
    .single<CompanyWithForfait>();

  if (companyErr || !company) {
    console.error("Company not found or query error:", companyErr);
    throw new Error("Company not found");
  }

  // Handle Supabase's array vs object behaviour
  let includedCredits = 0;
  if (Array.isArray(company.forfait)) {
    includedCredits = company.forfait[0]?.included_ai_credits ?? 0;
  } else if (company.forfait && company.forfait.included_ai_credits) {
    includedCredits = company.forfait.included_ai_credits;
  }

  const used = company.used_ai_credits ?? 0;

  if (used >= includedCredits) {
    console.warn(`Company ${companyId} has no remaining AI credits.`);
    return false; // no remaining credits
  }

  // Increment usage
  const { error: updateError } = await supabaseAdmin
    .from("company")
    .update({ used_ai_credits: used + 1 })
    .eq("id", companyId);

  if (updateError) {
    console.error("Failed to update used_ai_credits:", updateError);
    throw updateError;
  }

  return true;
}

/**
 * (Optional helper) Get remaining AI credits for a company.
 */
export async function getRemainingCredits(companyId: string): Promise<number> {
  const { data: company, error } = await supabaseAdmin
    .from("company")
    .select(
      "used_ai_credits, forfait:forfait_id (included_ai_credits)"
    )
    .eq("id", companyId)
    .single<CompanyWithForfait>();

  if (error || !company) throw new Error("Company not found");

  let includedCredits = 0;
  if (Array.isArray(company.forfait)) {
    includedCredits = company.forfait[0]?.included_ai_credits ?? 0;
  } else if (company.forfait && company.forfait.included_ai_credits) {
    includedCredits = company.forfait.included_ai_credits;
  }

  const used = company.used_ai_credits ?? 0;
  return Math.max(includedCredits - used, 0);
}
```
</details>

---

## `lib/supabaseClient.ts`

```
Folder: lib
Type: ts | Lines:       87
Top definitions:
--- Exports ---
export const supabase = createClient(
export const isSessionValid = async () => {
export const refreshSession = async () => {

--- Key Functions/Components ---
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const storage = isBrowser
```

<details>
<summary>📄 Full content (      87 lines)</summary>

```ts
// lib/supabaseClient.ts
'use client';

import { createClient } from '@supabase/supabase-js';

// Browser detection
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Custom storage adapter that safely handles SSR
const storage = isBrowser
  ? {
      getItem: (key: string) => localStorage.getItem(key),
      setItem: (key: string, value: string) => localStorage.setItem(key, value),
      removeItem: (key: string) => localStorage.removeItem(key),
    }
  : {
      getItem: (_key: string) => null,
      setItem: (_key: string, _value: string) => {},
      removeItem: (_key: string) => {},
    };

// 🆕 Enhanced Supabase client with optimal auth configuration
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // ✅ Enable session persistence across browser sessions
      persistSession: true,
      
      // ✅ Store auth tokens in localStorage (survives browser close)
      storage,
      
      // ✅ Auto-refresh tokens before they expire (default: true, but explicit is better)
      autoRefreshToken: true,
      
      // ✅ Detect when user comes back to tab and refresh if needed
      detectSessionInUrl: true,
      
      // ✅ Storage key (can customize if needed)
      storageKey: 'supabase.auth.token',
      
      // 🆕 Flow type for PKCE (more secure, recommended for production)
      flowType: 'pkce'
    },
    
    // 🆕 Global settings
    global: {
      headers: {
        'X-Client-Info': 'hrinno-web-app'
      }
    }
  }
);

// 🆕 Optional: Helper function to check if session is valid
export const isSessionValid = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }
    
    return !!session;
  } catch (err) {
    console.error('Failed to validate session:', err);
    return false;
  }
};

// 🆕 Optional: Helper to force session refresh
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
    
    return data.session;
  } catch (err) {
    console.error('Session refresh error:', err);
    return null;
  }
};
```
</details>

---

## `lib/supabaseServerClient.ts`

```
Folder: lib
Type: ts | Lines:        6
Top definitions:
--- Exports ---
export function createServerClient() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (       6 lines)</summary>

```ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function createServerClient() {
  return createServerComponentClient({ cookies: () => cookies() }) // ⬅️ bien une fonction !
}
```
</details>

---

## `lib/parsePdf.ts`

```
Folder: lib
Type: ts | Lines:        9
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (       9 lines)</summary>

```ts
import pdfParse from 'pdf-parse';

process.env.DEBUG= 'false';
process.env.NODE_DEBUG = '';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Just parse the buffer without accessing filesystem
  const data = await pdfParse(buffer);
  return data.text;
}
```
</details>

---

## `lib/email-service.ts`

```
Folder: lib
Type: ts | Lines:      421
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const resend = new Resend(process.env.RESEND_API_KEY)
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string
interface SendInterviewInvitationParams {
interface SendInterviewCancellationParams {
```

<details>
<summary>📄 Preview (first 100 lines of      421)</summary>

```ts
// lib/email-service.ts

import { Resend } from 'resend'
import { generateICS } from './ics-generator'
import { generateInterviewEmail } from './email-templates'
import { sendEmailWithCompanySMTP } from './smtp-mailer'

const resend = new Resend(process.env.RESEND_API_KEY)

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

interface SendInterviewInvitationParams {
  candidate: {
    email: string
    firstName: string
    lastName: string
  }
  recruiter: {
    email: string
    firstName: string
    lastName: string
  }
  position: {
    title: string
  }
  interview: {
    datetime: Date
    location: string
    durationMinutes?: number
  }
  companyId: number // Added: to fetch company SMTP settings
  t?: TranslationFunction // Optional translation function
}

interface SendInterviewCancellationParams {
  candidate: {
    email: string
    firstName: string
    lastName: string
  }
  recruiter: {
    firstName: string
    lastName: string
  }
  position: {
    title: string
  }
  interview: {
    datetime: Date
    location: string
    durationMinutes?: number
  }
  companyId: number // Added: to fetch company SMTP settings
  t?: TranslationFunction // Optional translation function
}

export async function sendInterviewCancellation(params: SendInterviewCancellationParams) {
  const { candidate, recruiter, position, interview, companyId, t } = params

  // Fallback translation function if none provided
  const translate: TranslationFunction = t || ((key, params) => {
    // Default English fallbacks
    const defaults: Record<string, string> = {
      'emailService.cancellation.subject': `Interview Cancelled - ${params?.positionTitle}`,
      'emailService.cancellation.title': 'Interview Cancelled',
      'emailService.cancellation.greeting': `Dear ${params?.candidateName},`,
      'emailService.cancellation.body': `We regret to inform you that your interview for the position of <strong>${params?.positionTitle}</strong> has been cancelled.`,
      'emailService.cancellation.cancelledDate': '📅 Cancelled Date:',
      'emailService.cancellation.cancelledTime': '⏰ Cancelled Time:',
      'emailService.cancellation.contactInfo': `If you have any questions, please feel free to contact ${params?.recruiterName}.`,
      'emailService.cancellation.closing': 'Thank you for your understanding,',
      'emailService.cancellation.footer': 'Sent via HRInno Interview Scheduler',
      'emailService.cancellation.icsDescription': 'This interview has been cancelled.',
      'emailService.cancellation.icsSummary': `CANCELLED: Interview - ${params?.positionTitle}`,
      'emailService.from.interviews': 'HRInno Interviews',
      'emailService.invitation.icsFilenameCancelled': 'interview-cancelled.ics',
    }
    return defaults[key] || key
  })

  const candidateName = `${candidate.firstName} ${candidate.lastName}`
  const recruiterName = `${recruiter.firstName} ${recruiter.lastName}`
  
  const duration = interview.durationMinutes || 60
  const endTime = new Date(interview.datetime.getTime() + duration * 60000)

  const interviewDate = interview.datetime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const interviewTime = interview.datetime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  // Generate CANCELLED ICS file (with STATUS:CANCELLED)
... (truncated,      421 total lines)
```
</details>

---

## `lib/runPayrollValidation.ts`

```
Folder: lib
Type: ts | Lines:      183
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
type PayrollValidationContext = {
type ValidationIssue = {
```

<details>
<summary>📄 Full content (     183 lines)</summary>

```ts
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
```
</details>

---

## `lib/payrollExportUtils.ts`

```
Folder: lib
Type: ts | Lines:      492
Top definitions:
--- Exports ---
export function generatePayrollExcel(options: ExportOptions): Blob {
export function downloadPayrollExcel(blob: Blob, fileName: string) {

--- Key Functions/Components ---
interface ExportOptions {
function addGenericSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
function addAllowancesDetailSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
function addDeductionsDetailSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
function addKulcsSoftSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
function addNexonSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
function addSAPSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
function formatAllowanceType(type: string): string {
function formatDeductionType(type: string): string {
function formatTaxTreatment(treatment: string): string {
function hashCode(str: string): number {
```

<details>
<summary>📄 Preview (first 100 lines of      492)</summary>

```ts
// lib/payrollExportUtils.ts
// Client-side utilities for generating payroll Excel exports

import * as XLSX from 'xlsx';
import type { PayrollExportData, ExportFormat } from '../types/payroll';

interface ExportOptions {
  format: ExportFormat;
  month: number;
  year: number;
  data: PayrollExportData[];
}

/**
 * Generate Excel file for payroll export
 */
export function generatePayrollExcel(options: ExportOptions): Blob {
  const { format, month, year, data } = options;
  
  const workbook = XLSX.utils.book_new();
  
  switch (format) {
    case 'generic':
      addGenericSheet(workbook, data, month, year);
      break;
    case 'kulcs_soft':
      addKulcsSoftSheet(workbook, data, month, year);
      break;
    case 'nexon':
      addNexonSheet(workbook, data, month, year);
      break;
    case 'sap':
      addSAPSheet(workbook, data, month, year);
      break;
    default:
      // Add all formats
      addGenericSheet(workbook, data, month, year);
      addKulcsSoftSheet(workbook, data, month, year);
      addNexonSheet(workbook, data, month, year);
      addSAPSheet(workbook, data, month, year);
  }
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Generic format - human-readable with compensation details
 */
function addGenericSheet(workbook: XLSX.WorkBook, data: PayrollExportData[], month: number, year: number) {
  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });
  
  // Prepare data for sheet
  const sheetData : (string | number)[][] = [
    [`Payroll Export - ${monthName} ${year}`],
    [],
    [
      'Employee ID', 'Last Name', 'First Name', 'TAJ Number', 'Tax ID',
      'Position', 'Department', 'Employment Type', 'Contract Type',
      'Base Salary (HUF)', 'Total Allowances', 'Taxable Allowances', 'Non-Taxable Allowances',
      'Total Deductions', 'Gross Total', 'Net Before Tax',
      'Currency', 'Bank IBAN', 'Bank Name',
      'Worked Days', 'Leave Days', 'Actual Worked Days', 'Weekly Hours'
    ]
  ];
  
  data.forEach(emp => {
    const countryData = emp.country_specific_data || {};
    sheetData.push([
      emp.user_id,
      emp.user_lastname,
      emp.user_firstname,
      countryData.taj_number || '',
      countryData.tax_id || '',
      emp.position_title,
      emp.department || '',
      emp.employment_type,
      emp.contract_type,
      Number(emp.salary_amount) || 0,
      Number(emp.total_allowances) || 0,
      Number(emp.taxable_allowances) || 0,
      Number(emp.non_taxable_allowances) || 0,
      Number(emp.total_deductions) || 0,
      Number(emp.gross_total) || Number(emp.salary_amount) || 0,
      Number(emp.net_before_tax) || Number(emp.salary_amount) || 0,
      emp.salary_currency,
      emp.bank_account_iban || '',
      emp.bank_name || '',
      Number(emp.worked_days) || 0,
      Number(emp.leave_days) || 0,
      Number(emp.actual_worked_days) || 0,
      Number(emp.weekly_hours) || 0
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  worksheet['!cols'] = [
... (truncated,      492 total lines)
```
</details>

---

## `lib/ocr.ts`

```
Folder: lib
Type: ts | Lines:       10
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      10 lines)</summary>

```ts
// lib/ocr.ts
import Tesseract from "tesseract.js";
import fs from "fs";

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(buffer, "eng", {
    logger: m => console.log("OCR:", m.status, m.progress),
  });
  return data.text;
}
```
</details>

---

## `lib/prompts.ts`

```
Folder: lib
Type: ts | Lines:      261
Top definitions:
--- Exports ---
export class PromptNotFoundError extends Error {
export class PromptDatabaseError extends Error {
export function fillPromptVariables(
export function clearPromptCache(): void {

--- Key Functions/Components ---
const supabase = createClient(
interface PromptData {
const promptCache = new Map<string, { data: PromptData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

<details>
<summary>📄 Full content (     261 lines)</summary>

```ts
// lib/prompts.ts
/**
 * Centralized utility for managing AI prompts from Supabase
 * All AI prompts are stored in the database with version control
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Error thrown when a prompt cannot be retrieved
 */
export class PromptNotFoundError extends Error {
  constructor(promptName: string) {
    super(`AI tool is currently unavailable. Prompt '${promptName}' not found in database.`);
    this.name = 'PromptNotFoundError';
  }
}

/**
 * Error thrown when database connection fails
 */
export class PromptDatabaseError extends Error {
  constructor(message: string) {
    super(`AI tool is currently unavailable. Database error: ${message}`);
    this.name = 'PromptDatabaseError';
  }
}

/**
 * Interface for prompt data from database
 */
interface PromptData {
  id: string;
  name: string;
  description: string;
  prompt_text: string;
  variables: string[] | null;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

/**
 * Cache to store frequently used prompts (optional optimization)
 */
const promptCache = new Map<string, { data: PromptData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches a prompt from the database by name
 * 
 * @param promptName - The unique name of the prompt (e.g., 'cv_analysis_combined')
 * @param useCache - Whether to use cached version (default: true)
 * @returns The prompt template text with ${variable} placeholders
 * @throws PromptNotFoundError if prompt doesn't exist or is inactive
 * @throws PromptDatabaseError if database query fails
 */
export async function getPrompt(
  promptName: string, 
  useCache: boolean = true
): Promise<string> {
  try {
    // Check cache first
    if (useCache) {
      const cached = promptCache.get(promptName);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[Prompts] Using cached prompt: ${promptName}`);
        return cached.data.prompt_text;
      }
    }

    console.log(`[Prompts] Fetching prompt from database: ${promptName}`);

    // Fetch from database
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', promptName)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`[Prompts] Database error for '${promptName}':`, error);
      throw new PromptDatabaseError(error.message);
    }

    if (!data) {
      console.error(`[Prompts] Prompt not found: ${promptName}`);
      throw new PromptNotFoundError(promptName);
    }

    // Cache the result
    promptCache.set(promptName, {
      data: data as PromptData,
      timestamp: Date.now()
    });

    console.log(`[Prompts] Successfully loaded prompt: ${promptName} (v${data.version})`);
    return data.prompt_text;

  } catch (error) {
    // Re-throw our custom errors
    if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
      throw error;
    }

    // Wrap unexpected errors
    console.error(`[Prompts] Unexpected error fetching prompt '${promptName}':`, error);
    throw new PromptDatabaseError('Unexpected error occurred');
  }
}

/**
 * Fetches multiple prompts at once for better performance
 * 
 * @param promptNames - Array of prompt names to fetch
 * @returns Object mapping prompt names to their template text
 * @throws PromptDatabaseError if any prompt fails to load
 */
export async function getPrompts(promptNames: string[]): Promise<Record<string, string>> {
  try {
    console.log(`[Prompts] Fetching ${promptNames.length} prompts:`, promptNames);

    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .in('name', promptNames)
      .eq('is_active', true);

    if (error) {
      console.error('[Prompts] Database error fetching multiple prompts:', error);
      throw new PromptDatabaseError(error.message);
    }

    if (!data || data.length === 0) {
      throw new PromptDatabaseError('No prompts found');
    }

    // Check if all requested prompts were found
    const foundNames = new Set(data.map(p => p.name));
    const missingPrompts = promptNames.filter(name => !foundNames.has(name));
    
    if (missingPrompts.length > 0) {
      throw new PromptNotFoundError(missingPrompts.join(', '));
    }

    // Create result object and cache
    const result: Record<string, string> = {};
    data.forEach((prompt: PromptData) => {
      result[prompt.name] = prompt.prompt_text;
      
      // Cache individual prompts
      promptCache.set(prompt.name, {
        data: prompt,
        timestamp: Date.now()
      });
    });

    console.log(`[Prompts] Successfully loaded ${data.length} prompts`);
    return result;

  } catch (error) {
    if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
      throw error;
    }
    
    console.error('[Prompts] Unexpected error fetching multiple prompts:', error);
    throw new PromptDatabaseError('Unexpected error occurred');
  }
}

/**
 * Replaces ${variable} placeholders in a prompt template with actual values
 * 
 * @param template - The prompt template with ${variable} placeholders
 * @param variables - Object containing variable values
 * @returns Prompt with all variables replaced
 * 
 * @example
 * const prompt = await getPrompt('cv_analysis_combined');
 * const filled = fillPromptVariables(prompt, {
 *   cvText: "John Doe's CV...",
 *   jobDescription: "Senior Developer position..."
 * });
 */
export function fillPromptVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  
  // Replace each ${variable} with its value
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `\${${key}}`;
    result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
  });

  return result;
}

/**
 * Clears the prompt cache (useful for testing or forcing refresh)
 */
export function clearPromptCache(): void {
  promptCache.clear();
  console.log('[Prompts] Cache cleared');
}

/**
 * Gets prompt metadata without caching (useful for admin purposes)
 * 
 * @param promptName - The unique name of the prompt
 * @returns Full prompt metadata including version, dates, etc.
 */
export async function getPromptMetadata(promptName: string): Promise<PromptData | null> {
  try {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('name', promptName)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PromptData;
  } catch (error) {
    console.error(`[Prompts] Error fetching metadata for '${promptName}':`, error);
    return null;
  }
}

/**
 * Lists all available active prompts
 * 
 * @returns Array of prompt names and descriptions
 */
export async function listPrompts(): Promise<Array<{ name: string; description: string; version: number }>> {
  try {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('name, description, version')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new PromptDatabaseError(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('[Prompts] Error listing prompts:', error);
    return [];
  }
}
```
</details>

---

## `lib/ics-generator.ts`

```
Folder: lib
Type: ts | Lines:      100
Top definitions:
--- Exports ---
export function generateICS(event: ICSEvent): string {
export function isURL(str: string): boolean {
export function formatLocation(location: string): {

--- Key Functions/Components ---
interface ICSEvent {
```

<details>
<summary>📄 Full content (     100 lines)</summary>

```ts
// lib/ics-generator.ts

/**
 * Generate an ICS (iCalendar) file for email attachments
 * Compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */

interface ICSEvent {
  title: string
  description: string
  location: string
  startTime: Date
  endTime: Date
  organizerEmail: string
  organizerName: string
  attendeeEmail: string
  attendeeName: string
}

export function generateICS(event: ICSEvent): string {
  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  }

  const now = new Date()
  const uid = `${now.getTime()}@hrinno.hu`

  // Escape special characters for ICS format
  const escape = (str: string): string => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HRInno//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(now)}`,
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(event.description)}`,
    `LOCATION:${escape(event.location)}`,
    `ORGANIZER;CN=${escape(event.organizerName)}:mailto:${event.organizerEmail}`,
    `ATTENDEE;CN=${escape(event.attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Interview reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return ics
}

/**
 * Detect if location is a URL (meeting link)
 */
export function isURL(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Format location for display
 */
export function formatLocation(location: string): {
  isVirtual: boolean
  displayText: string
  link?: string
} {
  if (isURL(location)) {
    return {
      isVirtual: true,
      displayText: 'Virtual Meeting',
      link: location,
    }
  }
  return {
    isVirtual: false,
    displayText: location,
  }
}
```
</details>

---

## `lib/smtp-mailer.ts`

```
Folder: lib
Type: ts | Lines:      124
Top definitions:
--- Exports ---

--- Key Functions/Components ---
interface CompanyEmailSettings {
interface SendEmailParams {
```

<details>
<summary>📄 Full content (     124 lines)</summary>

```ts
// lib/smtp-mailer.ts
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'
import { decryptPassword } from './encryption'

interface CompanyEmailSettings {
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  smtp_username: string
  smtp_password_encrypted: string
  from_name: string | null
  from_email: string
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: string
  }>
}

/**
 * Get company email settings from database
 */
async function getCompanyEmailSettings(companyId: number): Promise<CompanyEmailSettings | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('company_email_settings')
    .select('*')
    .eq('company_id', companyId)
    .single()

  if (error || !data) {
    return null
  }

  return data as CompanyEmailSettings
}

/**
 * Send email using company's SMTP settings or fallback to Resend
 */
export async function sendEmailWithCompanySMTP(
  companyId: number,
  emailParams: SendEmailParams
): Promise<{ success: boolean; emailId?: string; provider: 'company-smtp' | 'resend' }> {
  
  // Try to get company email settings
  const companySettings = await getCompanyEmailSettings(companyId)

  if (companySettings) {
    // Use company SMTP
    try {
      console.log(`📧 Sending email via company SMTP (${companySettings.smtp_host})`)
      
      // Decrypt password
      const decryptedPassword = decryptPassword(companySettings.smtp_password_encrypted)

            console.log('SMTP Config:', {
        host: companySettings.smtp_host,
        port: companySettings.smtp_port,
        secure: companySettings.smtp_secure,
        username: companySettings.smtp_username,
        passwordLength: decryptPassword(companySettings.smtp_password_encrypted)?.length,
        });



      // Create transporter with company settings
      const transporter = nodemailer.createTransport({
        host: companySettings.smtp_host,
        port: companySettings.smtp_port,
        secure: companySettings.smtp_secure, // true for 465, false for other ports
        auth: {
          user: companySettings.smtp_username,
          pass: decryptedPassword,
        },
      })

      // Prepare from address
      const fromAddress = companySettings.from_name
        ? `${companySettings.from_name} <${companySettings.from_email}>`
        : companySettings.from_email

      // Prepare attachments for nodemailer
      const attachments = emailParams.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64',
      }))

      // Send email
      const info = await transporter.sendMail({
        from: fromAddress,
        to: emailParams.to,
        subject: emailParams.subject,
        html: emailParams.html,
        attachments,
      })

      console.log('✅ Email sent via company SMTP:', info.messageId)

      return {
        success: true,
        emailId: info.messageId,
        provider: 'company-smtp',
      }
    } catch (error) {
      console.error('❌ Failed to send email via company SMTP:', error)
      throw new Error(`Failed to send email via company SMTP: ${(error as Error).message}`)
    }
  } else {
    // No company settings found, use Resend (fallback)
    console.log('📧 No company SMTP settings found, using Resend')
    throw new Error('Company SMTP settings not configured. Please configure email settings or use Resend directly.')
  }
}
```
</details>

---

## `lib/encryption.ts`

```
Folder: lib
Type: ts | Lines:       98
Top definitions:
--- Exports ---
export function encryptPassword(password: string): string {
export function decryptPassword(encryptedPassword: string): string {
export function generateEncryptionKey(): string {

--- Key Functions/Components ---
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH
function getEncryptionKey(): Buffer {
```

<details>
<summary>📄 Full content (      98 lines)</summary>

```ts
// lib/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const TAG_POSITION = SALT_LENGTH + IV_LENGTH
const ENCRYPTED_POSITION = TAG_POSITION + TAG_LENGTH

/**
 * Get encryption key from environment variable
 * The key should be a 64-character hex string (32 bytes)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 characters (32 bytes in hex)')
  }
  
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a password using AES-256-GCM
 * Returns a base64 encoded string containing: salt + iv + auth tag + encrypted data
 */
export function encryptPassword(password: string): string {
  const key = getEncryptionKey()
  
  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  // Derive key using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512')
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)
  
  // Encrypt the password
  const encrypted = Buffer.concat([
    cipher.update(password, 'utf8'),
    cipher.final(),
  ])
  
  // Get authentication tag
  const tag = cipher.getAuthTag()
  
  // Combine: salt + iv + tag + encrypted data
  const result = Buffer.concat([salt, iv, tag, encrypted])
  
  // Return as base64
  return result.toString('base64')
}

/**
 * Decrypt a password that was encrypted with encryptPassword
 */
export function decryptPassword(encryptedPassword: string): string {
  const key = getEncryptionKey()
  
  // Decode from base64
  const data = Buffer.from(encryptedPassword, 'base64')
  
  // Extract components
  const salt = data.subarray(0, SALT_LENGTH)
  const iv = data.subarray(SALT_LENGTH, TAG_POSITION)
  const tag = data.subarray(TAG_POSITION, ENCRYPTED_POSITION)
  const encrypted = data.subarray(ENCRYPTED_POSITION)
  
  // Derive key using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, 'sha512')
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv)
  decipher.setAuthTag(tag)
  
  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])
  
  return decrypted.toString('utf8')
}

/**
 * Generate a new encryption key (for initial setup)
 * Run this once and add the output to your .env.local file
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
```
</details>

---

## `lib/parsePdfSafe.ts`

```
Folder: lib
Type: ts | Lines:      118
Top definitions:
--- Exports ---
export default parsePdfBuffer;

--- Key Functions/Components ---
function extractTextFromPdfBuffer(buffer: Buffer): string {
```

<details>
<summary>📄 Full content (     118 lines)</summary>

```ts
// lib/parsePdfSafe.ts

/**
 * Simple, reliable PDF parsing using pdf-parse with fallback
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  console.log("Starting PDF parsing, buffer size:", buffer.length);
  
  // Try pdf-parse first
  try {
    const pdfParse = (await import('pdf-parse')).default;
    
    // Simple timeout wrapper
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('PDF parsing timeout')), 15000);
    });
    
    const parsePromise = pdfParse(buffer);
    
    const pdfData = await Promise.race([parsePromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    
    // Type the pdf-parse result properly
    const pdfResult = pdfData as { text: string; numpages: number };
    const extractedText = pdfResult.text?.trim() || '';
    
    if (extractedText.length > 0) {
      const limitedText = extractedText.length > 10000 
        ? extractedText.substring(0, 10000) + '...[truncated]'
        : extractedText;
        
      console.log(`pdf-parse successful - ${limitedText.length} characters`);
      return limitedText;
    }
    
    throw new Error("No text content found");

  } catch (error) {
    console.error('pdf-parse failed:', error);
    
    // Fallback: Manual text extraction
    try {
      const result = extractTextFromPdfBuffer(buffer);
      if (result.length > 20) {
        console.log(`Fallback extraction successful - ${result.length} characters`);
        return result;
      }
    } catch (fallbackError) {
      console.error('Fallback extraction failed:', fallbackError);
    }
    
    // Final fallback message
    return `CV téléchargé avec succès (${Math.round(buffer.length / 1024)} Ko)

⚠️ Extraction automatique du texte indisponible

Le fichier PDF a été sauvegardé et est accessible à l'équipe de recrutement.

Solutions pour le candidat:
• Télécharger le CV au format .txt ou .docx
• Copier-coller le contenu dans le formulaire
• Ajouter les informations clés dans la description

Statut: Fichier uploadé ✓ Sauvegardé ✓ Prêt pour révision manuelle ✓`;
  }
}

/**
 * Manual PDF text extraction fallback
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
  const pdfContent = buffer.toString('binary');
  let extractedText = '';
  
  // Look for text objects (fixed regex for older ES versions)
  const textRegex = /BT\s+([\s\S]*?)\s+ET/g;
  const matches = pdfContent.match(textRegex);
  
  if (matches) {
    for (const match of matches) {
      // Extract text from Tj operations
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(match)) !== null) {
        const text = tjMatch[1]
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .trim();
        if (text.length > 1) {
          extractedText += text + ' ';
        }
      }
    }
  }
  
  // Clean up
  extractedText = extractedText
    .replace(/\s+/g, ' ')
    .trim();
  
  // If manual extraction fails, try basic ASCII
  if (extractedText.length < 20) {
    const asciiText = buffer
      .toString('utf8')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (asciiText.length > 50) {
      return asciiText.substring(0, 3000);
    }
  }
  
  return extractedText;
}

export default parsePdfBuffer;
```
</details>

---

## `lib/email-templates.ts`

```
Folder: lib
Type: ts | Lines:      181
Top definitions:
--- Exports ---
export function generateInterviewEmail(data: InterviewEmailData): string {

--- Key Functions/Components ---
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string
interface InterviewEmailData {
```

<details>
<summary>📄 Full content (     181 lines)</summary>

```ts
// lib/email-templates.ts

import { formatLocation } from './ics-generator'

// Translation function type
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string

interface InterviewEmailData {
  candidateName: string
  recruiterName: string
  positionTitle: string
  interviewDate: string
  interviewTime: string
  location: string
  isForCandidate: boolean
  t?: TranslationFunction // Optional translation function
}

export function generateInterviewEmail(data: InterviewEmailData): string {
  // Fallback translation function if none provided
  const translate: TranslationFunction = data.t || ((key, params) => {
    // Default English fallbacks
    const defaults: Record<string, string> = {
      'emailTemplates.candidate.title': 'Interview Invitation',
      'emailTemplates.candidate.greeting': `Dear ${params?.candidateName},`,
      'emailTemplates.candidate.body': `You have been invited for an interview for the position of <strong>${params?.positionTitle}</strong> with ${params?.recruiterName}.`,
      'emailTemplates.candidate.date': '📅 Date:',
      'emailTemplates.candidate.time': '⏰ Time:',
      'emailTemplates.candidate.locationPhysical': '📍 Location:',
      'emailTemplates.candidate.locationVirtual': '🔗 Location:',
      'emailTemplates.candidate.calendarInfo': 'A calendar invitation has been attached to this email. Please accept it to add this interview to your calendar.',
      'emailTemplates.candidate.contactInfo': `If you have any questions or need to reschedule, please contact ${params?.recruiterName}.`,
      'emailTemplates.candidate.closing': 'Best regards,',
      'emailTemplates.candidate.footer': 'Sent via HRInno Interview Scheduler',
      'emailTemplates.recruiter.title': 'Interview Scheduled',
      'emailTemplates.recruiter.greeting': `Hi ${params?.recruiterName},`,
      'emailTemplates.recruiter.body': `Your interview with <strong>${params?.candidateName}</strong> for the position of <strong>${params?.positionTitle}</strong> has been scheduled.`,
      'emailTemplates.recruiter.candidateLabel': '👤 Candidate:',
      'emailTemplates.recruiter.date': '📅 Date:',
      'emailTemplates.recruiter.time': '⏰ Time:',
      'emailTemplates.recruiter.locationPhysical': '📍 Location:',
      'emailTemplates.recruiter.locationVirtual': '🔗 Location:',
      'emailTemplates.recruiter.notification': 'The candidate has been notified and will receive a calendar invitation. A copy has been added to your calendar as well.',
      'emailTemplates.recruiter.goodLuck': 'Good luck with the interview!',
      'emailTemplates.recruiter.footer': 'Sent via HRInno Interview Scheduler',
    }
    return defaults[key] || key
  })

  const locationInfo = formatLocation(data.location)
  const locationHTML = locationInfo.isVirtual
    ? `<a href="${locationInfo.link}" style="color: #4F46E5; text-decoration: none;">${locationInfo.displayText}</a>`
    : locationInfo.displayText

  if (data.isForCandidate) {
    // Email for candidate
    const locationKey = locationInfo.isVirtual 
      ? 'emailTemplates.candidate.locationVirtual'
      : 'emailTemplates.candidate.locationPhysical'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${translate('emailTemplates.candidate.title')}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">${translate('emailTemplates.candidate.greeting', { candidateName: data.candidateName })}</p>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.candidate.body', { 
        positionTitle: data.positionTitle,
        recruiterName: data.recruiterName 
      })}
    </p>
    
    <div style="background: #f9fafb; border-left: 4px solid #4F46E5; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.candidate.date')}</strong> ${data.interviewDate}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.candidate.time')}</strong> ${data.interviewTime}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate(locationKey)}</strong> ${locationHTML}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.candidate.calendarInfo')}
    </p>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.candidate.contactInfo', { recruiterName: data.recruiterName })}
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      ${translate('emailTemplates.candidate.closing')}<br>
      <strong>${data.recruiterName}</strong>
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">${translate('emailTemplates.candidate.footer')}</p>
  </div>
  
</body>
</html>
`
  } else {
    // Email for recruiter (confirmation)
    const locationKey = locationInfo.isVirtual 
      ? 'emailTemplates.recruiter.locationVirtual'
      : 'emailTemplates.recruiter.locationPhysical'

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${translate('emailTemplates.recruiter.title')}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    
    <p style="font-size: 16px; margin-top: 0;">${translate('emailTemplates.recruiter.greeting', { recruiterName: data.recruiterName })}</p>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.recruiter.body', { 
        candidateName: data.candidateName,
        positionTitle: data.positionTitle 
      })}
    </p>
    
    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.recruiter.candidateLabel')}</strong> ${data.candidateName}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.recruiter.date')}</strong> ${data.interviewDate}
      </p>
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate('emailTemplates.recruiter.time')}</strong> ${data.interviewTime}
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        <strong style="color: #111827;">${translate(locationKey)}</strong> ${locationHTML}
      </p>
    </div>
    
    <p style="font-size: 16px;">
      ${translate('emailTemplates.recruiter.notification')}
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      ${translate('emailTemplates.recruiter.goodLuck')}
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">${translate('emailTemplates.recruiter.footer')}</p>
  </div>
  
</body>
</html>
`
  }
}
```
</details>

---

## `utils/formatDate.ts`

```
Folder: utils
Type: ts | Lines:       31
Top definitions:
--- Exports ---
export const formatDate = (dateString: string) => {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      31 lines)</summary>

```ts
// File: utils/formatDate.ts

/**
 * Format date string to Hungarian locale format
 * Handles both ISO date strings (YYYY-MM-DD) and ISO datetime strings
 * Uses UTC to avoid timezone conversion issues
 */
export const formatDate = (dateString: string) => {
  // Parse the date string
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date string:', dateString);
    return dateString; // Return original string if invalid
  }

  // Extract year, month, day in UTC to avoid timezone issues
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Create a new date using UTC components
  const utcDate = new Date(Date.UTC(year, month, day));
  
  return utcDate.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // Force UTC interpretation
  });
};
```
</details>

---

## `utils/absenceNotifications.ts`

```
Folder: utils
Type: ts | Lines:      251
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface LeaveRequestNotificationData {
interface LeaveReviewNotificationData {
interface LeaveCancellationNotificationData {
```

<details>
<summary>📄 Full content (     251 lines)</summary>

```ts
// File: utils/absenceNotifications.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LeaveRequestNotificationData {
  leaveRequestId: string;
  userId: string;
  userName: string;
  managerId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}

interface LeaveReviewNotificationData {
  leaveRequestId: string;
  userId: string;
  managerId: string;
  managerName: string;
  leaveTypeName: string;
  status: 'approved' | 'rejected';
  reviewNotes?: string;
}

interface LeaveCancellationNotificationData {
  leaveRequestId: string;
  userId: string;
  userName: string;
  managerId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}

/**
 * Verify that a user exists in the users table
 */
async function verifyUserExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error(`User ${userId} not found in users table:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Error verifying user ${userId}:`, err);
    return false;
  }
}

/**
 * Create notification when a user submits a leave request
 */
export async function createLeaveRequestNotification(data: LeaveRequestNotificationData) {
  try {
    // Verify both sender and recipient exist
    const [senderExists, recipientExists] = await Promise.all([
      verifyUserExists(data.userId),
      verifyUserExists(data.managerId)
    ]);

    if (!senderExists) {
      console.error(`Cannot create notification: sender ${data.userId} does not exist`);
      return { success: false, error: 'Sender user not found' };
    }

    if (!recipientExists) {
      console.error(`Cannot create notification: recipient ${data.managerId} does not exist`);
      return { success: false, error: 'Recipient user not found' };
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        type: 'leave_request_created',
        title: 'New Leave Request',
        message: `${data.userName} requested ${data.leaveTypeName} from ${data.startDate} to ${data.endDate} (${data.totalDays} day${data.totalDays !== 1 ? 's' : ''})`,
        leave_request_id: data.leaveRequestId,
        sender_id: data.userId,
        recipient_id: data.managerId,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating leave request notification:', error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to create leave request notification:', err);
    return { success: false, error: err };
  }
}

/**
 * Create notification when a manager approves or rejects a leave request
 */
export async function createLeaveReviewNotification(data: LeaveReviewNotificationData) {
  try {
    // Verify both sender and recipient exist
    const [senderExists, recipientExists] = await Promise.all([
      verifyUserExists(data.managerId),
      verifyUserExists(data.userId)
    ]);

    if (!senderExists) {
      console.error(`Cannot create notification: sender (manager) ${data.managerId} does not exist`);
      return { success: false, error: 'Sender (manager) user not found' };
    }

    if (!recipientExists) {
      console.error(`Cannot create notification: recipient (employee) ${data.userId} does not exist`);
      return { success: false, error: 'Recipient (employee) user not found' };
    }

    const isApproved = data.status === 'approved';
    const title = isApproved ? 'Leave Request Approved' : 'Leave Request Rejected';
    const emoji = isApproved ? '✅' : '❌';
    
    let message = `${emoji} Your ${data.leaveTypeName} request has been ${data.status} by ${data.managerName}`;
    if (data.reviewNotes) {
      message += `. Note: ${data.reviewNotes}`;
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        type: `leave_request_${data.status}`,
        title,
        message,
        leave_request_id: data.leaveRequestId,
        sender_id: data.managerId,
        recipient_id: data.userId,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating leave review notification:', error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to create leave review notification:', err);
    return { success: false, error: err };
  }
}

/**
 * Create notification when a user cancels their leave request
 */
export async function createLeaveCancellationNotification(data: LeaveCancellationNotificationData) {
  try {
    // Verify both sender and recipient exist
    const [senderExists, recipientExists] = await Promise.all([
      verifyUserExists(data.userId),
      verifyUserExists(data.managerId)
    ]);

    if (!senderExists) {
      console.error(`Cannot create notification: sender ${data.userId} does not exist`);
      return { success: false, error: 'Sender user not found' };
    }

    if (!recipientExists) {
      console.error(`Cannot create notification: recipient ${data.managerId} does not exist`);
      return { success: false, error: 'Recipient user not found' };
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        type: 'leave_request_cancelled',
        title: 'Leave Request Cancelled',
        message: `${data.userName} has cancelled their ${data.leaveTypeName} request from ${data.startDate} to ${data.endDate} (${data.totalDays} day${data.totalDays !== 1 ? 's' : ''})`,
        leave_request_id: data.leaveRequestId,
        sender_id: data.userId,
        recipient_id: data.managerId,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating cancellation notification:', error);
      throw error;
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to create cancellation notification:', err);
    return { success: false, error: err };
  }
}

/**
 * Get manager info for a user
 */
export async function getUserManager(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('manager_id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { managerId: data?.manager_id, error: null };
  } catch (err) {
    console.error('Error fetching user manager:', err);
    return { managerId: null, error: err };
  }
}

/**
 * Get user's full name
 */
export async function getUserName(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_firstname, user_lastname')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Construct full name from firstname and lastname
    const fullName = data?.user_firstname && data?.user_lastname
      ? `${data.user_firstname} ${data.user_lastname}`.trim()
      : data?.user_firstname || data?.user_lastname || 'User';
    
    return { name: fullName, error: null };
  } catch (err) {
    console.error('Error fetching user name:', err);
    return { name: 'User', error: err };
  }
}
```
</details>

---

---

# Statistics
- **Files included:** 150
- **File size:** 648K
- **Extraction date:** Sun Feb 15 15:29:10 CET 2026

# Technology Stack Detected

## Frontend/Framework
    next: ^15.5.7
    react: ^19.2.1

## Backend/API

## Database

## AI/ML Libraries
    openai: ^5.11.0

# Key Folder Overview

```
```

---

# Feature Extraction Summary

Based on this codebase, here are the detected features:

## API Endpoints
```
src/app/api/analyse-cv/route.ts
src/app/api/analyse-massive/route.ts
src/app/api/candidate-count/route.ts
src/app/api/close/route.ts
src/app/api/company-email-settings/route.ts
src/app/api/contact-submissions/route.ts
src/app/api/contact/route.ts
src/app/api/feedback/route.ts
src/app/api/happiness/chat/route.ts
src/app/api/happiness/dashboard/route.ts
src/app/api/happiness/session/route.ts
src/app/api/import-users/route.ts
src/app/api/interview-assistant/route.ts
src/app/api/interviews/route.ts
src/app/api/medical-certificates/confirm/route.ts
src/app/api/medical-certificates/upload/route.ts
src/app/api/new-position/route.ts
src/app/api/notifications/email/route.ts
src/app/api/notifications/email/types.ts
src/app/api/payroll/[id]/route.ts
src/app/api/payroll/allowances/[id]/route.ts
src/app/api/payroll/allowances/route.ts
src/app/api/payroll/bulk/route.ts
src/app/api/payroll/by-user/[userId]/route.ts
src/app/api/payroll/deductions/route.ts
src/app/api/payroll/export/route.ts
src/app/api/payroll/grid/route.ts
src/app/api/payroll/periods/close/route.ts
src/app/api/payroll/periods/status/route.ts
src/app/api/payroll/route.ts
src/app/api/performance/goals/create/route.ts
src/app/api/performance/goals/route.ts
src/app/api/performance/goals/update/route.ts
src/app/api/performance/pulse/submit/route.ts
src/app/api/positions-private/route.ts
src/app/api/positions-public/route.ts
src/app/api/positions/analytics.ts
src/app/api/positions/list.ts
src/app/api/recruitment-step/route.ts
src/app/api/stats/route/[positionId]/route.ts
src/app/api/stripe/create-credit-session/route.ts
src/app/api/stripe/create-portal-session/route.ts
src/app/api/stripe/create-subscription/route.ts
src/app/api/stripe/prices/route.ts
src/app/api/stripe/subscription-cancel/route.ts
src/app/api/stripe/subscription/route.ts
src/app/api/stripe/webhook/route.ts
src/app/api/tickets/upload/route.ts
src/app/api/timeclock/manager/route.ts
src/app/api/timeclock/route.ts
src/app/api/update-comment/route.ts
src/app/api/update-next-step/route.ts
src/app/api/user-role/route.ts
src/app/api/users/update-manager/route.ts
src/app/api/users/update-status/route.ts
src/app/api/users/users-creation/route.ts
```

## User-Facing Pages
```
src/app/ObsoleteHome/page.tsx
src/app/jobs/[slug]/Home/page.tsx
src/app/jobs/[slug]/absences/calendar/page.tsx
src/app/jobs/[slug]/absences/page.tsx
src/app/jobs/[slug]/admin/import-users/page.tsx
src/app/jobs/[slug]/contact-submissions/page.tsx
src/app/jobs/[slug]/contact/page.tsx
src/app/jobs/[slug]/cookies/page.tsx
src/app/jobs/[slug]/cv-analyse/page.tsx
src/app/jobs/[slug]/feedback/page.tsx
src/app/jobs/[slug]/happiness-check/page.tsx
src/app/jobs/[slug]/happiness-dashboard/page.tsx
src/app/jobs/[slug]/impressum-demo/page.tsx
src/app/jobs/[slug]/medical-certificate/download/page.tsx
src/app/jobs/[slug]/medical-certificate/list/page.tsx
src/app/jobs/[slug]/medical-certificate/upload/page.tsx
src/app/jobs/[slug]/openedpositions/analytics/page.tsx
src/app/jobs/[slug]/openedpositions/new/page.tsx
src/app/jobs/[slug]/openedpositions/page.tsx
src/app/jobs/[slug]/page.tsx
src/app/jobs/[slug]/payroll/employee/[employeeId]/page.tsx
src/app/jobs/[slug]/payroll/page.tsx
src/app/jobs/[slug]/performance/goals/[goalId]/page.tsx
src/app/jobs/[slug]/performance/goals/new/page.tsx
src/app/jobs/[slug]/performance/page.tsx
src/app/jobs/[slug]/performance/pulse/page.tsx
src/app/jobs/[slug]/performance/team/page.tsx
src/app/jobs/[slug]/privacy-demo/page.tsx
src/app/jobs/[slug]/stats/page.tsx
src/app/jobs/[slug]/subscription/page.tsx
src/app/jobs/[slug]/terms-demo/page.tsx
src/app/jobs/[slug]/tickets/[ticketId]/page.tsx
src/app/jobs/[slug]/tickets/create/page.tsx
src/app/jobs/[slug]/tickets/page.tsx
src/app/jobs/[slug]/time-clock/manager/page.tsx
src/app/jobs/[slug]/time-clock/page.tsx
src/app/jobs/[slug]/users-creation/page.tsx
src/app/page.tsx
src/app/reset-password/page.tsx
```

## Components
```
components
components/absence
components/absence/Calendar
components/header
components/payroll
components/timeclock
```

---

# What's Included
✅ **Config files** - Complete project setup  
✅ **Database schema** - All SQL definitions  
✅ **Type definitions** - Domain models  
✅ **ALL API routes** - Every endpoint with full/preview code  
✅ **ALL Components** - Every feature component  
✅ **Main pages** - User flows  
✅ **Services/Utils** - Business logic  

# What's Excluded
❌ node_modules, build artifacts  
❌ Test files (*.test.ts, *.spec.ts)  
❌ Type definitions (*.d.ts)  
❌ Files exceeding 300 lines (preview shown)

# AI Analysis Prompts

Copy this file and use these prompts:

## 1. Complete Feature List
```
"Analyze this codebase and create a comprehensive list of ALL features with descriptions. Group by: HR Management, Recruitment, Employee Tools, Admin Features, and AI/Automation capabilities."
```

## 2. Technical Documentation
```
"Create technical documentation covering: architecture, API endpoints, data models, and integration points."
```

## 3. Sales Pitch (5 slides)
```
"Create a 5-slide sales pitch for Hungarian SMEs (10-50 employees) highlighting the unique features and ROI."
```

## 4. Competitive Analysis
```
"Compare this HR system to competitors (BambooHR, Gusto, Personio). What are the unique differentiators?"
```

## 5. Pricing Strategy
```
"Suggest a tiered pricing strategy based on features, target market (Hungarian SMEs), and value delivered."
```

## 6. Go-to-Market Strategy
```
"Develop a 6-month go-to-market plan for the Hungarian market including: positioning, channels, messaging, and milestones."
```

