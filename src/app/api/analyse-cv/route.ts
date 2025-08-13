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

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 })
    }

    // reading of the PDF for parsing to AI model
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const cvText = await parsePdfBuffer(buffer)

    //On prépare le fichier pour son enregistrement en base de données
// 1. Nom unique pour éviter les collisions et nettoyage avant insertion dans Supabase
function sanitizeFileName(filename: string) {
  return filename
    .normalize('NFD') // enlève accents
    .replace(/[\u0300-\u036f]/g, '') // supprime diacritiques
    .replace(/\s+/g, '_') // remplace espaces par underscores
    .replace(/[^a-zA-Z0-9._-]/g, '') // enlève caractères interdits
}

const safeFileName = sanitizeFileName(file.name)
const filePath = `cvs/${Date.now()}_${safeFileName}`


// 2. Upload du fichier dans Supabase Storage
const { error: uploadError } = await supabase.storage
  .from('cvs')
  .upload(filePath, buffer, {
    contentType: 'application/pdf'
  })

if (uploadError) {
  console.error('Erreur upload fichier:', uploadError)
  return NextResponse.json({ error: 'Échec de l’upload du CV' }, { status: 500 })
}

// 3. Récupérer l’URL publique
const { data: publicUrlData } = supabase.storage
  .from('cvs')
  .getPublicUrl(filePath)

const cvFileUrl = publicUrlData.publicUrl
// end of PDF file preparation for upload

console.log("Job Description passed:",jobDescription)

// AI model prompt
    const prompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Voici la description détaillée du poste ciblé:

${jobDescription}

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




Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": string
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.

La réponse doit etre en anglais parfait

`
//End of AI Model Prompt


    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'CV Analyzer',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const completion = await res.json()
    const rawResponse = completion.choices?.[0]?.message?.content ?? ''

    const match = rawResponse.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'Réponse JSON invalide de l’IA.' }, { status: 500 })
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(match[0])
    } catch (err) {
      console.error('Erreur de parsing JSON:', err, 'avec la réponse:', rawResponse)
      return NextResponse.json({ error: 'Impossible de parser la réponse de l’IA.' }, { status: 500 })
    }

    const { score, analysis } = parsedResponse

    // 🔄 Enregistrement dans Supabase
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

    if (insertError || !candidate) {
      console.error('Erreur insertion candidat:', insertError)
      return NextResponse.json({ error: 'Échec de l’enregistrement du candidat' }, { status: 500 })
    }

    const { error: relationError } = await supabase
      .from('position_to_candidat')
      .insert({
        position_id: positionId,
        candidat_id: candidate.id,
        candidat_score: score
      })

    if (relationError) {
      console.error('Erreur relation position/candidat:', relationError)
      return NextResponse.json({ error: 'Échec de la liaison position/candidat' }, { status: 500 })
    }

    return NextResponse.json({ score, analysis })

  } catch (err: unknown) {
    console.error('Erreur API:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}