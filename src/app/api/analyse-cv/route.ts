import { NextRequest, NextResponse } from 'next/server'
import { parsePdfBuffer } from '../../../../lib/parsePdfSafe'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const jobDescription = formData.get('jobDescription') as string || null

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const cvText = await parsePdfBuffer(buffer)

    const prompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Voici la description du poste ciblé:
'
${jobDescription}

Fais une analyse complète :
1. Résumé du profil
2. Compétences clés
3. Points à améliorer
4. Suggestions de postes adaptés
5. Ton avis global

Donne aussi un score sur 10 de la correspondance du CV avec ce poste, avec 10 = parfaitement adapté.
Répond en JSON au format suivant :
{
  "score": number,
  "analysis": string
  }

IMPORTANT : Réponds uniquement avec un objet JSON valide, sans aucun commentaire, explication ou texte en dehors de cet objet.

`
  //Local ML Lab
  /*  const res = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer lm-studio', // requis même en local
      },
      body: JSON.stringify({
        model: 'mistral-7b-instruct-v0.2', // ou le modèle que tu as lancé
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
    }) */

    //OpenRouter
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // ou ton domaine de prod
        'X-Title': 'CV Analyzer',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // ✅ modèle gratuit
        messages: [{ role: 'user', content: prompt }],
      }),
    })


    const completion = await res.json()

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      return NextResponse.json({ error: 'Erreur de l’IA. Réponse invalide.' }, { status: 500 })
    }

  //  const result = completion.choices[0].message.content
  //  return NextResponse.json({ analysis: result })

const rawResponse = completion.choices[0].message.content

// Parse JSON safely - Récupération de la réponse de l'AI
let parsedResponse
try {
  const match = rawResponse.match(/\{[\s\S]*\}/) // extrait le bloc JSON
    if (!match) {
      return NextResponse.json({ error: 'Réponse JSON invalide de l’IA.' }, { status: 500 })
    }

    try {
      parsedResponse = JSON.parse(match[0])
    } catch (err) {
      console.error('Erreur de parsing JSON:', err)
      return NextResponse.json({ error: 'Impossible de parser la réponse de l’IA.' }, { status: 500 })
    }
} catch {
  return NextResponse.json({ error: 'Réponse JSON invalide de l’IA.' }, { status: 500 })
}

const { score, analysis } = parsedResponse
return NextResponse.json({ score, analysis })




  } catch (err: any) {
    console.error('Erreur API:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}