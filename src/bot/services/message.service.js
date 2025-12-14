// src/bot/services/message.service.js

import { telegram, helpers } from '../../utils/index.js';

const { botTyping } = helpers;
const { safeSend, safeEdit } = telegram;
const { logger } = helpers;

/**
 * Отправка сообщения с имитацией "печатает..."
 */
async function sendMessage(bot, chatId, text, options = {}) {
    await botTyping(bot, chatId);

    const msg = await safeSend(bot, chatId, text, options);

    if (msg?.message_id) {
        logger.debug(
            `[messageService] sendMessage chatId=${chatId} msgId=${msg.message_id}`
        );
    }

    return msg;
}

/**
 * Безопасное редактирование сообщения
 */
async function editMessage(bot, chatId, messageId, text, options = {}) {
    const msg = await safeEdit(bot, chatId, messageId, text, options);

    if (msg) {
        logger.debug(
            `[messageService] editMessage chatId=${chatId} msgId=${messageId}`
        );
    }

    return msg;
}

/**
 * Клавиатура подтверждения / отмены
 */
function buildConfirmCancelKeyboard() {
    return telegram.keyboards.confirmCancel();
}

export const messageService = {
    sendMessage,
    editMessage,
    buildConfirmCancelKeyboard,
};
