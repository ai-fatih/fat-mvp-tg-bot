// src/pdf/pdf.section.loader.js
import { PDFParse } from 'pdf-parse';
import { readFile } from 'node:fs/promises';

export async function loadSection({ pdfPath, fromPage, toPage }) {
  if (!pdfPath) {
    throw new Error('pdfPath is required');
  }

  if (!fromPage || !toPage || fromPage > toPage) {
    throw new Error(
      `Invalid page range: ${fromPage} - ${toPage}`
    );
  }

  const pages = [];
  for (let i = fromPage; i <= toPage; i++) {
    pages.push(i);
  }

  const buffer = await readFile(pdfPath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText({
      partial: pages
    });

    return {
      text: result.text,
      fromPage,
      toPage
    };
  } finally {
    await parser.destroy();
  }
}
