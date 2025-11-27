// /utils/telegram/clearServiceMessages.js
import { 
  getServiceMessages,
  removeServiceMessage
} from '../state/stateHelpers.js';

import { logger } from '../helpers/logger.js';

/**
 * Очищает все служебные сообщения чата.
 * Ничего не решает сам — только удаляет.
 */
export async function clearServiceMessages(bot, chatId) {
    const serviceIds = getServiceMessages(chatId);

    if (!serviceIds.length) {
        logger.debug(`[CLEANUP] нет служебных сообщений`);
        return;
    }

    logger.debug(`[CLEANUP] начинаю удаление ${serviceIds.length} сообщений`);

    // Копия массива для безопасного обхода
    for (const msgId of [...serviceIds]) {
        const ok = await deleteWithRetry(bot, chatId, msgId);

        if (ok) {
            removeServiceMessage(chatId, msgId);
            logger.cleanup(`[CLEANUP] удалено сообщение: ${msgId}`);
        } else {
            logger.warn(`[CLEANUP] не удалось удалить сообщение: ${msgId}`);
        }
    }
}

/**
 * Удаляет сообщение с 2 попытками.
 * Обособлена, чтобы легко переиспользовать и тестировать.
 */
async function deleteWithRetry(bot, chatId, msgId) {
    const retries = 2;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await bot.deleteMessage(chatId, msgId);
            return true; // Успех
        } catch (err) {
            if (attempt === retries) {
                return false; // Вторая попытка тоже не удалась
            }

            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return false;
}
