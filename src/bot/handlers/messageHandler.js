// src/bot/handlers/messageHandler.js

import { state, telegram } from '../../utils/index.js';
import { messageService } from '../services/messageService.js'; 
import { chatService } from '../services/chatService.js';

/**
 * Обработчик входящих текстовых сообщений
 * - Показывает подтверждение "Добавить вопрос?"
 * - Хранит временный вопрос (temp_question)
 * - Запоминает ID сообщения пользователя
 */
export async function messageHandler(bot, msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    // игнорируем команды
    if (!text || text.startsWith('/')) return;

    const userMsgId = msg.message_id;
    const chatState = state.getState(chatId);

    try {
        // Формируем клавиатуру подтверждения
        const keyboard = telegram.keyboards.confirmCancel()

        // Отправляем пользователю подтверждение
        await messageService.sendMessage(
            bot,
            chatId,
            `<i>- "${text}"</i>\n\n<b>Добавить в список для обработки?</b>`,
            { reply_markup: keyboard }
        );

        // Сохраняем контекст   
        chatState.serviceMsgId.push(userMsgId);
        state.setState(chatId, 'serviceMsgId', chatState.serviceMsgId);
        state.setState(chatId, 'chatId', chatId);
        state.setState(chatId, 'lastUserMessageId', userMsgId);
        state.setState(chatId, 'tempQuestion', text);

        console.log(`[messageHandler] Обновлённое состояние:`, state.getState(chatId));

    } catch (err) {
        console.error("[MESSAGE] Ошибка:", err);
    }
}