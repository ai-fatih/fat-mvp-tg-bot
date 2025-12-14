// src/bot/handlers/callbacks/clearQuestions.js

import { uiService, chatService } from '../../services/index.js';
import { state } from '../../../utils/index.js';
import { logger } from '../../../utils/helpers/logger.js';

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

  // 1️⃣ Регистрируем callback
  await uiService.registerMessage(chatId, messageId);

  // 2️⃣ Сбрасываем состояние вопросов
  state.setMany(chatId, {
    questions: [],
    tempQuestion: null,
  });

  // ⚠️ статус НЕ трогаем (ты это уже правильно поймал раньше)

  // 3️⃣ Обновляем UI
  await uiService.refreshScreen(
    chatService.updateQuestionsList,
    bot,
    chatId
  );

  // 4️⃣ UX-подсказка
  /* await uiService.toast(bot, chatId, '🧹 Список вопросов очищен'); */
}
