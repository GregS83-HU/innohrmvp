# Codebase - innohrmvp
**Mode:** full-feature-extract  
**Generated:** Fri Oct 31 06:14:30 CET 2025
**Purpose:** Complete AI analysis including all APIs, components & features

---


## `package.json`

```
Folder: .
Type: json | Lines:       71
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
    "lint": "next lint"
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@stripe/react-stripe-js": "^4.0.2",
    "@stripe/stripe-js": "^7.9.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",

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
    "@vercel/speed-insights": "^1.2.0",
    "canvas": "^3.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.23.12",
    "jszip": "^3.10.1",
```

<details>
<summary>📄 Full content (      71 lines)</summary>

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
    "lint": "next lint"
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
    "@vercel/speed-insights": "^1.2.0",
    "canvas": "^3.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "file-saver": "^2.0.5",
    "framer-motion": "^12.23.12",
    "jszip": "^3.10.1",
    "lucide-react": "^0.539.0",
    "next": "^15.5.2",
    "next-intl": "^4.3.12",
    "nodemailer": "^7.0.10",
    "openai": "^5.11.0",
    "patch-package": "^8.0.0",
    "pdf-parse": "^1.1.1",
    "react": "19.1.0",
    "react-dom": "19.1.0",
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
    "eslint": "^9",
    "eslint-config-next": "15.4.5",
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
Type: ts | Lines:      322
Top definitions:
--- Exports ---
export const runtime = "nodejs";

--- Key Functions/Components ---
const supabase = createClient(
function extractAndParseJSON(rawResponse: string, context = '') {
function sanitizeFileName(filename: string) {
```

<details>
<summary>📄 Preview (first 100 lines of      322)</summary>

```ts
// src/app/api/analyse-cv/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import parsePdfBuffer from '../../../../lib/parsePdfSafe';
import { createClient } from '@supabase/supabase-js';
import { consumeCredit } from '../../../../lib/credit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Optimized API call with faster model and timeout
async function callOpenRouterAPI(prompt: string, context = '', model = 'openai/gpt-3.5-turbo') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout (increased for longer response)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000',
        'X-Title': 'CV Analysis App',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 3000, // Increased for combined analysis
      }),
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (!response.ok) {
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
        throw new Error(`API returned HTML error page for ${context}. Check API key and endpoint status.`);
      }
      throw new Error(`API call failed for ${context}: ${response.status} ${response.statusText}`);
    }

    let completion;
    try {
      completion = JSON.parse(responseText);
    } catch {
      throw new Error(`API returned invalid JSON for ${context}`);
    }

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error(`Invalid API response structure for ${context}`);
    }

    return completion.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Error in callOpenRouterAPI for ${context}:`, error);
    throw error;
  }
}

// Fallback API call with different model
async function callFallbackAPI(prompt: string, context = '') {
  try {
    // Try Claude Haiku first (fast and reliable)
    return await callOpenRouterAPI(prompt, context, 'anthropic/claude-3-haiku');
  } catch {
    // Then try Mistral Small (faster than 7b-instruct)
    return await callOpenRouterAPI(prompt, context, 'mistralai/mistral-small');
  }
}

// Robust JSON extraction
function extractAndParseJSON(rawResponse: string, context = '') {
  const trimmed = rawResponse.trim();
  
  try {
    return JSON.parse(trimmed);
  } catch {}

  // Extract first complete JSON object
  const match = trimmed.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
  if (!match) {
    console.error(`No JSON found in ${context} response:`, rawResponse);
    throw new Error(`No valid JSON found in ${context} response`);
  }

  try {
    return JSON.parse(match[0]);
  } catch (parseError) {
    console.error(`Invalid JSON in ${context} response:`, match[0]);
    throw new Error(`Invalid JSON structure in ${context} response`);
  }
}

// Sanitize filenames
... (truncated,      322 total lines)
```
</details>

---

## `src/app/api/analyse-massive/route.ts`

```
Folder: src/app/api/analyse-massive
Type: ts | Lines:      281
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
```

<details>
<summary>📄 Full content (     281 lines)</summary>

```ts
// src/app/api/analyse-massive/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { consumeCredit } from "../../../../lib/credit";

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
  const prompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Voici la description détaillée du poste ciblé:

${jobDescriptionDetailed || jobDescription}

Analyze the CV only against the provided job description with extreme rigor.
Do not guess, assume, or infer any skill, experience, or qualification that is not explicitly written in the CV.
Be critical: even a single missing core requirement should significantly lower the score.
If the CV shows little or no direct relevance, the score must be 3 or lower.
Avoid “benefit of the doubt” scoring.

Your output must strictly follow this structure:

Profile Summary – short and factual, based only on what is explicitly written in the CV.

Direct Skill Matches – list only the job-relevant skills that are directly evidenced in the CV.

Critical Missing Requirements – list each key requirement from the job description that is missing or insufficient in the CV.

Alternative Suitable Roles – suggest other roles the candidate may fit based on their actual CV content.

Final Verdict – clear and decisive statement on whether this candidate should be considered.

Scoring Rules (Extremely Strict):

9–10 → Perfect fit: all key requirements explicitly met with proven, recent experience.
7–8 → Strong potential: almost all requirements met; only minor gaps.
5–6 → Marginal: some relevant experience but several major gaps. Unlikely to succeed without major upskilling.
Below 5 → Not suitable: lacks multiple essential requirements or background is in a different field.

Mandatory principles:
Never award a score above 5 unless the CV matches at least 80% of the core requirements.
When in doubt, choose the lower score.
Always provide concrete examples from the CV to justify the score.
Keep tone professional, concise, and free from speculation.

Please finish your analysis with 3 key questions that the recruiter should ask during the first interview.

Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": string
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.

Analysis should be in perfect English.
`;

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
Type: ts | Lines:      685
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
<summary>📄 Preview (first 100 lines of      685)</summary>

