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
    questions: () => `<b>📋 Ваши вопросы</b>`,
    waiting: () => `<i>Ожидайте, менеджер скоро свяжется.</i>`,
    welcome: () => `<b>👋 Добро пожаловать!</b>`,
    success: (t = "Готово") => `✅ <b>${t}</b>`,
    error: (t = "Ошибка") => `❌ <b>${t}</b>`,
    warning: (t = "Внимание") => `⚠️ <b>${t}</b>`,
    info: (t = "Информация") => `ℹ️ <b>${t}</b>`,
};


/**
 * ФОРМАТИРОВАНИЕ ДАТ
 */
export function formatDate(date = new Date()) {
    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}


/**
 * ПРЕДСТАВЛЕНИЕ ВОПРОСОВ
 */
export function buildQuestionsList(questions = []) {
    let out =
        `${headers.questions()} (${questions.length} из 20)` +
        fmt.nl(2);

    for (const q of questions) {
        out += `${fmt.italic(`${q.id}. ${fmt.esc(q.question)}`)}\n`;
        if (q.answer) {
            out += `Ответ: ${fmt.esc(q.answer)}\n`;
        }
        out += fmt.nl();
    }

    return out + fmt.nl() + headers.waiting();
}


/**
 * ТИПОВЫЕ ШАБЛОНЫ
 */
export function buildWelcomeMessage() {
    return (
        `${headers.welcome()}\n` +
        `Напишите ваш вопрос, я добавлю его в список.\n`
    );
}

export function buildAddedQuestion(text) {
    return `${headers.success("Добавлено")}\n${fmt.italic(fmt.esc(text))}`;
}

export function buildDeletedMessage(id) {
    return `${headers.warning("Вопрос удалён")}\nID: ${fmt.bold(id)}`;
}

export function buildErrorMessage(err) {
    return (
        `${headers.error("Произошла ошибка")}\n` +
        fmt.mono(fmt.esc(err?.message || err || "Неизвестная ошибка"))
    );
}

 

/**
 * Общий экспорт
 */
export default {
    fmt,
    list,
    headers,
    formatDate,
    keyboard,

    // основные шаблоны
    buildQuestionsList,
    buildWelcomeMessage,
    buildAddedQuestion,
    buildDeletedMessage,
    buildErrorMessage,
};
