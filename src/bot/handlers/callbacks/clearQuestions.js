// src/bot/handlers/callbacks/clearQuestions.js

import { uiService, chatService } from '../../services/index.js';
import { state } from '../../../utils/index.js';
import { logger } from '../../../utils/helpers/logger.js';
import { questionFirebase } from '../../../firebase/question.firebase.js';

/**
 * clear_questions
 * Очистка списка вопросов
 */
export async function clearQuestions(bot, ctx) {
  const { chatId, messageId } = ctx;

  logger.warn('[CALLBACK] clear_questions', {
    chatId,
    messageId,
  });

  // 1️⃣ Регистрируем callback как служебный
  await uiService.registerMessage(chatId, messageId);

  // 2️⃣ Бизнес-изменение: очищаем вопросы
  state.setMany(chatId, {
    questions: [],
    tempQuestion: null,
  });

  // ⚠️ статус чата НЕ трогаем
  // сценарный статус решается отдельно (и ты это правильно отметил)

  // 3️⃣ Фиксируем изменения в Firebase
  await questionFirebase.save(
    chatId,
    state.getState(chatId)
  );

  // 4️⃣ Перерисовываем главный экран
  await uiService.refreshScreen(
    chatService.updateQuestionsList,
    bot,
    chatId
  );

  // 5️⃣ UX-подсказка (по желанию)
  // await uiService.toast(bot, chatId, '🧹 Список вопросов очищен');
}