```ts
// src/app/api/happiness/chat/route.ts (Multi-language version - TypeScript strict)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      step: 12,
... (truncated,      685 total lines)
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

## `src/app/api/interview-assistant/route.ts`

```
Folder: src/app/api/interview-assistant
Type: ts | Lines:      182
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
const languageNames: Record<string, string> = {
```

<details>
<summary>📄 Full content (     182 lines)</summary>

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    if (mode === 'questions') {
      aiMode = 'questions'
      prompt = `
You are an HR expert preparing a job interview.

IMPORTANT: Generate all content in ${languageName}. All questions must be in ${languageName}.

Candidate: ${candidat.candidat_firstname} ${candidat.candidat_lastname}

CV:
${candidat.cv_text}

Job:
${position.position_description_detailed}

Current recruitment step: ${recruitmentStep.step_name}

Generate 6–8 precise, role-specific questions tailored for the "${recruitmentStep.step_name}" stage.
Return ONLY valid JSON in this exact format (with all text in ${languageName}):
{
  "questions": [
    { "category": "technical", "text": "..." },
    { "category": "behavioral", "text": "..." }
  ]
}
`
    } else if (mode === 'summary') {
      aiMode = 'summary'
      prompt = `
You are an HR assistant.

IMPORTANT: Generate all content in ${languageName}. The entire summary, strengths, weaknesses, cultural fit assessment, and recommendations must be in ${languageName}.

Candidate: ${candidat.candidat_firstname} ${candidat.candidat_lastname}

CV:
${candidat.cv_text}

Job:
${position.position_description_detailed}

Current recruitment step: ${recruitmentStep.step_name}

Recruiter notes:
${notes}

Generate a structured interview summary for the "${recruitmentStep.step_name}" stage and recommend the next step.
Return ONLY valid JSON in this exact format (with all text in ${languageName} including the category titles):
{
  "summary": "detailed summary in ${languageName}",
  "strengths": ["strength 1 in ${languageName}", "strength 2 in ${languageName}"],
  "weaknesses": ["weakness 1 in ${languageName}", "weakness 2 in ${languageName}"],
  "cultural_fit": "cultural fit assessment in ${languageName}",
  "recommendation": "recommendation in ${languageName}",
  "next_step_recommendation": "next step recommendation in ${languageName}",
  "score": number
}
`
    } else {
      console.error('[Interview Assistant] Invalid mode:', mode)
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
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
Type: ts | Lines:      107
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
const secureUrl = signedUrlData.signedUrl;
```

<details>
<summary>📄 Full content (     107 lines)</summary>

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
      treated: false
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
Type: ts | Lines:      217
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
<summary>📄 Full content (     217 lines)</summary>

```ts
// src/app/api/medical-certificates/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Analytics } from "@vercel/analytics/next"

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
    const companyId = formData.get("company_id") as string | null; // AJOUT: récupération du company_id

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
    const filePath = `uploads/${companyId}/${Date.now()}_${safeName}`; // MODIFICATION: inclure company_id dans le chemin

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

//console.log("Raw PDF:", rawText)

    // 3) Extraction JSON via OpenRouter
    const extractPrompt = `
You will receive raw OCR text from a Hungarian medical certificate. Be Careful, the language of the certificate may vary.
I would like to return from this raw text: 
The name (in the file it will first name and last name together), the starting date of sickness, the end date of sickness
Extract the following fields and return STRICT JSON, nothing else:
{
  "employee_name": string | null,
  "sickness_start_date": "YYYY-MM-DD" | null,
  "sickness_end_date": "YYYY-MM-DD" | null
}
Rules:
- If a field is missing, set it to "not recognised".
- Try to normalize dates to YYYY-MM-DD if possible.
- Do not include any explanation. Only output JSON.

OCR TEXT:
---
${rawText}
---`;

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
      company_id: companyId, // AJOUT: retourner le company_id dans la réponse
      storage_path: filePath,
      //signed_url: signed.signedUrl,
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
Type: ts | Lines:       50
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      50 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, position_name, position_description, position_description_detailed, position_start_date } = body

    if (!user_id || !position_name || !position_description || !position_description_detailed || !position_start_date) {
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

    // Ici on utilise .insert(...).select() pour récupérer l'ID
    const { data: insertedData, error: insertError } = await supabase
      .from('openedpositions')
      .insert([
        {
          position_name,
          position_description,
          position_description_detailed,
          position_start_date,
          user_id,
          company_id: company.company_id,
        },
      ])
      .select() // ← important pour récupérer les champs insérés

    if (insertError || !insertedData || insertedData.length === 0) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create position' }, { status: 500 })
    }

    // On renvoie l'ID de la position créée
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
Type: ts | Lines:       44
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      44 lines)</summary>

```ts
import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') // Doit matcher ton param dans l'URL
  const now = new Date().toISOString();


  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = createServerComponentClient({ cookies: () => cookies() })

  // Récupérer le company_id de l'utilisateur
  const { data: companyLink, error: errorCompany } = await supabase
    .from('company_to_users')
    .select('company_id')
    .eq('user_id', userId)
    .single(); // on attend un seul enregistrement

  if (errorCompany) {
    return NextResponse.json({ error: errorCompany.message }, { status: 500 })
  }

  if (!companyLink) {
    return NextResponse.json({ positions: [] })
  }

  // Récupérer les positions liées à cette compagnie
  const { data: positions, error: errorPositions } = await supabase
    .from('openedpositions')
    .select(`*, company:company_id (company_logo)`)
    .eq('company_id', companyLink.company_id)
    .or(`position_end_date.is.null,position_end_date.gt.${now}`)

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
Type: ts | Lines:       46
Top definitions:
--- Exports ---

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      46 lines)</summary>

