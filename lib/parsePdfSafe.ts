import pdfParse from 'pdf-parse';

process.env.DEBUG= 'false';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  // Just parse the buffer without accessing filesystem
  const data = await pdfParse(buffer);
  return data.text;
}