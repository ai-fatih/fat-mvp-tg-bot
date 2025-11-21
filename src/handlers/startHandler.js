import { createOrUpdateUser } from '../services/firebaseService.js';
import { safeSend } from '../utils/safeSend.js';
import { chatState } from '../utils/chatState.js';
 
export async function startHandler(bot, msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;
  console.log('Состояние после /start:', chatState.get(chatId));

  try {
    await createOrUpdateUser({ telegramId: chatId, username });
    await safeSend(
      bot, 
      chatId, 
      ` Привет, ${msg.from.first_name || 'коллега'}!\n\nЯ ассистент по StoreHouse Pro\nНапиши вопрос в свободной форме — постараюсь помочь`
  );
  } catch (err) {
    console.error("[START] Ошибка:", err);
  }
}

/**
  Если пользователь новый:
    Создаёт документ в Firestore (users/{telegramId}) с полями:
      telegramId, username, role, status и др.
  Если уже есть:
    Обновляет lastInterActionAt (время последнего взаимодействия)

  Итог:
    пользователь зарегистрирован/обновлён
    получает приветствие
 */
 