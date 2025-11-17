import { safeSend } from '../utils/safeSend.js';
import { getUserQuestions, updateMessageStatus } from '../services/firebaseService.js';

export async function callbackHandler(bot, query) {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    // Кнопка “Мои вопросы”
    if (data === "my_questions") {
      const questions = await getUserQuestions(chatId);

      if (questions.length === 0) {
        await safeSend(bot, chatId, "У вас пока нет зарегистрированных вопросов.");
      } else {
        for (let q of questions) { 
          // добавить кнопку удалить - удаляет этот вопрос из истории
          await safeSend(bot, chatId, `[${q.status}] ${q.text} (добавлено: ${q.createdAt})`, buttons);
        }
      }

    } 
    // Кнопка вызова оператора
    else if (data === "call_operator") {
      await safeSend(bot, chatId, "Оператор свяжется с вами в ближайшее время.");
    } 

  } catch (err) {
    console.error("[CALLBACK] Ошибка:", err);
  }
}