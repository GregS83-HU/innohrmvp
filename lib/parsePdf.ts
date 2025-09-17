import pdfParse from 'pdf-parse'

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(Buffer.from(buffer)) // important : pas de "new Buffer()"
    return data.text || ''
  } catch (err) {
    console.error('Erreur parsePdfBuffer:', err)
    return '' // fallback si le PDF est illisible
  }
}