// src/bot/handlers/startHandler.js
import { state } from '../../utils/index.js';
import { messageService } from '../services/messageService.js';

/**
 * Обработчик команды /start
 * - Инициализирует состояние чата
 * - Сохраняет ID служебного сообщения
 * - Отправляет приветственное сообщение
 */
export async function startHandler(bot, msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    const userMsgId = msg.message_id;

    // Получаем состояние чата
    const chatState = state.getState(chatId);

    try {
        // TODO: при необходимости создаем/обновляем пользователя в Firebase
        // await firebaseService.createOrUpdateUser({ telegramId: chatId, username });

        // Инициализируем chatId
        state.setState(chatId, 'chatId', chatId);

        // Добавляем ID пользователя в служебные сообщения
        chatState.serviceMsgId.push(userMsgId);
        state.setState(chatId, 'serviceMsgId', chatState.serviceMsgId); 
        state.setState(chatId, 'questionsMsgId', userMsgId + 1);

        // Отправляем приветственное сообщение через сервис
        await messageService.sendMessage(
            bot,
            chatId,
            `Добро пожаловать!\n<b>Напишите первый вопрос</b>`
        );

        // Логируем состояние чата после /start
        console.log(
            'serviceMsgId', 
            chatState.serviceMsgId, 
            'Состояние после /start:', 
            state.getState(chatId)
        );

    } catch (err) {
        console.error("[START] Ошибка:", err);
    }
}
