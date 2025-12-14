// src/bot/handlers/callbacks/index.js

import { confirmQuestion } from './confirmQuestion.js';
import { cancelQuestion } from './cancelQuestion.js';
import { refreshQuestions } from './refreshQuestions.js';
import { clearQuestions } from './clearQuestions.js';
import { sendQuestionsToWork } from './sendQuestionsToWork.js';

/**
 * Routing-table для callback_query
 * key   — callback_data
 * value — handler(bot, ctx)
 */
export const callbackRoutes = {
  confirm_question: confirmQuestion,
  cancel_question: cancelQuestion,
  refresh_questions: refreshQuestions,
  clear_questions: clearQuestions,
  send_questions: sendQuestionsToWork,
};
