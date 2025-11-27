// /utils/telegram/safeSend.js
import { botTyping } from './timer.js';
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
            await botTyping(bot, chatId)
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
        const msg = await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options,
        });
        logger.debug(`[EDIT] chatId=${chatId}, message_id=${messageId}`);
        return msg;
    } catch (err) {
        logger.warn(`[EDIT] Не удалось изменить сообщение ${messageId} в chatId=${chatId}: ${err?.message}`);
        return null;
    }
}

export default { safeSend, safeEdit };
