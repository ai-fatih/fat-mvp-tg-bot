import { safeSend } from '../utils/safeSend.js';
import { getUserQuestions, updateMessageStatus } from '../services/firebaseService.js';

export async function callbackHandler(bot, query) {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    // Кнопка вызова оператора
    if (data === "call_operator") {
      await safeSend(bot, chatId, "Оператор свяжется с вами в ближайшее время.");
    } 

  } catch (err) {
    console.error("[CALLBACK] Ошибка:", err);
  }
}