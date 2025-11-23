import { setChatState, getChatState } from './chatState.js';

export async function safeSend(bot, chatId, text, options = {}) {
    const retries = 3;
    let sentMessage = null;
    const state = getChatState(chatId);

    for (let i = 0; i < retries; i++) {
      try {
        sentMessage = await bot.sendMessage(chatId, text, {
          ...options,
          parse_mode: 'HTML'  // Для жирного текста в подтверждении
        }); 

        setChatState(chatId, 'lastBotMessageId', sentMessage.message_id);
        
        state.serviceMsgIds.push(sentMessage.message_id);
        setChatState(chatId, 'serviceMsgIds', state.serviceMsgIds);
 
        console.log(`[SEND] message_id=${sentMessage.message_id}`, state.serviceMsgIds); 

        return sentMessage;
      } catch (err) {
        console.error(`[SEND] попытка ${i+1} ошибка:`, err.code || err.message);
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }