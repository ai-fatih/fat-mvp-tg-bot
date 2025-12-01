import { telegram, helpers, state } from '../../utils/index.js'; 
import { chatService } from '../services/chatService.js';

async function callbackHandler(bot, msg) {
    const chatId = msg.message.chat.id;
    const data = msg.data;
    const chatState = state.getState(chatId);

    try {
        // ============================================================
        // 1) Подтверждение вопроса
        // ============================================================
        if (data === 'confirm_question') {
            try {
                if (!chatState.temp_question) {
                    throw new Error('Временный вопрос отсутствует');
                }

                // Сохраняем служебное сообщение
                chatState.serviceMsgIds.push(msg.message.message_id);
                state.setState(chatId, 'serviceMsgIds', chatState.serviceMsgIds);

                // --- Ограничение по количеству ---
                if (chatState.questions.length >= 20) {
                    throw new Error('Превышено максимальное количество вопросов (20)');
                }

                // --- Формируем модель вопроса ---
                const newQuestion = {
                    id: chatState.questions.length + 1,
                    question: chatState.temp_question,
                    answer: null,
                    files: [],
                    edited: false,
                };

                // --- Сохраняем сохранённый вопрос ---
                chatState.questions.push(newQuestion);
                state.setState(chatId, 'questions', chatState.questions);

                // --- Очищаем временное поле ---
                state.setState(chatId, 'temp_question', null);

                // --- Пытаемся удалить сообщение подтверждения ---
                /* try {
                    await bot.deleteMessage(chatId, chatState.welcomeMsgId + 1);
                } catch {} */

                // --- Перерисовываем список вопросов ---
                await chatService.updateQuestionsList(bot, chatId);
            } catch (err) {
                console.error("[CONFIRM] Ошибка:", err);
            }
        }

        // ============================================================
        // 2) Отмена вопроса
        // ============================================================
        if (data === 'cancel_question') {
            // Сохраняем служебный ID
            chatState.serviceMsgIds.push(msg.message.message_id);
            state.setState(chatId, 'serviceMsgIds', chatState.serviceMsgIds);

            // Чистим временное поле
            state.setState(chatId, 'temp_question', null);

            // Очищаем чат
            await telegram.clearServiceMessages(bot, chatId);
        }

        // ============================================================
        // 🔧 Место для будущих callback-команд
        // ============================================================
        // if (data === 'edit_question') { ... }
        // if (data === 'delete_question') { ... }
        // if (data === 'send_question') { ... }

    } catch (err) {
        console.error("[CALLBACK] Общая ошибка:", err);
    }
}


// ============================================================
// Экспортируем обёртку подключения
// ============================================================
export function setupCallbackHandler(bot) {
    bot.on('callback_query', async (msg) => {
        await callbackHandler(bot, msg);
    });
}
