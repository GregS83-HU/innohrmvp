// src/app/api/generate-position-description/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { consumeCredit } from '../../../../lib/credit';
import { getPrompt, fillPromptVariables, PromptNotFoundError, PromptDatabaseError } from '../../../../lib/prompts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Optimized API call
async function callOpenRouterAPI(prompt: string, model = 'anthropic/claude-3.5-sonnet') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

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
        temperature: 0.3, // Lower temperature for more focused, accurate output
        max_tokens: 4000, // Increased to allow ~500-800 words per description
      }),
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();

    if (!response.ok) {
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html>')) {
        throw new Error(`API returned HTML error page. Check API key and endpoint status.`);
      }
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    let completion;
    try {
      completion = JSON.parse(responseText);
    } catch {
      throw new Error(`API returned invalid JSON`);
    }

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error(`Invalid API response structure`);
    }

    return completion.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error in callOpenRouterAPI:', error);
    throw error;
  }
}

// Fallback API call with different model
async function callFallbackAPI(prompt: string) {
  try {
    // Try GPT-4o-mini as fallback (still good but faster)
    return await callOpenRouterAPI(prompt, 'openai/gpt-4o-mini');
  } catch {
    // Final fallback: GPT-3.5
    return await callOpenRouterAPI(prompt, 'openai/gpt-3.5-turbo');
  }
}

// Robust JSON extraction
function extractAndParseJSON(rawResponse: string) {
  const trimmed = rawResponse.trim();
  
  // Try parsing directly first
  try {
    return JSON.parse(trimmed);
  } catch {}

  // If direct parsing fails, try to find JSON by looking for the outermost braces
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1) {
    console.error('No JSON braces found in response:', rawResponse.substring(0, 200));
    throw new Error('No valid JSON found in response');
  }

  let jsonString = trimmed.substring(firstBrace, lastBrace + 1);
  
  // Try multiple sanitization strategies
  const strategies = [
    // Strategy 1: Parse as-is
    (s: string) => s,
    
    // Strategy 2: Escape unescaped control characters within string values
    (s: string) => {
      // This is tricky - we need to escape actual newlines/tabs in string values
      // but not break already-escaped ones
      return s.replace(/([^\\])([\n\r\t])/g, '$1\\$2');
    },
    
    // Strategy 3: Remove control characters entirely
    (s: string) => s.replace(/[\x00-\x1F\x7F]/g, ''),
    
    // Strategy 4: Replace actual newlines with spaces
    (s: string) => s.replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ')
  ];
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const sanitized = strategies[i](jsonString);
      const result = JSON.parse(sanitized);
      if (i > 0) {
        console.log(`Successfully parsed JSON using strategy ${i + 1}`);
      }
      return result;
    } catch (e) {
      if (i === 0) {
        console.log(`Strategy 1 failed, trying alternatives...`);
        console.error('Problematic JSON (first 300 chars):', jsonString.substring(0, 300));
      }
      // Continue to next strategy
    }
  }
  
  // All strategies failed
  console.error('All parsing strategies failed. JSON snippet:', jsonString.substring(0, 500));
  throw new Error('Invalid JSON structure in response - could not sanitize');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roughDraft, positionName, companyId } = body;

    // Validate inputs
    if (!roughDraft || roughDraft.trim().length < 20) {
      return NextResponse.json({ 
        error: 'Please provide a description of at least 20 characters.' 
      }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json({ 
        error: 'Missing company ID (needed to check AI credits).' 
      }, { status: 400 });
    }

    // === CHECK AI CREDITS BEFORE GENERATION ===
    console.log('Checking AI credits for company:', companyId);
    const ok = await consumeCredit(companyId);
    if (!ok) {
      return NextResponse.json({ 
        error: 'You have no remaining AI credits this month.' 
      }, { status: 402 });
    }

    // === FETCH PROMPT FROM DATABASE ===
    console.log('Fetching position description generation prompt from database...');
    
    let promptTemplate: string = '';
    try {
      promptTemplate = await getPrompt('position_description_generator');
    } catch (error) {
      if (error instanceof PromptNotFoundError || error instanceof PromptDatabaseError) {
        console.error('Failed to load prompt:', error.message);
        
        // FALLBACK: Use hardcoded prompt if database lookup fails
        console.log('Using fallback prompt template');
        promptTemplate = `You are creating job descriptions from a rough draft.

**INPUTS:**
Position Name: {{positionName}}
Rough Draft: {{roughDraft}}

**CRITICAL RULES:**
1. Use the ACTUAL position name everywhere (not the placeholder)
2. Extract ALL information ONLY from the rough draft
3. DO NOT substitute different technologies or change role type
4. If draft says "React" → write about React (not Java/marketing)
5. DO NOT copy from examples - read the actual rough draft

**CREATE TWO OUTPUTS:**

**position_description** (~500 words - job ad):
- Use actual position name
- Responsibilities from rough draft
- Technologies/skills from rough draft
- Experience from rough draft
- Professional and engaging

**position_description_detailed** (500-1000 words - CV matching):
- Extremely detailed for AI CV analysis
- Expand every item from rough draft
- Examples: "React" → "React.js, hooks, JSX, state management, etc."
- Include: Role overview, all requirements expanded, experience details, daily tasks
- 500-1000 words

**JSON OUTPUT:**
{
  "position_description": "...",
  "position_description_detailed": "..."
}

**VERIFY:**
✓ Same role type as rough draft?
✓ Same technologies as rough draft?
✓ Used actual position name?`;
      } else {
        throw error;
      }
    }
    // Fill in the variables
    // Note: fillPromptVariables seems to not be working, so we do manual replacement as backup
    let prompt = fillPromptVariables(promptTemplate, {
      positionName: positionName || 'Position',
      roughDraft: roughDraft.trim()
    });

    // MANUAL REPLACEMENT as backup (in case fillPromptVariables fails)
    prompt = prompt.replace(/\{\{positionName\}\}/g, positionName || 'Position');
    prompt = prompt.replace(/\{\{roughDraft\}\}/g, roughDraft.trim());

    console.log('=== DEBUG INFO ===');
    console.log('Position Name INPUT:', positionName);
    console.log('Rough Draft INPUT:', roughDraft.trim());
    console.log('Prompt after variable replacement (first 500 chars):', prompt.substring(0, 500));
    console.log('Checking if {{positionName}} was replaced:', prompt.includes('{{positionName}}') ? 'NO - STILL HAS PLACEHOLDER!' : 'YES - replaced');
    console.log('==================');

    // === CALL AI ===
    console.log('Generating position descriptions with AI...');
    
    const rawResponse = await callOpenRouterAPI(prompt)
      .catch(() => callFallbackAPI(prompt));

    console.log('AI generation completed');

    // Parse response
    console.log('Raw AI response (first 200 chars):', rawResponse.substring(0, 200));
    const aiData = extractAndParseJSON(rawResponse);
    const { position_description, position_description_detailed } = aiData;

    // Validate required fields
    if (!position_description || !position_description_detailed) {
      throw new Error('Missing required fields in AI response');
    }

    // Validate minimum lengths
    if (position_description.length < 50 || position_description_detailed.length < 100) {
      throw new Error('Generated descriptions are too short');
    }

    console.log('Descriptions validated successfully');

    return NextResponse.json({
      position_description,
      position_description_detailed,
      success: true
    });

  } catch (aiError: unknown) {
    console.error('AI processing error:', aiError);
    const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI processing error';
    return NextResponse.json({ 
      error: `AI generation failed: ${errorMessage}` 
    }, { status: 500 });
  }
}