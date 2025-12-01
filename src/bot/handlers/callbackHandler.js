import { telegram, state } from '../../utils/index.js'; 
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
                if (!chatState.tempQuestion) {
                    throw new Error('Временный вопрос отсутствует');
                }

                // Сохраняем служебное сообщение
                chatState.serviceMsgId.push(msg.message.message_id);
                state.setState(chatId, 'serviceMsgId', chatState.serviceMsgId);

                // --- Ограничение по количеству ---
                if (chatState.questions.length >= 20) {
                    throw new Error('Превышено максимальное количество вопросов (20)');
                }

                // --- Формируем модель вопроса ---
                const newQuestion = {
                    id: chatState.questions.length + 1,
                    question: chatState.tempQuestion,
                    answer: null,
                    files: [],
                    edited: false,
                };

                // --- Сохраняем сохранённый вопрос ---
                chatState.questions.push(newQuestion);
                state.setState(chatId, 'questions', chatState.questions);

                // --- Очищаем временное поле ---
                state.setState(chatId, 'tempQuestion', null);

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
            chatState.serviceMsgId.push(msg.message.message_id);
            state.setState(chatId, 'serviceMsgId', chatState.serviceMsgId);

            // Чистим временное поле
            state.setState(chatId, 'tempQuestion', null);

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
