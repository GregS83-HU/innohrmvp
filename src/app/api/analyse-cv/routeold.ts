import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai' // ✅ Import mis à jour
import { parsePdfBuffer } from '../../../../lib/parsePdfSafe'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Fichier PDF requis.' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  //const pdfData = await pdf(buffer)
  //const cvText = pdfData.text
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

console.log('Texte extrait du PDF:', cvText)

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  })


  const result = completion.choices[0].message?.content

console.log('Reponse OpenAI:', result)

  return NextResponse.json({ analysis: result })
}