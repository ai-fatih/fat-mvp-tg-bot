// src/handlers/messageHandler.js
import { chatState, setChatState, getChatState } from '../utils/chatState.js';
import { createOrUpdateUser, saveUserMessage } from '../services/firebaseService.js';
// import { generateResponse } from '../services/responseService.js';
import { safeSend } from '../utils/safeSend.js'; 

import { updateQuestionsList } from '../utils/chatUtils.js';

export async function messageHandler(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/start")) return;

  // Сохраняем ID сообщения пользователя
  setChatState(chatId, 'lastUserMessageId', msg.message_id);

  const username = msg.from.username || msg.from.first_name;

  try {
    //обновляет данные пользователя
    await createOrUpdateUser({ telegramId: chatId, username });
    //сохраняет сообщение
    await saveUserMessage({ telegramId: chatId, text });

     // Проверяем, не является ли это ответом на запрос сохранения вопроса
     if (text === 'Да' || text === 'Нет') {
      // Сохраняем ID сообщения пользователя ("Да"/"Нет")
      const state = getChatState(chatId);
      if (!state.serviceMsgIds) state.serviceMsgIds = [];
      state.serviceMsgIds.push(msg.message_id); // ← Добавляем ID сообщения "Да"

      if (text === 'Да') {
        const lastQuestion = state.lastUserQuestion;
        if (lastQuestion) {
          state.questions.push(lastQuestion);
          
          // Обновляем список и удаляем ВСЕ служебные сообщения
          await updateQuestionsList(chatId, true);
          
          // Отправляем подтверждение и сохраняем его ID
          const confirmMsg = await safeSend(bot, chatId, 'Вопрос сохранён!');
          if (confirmMsg?.message_id) {
            state.serviceMsgIds.push(confirmMsg.message_id);
          }
        }
      }
      return;
    }

    //формирует ответ на основе ключевых слов
    // const { text: replyText, buttons } = generateResponse(text);

    // Отправляем вопрос на подтверждение
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

    // Сохраняем ID служебного сообщения для последующего удаления
    if (confirmMsg?.message_id) {
      const state = getChatState(chatId);
      if (!state.serviceMsgIds) state.serviceMsgIds = [];
      state.serviceMsgIds.push(confirmMsg.message_id);
    }
    
    // Сохраняем вопрос для последующего добавления
    setChatState(chatId, 'lastUserQuestion', text);

    console.log('[safeSend] Состояние чата:', chatState.get(chatId));
     
  } catch (err) {
    console.error("[MESSAGE] Ошибка:", err);
  }
}

/**
  Что делает saveUserMessage():
    Создаёт документ в коллекции messages:
      Поля: telegramId, text, createdAt, status, isEscalated.
      Обновляет questionCount у пользователя в users.
    Что делает generateResponse():
      Анализирует текст на ключевые слова (списание, накладная, отчёт).
      Возвращает заготовленный ответ и кнопки:
        «Документация» (ссылка)
        «Позвать оператора» (callback).
  Итог: сообщение сохранено, пользователь получил ответ с кнопками.
 */