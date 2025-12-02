import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Поддержка __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Абсолютный путь к JSON
const templatesPath = path.resolve(__dirname, '../../data/serviceMessage.json');

// Чтение JSON
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

/**
 * Генерирует текст сервисного сообщения
 * @param {string} status - статус сообщения (EMPTY, COLLECTING, etc)
 * @param {Array} questions - массив вопросов
 * @returns {string} HTML текст
 */
export function buildServiceMessage(status, questions = []) {
  const tpl = templates[status];

  if (!tpl) {
    return `Ошибка: неизвестный статус ${status}`;
  }

  // Счётчик
  const questionsCount = questions.length;

  // Генерация списка вопросов
  const questionsList = questions
    .map((q, index) => {
      const question = `<b>${index + 1}. ${q.question}</b>`;
      const answer = q.answer
        ? `— Ответ: ${q.answer}`
        : `— Ответ: <i>в обработке…</i>`;

      return `${question}\n${answer}`;
    })
    .join('\n\n');

  // Подстановка переменных
  const body = tpl.body
    .replace('{{questionsCount}}', questionsCount)
    .replace('{{questionsList}}', questionsList || '—');

  // Финальная сборка
  let text = tpl.header;

  if (body.trim().length > 0) {
    text += `\n\n${body}`;
  }

  if (tpl.footer.trim().length > 0) {
    text += `\n\n${tpl.footer}`;
  }

  return text;
}
