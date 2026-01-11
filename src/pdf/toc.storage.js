// src/pdf/toc.storage.js
import fs from 'fs';
import path from 'path';

const BASE_DIR = 'src/data/jsons/pdfHeaders';

export function getTOCPath(pdfId) {
  return path.join(BASE_DIR, `${pdfId}.toc.json`);
}

export function tocExists(pdfId) {
  return fs.existsSync(getTOCPath(pdfId));
}

export async function saveTOCJson({ pdfId, tocResult }) {
  const filePath = getTOCPath(pdfId);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(tocResult, null, 2));

  return filePath;
}
