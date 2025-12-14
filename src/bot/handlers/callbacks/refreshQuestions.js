// src/bot/handlers/callbacks/refreshQuestions.js

import { uiService, chatService } from '../../services/index.js';
import { logger } from '../../../utils/helpers/logger.js';

/**
 * refresh_questions
 * Принудительное обновление главного UI
 */
export async function refreshQuestions(bot, ctx) {
  const { chatId, messageId } = ctx;

  logger.debug('[CALLBACK] refresh_questions', {
    chatId,
    messageId,
  });

  // Регистрируем callback как служебный
  await uiService.registerMessage(chatId, messageId);

  // Просто перерисовываем экран
  await uiService.refreshScreen(
    chatService.updateQuestionsList,
    bot,
    chatId
  );
}
