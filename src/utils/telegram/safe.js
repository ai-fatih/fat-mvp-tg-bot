// /utils/telegram/safe.js
import { logger } from '../helpers/logger.js';

/**
 * Безопасная отправка сообщений ботом
 *
 * @param {object} bot - экземпляр TelegramBot
 * @param {number|string} chatId - ID чата
 * @param {string} text - текст сообщения
 * @param {object} [options={}] - опции Telegram (parse_mode, reply_markup, disable_notification и т.д.)
 * @param {number} [retries=3] - количество попыток при ошибке
 * @returns {Promise<object>} - объект отправленного сообщения
 */
export async function safeSend(bot, chatId, text, options = {}, retries = 3) {
    let sentMessage = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try { 
            sentMessage = await bot.sendMessage(chatId, text, {
                parse_mode: 'HTML', // HTML по умолчанию
                ...options,
            });

            logger.debug(`[SEND] chatId=${chatId}, message_id=${sentMessage.message_id}`);
            return sentMessage;

        } catch (err) {
            logger.warn(`[SEND] попытка ${attempt} для chatId=${chatId} не удалась: ${err?.code || err?.message}`);

            if (attempt === retries) {
                logger.error(`[SEND] окончательная ошибка отправки сообщения chatId=${chatId}`);
                throw err;
            }

            // Задержка перед повторной попыткой
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return sentMessage;
}
/**
 * Вспомогательная функция для редактирования сообщений
 *
 * @param {object} bot - экземпляр TelegramBot
 * @param {number|string} chatId - ID чата
 * @param {number} messageId - ID сообщения
 * @param {string} text - новый текст
 * @param {object} [options={}] - дополнительные опции Telegram
 */
export async function safeEdit(bot, chatId, messageId, text, options = {}) {
    try {
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        ...options,
      });
      return true;
    } catch (err) {
      const msg = err?.response?.body?.description || err.message;
  
      if (msg?.includes('message is not modified')) {
        return 'NOT_MODIFIED';
      }
  
      if (
        msg?.includes('message to edit not found') ||
        msg?.includes('message identifier is not specified') ||
        msg?.includes('message can\'t be edited')
      ) {
        return 'NOT_FOUND';
      }
  
      // всё остальное — настоящая ошибка
      throw err;
    }
  }
export async function safeDelete(bot, chatId, msgId) {
    try {
      await bot.deleteMessage(chatId, msgId);
      return true;
    } catch (e) {
      // Telegram часто кидает "message can't be deleted"
      logger.debug(
        `[UI] delete failed msg=${msgId} chat=${chatId}: ${e.message}`
      );
      return false;
    }
  }
export async function safeDeleteWithRetry(bot, chatId, msgId, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      await bot.deleteMessage(chatId, msgId);
      return true;
    } catch (e) {
      if (i === retries - 1) return false;
      await new Promise(r => setTimeout(r, 500));
    }
  }
}


