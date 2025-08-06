import fs from 'fs'
import pdfParse from 'pdf-parse'

export async function parsePdfBuffer(buffer: Buffer) {
  const data = await pdfParse(buffer)
  return data.text
}