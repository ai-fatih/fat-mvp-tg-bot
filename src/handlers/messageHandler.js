import { createOrUpdateUser, saveUserMessage } from '../services/firebaseService.js';
import { generateResponse } from '../services/responseService.js';
import { safeSend } from '../utils/safeSend.js';

export async function messageHandler(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/start")) return;

  const username = msg.from.username || msg.from.first_name;

  try {
    await createOrUpdateUser({ telegramId: chatId, username });
    await saveUserMessage({ telegramId: chatId, text });
    const { text: replyText, buttons } = generateResponse(text);
    await safeSend(bot, chatId, replyText, buttons);
  } catch (err) {
    console.error("[MESSAGE] Ошибка:", err);
  }
}