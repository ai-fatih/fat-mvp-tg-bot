// src/bot/handlers/startHandler.js
import { state } from '../../utils/index.js';
import { chatService } from '../services/chatService.js';

export async function startHandler(bot, msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    const userMsgId = msg.message_id;

    try {
        const chatState = state.getState(chatId) || {};

        // Гарантируем массив
        const serviceMsgId = Array.isArray(chatState.serviceMsgId)
            ? [...chatState.serviceMsgId, userMsgId]
            : [userMsgId];

        // Сохраняем обновления
        state.setState(chatId, 'chatId', chatId);
        state.setState(chatId, 'username', username);
        state.setState(chatId, 'serviceMsgId', serviceMsgId);

        // Устанавливаем глобальный статус
        state.updateChatStatus(chatId, 'EMPTY');

        // Перерисовываем активное сервис-сообщение
        await chatService.updateQuestionsList(bot, chatId);

        console.log('стейт после /start', chatState)

    } catch (err) {
        console.error("[START] Ошибка:", err);
    }
}
