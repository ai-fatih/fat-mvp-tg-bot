// src/handlers/messageHandler.js

import { getChatState, setChatState } from '../../utils/chatState.js';
import { safeSend } from '../../utils/safeSend.js';
// import { createOrUpdateUser, saveUserMessage } from '../services/firebaseService.js';
// import { updateQuestionsList } from '../utils/chatUtils.js';
// import { clearChatExceptImportant } from '../utils/clearServiceMessages.js';

export async function messageHandler(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;
  console.log('my chat id', chatId)
  if (!text || text.startsWith('/')) return;

  const userMsgId = msg.message_id;
  const state = getChatState(chatId);

  try {
  //  await createOrUpdateUser({ telegramId: chatId, username: msg.from.username || msg.from.first_name });
  //  await saveUserMessage({ telegramId: chatId, text });

  // Формируем клавиатуру подтверждения
  function createConfirmKeyboard() {
    return {
        inline_keyboard: [
            [
                {
                    text: 'Да',
                    callback_data: 'confirm_question'
                },
                {
                    text: 'Нет',
                    callback_data: 'cancel_question'
                }
            ] 
        ]
    };
}

  // Отправляем сообщение с подтверждением
  await safeSend(bot, chatId, 
    `<i> - "${text}"</i>\n\n<b>добавить ваш вопрос в список для обработки</b>`,
    { reply_markup: createConfirmKeyboard() }
  );
  
  // Сохраняем временный контекст
  state.serviceMsgIds.push(userMsgId);
  setChatState(chatId, 'serviceMsgIds', state.serviceMsgIds);
  setChatState(chatId, 'chat_id', chatId);
  setChatState(chatId, 'lastUserMessageId', userMsgId);
  setChatState(chatId, `temp_question`, text);

  console.log('чекаем в messageHandler', state)

  } catch (err) {
    console.error("[MESSAGE] Ошибка:", err);
  }
}
