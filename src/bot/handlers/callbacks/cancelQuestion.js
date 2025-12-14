// src/bot/handlers/callbacks/cancelQuestion.js

import { uiService, questionService } from '../../services/index.js';
import { logger } from '../../../utils/helpers/logger.js';

/**
 * cancel_question
 * Отмена временного вопроса
 */
export async function cancelQuestion(bot, ctx) {
  const { chatId, messageId } = ctx;

  logger.info('[CALLBACK] cancel_question', {
    chatId,
    messageId,
  });

  // 1️⃣ Регистрируем callback-сообщение как служебное
  await uiService.registerMessage(chatId, messageId);

  // 2️⃣ Отменяем временный вопрос
  const result = questionService.cancelTempQuestion(chatId);

  // 3️⃣ Чистим все служебные сообщения (кроме главного UI — он защищён)
  await uiService.clearAll(bot, chatId);

  // 4️⃣ Если был текст — предлагаем отредактировать
  if (result?.text) {
    const draftMsg = await bot.sendMessage(
      chatId,
      `✏️ Вы отменили вопрос.\nМожете отредактировать и отправить заново:\n\n${result.text}`,
      { reply_markup: { force_reply: true } }
    );

    if (draftMsg?.message_id) {
      await uiService.registerMessage(chatId, draftMsg.message_id);
    }
  }
}
