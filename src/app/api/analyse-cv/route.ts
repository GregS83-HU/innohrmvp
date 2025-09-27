  // src/app/api/analyse-cv/route.ts
  export const runtime = "nodejs";
  import { NextRequest, NextResponse } from 'next/server';
  import parsePdfBuffer from '../../../../lib/parsePdfSafe';
  import { createClient } from '@supabase/supabase-js';
  

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Optimized API call with faster model and timeout
  async function callOpenRouterAPI(prompt: string, context = '', model = 'openai/gpt-3.5-turbo') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

    try {
      //console.log(`Making API call for ${context} with model ${model}...`);

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
          max_tokens: 1500, // Reduced from 2000 for faster processing
        }),
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
     // console.log(`API response for ${context} (status: ${response.status}):`, responseText.substring(0, 500) + '...');

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
     // console.log(`Making fallback API call for ${context} with Claude Haiku...`);
      
      // Try Claude Haiku first (fast and reliable)
      return await callOpenRouterAPI(prompt, context, 'anthropic/claude-3-haiku');
    } catch {
     // console.log(`Claude Haiku failed, trying Mistral Small for ${context}...`);
      
      // Then try Mistral Small (faster than 7b-instruct)
      return await callOpenRouterAPI(prompt, context, 'mistralai/mistral-small');
    }
  }

  // Robust JSON extraction
  function extractAndParseJSON(rawResponse: string, context = '') {
    const trimmed = rawResponse.trim();
    //console.log("Raw AI answer", rawResponse)
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
  function sanitizeFileName(filename: string) {
    return filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '');
  }

  export async function POST(req: NextRequest) {
   try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const jobDescription = formData.get('jobDescription') as string;
    const positionId = formData.get('positionId') as string;
    const source = formData.get('source') as string || 'Candidate Upload';

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 });
    }

    // Convert File to Buffer (parsePdfBuffer expects Buffer, not Uint8Array)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF - use the correct function name and parameter type
    const fullCvText = await parsePdfBuffer(buffer);
    console.log("Parsed CV length:", fullCvText.length);
    
    // Optimize PDF text length for faster processing
    const MAX_CV_LENGTH = 8000;
    const cvText = fullCvText.length > MAX_CV_LENGTH 
      ? fullCvText.substring(0, MAX_CV_LENGTH) + '...[truncated]'
      : fullCvText;

    // Start file upload in parallel
    const safeFileName = sanitizeFileName(file.name);
    const filePath = `cvs/${Date.now()}_${safeFileName}`;
    
    // Upload the buffer, not uint8Array
    const uploadPromise = supabase.storage
      .from('cvs')
      .upload(filePath, buffer, { contentType: 'application/pdf' });

      // Optimized prompts for faster processing
      const hrPrompt = `
  Analyze this CV against the job requirements. Respond with JSON only.

  CV: ${cvText}

  Job Requirements: ${jobDescription}

  Score strictly: 9-10 perfect match, 7-8 strong fit, 5-6 marginal, <5 unsuitable.

  Required JSON format:
  {
    "score": number,
    "analysis": "brief analysis focusing on key strengths, gaps, and fit assessment and finish by 3 key questions that the recruiter should ask during the first interview to confirm the match between the candidate and the position",
    "candidat_firstname": "string",
    "candidat_lastname": "string",
    "candidat_email": "string", 
    "candidat_phone": "string"
  }

  Be critical in scoring. Missing core requirements should significantly lower the score.
  Analysis should be in perfect English
  `;

      const candidateFeedbackPrompt = `
  You are a career consultant. Provide constructive feedback for this candidate.

  CV: ${cvText}
  Position: ${jobDescription}

  Structure your feedback EXACTLY like this with clear paragraphs separated by double line breaks (\\n\\n):

  1. Personal greeting using their first and last name from CV
  2. Strengths paragraph highlighting relevant experience and skills
  3. Development areas paragraph with specific improvement suggestions  
  4. Career advice paragraph mentioning alternative suitable roles
  5. Next steps paragraph with actionable recommendations

  IMPORTANT: Each section must be a separate paragraph with \\n\\n between them.

  Example format:
  "Dear [First Name] [Last Name],\\n\\nYour strengths include...\\n\\nFor development, I recommend...\\n\\nRegarding your career path...\\n\\nYour next steps should focus on..."

  Respond with JSON only:
  {
    "feedback": "comprehensive feedback message with proper paragraph formatting using \\n\\n separators"
  }

  Keep tone kind, professional, encouraging, and actionable.
  `;

      // === PARALLEL AI PROCESSING ===
      //console.log('Starting parallel AI analysis...');
      
      const aiPromises = [
        // HR Analysis with fallback
        callOpenRouterAPI(hrPrompt, 'HR analysis')
          .catch(() => callFallbackAPI(hrPrompt, 'HR analysis')),
        
        // Candidate Feedback with fallback  
        callOpenRouterAPI(candidateFeedbackPrompt, 'candidate feedback')
          .catch(() => callFallbackAPI(candidateFeedbackPrompt, 'candidate feedback'))
      ];

      // Wait for both AI calls to complete
      const [hrRawResponse, candidateRawResponse] = await Promise.all(aiPromises);

      //console.log('Both AI analyses completed');

      // Parse responses
      const hrData = extractAndParseJSON(hrRawResponse, 'HR analysis');
      const { score, analysis, candidat_firstname, candidat_lastname, candidat_email, candidat_phone } = hrData;

      const candidateData = extractAndParseJSON(candidateRawResponse, 'candidate feedback');
      const { feedback } = candidateData;

      // Wait for file upload to complete
      const { error: uploadError } = await uploadPromise;

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json({ error: 'Échec upload CV' }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(filePath);
      const cvFileUrl = publicUrlData.publicUrl;

      // === Database Operations ===
      const { data: candidate, error: insertError } = await supabase
        .from('candidats')
        .insert({
          candidat_firstname,
          candidat_lastname,
          cv_text: fullCvText, // Store full text in database
          cv_file: cvFileUrl,
          candidat_email,
          candidat_phone
        })
        .select()
        .single();

      if (insertError || !candidate) {
        console.error('Database insert error:', insertError);
        return NextResponse.json({ error: 'Échec enregistrement candidat' }, { status: 500 });
      }

      const { error: relationError } = await supabase
        .from('position_to_candidat')
        .insert({
          position_id: positionId,
          candidat_id: candidate.id,
          candidat_score: score,
          candidat_ai_analyse: analysis,
          candidat_next_step: score < 5 ? "1" : "0",  // 👈 add this line
          source
        });

      if (relationError) {
        console.error('Relation insert error:', relationError);
        return NextResponse.json({ error: 'Échec liaison position/candidat' }, { status: 500 });
      }

      return NextResponse.json({
        score,
        analysis,
        candidateFeedback: feedback
      });

    } catch (aiError: unknown) {
      console.error('AI processing error:', aiError);
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI processing error';
      return NextResponse.json({ error: `AI processing failed: ${errorMessage}` }, { status: 500 });
    }
  }