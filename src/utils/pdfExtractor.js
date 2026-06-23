import * as pdfjsLib from 'pdfjs-dist';
// Vite-friendly way to wire up the pdf.js worker as a URL asset.
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MAX_FILE_SIZE_MB = 8;

export class PdfExtractionError extends Error {}

/**
 * Validates that the selected file is a usable PDF before we touch it.
 */
export function validatePdfFile(file) {
  if (!file) {
    throw new PdfExtractionError('No file selected.');
  }
  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name?.toLowerCase().endsWith('.pdf');
  if (!isPdfMime && !isPdfExt) {
    throw new PdfExtractionError('Please upload a PDF file (.pdf).');
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new PdfExtractionError(`File is too large. Keep it under ${MAX_FILE_SIZE_MB}MB.`);
  }
  return true;
}

/**
 * Extracts plain text from a PDF File/Blob entirely in the browser.
 * Reconstructs rough line breaks by tracking the Y position of each text run.
 */
export async function extractTextFromPdf(file, { onProgress } = {}) {
  validatePdfFile(file);

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageTexts = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    let lastY = null;
    let line = [];
    const lines = [];

    for (const item of content.items) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(line.join(' ').replace(/\s+/g, ' ').trim());
        line = [];
      }
      line.push(item.str);
      lastY = y;
    }
    if (line.length) {
      lines.push(line.join(' ').replace(/\s+/g, ' ').trim());
    }

    pageTexts.push(lines.filter(Boolean).join('\n'));
    onProgress?.(pageNum / pdf.numPages);
  }

  const fullText = pageTexts.join('\n\n').trim();

  if (!fullText || fullText.length < 30) {
    throw new PdfExtractionError(
      'Could not read text from this PDF. It may be a scanned image — try exporting a text-based PDF instead.'
    );
  }

  return fullText;
}
