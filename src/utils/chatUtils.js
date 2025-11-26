// src/utils/chatUtils.js
import { getChatState, setChatState } from './chatState.js';
import { bot } from '../bot.js';
import { clearChatExceptImportant } from './clearServiceMessages.js';

export async function updateQuestionsList(chatId, deleteOld = true) {
  const state = getChatState(chatId);
  const questions = state.questions || [];
  if (state.questions.length >= 20) return false;
 
  // Формируем текст списка
  let text = `<b>📋 Ваши вопросы</b> (${state.questions.length} из 20)\n\n`
   questions.forEach((q) => {
    text += `<i>${q.id}. ${q.question}\n</i>`;
    if (q.answer) text += `Ответ: ${q.answer}\n\n`; 
  });  
  text += `\n📋 Ожидайте, пожалуйста, менеджер с вами свяжется!`;
    

   // Формируем клавиатуру подтверждения
  function createConfirmKeyboard() {
    return {
        inline_keyboard: [
              [
                {
                    text: 'Отправить список менеджеру',
                    callback_data: 'send_question'
                }
              ],
              [
                {
                    text: 'Редактировать',
                    callback_data: 'edits_question'
                },
                {
                    text: 'Очистить',
                    callback_data: 'del_question'
                }
              ]
          ]
    }
}

  try {
    
    if (state.questionsMsgId) {
      // Редактируем существующее сообщение
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: state.questionsMsgId,
        parse_mode: 'HTML',
       // reply_markup: createConfirmKeyboard()
      });
      console.log(`[QUESTIONS] Список обновлён (ID: ${state.questionsMsgId})`);
    } else {
      // Отправляем новое сообщение
      const msg = await bot.sendMessage(chatId, text,  { parse_mode: 'HTML',
        // reply_markup: createConfirmKeyboard() 
      });
      setChatState(chatId, 'questionsMsgId', msg.message_id);
      console.log(`[QUESTIONS] Новый список (ID: ${msg.message_id})`);
    }
    console.log('список вопросов', state.questions)
    // Удаляем старые служебные сообщения (если нужно)
    if (deleteOld) {
        await clearChatExceptImportant(bot, chatId); // Используем новую функцию
    }
  } catch (err) {
    console.error('[QUESTIONS] Ошибка обновления списка:', err);
  }
}
