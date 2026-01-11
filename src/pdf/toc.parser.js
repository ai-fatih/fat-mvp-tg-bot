import { PDFParse } from 'pdf-parse';
import fs from 'fs';

/**
 * Парсит оглавление PDF
 */
export async function parseTOC({ pdfPath, pageFrom, pageTo }) {
  const buffer = fs.readFileSync(pdfPath);

  const parser = new PDFParse({
    data: buffer
  });

  // вытаскиваем только страницы оглавления
  const result = await parser.getText({
    partial: range(pageFrom, pageTo)
  });

  await parser.destroy();

  const lines = result.text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const items = [];

  for (const line of lines) {
    const parsed = parseTocLine(line);
    if (parsed) {
      items.push(parsed);
    }
  }

  const flat = items;
  const tree = buildTree(flat);

  return { flat, tree };
}

/**
 * Генерация массива страниц
 * 3..25 → [3,4,...,25]
 */
function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

/**
 * Парсинг строки оглавления
 */
function parseTocLine(line) {
  const regex = /^(\d+(?:\.\d+)*)\s+(.+?)\s+\.{2,}\s+(\d+)$/;
  const match = line.match(regex);
  if (!match) return null;

  const [, id, title, page] = match;
  const level = id.split('.').length;
  const parentId = level > 1 ? id.split('.').slice(0, -1).join('.') : null;

  return {
    id,
    title,
    page: Number(page),
    level,
    parentId
  };
}

/**
 * Построение дерева
 */
function buildTree(flat) {
  const map = new Map();
  const roots = [];

  flat.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  flat.forEach(item => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(map.get(item.id));
    } else {
      roots.push(map.get(item.id));
    }
  });

  return roots;
}
