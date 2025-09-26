import pdfParse from 'pdf-parse';

process.env.DEBUG= 'false';
process.env.NODE_DEBUG = '';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Just parse the buffer without accessing filesystem
  const data = await pdfParse(buffer);
  return data.text;
}