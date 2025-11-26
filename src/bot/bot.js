// src/bot/bot.js
import TelegramBot from 'node-telegram-bot-api';

/**
 * Создаёт экземпляр Telegram бота
 * @param {string} token - токен бота
 * @param {Object} options - настройки бота (polling, debug и т.д.)
 */
export const createBot = (token, options = {}) => {
  const bot = new TelegramBot(token, { polling: options.polling ?? true });

  if (options.debug) {
    console.log("Bot config:", options);
  }

  return bot;
};
