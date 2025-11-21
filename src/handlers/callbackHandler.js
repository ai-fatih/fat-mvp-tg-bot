// src/handlers/callbackHandler.js
import { safeSend } from '../utils/safeSend.js'; 
 
export async function callbackHandler(bot, query) {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    // Кнопка вызова оператора
    if (data === "call_operator") { 
      //надо отправить мне уведомление о новом вопросе оператору
      await safeSend(bot, chatId, "Оператор свяжется с вами в ближайшее время.");
    } 
    if (data === "new_question") { 
      await safeSend(bot, chatId, "Задайте новый вопрос:");
    }
  } catch (err) {
    console.error("[CALLBACK] Ошибка:", err);
  }
}