// src/bot/handlers/callbacks/sendQuestionsToWork.js

import { uiService, questionService, chatService } from '../../services/index.js';
import { state } from '../../../utils/index.js';
import { logger } from '../../../utils/helpers/logger.js';

/**
 * send_questions
 * Отправка всех вопросов в работу
 */
export async function sendQuestionsToWork(bot, ctx) {
  const { chatId, messageId } = ctx;

  logger.info('[CALLBACK] send_questions', {
    chatId,
    messageId,
  });

  // 1️⃣ Регистрируем callback-сообщение как служебное
  await uiService.registerMessage(chatId, messageId);

  // 2️⃣ Проверяем, есть ли вопросы
  const chatState = state.getState(chatId);

  if (!chatState.questions?.length) {
    await uiService.toast(bot, chatId, '❗ Список вопросов пуст');
    return;
  }

  // 3️⃣ Обновляем статус всех вопросов
  questionService.updateAllQuestionsStatus(chatId, 'в работе');

  // 4️⃣ Обновляем сценарный статус чата
  state.updateChatStatus(chatId, 'SENT_TO_MANAGER');

  // 5️⃣ Перерисовываем главный экран
  await uiService.refreshScreen(
    chatService.updateQuestionsList,
    bot,
    chatId
  );

  logger.info('[CALLBACK] questions sent to work', {
    chatId,
    count: chatState.questions.length,
  });
}
