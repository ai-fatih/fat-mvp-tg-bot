// src/bot/handlers/messageHandler.js

import { uiService, questionService, messageService } from '../services/index.js';

/**
 * Обработчик входящих текстовых сообщений
 *
 * Отвечает ТОЛЬКО за:
 * - приём текста пользователя
 * - передачу его в QuestionService
 * - отображение UI подтверждения / ошибок
 */
export async function messageHandler(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Игнорируем команды и пустые сообщения
  if (!text || text.startsWith('/')) return;

  try {
    // 1️⃣ Регистрируем сообщение пользователя как служебное
    await uiService.registerMessage(chatId, msg.message_id);

    // 2️⃣ Устанавливаем временный вопрос + получаем результат валидации
    const check = questionService.setTempQuestion(chatId, text, {
      sourceMessageId: msg.message_id,
    });

    // 3️⃣ Сообщения валидации
    const validationMessages = {
      SHORT: '❌ Вопрос слишком короткий.',
      LIMIT: max => `⚠️ Лимит ${max} вопросов достигнут.`,
      DUPLICATE: '🔁 Вы уже задавали похожий вопрос.',
      SPAM: '🧹 Похоже на мусор. Попробуйте переформулировать.',
      NO_TEMP: 'Не удалось обработать вопрос.',
    };

    let footer = '';
    let replyMarkup = null;

    // 4️⃣ Если валидация НЕ пройдена
    if (!check.ok) {
      const message =
        typeof validationMessages[check.reason] === 'function'
          ? validationMessages[check.reason](check.max)
          : validationMessages[check.reason] || 'Ошибка обработки вопроса.';

      footer = `\n\n<b>${message}</b>`;
    } else {
      // 5️⃣ Если всё ок — показываем подтверждение
      footer = `\n\n<b>Добавить этот вопрос?</b>`;
      replyMarkup = messageService.buildConfirmCancelKeyboard();
    }

    // 6️⃣ Отправляем единое UI-сообщение
    const confirmMsg = await messageService.sendMessage(
      bot,
      chatId,
      `<b>Ваш вопрос:</b>\n\n<i>«${text}»</i>${footer}`,
      { reply_markup: replyMarkup }
    );

    // 7️⃣ Регистрируем UI как служебное
    if (confirmMsg?.message_id) {
      await uiService.registerMessage(chatId, confirmMsg.message_id);
    }

  } catch (err) {
    console.error('[MESSAGE_HANDLER] Ошибка:', err);

    // Фолбэк для пользователя
    await uiService.toast(
      bot,
      chatId,
      'Произошла ошибка при обработке сообщения.'
    );
  }
}
