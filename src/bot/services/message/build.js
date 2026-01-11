// buildServiceMessage.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { telegram } from '../../../utils/index.js'; 

// __dirname support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesPath = path.resolve(__dirname, './templates.json');
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

export function buildServiceMessage(status, questions = []) {
  const tpl = templates[status];
  if (!tpl) {
    return {
      text: `Ошибка: неизвестный статус (${status})`,
      reply_markup: null
    };
  }

  const questionsList = telegram.buildQuestionsList(questions);


  /* const mainTopics = [
    { text: 'ЕГАИС', action: 'egais' },
    { text: 'Заявки', action: 'requests' },
    { text: 'Накладные', action: 'invoices' },
    { text: 'Справочники', action: 'references' },
    { text: 'Отчеты', action: 'reports' }
  ];
    */
  
  /**
   * 🧭 MVP-debug: строка текущего статуса
   * Используется только если tpl.status существует
   */
  const statusLine = tpl.status
    ? tpl.status.replace('{chatStatus}', status)
    : null;

  const text = [
    tpl.header,
    statusLine, // 👈 ВАЖНО: вставляем сразу после header
    tpl.body?.replace('{questionsList}', questionsList),
    tpl.footer
  ]
    .filter(Boolean)
    .join('\n\n');
 
  const reply_markup = telegram.buildInlineKeyboard(tpl.btns);

  return { text, reply_markup };
}
