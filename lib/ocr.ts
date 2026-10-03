// lib/ocr.ts
import Tesseract from "tesseract.js";

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  const { data } = await Tesseract.recognize(buffer, "eng", {
    logger: m => console.log("OCR:", m.status, m.progress),
  });
  return data.text;
}
