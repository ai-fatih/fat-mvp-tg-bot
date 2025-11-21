import { createOrUpdateUser } from '../services/firebaseService.js';
import { safeSend } from '../utils/safeSend.js';
import { getChatState, setChatState } from '../utils/chatState.js';

export async function startHandler(bot, msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name; 

  try {
    await createOrUpdateUser({ telegramId: chatId, username });

    // Отправляем приветственное сообщение
    const welcomeMessage = await safeSend(
      bot, 
      chatId, 
      `Привет, ${msg.from.first_name || 'коллеga'}!\n\nЯ ассистент по StoreHouse Pro\nНапиши вопрос в свободной форме — постараюсь помочь`
    );
    
    // Сохраняем полное сообщение
    setChatState(chatId, 'welcomeMsg', welcomeMessage);
    
    // Выводим состояние именно для этого чата
    console.log('Состояние после /start:', getChatState(chatId));
  } catch (err) {
    console.error("[START] Ошибка:", err);
  }
}
