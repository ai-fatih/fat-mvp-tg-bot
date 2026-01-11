// src/pdf/toc.loader.js
import fs from 'fs';
import { getTOCPath } from './toc.storage.js';

export function loadTOC(pdfId) {
  const filePath = getTOCPath(pdfId);

  if (!fs.existsSync(filePath)) {
    throw new Error(`TOC не найден для pdfId=${pdfId}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}
