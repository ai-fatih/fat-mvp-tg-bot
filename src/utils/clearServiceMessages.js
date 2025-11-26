// src/utils/clearServiceMessages.js
import { getChatState, setChatState } from './chatState.js';

export async function clearChatExceptImportant(bot, chatId) {
    const state = getChatState(chatId);
  
    try {
      if (state.serviceMsgIds?.length) {
        // Создаем копию массива для безопасной итерации
        const msgIdsCopy = [...state.serviceMsgIds];
        
        for (const msgId of msgIdsCopy) {
          try {
            await bot.deleteMessage(chatId, msgId);
            console.log(`[CLEANUP] Удалено служебное сообщение: ${msgId}`);
            
            // Удаляем успешно удаленное сообщение из массива
            const index = state.serviceMsgIds.indexOf(msgId);
            if (index !== -1) {
              state.serviceMsgIds.splice(index, 1);
            }
            
          } catch (err) {
            console.warn(`[CLEANUP] Не удалось удалить сообщение ${msgId}:`, err.message);
            
            // Повторяем попытку через 1 секунду
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
              await bot.deleteMessage(chatId, msgId);
              console.log(`[CLEANUP] Удалено после повторной попытки: ${msgId}`);
              
              // Удаляем успешно удаленное сообщение
              const index = state.serviceMsgIds.indexOf(msgId);
              if (index !== -1) {
                state.serviceMsgIds.splice(index, 1);
              }
            } catch (retryErr) {
              console.error(`[CLEANUP] Повторная попытка удаления ${msgId} не удалась:`, retryErr.message);
            }
          }
        }

           // Обновляем состояние только с успешно удаленными сообщениями
    const updatedIds = state.serviceMsgIds.filter(id => !msgIdsCopy.includes(id));
    
    // Сохраняем обновленное состояние
    setChatState(chatId, 'serviceMsgIds', updatedIds);
    
        console.log('после удаления', state.serviceMsgIds)
      }
    } catch (err) {
      console.error('[CLEANUP] Критическая ошибка при очистке сообщений:', err);
    }
    
  }