// lib/parsePdfSafe.ts

/**
 * Simple, reliable PDF parsing using pdf-parse with fallback
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  console.log("Starting PDF parsing, buffer size:", buffer.length);
  
  // Try pdf-parse first
  try {
    const pdfParse = (await import('pdf-parse')).default;
    
    // Simple timeout wrapper
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('PDF parsing timeout')), 15000);
    });
    
    const parsePromise = pdfParse(buffer);
    
    const pdfData = await Promise.race([parsePromise, timeoutPromise]);
    clearTimeout(timeoutId!);
    
    // Type the pdf-parse result properly
    const pdfResult = pdfData as { text: string; numpages: number };
    const extractedText = pdfResult.text?.trim() || '';
    
    if (extractedText.length > 0) {
      const limitedText = extractedText.length > 10000 
        ? extractedText.substring(0, 10000) + '...[truncated]'
        : extractedText;
        
      console.log(`pdf-parse successful - ${limitedText.length} characters`);
      return limitedText;
    }
    
    throw new Error("No text content found");

  } catch (error) {
    console.error('pdf-parse failed:', error);
    
    // Fallback: Manual text extraction
    try {
      const result = extractTextFromPdfBuffer(buffer);
      if (result.length > 20) {
        console.log(`Fallback extraction successful - ${result.length} characters`);
        return result;
      }
    } catch (fallbackError) {
      console.error('Fallback extraction failed:', fallbackError);
    }
    
    // Final fallback message
    return `CV téléchargé avec succès (${Math.round(buffer.length / 1024)} Ko)

⚠️ Extraction automatique du texte indisponible

Le fichier PDF a été sauvegardé et est accessible à l'équipe de recrutement.

Solutions pour le candidat:
• Télécharger le CV au format .txt ou .docx
• Copier-coller le contenu dans le formulaire
• Ajouter les informations clés dans la description

Statut: Fichier uploadé ✓ Sauvegardé ✓ Prêt pour révision manuelle ✓`;
  }
}

/**
 * Manual PDF text extraction fallback
 */
function extractTextFromPdfBuffer(buffer: Buffer): string {
  const pdfContent = buffer.toString('binary');
  let extractedText = '';
  
  // Look for text objects (fixed regex for older ES versions)
  const textRegex = /BT\s+([\s\S]*?)\s+ET/g;
  const matches = pdfContent.match(textRegex);
  
  if (matches) {
    for (const match of matches) {
      // Extract text from Tj operations
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(match)) !== null) {
        const text = tjMatch[1]
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .trim();
        if (text.length > 1) {
          extractedText += text + ' ';
        }
      }
    }
  }
  
  // Clean up
  extractedText = extractedText
    .replace(/\s+/g, ' ')
    .trim();
  
  // If manual extraction fails, try basic ASCII
  if (extractedText.length < 20) {
    const asciiText = buffer
      .toString('utf8')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (asciiText.length > 50) {
      return asciiText.substring(0, 3000);
    }
  }
  
  return extractedText;
}

export default parsePdfBuffer;