// /utils/telegram/formatMessage.js

/**
 * БАЗОВЫЕ HTML-ФОРМАТИРУЮЩИЕ ФУНКЦИИ
 * (Все — pure functions, безопасны для Telegram)
 */
export const fmt = {
    bold: (t) => `<b>${t}</b>`,
    italic: (t) => `<i>${t}</i>`,
    mono: (t) => `<code>${t}</code>`,
    strike: (t) => `<s>${t}</s>`,
    underline: (t) => `<u>${t}</u>`,

    block: (t) => `<pre>${t}</pre>`,   // многострочный код
    quote: (t) => `❝ ${t}`,           // простой quote

    br: () => `\n`,
    nl: (count = 1) => `\n`.repeat(count),

    // Экранирование текста от HTML
    esc: (t = "") =>
        t.replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/&/g, "&amp;"),
};


/**
 * ГЕНЕРАТОРЫ СПИСКОВ
 */
export const list = {
    bullet: (items = []) =>
        items.map(i => `• ${fmt.esc(i)}`).join("\n"),

    numeric: (items = []) =>
        items.map((i, idx) => `${idx + 1}. ${fmt.esc(i)}`).join("\n"),

    checkbox: (items = []) =>
        items.map(i => `☑️ ${fmt.esc(i)}`).join("\n"),
};


/**
 * ЗАГОЛОВКИ / БЛОКИ / СТАТУСЫ
 */
export const headers = {
    questions: (t) => `<b>Здравствуйте, Ваш вопрос принят!\n📋 Текущий список (${t} из 10):</b>`,
    waiting: () => `Работаем над ответами\nЕсли нужно - напишите следующий вопрос`,
    welcome: () => `<b>👋 Добро пожаловать!</b>`,
    success: (t = "Готово") => `✅ <b>${t}</b>`,
    error: (t = "Ошибка") => `❌ <b>${t}</b>`,
    warning: (t = "Внимание") => `⚠️ <b>${t}</b>`,
    info: (t = "Информация") => `ℹ️ <b>${t}</b>`,
};


/**
 * ФОРМАТИРОВАНИЕ ДАТ
 */

export function formatDate(dateISO) {
    try {
    const d = new Date(dateISO);
    return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
    });
    } catch (e) {
    return dateISO;
    }
    }

/**
 * ПРЕДСТАВЛЕНИЕ ВОПРОСОВ
 */
export function buildQuestionsList(questions) {
  return questions
    .map((q, i) => {
      const created = telegram.formatDate(q.createdAt);

      const status = q.ready
        ? 'Готов'
        : q.answer
          ? 'Отвечен'
          : 'В обработке';

      return `
<b>${i + 1}. Вопрос:</b> ${q.question}

💬 <b>Ответ:</b> ${q.answer || '—'}
🔄 <b>Статус:</b> ${status}
📎 <b>Файлов:</b> ${q.files?.length || 0}
🕒 <b>Создан:</b> ${created}
      `.trim();
    })
    .join('\n\n');
}
 

/**
 * Общий экспорт
 */
export default {
    fmt,
    list,
    headers,
    formatDate,
    
    // основные шаблоны
    buildQuestionsList
};
