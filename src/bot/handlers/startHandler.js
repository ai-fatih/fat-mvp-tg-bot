import { createOrUpdateUser } from '../services/firebaseService.js';
import { safeSend } from '../utils/safeSend.js';
import { getChatState, setChatState } from '../utils/chatState.js';

export async function startHandler(bot, msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name; 
  
  const userMsgId = msg.message_id;
  const state = getChatState(chatId);

  try {
    await createOrUpdateUser({ telegramId: chatId, username });
  
    // Сохраняем полное сообщение
    setChatState(chatId, 'chat_id', chatId)
    
    state.serviceMsgIds.push(userMsgId);
    setChatState(chatId, 'serviceMsgIds', state.serviceMsgIds);
    setChatState(chatId, 'welcomeMsgId', userMsgId);

     // Отправляем приветственное сообщение
     await safeSend(
      bot, 
      chatId, 
      `Добро пожаловать!\n<b>Напишите первый вопрос . . .</b>`
    ); 
    
    // Выводим состояние именно для этого чата
    console.log('serviceMsgIds', state.serviceMsgIds, 'Состояние после /start:', getChatState(chatId));
  } catch (err) {
    console.error("[START] Ошибка:", err);
  }
}
