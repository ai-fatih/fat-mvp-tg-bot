import { state } from '../../utils/index.js'
import { uiService, questionService, chatService } from '../services/index.js';

async function callbackHandler(bot, msg) {
    const chatId = msg.message.chat.id;
    const data = msg.data;

    // Всегда подтверждаем callback
    bot.answerCallbackQuery(msg.id).catch(() => {});

    try {
        // ============================================================
        // 1) Подтверждение вопроса
        // ============================================================
        if (data === 'confirm_question') {
            // Регистрируем callback-сообщение как служебное
            await uiService.registerMessage(chatId, msg.message.message_id);

            const result = questionService.addQuestion(chatId, {
                sourceMessageId: msg.message.message_id,
            });

            /* if (!result.ok) {
                switch (result.reason) {
                    case 'LIMIT':
                        await uiService.toast(
                            bot,
                            chatId,
                            `⚠️ Лимит ${result.max} вопросов достигнут.`
                        );
                        break;

                    case 'SHORT':
                        await uiService.toast(
                            bot,
                            chatId,
                            'Вопрос слишком короткий.'
                        );
                        break;

                    default:
                        await uiService.toast(
                            bot,
                            chatId,
                            'Не удалось добавить вопрос.'
                        );
                }
                return;
            } */

            state.updateChatStatus(chatId, 'COLLECTING'); 
            
            await uiService.refreshScreen(
                chatService.updateQuestionsList,
                bot,
                chatId
            );
            return;
        }

        // ============================================================
        // 2) Отмена вопроса
        // ============================================================
        if (data === 'cancel_question') {
            await uiService.registerMessage(chatId, msg.message.message_id);

            const result = questionService.cancelTempQuestion(chatId);

            // Чистим все служебные сообщения
            await uiService.clearAll(bot, chatId);

            if (result.text) {
                const draftMsg = await bot.sendMessage(
                    chatId,
                    `✏️ Вы отменили вопрос.\nМожете отредактировать и отправить заново:\n\n${result.text}`,
                    { reply_markup: { force_reply: true } }
                );

                await uiService.registerMessage(chatId, draftMsg.message_id);
            }
            return;
        }

        // ============================================================
        // 3) Отправка вопросов в работу
        // ============================================================
        if (data === '🚀_отправить_в_работу') {
            const result = questionService.sendToManager(chatId);

            if (!result.ok) {
                await uiService.toast(
                    bot,
                    chatId,
                    'Список вопросов пуст.'
                );
                return;
            }

            await uiService.toast(
                bot,
                chatId,
                '🚀 Вопросы отправлены менеджеру'
            );

            // MVP — без перерисовки
            return;
        }

        // ============================================================
        // 4) Заглушки кнопок
        // ============================================================
        if (data === '🔄_обновить') {
            await uiService.refreshScreen(
                chatService.updateQuestionsList,
                bot,
                chatId
            );
            return;
        }

        if (data === '🧹_очистить') {
            // На будущее: questionService.clearQuestions(chatId)
            await uiService.toast(bot, chatId, 'Функция в разработке');
            return;
        }

    } catch (err) {
        console.error('[CALLBACK] Общая ошибка:', err);
    }
}

// ============================================================
// Экспорт подключения
// ============================================================
export function setupCallbackHandler(bot) {
    bot.on('callback_query', async (msg) => {
        await callbackHandler(bot, msg);
    });
}
