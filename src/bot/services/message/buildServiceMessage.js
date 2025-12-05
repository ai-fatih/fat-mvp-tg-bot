import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { telegram } from "../../../utils/index"

// Поддержка __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Абсолютный путь к JSON
const templatesPath = path.resolve(__dirname, './serviceMessage.json');
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

export function buildServiceMessage(status, questions = [], state = {}) {
  const tpl = templates[status];
  if (!tpl) return { text: `Ошибка: неизвестный статус ${status}`, reply_markup: null };

  // 1) Строим список вопросов (если нужен)
  const questionsListText =
    questions.length > 0
      ? buildQuestionsList(questions)
      : '';

  // 2) Подставляем переменные в одну строку
  const applyVars = (str) => {
    if (!str) return '';
    return str
      .replace(/\{questionsList\}|\{\{questionsList\}\}/g, questionsListText)
      .replace(/\{questionsCount\}/g, questions.length.toString())
      .replace(/\{lastQuestion\}/g, questions.at(-1)?.question || '—')
      // универсальная подстановка из state
      .replace(/\{(\w+)\}/g, (_, key) => state[key] ?? `{${key}}`);
  };

  // 3) Собираем текст
  const text = [
    applyVars(tpl.header),
    applyVars(tpl.body),
    applyVars(tpl.footer)
  ]
    .filter(Boolean)
    .join('\n\n');

  // 4) Клавиатура
  const reply_markup = telegram.buildInlineKeyboard(tpl.btns);

  return { text, reply_markup };
}

