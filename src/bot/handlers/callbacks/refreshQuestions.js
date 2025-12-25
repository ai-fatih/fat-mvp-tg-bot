// src/bot/handlers/callbacks/refreshQuestions.js
import { state } from '../../../utils/index.js';
import { uiService, chatService } from '../../services/index.js';
import { logger } from '../../../utils/helpers/logger.js';
import { questionFirebase } from '../../../firebase/question.firebase.js';

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

  const firebaseState = await questionFirebase.getChat(chatId);

if (firebaseState) {
  state.mergeFromFirebase(chatId, firebaseState);
}

await uiService.refreshScreen(
  chatService.updateQuestionsList,
  bot,
  chatId
);

}