```ts
import { NextResponse } from "next/server"
import { createServerClient } from "../../../../lib/supabaseServerClient"

export async function GET(req: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")
    console.log("slug", slug)

    let query = supabase
      .from("openedpositions")
      .select(
        `
        id,
        position_name,
        position_description,
        position_description_detailed,
        company:company(
          company_logo,
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

## `src/app/terms-demo/page.tsx`

```
Folder: src/app/terms-demo
Type: tsx | Lines:       53
Top definitions:
--- Exports ---
export default function TermsDemoPage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      53 lines)</summary>

```tsx
// src/app/terms-demo/page.tsx

'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

export default function TermsDemoPage() {
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">{t('termsDemo.title', 'Demo Felhasználási Feltételek')}</h1>
      
      <div className="prose prose-blue">
        <h2>1. Demó Verzió Jellemzői</h2>
        <p>
          Ez egy ingyenes demó verzió tesztelési célokra. A rendszer funkciói korlátozottak, 
          és az adatok 30 nap után automatikusan törlésre kerülnek.
        </p>

        <h2>2. Felelősség Kizárása</h2>
        <p>
          A demó verzió "ahogy van" állapotban kerül biztosításra, mindenféle garancia nélkül. 
          Ne használjon valós személyes adatokat vagy érzékeny információkat.
        </p>

        <h2>3. Adatkezelés</h2>
        <p>
          A demó használata során megadott adatokat kizárólag a rendszer teszteléséhez használjuk fel. 
          Részletek: <a href="/privacy-demo" className="text-blue-600 underline">Adatvédelmi Tájékoztató</a>
        </p>

        <h2>4. AI Tartalom</h2>
        <p>
          Az AI által generált tartalma nem minősül szakmai tanácsadásnak. 
          Pontatlanságok előfordulhatnak.
        </p>

        <h2>5. Hozzáférés Megszüntetése</h2>
        <p>
          Fenntartjuk a jogot a demó hozzáférés azonnali megszüntetésére indoklás nélkül.
        </p>

        <h2>6. Kapcsolat</h2>
        <p>
          Kérdés esetén: <a href="mailto:privacy@innohr.hu" className="text-blue-600 underline">privacy@innohr.hu</a>
        </p>

        <p className="text-sm text-gray-500 mt-8">Utolsó frissítés: 2025. január 29.</p>
      </div>
    </div>
  );
}
```
</details>

---

## `src/app/privacy-demo/page.tsx`

```
Folder: src/app/privacy-demo
Type: tsx | Lines:      127
Top definitions:
--- Exports ---
export default PrivacyDemoPage;

--- Key Functions/Components ---
const PrivacyDemoPage: React.FC = () => {
const ThirdPartyServices = () => (
const DataControllerInfo = () => (
```

<details>
<summary>📄 Full content (     127 lines)</summary>

```tsx
'use client';

import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

const PrivacyDemoPage: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">{t('privacyDemo.title')}</h1>

      {/* ✅ ADD: Data Controller Info */}
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

      {/* ✅ ADD: Third Party Services */}
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
        privacy@innohr.hu
      </a>

      <p className="text-sm text-gray-500 mt-8">
        {t('privacyDemo.lastUpdated')}
      </p>
    </div>
  );
};

const ThirdPartyServices = () => (
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-3">Harmadik Felek Szolgáltatásai</h2>
    <div className="space-y-3">
      <div className="border-l-4 border-blue-500 pl-4">
        <h3 className="font-semibold">Supabase (BaaS Platform)</h3>
        <p className="text-sm text-gray-600">
          Cél: Adatbázis hosting, auth<br/>
          Székhely: USA (EU szerverre tárolunk)<br/>
          <a href="https://supabase.com/privacy" className="text-blue-600 underline">Adatvédelem</a>
        </p>
      </div>

      <div className="border-l-4 border-green-500 pl-4">
        <h3 className="font-semibold">OpenRouter/OpenAI (AI szolgáltatás)</h3>
        <p className="text-sm text-gray-600">
          Cél: CV elemzés, happiness chat<br/>
          Székhely: USA<br/>
          Adatkezelés: Nem tárolják hosszú távon<br/>
          <a href="https://openai.com/privacy" className="text-blue-600 underline">Adatvédelem</a>
        </p>
      </div>

      <div className="border-l-4 border-purple-500 pl-4">
        <h3 className="font-semibold">Vercel (Hosting)</h3>
        <p className="text-sm text-gray-600">
          Cél: Web hosting, CDN<br/>
          Székhely: USA<br/>
          <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 underline">Adatvédelem</a>
        </p>
      </div>

      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="font-semibold">Stripe (Fizetés)</h3>
        <p className="text-sm text-gray-600">
          Cél: Előfizetés kezelés<br/>
          Székhely: USA (EU adattárolás)<br/>
          <a href="https://stripe.com/privacy" className="text-blue-600 underline">Adatvédelem</a>
        </p>
      </div>
    </div>

    <p className="text-sm text-gray-600 mt-4 bg-yellow-50 p-3 rounded">
      ⚠️ <strong>Adatátvitel:</strong> Az adatok az EU-n kívülre kerülhetnek. 
      Standard szerződéses záradékokat (SCC) alkalmazunk az adatvédelem biztosítására.
    </p>
  </div>
);

const DataControllerInfo = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <h3 className="font-semibold text-blue-900 mb-2">Adatkezelő Elérhetősége</h3>
    <p className="text-sm text-blue-800">
      <strong>Név:</strong> [Your Full Name / Company Name]<br/>
      <strong>Email:</strong> privacy@innohr.hu<br/>
      <strong>Cím:</strong> [Your Address - Optional for demo]<br/>
      <strong>Adatvédelmi tisztviselő:</strong> privacy@innohr.hu
    </p>
  </div>
);

