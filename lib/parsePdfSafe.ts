// src/lib/parsePdfSafe.ts

// ===== DISABLE DEBUG BEFORE ANY IMPORT =====
process.env.DEBUG = 'false';
process.env.NODE_DEBUG = '';

import pdfParse from 'pdf-parse';

/**
 * Parses a PDF buffer safely in a serverless environment.
 * @param buffer PDF file as a Buffer
 * @returns Extracted text
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    console.error('PDF parsing failed:', err);
    return '';
  }
}
