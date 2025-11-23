// src/utils/clearServiceMessages.js
import { getChatState, setChatState } from './chatState.js';
import { bot } from '../bot.js';

export async function clearChatExceptImportant(bot, chatId) {
    const state = getChatState(chatId);
  
    try {
      if (state.serviceMsgIds?.length) {
        console.log(state.serviceMsgIds)
        for (const msgId of state.serviceMsgIds) {
          try {
            await bot.deleteMessage(chatId, msgId);
            console.log(`[CLEANUP] Удалено служебное сообщение: ${msgId}`);
          } catch (err) {
            console.warn(`[CLEANUP] Не удалось удалить сообщение ${msgId}:`, err.message);
            // Опционально: повторить попытку через 1 сек
            await new Promise(resolve => setTimeout(resolve, 1000));
            await bot.deleteMessage(chatId, msgId);
          }
        }
        setChatState(chatId, 'serviceMsgIds', []);
      }
    } catch (err) {
      console.error('[CLEANUP] Критическая ошибка очистки:', err);
    }
  }