export default PrivacyDemoPage;
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
import DemoWarningBanner from "../../components/DemoWarningBanner";


export const metadata: Metadata = {
  title: "InnoHR",
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
            <DemoWarningBanner /> 
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

## `src/app/jobs/[slug]/openedpositions/new/page.tsx`

```
Folder: src/app/jobs/[slug]/openedpositions/new
Type: tsx | Lines:      709
Top definitions:
--- Exports ---
export default function NewOpenedPositionPage() {

--- Key Functions/Components ---
const supabase = createClient(
interface ConfirmAnalysisModalProps {
function ConfirmAnalysisModal({
```

<details>
<summary>📄 Preview (first 100 lines of      709)</summary>

```tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Calendar, FileText, Briefcase, BarChart3, CheckCircle, AlertCircle, Activity, Lock, X, Clock, Users } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Confirmation Modal Component
interface ConfirmAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onCreateWithoutAnalysis: () => void
  candidateCount: number
  loading?: boolean
}

function ConfirmAnalysisModal({
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
  const estimatedTime = estimatedMinutes < 1 
    ? `${candidateCount * 5} ${t('newPosition.modal.seconds')}`
    : `${estimatedMinutes} ${t('newPosition.modal.minute')}${estimatedMinutes > 1 ? 's' : ''}`

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
            {t('newPosition.modal.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-center">
            {t('newPosition.modal.message')}
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">{t('newPosition.modal.candidates')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center border border-purple-100">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{candidateCount}</div>
              <div className="text-xs text-gray-600">{t('newPosition.modal.aiCredits')}</div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-2 justify-center text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('newPosition.modal.estimatedTime')} ~{estimatedTime}
              </span>
            </div>
          </div>

          {/* Warning Text */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {t('newPosition.modal.willConsume')} <span className="font-semibold text-gray-800">{candidateCount} {t('newPosition.modal.aiCredits')}</span> {t('newPosition.modal.fromAccount')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
... (truncated,      709 total lines)
```
</details>

---

## `src/app/jobs/[slug]/openedpositions/page.tsx`

```
Folder: src/app/jobs/[slug]/openedpositions
Type: tsx | Lines:       75
Top definitions:
--- Exports ---
export default async function JobPage({

--- Key Functions/Components ---
type Position = {
type ApiResponse = { positions?: Position[] };
```

<details>
<summary>📄 Full content (      75 lines)</summary>

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

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
Type: tsx | Lines:      144
Top definitions:
--- Exports ---
export default function HomePage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (     144 lines)</summary>

```tsx
'use client';

import { Heart, Users, TrendingUp, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useLocale } from '../../../../i18n/LocaleProvider';

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

        {/* CTA Section }
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
        {*/}
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
Type: tsx | Lines:      535
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
<summary>📄 Preview (first 100 lines of      535)</summary>

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
import RequestLeaveModal from '../../../../../components/absence/RequestLeaveModal';

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
... (truncated,      535 total lines)
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
Type: tsx | Lines:      476
Top definitions:
--- Exports ---
export default HRDashboard;

--- Key Functions/Components ---
interface DashboardData {
type PermaKey = keyof DashboardData['permaAverages'];
const HRDashboard = () => {
```

<details>
<summary>📄 Preview (first 100 lines of      476)</summary>

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
... (truncated,      476 total lines)
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

## `src/app/jobs/[slug]/performance/pulse/page.tsx`

```
Folder: src/app/jobs/[slug]/performance/pulse
Type: tsx | Lines:      351
Top definitions:
--- Exports ---
export default function WeeklyPulsePage() {

--- Key Functions/Components ---
const supabase = createClient(
interface Goal {
interface ApiGoalsResponse {
interface PulseData {
```

<details>
<summary>📄 Preview (first 100 lines of      351)</summary>

```tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Calendar, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  goal_title: string
  last_update_week: string | null
  status: 'active' | 'inactive'
}

interface ApiGoalsResponse {
  goals: Goal[]
}

interface PulseData {
  [goalId: string]: {
    status: 'green' | 'yellow' | 'red'
    progress_comment: string
    blockers: string
  }
}

export default function WeeklyPulsePage() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goals, setGoals] = useState<Goal[]>([])
  const [pulseData, setPulseData] = useState<PulseData>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [weekStart, setWeekStart] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    fetchGoalsNeedingPulse(session.user.id)
  }, [session, router])

  const fetchGoalsNeedingPulse = async (userId: string) => {
    setLoading(true)
    try {
      const { data: week } = await supabase.rpc('get_week_start')
      setWeekStart((week as string) || '')

      const res = await fetch(`/api/performance/goals?view=employee&user_id=${userId}`)
      const data: ApiGoalsResponse = await res.json()
      
      if (res.ok) {
        const activeGoals = data.goals.filter(g => g.status === 'active')
        const needsPulse = activeGoals.filter(g => !g.last_update_week || g.last_update_week !== (week as string))
        
        setGoals(needsPulse)
        
        const initialData: PulseData = {}
        needsPulse.forEach(goal => {
          initialData[goal.id] = {
            status: 'green',
            progress_comment: '',
            blockers: ''
          }
        })
        setPulseData(initialData)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
    setLoading(false)
  }

  const updatePulse = (goalId: string, field: keyof PulseData[string], value: string) => {
    setPulseData(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
... (truncated,      351 total lines)
```
</details>

---

## `src/app/jobs/[slug]/performance/team/page.tsx`

```
Folder: src/app/jobs/[slug]/performance/team
Type: tsx | Lines:      485
Top definitions:
--- Exports ---
export default function ManagerDashboard() {

--- Key Functions/Components ---
const supabase = createClient(
interface Goal {
interface EmployeeStats {
```

<details>
<summary>📄 Preview (first 100 lines of      485)</summary>

```tsx
// app/jobs/[slug]/performance/team/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users, AlertTriangle, Target, TrendingUp } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  employee_id: string
  goal_title: string
  goal_description: string
  success_criteria: string
  quarter: string
  year: number
  status: string
  created_by: string
  latest_status: 'green' | 'yellow' | 'red' | null
  latest_comment: string | null
  latest_blockers: string | null
  last_update_week: string | null
  last_update_date: string | null
  employee_name: string
  manager_name: string
  created_at: string
}

interface EmployeeStats {
  employee_id: string
  employee_name: string
  total_goals: number
  active_goals: number
  red_flags: number
  yellow_flags: number
  green_flags: number
  needs_pulse: number
  pending_approval: number
}

export default function ManagerDashboard() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goals, setGoals] = useState<Goal[]>([])
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState('')
  const [selectedView, setSelectedView] = useState<'overview' | 'red-flags' | 'pending'>('overview')
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  useEffect(() => {
    if (!session) {
      router.push('/')
      return
    }

    fetchTeamGoals()
    fetchWeekStart()
  }, [session, router])

  const fetchWeekStart = async () => {
    try {
      const { data: week } = await supabase.rpc('get_week_start')
      setWeekStart(week as string || '')
    } catch (error) {
      console.error('Error fetching week:', error)
    }
  }

  const fetchTeamGoals = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) {
        console.error('No session found')
        setLoading(false)
        return
      }
      
      const res = await fetch(`/api/performance/goals?view=manager&user_id=${session.user.id}`)
      const data = await res.json()
      if (res.ok) {
        const teamGoals = data.goals || []
        console.log('Team goals fetched:', teamGoals.length)
        setGoals(teamGoals)
        calculateEmployeeStats(teamGoals)
      } else {
        console.error('Error fetching team goals:', data.error)
      }
    } catch (error) {
... (truncated,      485 total lines)
```
</details>

---

## `src/app/jobs/[slug]/performance/page.tsx`

```
Folder: src/app/jobs/[slug]/performance
Type: tsx | Lines:      363
Top definitions:
--- Exports ---
export default function PerformanceDashboard() {

--- Key Functions/Components ---
const supabase = createClient(
interface Goal {
```

<details>
<summary>📄 Preview (first 100 lines of      363)</summary>

```tsx
// app/jobs/[slug]/performance/page.tsx
'use client'

import { useSession } from '@supabase/auth-helpers-react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Plus, Target, TrendingUp, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useLocale } from 'i18n/LocaleProvider'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Goal {
  id: string
  goal_title: string
  goal_description: string
  success_criteria: string
  quarter: string
  year: number
  status: string
  created_by: string
  latest_status: 'green' | 'yellow' | 'red' | null
  latest_comment: string | null
  latest_blockers: string | null
  last_update_week: string | null
  last_update_date: string | null
  employee_name: string
  manager_name: string
  created_at: string
}

export default function PerformanceDashboard() {
  const { t } = useLocale()
  const router = useRouter()
  const session = useSession()
  const params = useParams()
  const companySlug = params.slug as string

  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuarter, setCurrentQuarter] = useState('')
  const [weekStart, setWeekStart] = useState('')

  useEffect(() => {
    if (!session) {
      router.push(`/jobs/${companySlug}`)
      return
    }

    fetchGoals()
    fetchQuarterAndWeek()
  }, [session, router, companySlug])

  const fetchQuarterAndWeek = async () => {
    try {
      const { data: quarter } = await supabase.rpc('get_current_quarter')
      const { data: week } = await supabase.rpc('get_week_start')
      
      setCurrentQuarter(quarter as string || '')
      setWeekStart(week as string || '')
    } catch (error) {
      console.error('Error fetching quarter/week:', error)
    }
  }

  const fetchGoals = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) {
        console.error('No session found')
        setLoading(false)
        return
      }
      
      const res = await fetch(`/api/performance/goals?view=employee&user_id=${session.user.id}`)
      const data = await res.json()
      if (res.ok) {
        setGoals(data.goals || [])
      } else {
        console.error('Error fetching goals:', data.error)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
    setLoading(false)
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const draftGoals = goals.filter(g => g.status === 'draft')
  const needsPulseGoals = activeGoals.filter(g => !g.last_update_week || g.last_update_week !== weekStart)
  const redFlagGoals = activeGoals.filter(g => g.latest_status === 'red')

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'red': return 'bg-red-100 text-red-800 border-red-200'
... (truncated,      363 total lines)
```
</details>

---

## `src/app/jobs/[slug]/page.tsx`

```
Folder: src/app/jobs/[slug]
Type: tsx | Lines:        8
Top definitions:
--- Exports ---
export default function HomePage() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (       8 lines)</summary>

```tsx
import Home from './Home/page'

export default function HomePage() {
  return (
    <main style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Home />
    </main>
  )
}
```
</details>

---

## `src/app/jobs/[slug]/time-clock/manager/page.tsx`

```
Folder: src/app/jobs/[slug]/time-clock/manager
Type: tsx | Lines:       32
Top definitions:
--- Exports ---
export default function Page() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      32 lines)</summary>

