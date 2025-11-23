// src/handlers/callbackHandler.js
import { safeSend } from '../utils/safeSend.js'; 
import { getChatState, setChatState } from '../utils/chatState.js';
import { updateQuestionsList } from '../utils/chatUtils.js';
import { clearChatExceptImportant } from '../utils/clearServiceMessages.js';

async function callbackHandler(bot, msg) {
  const chatId = msg.message.chat.id;
  const text = msg.message.text;
  const data = msg.data;
  const state = getChatState(chatId);
  const userMsgId = msg.message.message_id;

  try {  
    if (data === 'confirm_question') {
      try {
         
        if (!state.temp_question) {
          throw new Error('Временный вопрос не найден');
        }
         
        state.serviceMsgIds.push(userMsgId);
        setChatState(chatId, 'serviceMsgIds', state.serviceMsgIds);

         // Проверяем максимальное количество вопросов
    if (state.questions.length >= 20) {
      throw new Error('Превышено максимальное количество вопросов (20)');
    }
    // Генерируем уникальный ID для нового вопроса
    const newQuestionId = state.questions.length + 1;
    
    // Создаем новый объект вопроса
    const newQuestion = {
      id: newQuestionId,
      question: state.temp_question,
      answer: null,
      files: [],
      edited: false
    };
         // Добавляем вопрос в список
    state.questions.push(newQuestion);
    
    // Сохраняем обновленное состояние
    setChatState(chatId, 'questions', state.questions);
    
        setChatState(chatId, 'temp_question', null);
        try {
          await bot.deleteMessage(chatId, state.welcomeMsgId + 1); 
        } catch (error) { 
        }
         
        await updateQuestionsList(chatId); 
        
      } catch (err) {
        console.error("[CONFIRM] Ошибка при подтверждении вопроса:", err);
        console.error('Произошла ошибка при добавлении вопроса.');
      }
    } 

    if (data === 'cancel_question') {

      state.serviceMsgIds.push(userMsgId);
      setChatState(chatId, 'serviceMsgIds', state.serviceMsgIds);
      setChatState(chatId, 'temp_question', null);
      await clearChatExceptImportant(bot, chatId); // Используем новую функцию
    }

  } catch (err) {
    console.error("[CALLBACK] Общая ошибка:", err);
    console.error('Произошла ошибка при обработке запроса.');
  }
}

// Подключение обработчика
export function setupCallbackHandler(bot) {
  bot.on('callback_query', async (msg) => {
    await callbackHandler(bot, msg);
  });
}
