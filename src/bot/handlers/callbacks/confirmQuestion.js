// src/bot/handlers/callbacks/confirmQuestion.js

import { state } from '../../../utils/index.js';
import { uiService, chatService, questionService } from '../../services/index.js';
import { logger } from '../../../utils/helpers/logger.js';
import { questionFirebase } from '../../../firebase/question.firebase.js';

/**
 * confirm_question
 * Подтверждение добавления вопроса
 */
export async function confirmQuestion(bot, ctx) {
  const { chatId, messageId } = ctx;
  const chatState = state.getState(chatId);

  logger.info('[CALLBACK] confirm_question', {
    chatId,
    messageId,
  });

  // 1️⃣ Регистрируем callback-сообщение как служебное
  await uiService.registerMessage(chatId, messageId);

  // 2️⃣ Добавляем вопрос
  /* const result =  */
  questionService.addQuestion(chatId, {
    sourceMessageId: messageId,
  });
  await questionFirebase.save(chatId, chatState.questions);
  
  // 4️⃣ Обновляем сценарный статус
  state.updateChatStatus(chatId, 'COLLECTING');

  // 5️⃣ Перерисовываем главный экран
  await uiService.refreshScreen(
    chatService.updateQuestionsList.bind(chatService),
    bot,
    chatId
  );
}
