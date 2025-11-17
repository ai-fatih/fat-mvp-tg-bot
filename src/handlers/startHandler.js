import { createOrUpdateUser } from '../services/firebaseService.js';
import { safeSend } from '../utils/safeSend.js';

export async function startHandler(bot, msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;

  try {
    await createOrUpdateUser({ telegramId: chatId, username });
    await safeSend(bot, chatId, ` Привет, ${msg.from.first_name || 'коллега'}!\nЯ помогу с вопросами по StoreHouse Pro.\nНапиши вопрос в свободной форме — и я постараюсь подсказать решение.`
  );
  } catch (err) {
    console.error("[START] Ошибка:", err);
  }
}

 