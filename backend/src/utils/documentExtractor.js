import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

/**
 * Extract clean plain text from PDF, DOCX, or TXT file buffers
 * @param {Buffer} buffer
 * @param {string} originalname
 * @returns {Promise<string>}
 */
export const extractTextFromBuffer = async (buffer, originalname = '') => {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty file buffer received.');
  }

  const ext = path.extname(originalname).toLowerCase();

  if (ext === '.pdf') {
    try {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const textResult = await parser.getText();
      const cleaned = (textResult.text || '').replace(/-- \d+ of \d+ --/g, '').trim();
      return cleaned;
    } catch (err) {
      console.error('[PDF Parser Error]:', err.message);
      throw new Error(`Failed to parse PDF document: ${err.message}`);
    }
  }

  if (ext === '.docx') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return (result.value || '').trim();
    } catch (err) {
      console.error('[DOCX Parser Error]:', err.message);
      throw new Error(`Failed to parse DOCX document: ${err.message}`);
    }
  }

  if (ext === '.doc') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value && result.value.trim().length > 20) {
        return result.value.trim();
      }
    } catch {
      // Fallback below
    }
    const raw = buffer.toString('latin1').replace(/[^\x20-\x7E\t\n\r]/g, ' ').replace(/\s+/g, ' ');
    return raw.trim();
  }

  // Default text file
  return buffer.toString('utf-8').trim();
};
