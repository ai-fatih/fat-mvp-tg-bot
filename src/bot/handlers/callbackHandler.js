// src/bot/handlers/callbackHandler.js

import { callbackRoutes } from './callbacks/index.js';
import { logger } from '../../utils/helpers/logger.js';

export function setupCallbackHandler(bot) {
  bot.on('callback_query', async (msg) => {
    const chatId = msg.message?.chat.id;
    const messageId = msg.message?.message_id;
    const data = msg.data;

    // Telegram требует подтверждения callback
    bot.answerCallbackQuery(msg.id).catch(() => {});

    const handler = callbackRoutes[data];

    if (!handler) {
      logger.warn('[CALLBACK] unknown action', {
        chatId,
        data,
      });
      return;
    }

    try {
      await handler(bot, {
        chatId,
        messageId,
        callbackId: msg.id,
        raw: msg,
      });
    } catch (err) {
      logger.error('[CALLBACK] handler failed', {
        data,
        chatId,
        error: err.message,
      });
    }
  });
}
