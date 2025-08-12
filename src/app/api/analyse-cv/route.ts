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

// AI model prompt
    const prompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Voici la description du poste ciblé:

${jobDescription}

Analyse objectivement la correspondance entre le CV et le poste. Sois rigoureux et n'accorde une bonne note que si le profil correspond clairement.

Fais une analyse complète :
1. Résumé du profil
2. Compétences clés
3. Points à améliorer
4. Suggestions de postes alternatifs si ce poste ne convient pas
5. Ton avis global

Donne un score de correspondance sur 10 :
- 9–10 : correspondance parfaite
- 7–8 : profil qui pourrait correspondre avec un accompagnement fort
- 5–6 : bon candidat avec quelques écarts acceptables
- <5 : profil non adapté

L'analyse doit etre stricte. Ne remonte qu'un score au dessus de 5 uniquement si le candidat a vraiment un CV qui correspond á la description de poste.

La réponse doit etre en anglais

Répond uniquement avec un JSON strictement valide, au format :
{
  "score": number,
  "analysis": string
}
IMPORTANT : Ne réponds avec rien d'autre que ce JSON.
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