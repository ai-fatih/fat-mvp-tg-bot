// /utils/helpers/textUtils.js

/**
 * Очистка текста: убирает лишние пробелы, переносы строк
 */
export const normalize = (text) => text?.trim().replace(/\s+/g, ' ') || '';

/**
 * Преобразует текст в безопасный для HTML Telegram
 */
export const escapeHtml = (text) => text
    ?.replace(/&/g, "&amp;")
    ?.replace(/</g, "&lt;")
    ?.replace(/>/g, "&gt;")
    ?.replace(/"/g, "&quot;")
    ?.replace(/'/g, "&#039;") || '';
