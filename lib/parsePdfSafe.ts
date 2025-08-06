// src/lib/pdfParseSafe.ts
// ⛔️ Attention : pas d'import depuis 'pdf-parse' (le root), sinon mode debug déclenché

//const pdfParse = require('pdf-parse/lib/pdf-parse')
/*import pdfParse from 'pdf-parse'
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text
}*/


// ⚠️ Ne pas utiliser l'import global, cela déclenche le mode debug
// ⛔️ import pdfParse from 'pdf-parse'
// ✅ Utiliser une importation dynamique uniquement à l'exécution

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // L'import dynamique empêche le déclenchement de code en dehors de l'appel
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}