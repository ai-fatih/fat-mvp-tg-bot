// src/scripts/build-toc.js
import { parseTOC } from '../pdf/toc.parser.js';
import { saveTOCJson } from '../pdf/toc.storage.js';


export async function buildTOC(pdf) {
    const tocIndex = await parseTOC({
      pdfPath: pdf.path,
      pageFrom: pdf.toc.pageFrom,
      pageTo: pdf.toc.pageTo
    });
  
    await saveTOCJson({
      pdfId: pdf.id,
      tocResult: tocIndex
    });  
}
  