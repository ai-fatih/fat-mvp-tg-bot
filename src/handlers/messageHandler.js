// src/handlers/messageHandler.js
import { getChatState, setChatState } from '../utils/chatState.js';
import { createOrUpdateUser, saveUserMessage } from '../services/firebaseService.js';
import { safeSend } from '../utils/safeSend.js';
import { updateQuestionsList } from '../utils/chatUtils.js';
import { clearServiceMessages } from '../utils/clearServiceMessages.js';

export async function messageHandler(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/start')) return;

  const userMsgId = msg.message_id;
  const state = getChatState(chatId);

  try {
    await createOrUpdateUser({ telegramId: chatId, username: msg.from.username || msg.from.first_name });
    await saveUserMessage({ telegramId: chatId, text });

    // Если это ответ «Да»/«Нет» на запрос сохранения
    if (text === 'Да' || text === 'Нет') {
      // Добавляем ID сообщения «Да»/«Нет» в список на удаление
      state.serviceMsgIds.push(userMsgId);
    
      if (text === 'Да') {
        const lastQuestion = state.lastUserQuestion;
        if (lastQuestion && !state.questions.includes(lastQuestion)) {
          state.questions.push(lastQuestion);
    
          // Удаляем исходное сообщение пользователя
          try {
            await bot.deleteMessage(chatId, state.lastUserMessageId);
            console.log(`[DELETE] Удалено сообщение пользователя: ${state.lastUserMessageId}`);
          } catch (err) {
            console.error(`[DELETE] Ошибка при удалении:`, err);
          }
        }
    
        // Обновляем список вопросов И удаляем ВСЕ служебные сообщения
        await updateQuestionsList(chatId, true);
      } else if (text === 'Нет') {
        // Удаляем исходный вопрос
        try {
          await bot.deleteMessage(chatId, state.lastUserMessageId);
          console.log(`[DELETE] Удалено исходное сообщение: ${state.lastUserMessageId}`);
        } catch (err) {
          console.error(`[DELETE] Ошибка при удалении:`, err);
        }
      
        // Удаляем служебные сообщения
        await clearServiceMessages(chatId);
      }
    
      return; // ВАЖНО: завершаем обработку, чтобы не отправлять новый запрос
    }
    

    // Сохраняем ID текущего сообщения как lastUserMessageId (для последующего удаления)
    setChatState(chatId, 'lastUserMessageId', userMsgId);
    setChatState(chatId, 'lastUserQuestion', text);

    // Отправляем запрос на сохранение
    const confirmMsg = await safeSend(
      bot,
      chatId,
      `Сохранить этот вопрос в список вопросов?\n\n<b>${text}</b>`,
      {
        reply_markup: {
          keyboard: [['Да', 'Нет']],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    );

    // Сохраняем ID запроса на сохранение
    if (confirmMsg?.message_id) {
      state.serviceMsgIds.push(confirmMsg.message_id);
    }

    console.log('[safeSend] Состояние чата:', state);

  } catch (err) {
    console.error("[MESSAGE] Ошибка:", err);
  }
}
