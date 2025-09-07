// src/app/api/analyse-cv/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { parsePdfBuffer } from '../../../../lib/parsePdfSafe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const jobDescription = formData.get('jobDescription') as string
    const jobDescriptionDetailed = formData.get('jobDescriptionDetailed') as string
    const firstname = formData.get('firstName') as string
    const lastname = formData.get('lastName') as string
    const positionId = formData.get('positionId') as string
    const source = formData.get('source') as string || 'upload manuel'

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const cvText = await parsePdfBuffer(buffer)

    function sanitizeFileName(filename: string) {
      return filename
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '')
    }

    const safeFileName = sanitizeFileName(file.name)
    const filePath = `cvs/${Date.now()}_${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, buffer, { contentType: 'application/pdf' })

    if (uploadError) return NextResponse.json({ error: 'Échec upload CV' }, { status: 500 })

    const { data: publicUrlData } = supabase.storage.from('cvs').getPublicUrl(filePath)
    const cvFileUrl = publicUrlData.publicUrl

    // Prompt AI pour l'analyse RH (interne)
    const hrPrompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Voici la description détaillée du poste ciblé:

${jobDescription}

Analyze the CV only against the provided job description with extreme rigor.
Do not guess, assume, or infer any skill, experience, or qualification that is not explicitly written in the CV.
Be critical: even a single missing core requirement should significantly lower the score.
If the CV shows little or no direct relevance, the score must be 3 or lower.
Avoid "benefit of the doubt" scoring.

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

Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": string
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.

La réponse doit etre en anglais parfait
`

    // Prompt AI pour le feedback candidat (externe)
    const candidateFeedbackPrompt = `
Tu es un consultant en carrière bienveillant. Voici un CV d'un candidat :

${cvText}

Voici la description du poste pour lequel il/elle a postulé:

${jobDescription}

Provide constructive and encouraging feedback directly to the candidate. Your goal is to help them understand how their profile matches the position and give actionable advice for improvement.

Structure your response as follows:

**Your Strengths**
- Highlight the positive aspects of their CV that align with the position
- Mention transferable skills and relevant experiences

**Areas for Development**
- Identify skill gaps in a supportive way
- Suggest specific ways to address these gaps (training, certifications, projects, etc.)

**Career Advice**
- Provide constructive suggestions for their career path
- Mention alternative positions that might be a good fit
- Give tips for improving their CV or application

**Next Steps**
- Actionable recommendations they can implement immediately
- Resources or learning paths they could pursue

Keep the tone:
- Professional but warm and encouraging
- Constructive rather than critical
- Focused on growth opportunities
- Honest but supportive

Respond only with a valid JSON in this format:
{
  "feedback": "string containing the full feedback message"
}
IMPORTANT: Respond with nothing other than this JSON.

The response must be in perfect English.
`

    // Appel API pour l'analyse RH
    const hrRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: hrPrompt }],
      }),
    })

    const hrCompletion = await hrRes.json()
    const hrRawResponse = hrCompletion.choices?.[0]?.message?.content ?? ''
    const hrMatch = hrRawResponse.match(/\{[\s\S]*\}/)
    if (!hrMatch) return NextResponse.json({ error: 'Réponse JSON IA invalide pour analyse RH' }, { status: 500 })

    const { score, analysis } = JSON.parse(hrMatch[0])

    // Appel API pour le feedback candidat
    const candidateRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: candidateFeedbackPrompt }],
      }),
    })

    const candidateCompletion = await candidateRes.json()
    const candidateRawResponse = candidateCompletion.choices?.[0]?.message?.content ?? ''
    const candidateMatch = candidateRawResponse.match(/\{[\s\S]*\}/)
    if (!candidateMatch) return NextResponse.json({ error: 'Réponse JSON IA invalide pour feedback candidat' }, { status: 500 })

    const { feedback } = JSON.parse(candidateMatch[0])

    const { data: candidate, error: insertError } = await supabase
      .from('candidats')
      .insert({
        candidat_firstname: firstname,
        candidat_lastname: lastname,
        cv_text: cvText,
        cv_file: cvFileUrl
      })
      .select()
      .single()

    if (insertError || !candidate) return NextResponse.json({ error: 'Échec enregistrement candidat' }, { status: 500 })

    const { error: relationError } = await supabase
      .from('position_to_candidat')
      .insert({
        position_id: positionId,
        candidat_id: candidate.id,
        candidat_score: score,
        candidat_ai_analyse: analysis,
        source
      })

    if (relationError) return NextResponse.json({ error: 'Échec liaison position/candidat' }, { status: 500 })

    return NextResponse.json({ 
      score, 
      analysis, 
      candidateFeedback: feedback 
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}