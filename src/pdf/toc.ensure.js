// src/pdf/toc.ensure.js
import { tocExists } from './toc.storage.js';
import { buildTOC } from '../scripts/build-toc.js';

export async function ensureTOC(pdf) {
  if (tocExists(pdf.id)) {
    console.log(`📦 TOC найден: ${pdf.id}`);
    return;
  }

  console.warn(`⚠️ TOC не найден, создаю: ${pdf.id}`);
  const savedPath = await buildTOC(pdf);
  console.log(`✅ TOC создан: ${savedPath}`);
}
