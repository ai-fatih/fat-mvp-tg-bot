// src/bot/handlers/messageHandler.js

import { uiService, questionService, messageService } from '../services/index.js';

/**
 * Обработчик входящих текстовых сообщений
 * Отвечает ТОЛЬКО за:
 * - приём текста пользователя
 * - передачу его в questionService
 * - показ UI подтверждения
 */
export async function messageHandler(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Игнорируем команды и пустые сообщения
    if (!text || text.startsWith('/')) return;

    try {
        // Регистрируем сообщение пользователя как служебное
        // (чтобы потом подчистить подтверждение)
        await uiService.registerMessage(chatId, msg.message_id);

        // Сохраняем временный вопрос через сервис
        const result = questionService.setTempQuestion(chatId, text, {
            sourceMessageId: msg.message_id,
        });

        if (!result.ok) {
            await uiService.toast(bot, chatId, 'Не удалось обработать сообщение');
            return;
        }

        // Формируем клавиатуру подтверждения
        const keyboard = messageService.buildConfirmCancelKeyboard();

        // Отправляем подтверждение пользователю
        const confirmMsg = await messageService.sendMessage(
            bot,
            chatId,
            `<b>Ваш вопрос:</b>\n\n<i>«${text}»</i>`,
            { reply_markup: keyboard }
        );

        // Подтверждение тоже считаем служебным
        if (confirmMsg?.message_id) {
            await uiService.registerMessage(chatId, confirmMsg.message_id);
        }

    } catch (err) {
        console.error('[MESSAGE_HANDLER] Ошибка:', err);
    }
}