```tsx
'use client';

import ManagerTimeClockDashboard from '../../../../../../components/timeclock/ManagerTimeClockDashboard';
import { useSession } from '@supabase/auth-helpers-react';
import { useLocale } from 'i18n/LocaleProvider';

export default function Page() {
  const { t } = useLocale();
  const session = useSession();

  if (session === undefined) {
    // session is still loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('managerTimeClockPage.loading')}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('managerTimeClockPage.loginRequired')}</p>
      </div>
    );
  }

  const managerId = session.user.id;
  console.log("manager_id:", managerId);
  const managerName = session.user.user_metadata?.full_name || t('managerTimeClockPage.defaultManagerName');

  return <ManagerTimeClockDashboard managerId={managerId} managerName={managerName} />;
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
Type: tsx | Lines:      437
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
<summary>📄 Preview (first 100 lines of      437)</summary>

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

  // Manual correction state
  const [manualData, setManualData] = useState({
    employee_name: '',
    sickness_start_date: '',
    sickness_end_date: ''
  });

  const MAX_SIZE = 1 * 1024 * 1024; // 1MB

  const handleFileChange = (selectedFile: File | null) => {
    setError('');
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

      const res = await fetch('/api/medical-certificates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const extracted = data.extracted_data || {};
      
      // Pre-fill with logged-in user data or OCR data
      const resultData = {
        employee_name: prefilledData?.employee_name || extracted.employee_name,
        sickness_start_date: extracted.sickness_start_date,
        sickness_end_date: extracted.sickness_end_date,
... (truncated,      437 total lines)
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
Type: tsx | Lines:       36
Top definitions:
--- Exports ---
export default Footer;

--- Key Functions/Components ---
const Footer: React.FC = () => {
```

