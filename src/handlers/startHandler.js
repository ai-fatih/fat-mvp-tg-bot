import { createOrUpdateUser } from '../services/firebaseService.js';
import { safeSend } from '../utils/safeSend.js';

export async function startHandler(bot, msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;

  try {
    await createOrUpdateUser({ telegramId: chatId, username });
    await safeSend(bot, chatId, ` Привет, ${msg.from.first_name || 'коллега'}!\n\nЯ ассистент по StoreHouse Pro\nНапиши вопрос в свободной форме — постараюсь помочь`
  );
  } catch (err) {
    console.error("[START] Ошибка:", err);
  }
}

 