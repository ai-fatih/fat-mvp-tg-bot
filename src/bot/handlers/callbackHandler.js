import { telegram, state } from '../../utils/index.js'; 
import { chatService } from '../services/chatService.js';

async function callbackHandler(bot, msg) {
    const chatId = msg.message.chat.id;
    const data = msg.data;

    const chatState = state.getState(chatId);

    // Обязательное подтверждение нажатия
    bot.answerCallbackQuery(msg.id).catch(() => {});

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
                    id: chatState.questions.length + 1, // порядковый номер
                    question: chatState.tempQuestion,   // текст вопроса
                    answer: null,                        // ответ менеджера
                    files: [],                            // прикреплённые файлы
                    edited: false,                        // редактировался ли вопрос
                    status: 'Черновик (отправьте в работу)',                          // статус готовности ответа
                    high_priority: false,                  // для будущего
                    createdAt: new Date().toISOString()   // дата/время создания
                };
  

                // --- Сохраняем сохранённый вопрос ---
                chatState.questions.push(newQuestion);
                state.setState(chatId, 'questions', chatState.questions);

                // --- Очищаем временное поле ---
                state.setState(chatId, 'tempQuestion', null);
                state.setState(chatId, 'status', 'COLLECTING');

                // --- Перерисовываем список вопросов ---
                await chatService.updateQuestionsList(bot, chatId);
            } catch (err) {
                console.error("[CONFIRM] Ошибка:", err);
            }
        }

        if (data === 'cancel_question') {

            // Сохраняем ID текущего нажатого callback-сообщения
            chatState.serviceMsgId.push(msg.message.message_id);
            state.setState(chatId, 'serviceMsgId', chatState.serviceMsgId);
        
            const oldText = chatState.tempQuestion;
            state.setState(chatId, 'tempQuestion', null);
        
            // Удаляем все предыдущие служебные сообщения
            await telegram.clearServiceMessages(bot, chatId);
        
            // Отправляем пользователю его текст как черновик
            if (oldText) {
        
                const draftMsg = await bot.sendMessage(
                    chatId,
                    `✏️ Вы отменили вопрос.\nМожете отредактировать и отправить заново:\n\n${oldText}`,
                    { reply_markup: { force_reply: true } }
                );
        
                // Сохраняем как служебное, чтобы потом удалить
                chatState.serviceMsgId.push(draftMsg.message_id);
                state.setState(chatId, 'serviceMsgId', chatState.serviceMsgId);
            }
        }
        
        // ============================================================
    // 3) 🚀 Отправить менеджеру
    // ============================================================
    if (data === '🚀_отправить_в_работу') {
     try {
        // Нет вопросов — нет смысла отправлять
        if (!chatState.questions?.length) {
            return console.log("Список вопросов пуст → отправлять нечего");
        }

        // Обновляем статусы
        const updated = chatState.questions.map(q => ({
            ...q,
            status: 'в работе',    // статус после отправки 
        }));

        // Сохраняем в state только одно поле
        state.setState(chatId, 'questions', updated);
        state.setState(chatId, 'status', 'SENT_TO_MANAGER');

        // Временно просто логируем
        console.log('Вопросы отправлены менеджеру →', updated);

        // Фронт пока не перерисовываем — MVP
        return;
    } catch (err) {
        console.error("[SEND_TO_MANAGER] Ошибка:", err);
    }
}


        // 2) Обновить список вопросов
        if (data === '🔄_обновить') {
            return console.log('🔄_обновить')
        }

        // 3) Очистить список вопросов
        if (data === '🧹_очистить') {
            return console.log('🧹_очистить')
        }
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