<details>
<summary>📄 Full content (      36 lines)</summary>

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'i18n/LocaleProvider';

const Footer: React.FC = () => {
  const { t, locale } = useLocale();

  return (
    <footer className="text-center text-sm text-gray-500 mt-8 py-6 border-t border-gray-200">
  <p>© 2025 HRinno Demo – {t('footer.operatedBy')}</p>
  <div className="flex justify-center gap-4 mt-2">
    <Link href="/privacy-demo" className="underline hover:text-blue-600">
      {t('footer.privacyLink')}
    </Link>
    <Link href="/terms-demo" className="underline hover:text-blue-600">
      Felhasználási Feltételek
    </Link>
    <Link href="/cookies" className="underline hover:text-blue-600">
      Süti Szabályzat
    </Link>
  </div>
  <p className="mt-2">
    {t('footer.contact')}{' '}
    <a href="mailto:privacy@innohr.hu" className="underline hover:text-blue-600">
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
Type: tsx | Lines:      715
Top definitions:
--- Exports ---
export default function Header() {

--- Key Functions/Components ---
```

<details>
<summary>📄 Preview (first 100 lines of      715)</summary>

```tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import {
  Heart, BarChart3, Smile, Stethoscope, Briefcase, Plus, ChevronDown,
  User, LogOut, Clock, CreditCard, UserCog, TicketPlus, CalendarClock, Target, Users
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

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <DemoTimer
          isDemoMode={isDemoMode}
          isDemoExpired={isDemoExpired}
          demoTimeLeft={demoTimeLeft}
          formatTime={formatTime}
        />
... (truncated,      715 total lines)
```
</details>

---

## `components/InterviewAssistantModal.tsx`

```
Folder: components
Type: tsx | Lines:      156
Top definitions:
--- Exports ---
export default function InterviewAssistantModal({

--- Key Functions/Components ---
type InterviewQuestion = {
type InterviewSummary = {
```

<details>
<summary>📄 Full content (     156 lines)</summary>

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
  cultural_fit: string
  recommendation: string
  score: number
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
            <p><strong>{t('interviewAssistant.summary.culturalFitLabel')}:</strong> {interviewSummary.cultural_fit}</p>
            <p><strong>{t('interviewAssistant.summary.recommendationLabel')}:</strong> {interviewSummary.recommendation}</p>
            <p><strong>{t('interviewAssistant.summary.scoreLabel')}:</strong> {interviewSummary.score}/10</p>
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
Type: tsx | Lines:       47
Top definitions:
--- Exports ---
export default function LanguageSwitcher({ compact = false }) {

--- Key Functions/Components ---
```

<details>
<summary>📄 Full content (      47 lines)</summary>

```tsx
'use client';

import { useLocale } from '../src/i18n/LocaleProvider';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ compact = false }) {
  const { locale, setLocale } = useLocale();

  // Compact mobile icon version
  if (compact) {
    return (
      <button
        onClick={() => setLocale(locale === 'en' ? 'hu' : 'en')}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Change language"
      >
        <Globe className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  // Full version (desktop + mobile menu)
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
          locale === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('hu')}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
          locale === 'hu'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        HU
      </button>
    </div>
  );
}
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
Type: tsx | Lines:      531
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
<summary>📄 Preview (first 100 lines of      531)</summary>

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
    | 'goal_created'
    | 'goal_approved'
    | 'goal_red_flag'
    | 'pulse_reminder'
    | 'one_on_one_scheduled';
  title: string;
  message: string;
  ticket_id?: string;
  leave_request_id?: string;
  goal_id?: string;
  one_on_one_id?: string;
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

  // --- Check admin status ---
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
... (truncated,      531 total lines)
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
Type: tsx | Lines:      141
Top definitions:
--- Exports ---
export default RecentRequests;

--- Key Functions/Components ---
type Props = {
const RecentRequests: React.FC<Props> = ({
```

<details>
<summary>📄 Full content (     141 lines)</summary>

```tsx
// File: components/absence/RecentRequests.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';
import { RefreshCw, Calendar, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { LeaveRequest } from '../../types/absence';
import { CertificateStatusBadge } from './../CertificateStatusBadge';
import { formatDate as defaultFormatDate } from '../../utils/formatDate';

type Props = {
  requests: LeaveRequest[];
  onRefresh: () => void;
  onOpenRequestModal: () => void;
  onUploadCertificateForRequest: (id: string) => void;
  isSickLeaveType: (leaveTypeId: string) => boolean;
  formatDate?: (d: string) => string;
};

const RecentRequests: React.FC<Props> = ({
  requests,
  onRefresh,
  onOpenRequestModal,
  onUploadCertificateForRequest,
  isSickLeaveType,
  formatDate = defaultFormatDate
}) => {
  const { t } = useLocale();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {t('recentRequests.title')}
        </h2>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t('recentRequests.empty.noRequests')}</p>
          <button
            onClick={onOpenRequestModal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            {t('recentRequests.empty.firstLeaveButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: request.leave_type_color }}
                      />
                      <h3 className="font-semibold text-gray-900">
                        {request.leave_type_name_hu}
                      </h3>
                      <div className="ml-2">
                        <StatusBadge status={request.status} />
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">{t('recentRequests.fields.period')}</span>{' '}
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </p>
                      <p>
                        <span className="font-medium">{t('recentRequests.fields.duration')}</span>{' '}
                        {request.total_days} {request.total_days !== 1 
                          ? t('recentRequests.fields.days') 
                          : t('recentRequests.fields.day')}
                      </p>
                      {request.reason && (
                        <p>
                          <span className="font-medium">{t('recentRequests.fields.reason')}</span> {request.reason}
                        </p>
                      )}
                      {request.review_notes && (
                        <p>
                          <span className="font-medium">{t('recentRequests.fields.managerNotes')}</span> {request.review_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {t('recentRequests.fields.requested')} {formatDate(request.created_at)}
                    {request.reviewed_at && (
                      <>
                        <br />
                        {t('recentRequests.fields.reviewed')} {formatDate(request.reviewed_at)}
                      </>
                    )}
                  </div>
                </div>

                {/* Certificate Status Badge & Upload button */}
                <div className="flex items-center gap-2 flex-wrap">
                  <CertificateStatusBadge
                    hasCertificate={!!request.medical_certificate_id}
                    certificateTreated={false}
                    isHrValidated={request.hr_validated}
                    isMedicalConfirmed={request.is_medical_confirmed}
                  />

                  {isSickLeaveType(request.leave_type_id) &&
                    !request.medical_certificate_id &&
                    request.status === 'pending' && (
                      <button
                        onClick={() => onUploadCertificateForRequest(request.id)}
                        className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                      >
                        {t('recentRequests.buttons.uploadCertificate')}
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentRequests;
```
</details>

---

## `components/absence/RequestLeaveModal.tsx`

```
Folder: components/absence
Type: tsx | Lines:      646
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
<summary>📄 Preview (first 100 lines of      646)</summary>

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
    if (!selectedFile) return setCertificateFile(null);
    
    if (selectedFile.size > MAX_SIZE) {
      setCertificateError(t('requestLeaveModal.errors.fileTooLarge'));
      setCertificateFile(null);
    } else {
      setCertificateFile(selectedFile);
    }
  };
... (truncated,      646 total lines)
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
Type: tsx | Lines:      130
Top definitions:
--- Exports ---
export const LoginModal: React.FC<LoginModalProps> = ({

--- Key Functions/Components ---
interface LoginModalProps {
```

<details>
<summary>📄 Full content (     130 lines)</summary>

```tsx
// components/Header/LoginModal.tsx
import React from 'react';
import { useLocale } from 'i18n/LocaleProvider';

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

  if (!isOpen || isDemoExpired) return null;

  // Extract slug from URL (format: app/jobs/slug)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const slug = pathSegments[1] || ''; // Get the third segment (index 2)
  const isDemoMode = slug === 'demo';

  const handleDemoLogin = (email: string, pwd: string) => {
    return () => {
      // Call onLogin directly with the credentials
      onLogin(email, pwd);
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{t('loginModal.title')}</h2>
          <p className="text-gray-600 mt-1">
            {isDemoMode ? t('loginModal.subtitle.demo') : t('loginModal.subtitle.normal')}
          </p>
        </div>
        
        {isDemoMode ? (
          // Demo mode: Show 3 role options
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
        ) : (
          // Normal mode: Show login form
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('loginModal.fields.email')}</label>
              <input 
                type="email" 
                placeholder={t('loginModal.fields.emailPlaceholder')}
                value={login} 
                onChange={(e) => setLogin(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('loginModal.fields.password')}</label>
              <input 
                type="password" 
                placeholder={t('loginModal.fields.passwordPlaceholder')}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            {t('loginModal.buttons.cancel')}
          </button>
          {!isDemoMode && (
            <button 
              onClick={() => onLogin()} 
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {t('loginModal.buttons.connect')}
            </button>
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
Type: ts | Lines:       53
Top definitions:
--- Exports ---
export const supabase = createClientComponentClient() */
export const supabase = createClient(
export const supabase = createClient(

--- Key Functions/Components ---
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const storage = isBrowser
```

<details>
<summary>📄 Full content (      53 lines)</summary>

```ts
/*'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient() */

/*'use client'

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage: {
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  }
)*/

'use client';

import { createClient } from '@supabase/supabase-js';

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

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

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      storage,
    },
  }
);
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
Type: ts | Lines:      194
Top definitions:
--- Exports ---

--- Key Functions/Components ---
const supabase = createClient(
interface LeaveRequestNotificationData {
interface LeaveReviewNotificationData {
```

<details>
<summary>📄 Full content (     194 lines)</summary>

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
- **Files included:** 122
- **File size:** 456K
- **Extraction date:** Fri Oct 31 06:14:35 CET 2025

# Technology Stack Detected

## Frontend/Framework
    next: ^15.5.2
    react: 19.1.0

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
src/app/api/contact/route.ts
src/app/api/feedback/route.ts
src/app/api/happiness/chat/route.ts
src/app/api/happiness/dashboard/route.ts
src/app/api/happiness/session/route.ts
src/app/api/interview-assistant/route.ts
src/app/api/interviews/route.ts
src/app/api/medical-certificates/confirm/route.ts
src/app/api/medical-certificates/upload/route.ts
src/app/api/new-position/route.ts
src/app/api/notifications/email/route.ts
src/app/api/notifications/email/types.ts
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
src/app/api/users/users-creation/route.ts
```

## User-Facing Pages
```
src/app/ObsoleteHome/page.tsx
src/app/jobs/[slug]/Home/page.tsx
src/app/jobs/[slug]/absences/calendar/page.tsx
src/app/jobs/[slug]/absences/page.tsx
src/app/jobs/[slug]/contact/page.tsx
src/app/jobs/[slug]/cv-analyse/page.tsx
src/app/jobs/[slug]/feedback/page.tsx
src/app/jobs/[slug]/happiness-check/page.tsx
src/app/jobs/[slug]/happiness-dashboard/page.tsx
src/app/jobs/[slug]/medical-certificate/download/page.tsx
src/app/jobs/[slug]/medical-certificate/list/page.tsx
src/app/jobs/[slug]/medical-certificate/upload/page.tsx
src/app/jobs/[slug]/openedpositions/analytics/page.tsx
src/app/jobs/[slug]/openedpositions/new/page.tsx
src/app/jobs/[slug]/openedpositions/page.tsx
src/app/jobs/[slug]/page.tsx
src/app/jobs/[slug]/performance/goals/[goalId]/page.tsx
src/app/jobs/[slug]/performance/goals/new/page.tsx
src/app/jobs/[slug]/performance/page.tsx
src/app/jobs/[slug]/performance/pulse/page.tsx
src/app/jobs/[slug]/performance/team/page.tsx
src/app/jobs/[slug]/stats/page.tsx
src/app/jobs/[slug]/subscription/page.tsx
src/app/jobs/[slug]/tickets/[ticketId]/page.tsx
src/app/jobs/[slug]/tickets/create/page.tsx
src/app/jobs/[slug]/tickets/page.tsx
src/app/jobs/[slug]/time-clock/manager/page.tsx
src/app/jobs/[slug]/time-clock/page.tsx
src/app/jobs/[slug]/users-creation/page.tsx
src/app/page.tsx
src/app/privacy-demo/page.tsx
src/app/terms-demo/page.tsx
```

## Components
```
components
components/absence
components/absence/Calendar
components/header
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

