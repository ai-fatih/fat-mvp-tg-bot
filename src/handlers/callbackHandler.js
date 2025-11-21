// src/handlers/callbackHandler.js
import { safeSend } from '../utils/safeSend.js'; 
import { getChatState, setChatState } from '../utils/chatState.js';
import { updateQuestionsList } from '../utils/chatUtils.js';

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
        
        state.questions.push(state.temp_question);
        state.serviceMsgIds.push(userMsgId);
        setChatState(chatId, 'serviceMsgIds', state.serviceMsgIds);
        setChatState(chatId, 'questions', state.questions);
        setChatState(chatId, 'temp_question', null);
          
        await updateQuestionsList(chatId); 
        
      } catch (err) {
        console.error("[CONFIRM] Ошибка при подтверждении вопроса:", err);
        await safeSend(bot, chatId, 'Произошла ошибка при добавлении вопроса.');
      }
    }
  } catch (err) {
    console.error("[CALLBACK] Общая ошибка:", err);
    await safeSend(bot, chatId, 'Произошла ошибка при обработке запроса.');
  }
}

// Подключение обработчика
export function setupCallbackHandler(bot) {
  bot.on('callback_query', async (msg) => {
    await callbackHandler(bot, msg);
  });
}
