// messageService.js
import { telegram, helpers } from '../../utils/index.js';
const { botTyping } = helpers;
const { safeSend, safeEdit, clearServiceMessages } = telegram;
const { logger } = helpers;


/**
 * Сервис для работы с сообщениями:
 * - отправка/редактирование сообщений
 * - удаление служебных сообщений
 * - имитация печати (typing)
 */
export class MessageService {
  /**
   * Безопасная отправка сообщения с имитацией "печатает..."
   * @param {object} bot - экземпляр TelegramBot
   * @param {number|string} chatId 
   * @param {string} text 
   * @param {object} options - дополнительные опции
   */
  async sendMessage(bot, chatId, text, options = {}) {
    await botTyping(bot, chatId);
    const msg = await safeSend(bot, chatId, text, options);
    logger.debug(`[MessageService] Отправлено сообщение chatId=${chatId}, id=${msg.message_id}`);
    return msg;
  }

  /**
   * Безопасное редактирование сообщения
   */
  async editMessage(bot, chatId, messageId, text, options = {}) {
    const msg = await safeEdit(bot, chatId, messageId, text, options);
    if (msg) logger.debug(`[MessageService] Изменено сообщение chatId=${chatId}, id=${messageId}`);
    return msg;
  }

  /**
   * Очистка служебных сообщений
   */
  async clearServiceMessages(bot, chatId) {
    await clearServiceMessages(bot, chatId);
    logger.debug(`[MessageService] Очистка служебных сообщений chatId=${chatId} завершена`);
  }
}

// Экземпляр для удобного импорта
export const messageService = new MessageService();
