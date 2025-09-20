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

export async function parsePdfBufferSafe(buffer: Buffer) : Promise<string>{
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err: any) {
    console.warn('PDF parsing failed:', err.message);

    // Basic fallback: extract raw text from buffer
    const rawText = buffer.toString('utf-8').replace(/\0/g, ''); 
    return rawText.length > 0 ? rawText : '';
  }
}