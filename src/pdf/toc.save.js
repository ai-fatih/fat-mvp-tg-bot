import fs from 'node:fs/promises';
import path from 'node:path';

export async function saveTOCJson({
  pdfPath,
  tocResult,
  outDir = 'src/data/jsons/pdfHeaders'
}) {
  const pdfName = path.basename(pdfPath, '.pdf');
  const outPath = path.join(outDir, `${pdfName}.toc.json`);

  await fs.mkdir(outDir, { recursive: true });

  const payload = {
    meta: {
      pdf: pdfPath,
      generatedAt: new Date().toISOString(),
      flatCount: tocResult.flat.length,
      treeCount: tocResult.tree.length
    },
    flat: tocResult.flat,
    tree: tocResult.tree
  };

  await fs.writeFile(
    outPath,
    JSON.stringify(payload, null, 2),
    'utf-8'
  );

  return outPath;
}
