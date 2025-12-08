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
const numberEmojis = [
  "1️⃣","2️⃣","3️⃣","4️⃣","5️⃣",
  "6️⃣","7️⃣","8️⃣","9️⃣","🔟",
  "1️⃣1️⃣","1️⃣2️⃣","1️⃣3️⃣","1️⃣4️⃣","1️⃣5️⃣",
  "1️⃣6️⃣","1️⃣7️⃣","1️⃣8️⃣","1️⃣9️⃣","2️⃣0️⃣"
];

export function buildQuestionsList(questions) {
  if (!questions.length) return "Список пуст.";

  return questions
    .map((q, idx) => {
      const status = q.status ?? "—";
      const answer = q.answer ?? "—";

      const shortQuestion =
        q.question.length > 60
          ? q.question.slice(0, 60) + "..."
          : q.question;

      const num = numberEmojis[idx] ?? `${idx + 1}.`;

      return (
        `<b>${num} Вопрос:</b> ${shortQuestion}\n` +
        `       <b>Ответ:</b> ${answer}\n` +
        `<i>       ${status}\n` +
        `       Создан ${formatDate(q.createdAt)}</i>`
      );
    })
    .join("\n\n");
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
