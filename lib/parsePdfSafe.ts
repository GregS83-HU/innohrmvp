// src/lib/pdfParseSafe.ts
// ⛔️ Attention : pas d'import depuis 'pdf-parse' (le root), sinon mode debug déclenché

const pdfParse = require('pdf-parse/lib/pdf-parse')

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text
}