// lib/parsePdfSafe.ts

/**
 * Clean, reliable PDF parsing using pdf-parse
 * Optimized for both local development and Vercel deployment
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  console.log("Starting PDF parsing with pdf-parse, buffer size:", buffer.length);
  
  try {
    // Dynamic import to avoid build-time issues in serverless
    const pdfParse = (await import('pdf-parse')).default;
    
    // Parse PDF without options (safest approach)
    const pdfData = await pdfParse(buffer);

    const extractedText = pdfData.text?.trim() || '';
    
    if (extractedText.length > 0) {
      // Limit text length for performance if needed (e.g., first 10,000 characters)
      const limitedText = extractedText.length > 10000 
        ? extractedText.substring(0, 10000) + '...[truncated]'
        : extractedText;
        
      console.log(`PDF parsing successful - extracted ${limitedText.length} characters from ${pdfData.numpages} pages`);
      return limitedText;
    } else {
      console.warn("PDF parsed but no text content found");
      return "PDF processed successfully but no readable text content was found.";
    }

  } catch (error) {
    console.error('pdf-parse failed:', error);
    
    // Enhanced error message with specific guidance
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return `PDF text extraction failed: ${errorMessage}

The PDF file has been uploaded and saved successfully, but automatic text extraction encountered an issue.

Options to proceed:
• Upload the CV as a .txt or .docx file for better text extraction
• Copy and paste the CV content into the application form  
• The recruiter can download and review the original PDF file

File status: Uploaded ✓ Saved ✓ Available for manual review ✓`;
  }
}

// Default export for compatibility
export default parsePdfBuffer;