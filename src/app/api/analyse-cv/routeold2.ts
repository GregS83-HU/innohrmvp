import { NextRequest, NextResponse } from 'next/server'
import { parsePdfBuffer } from '../../../../lib/parsePdfSafe'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const cvText = await parsePdfBuffer(buffer)

  const prompt = `
Tu es un expert RH. Voici un CV :

${cvText}

Fais une analyse complète :
1. Résumé du profil
2. Compétences clés
3. Points à améliorer
4. Suggestions de postes adaptés
5. Ton avis global
`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // change if deployed
        'X-Title': 'CV Analyzer',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct', // ✅ free model
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
    })
        console.log('Clé API OpenRouter utilisée :', process.env.OPENROUTER_API_KEY)

    const completion = await res.json()
    console.log('Réponse OpenRouter brute:', JSON.stringify(completion, null, 2))

    if (!res.ok || !completion.choices || !completion.choices[0]?.message?.content) {
      return NextResponse.json({ error: 'Erreur de l’IA. Réponse invalide.' }, { status: 500 })
    }

    const result = completion.choices[0].message.content

    return NextResponse.json({ analysis: result })
  } 
    catch (err: unknown) {
    return NextResponse.json('Erreur lors de l’appel à OpenRouter.', { status: 500 })
  }
}