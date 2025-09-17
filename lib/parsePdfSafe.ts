// src/lib/parsePdfSafe.ts

// Tell TypeScript to ignore missing types
// @ts-ignore
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')

/**
 * Extracts all text from a PDF buffer.
 * @param buffer PDF file as a Buffer
 * @returns extracted text as a string
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Load the PDF
  const loadingTask = pdfjsLib.getDocument({ data: buffer })
  const pdf = await loadingTask.promise

  let text = ''

  // Loop through each page
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    // Combine text items from the page
    const pageText = content.items.map((item: any) => item.str).join(' ')
    text += pageText + '\n'
  }

  return text
}
