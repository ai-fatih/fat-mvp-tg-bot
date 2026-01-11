// src/bot/handlers/messageHandler.js

import { uiService, questionService, messageService } from '../services/index.js';
import { getAIAnswer } from '../../ai/ai.service.js'
import { config } from '../../config/index.js';
import { loadTOC } from '../../pdf/toc.loader.js';
import { searchSections } from '../../pdf/search.service.js';
import { findSection } from '../../pdf/section.finder.js';
import { loadSection } from '../../pdf/pdf.section.loader.js';
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
    /* if (text.startsWith('ai:')) {
      const question = text.replace('ai:', '').trim();
    
      const aiReply = await getAIAnswer(question);
    
      console.log('[AI REPLY]', aiReply);
      await bot.sendMessage(chatId, aiReply || 'AI не ответил');
      return;
    }
       
    console.log('1️⃣ Загружаем TOC');
    const toc = loadTOC('storehouse5');
  
    console.log('2️⃣ Ищем совпадения для запроса', text);
    const matches = searchSections({
      query: text,
      tocFlat: toc.flat,
      limit: 7
    }); 

    console.log('3️⃣ Выбираем секцию из', matches);
      const sectionData = findSection({
      matches,
      tocFlat: toc.flat,
      query: text
    }); 
    console.log('sectionData:', sectionData);
   
     console.log('4️⃣ Загружаем текст PDF');
    const content = await loadSection({
      pdfPath: config.pdfs[0].path,
      fromPage: sectionData.fromPage,
      toPage: sectionData.toPage
    });
  
    console.log('📄 RESULT TEXT (preview):', sectionData.section.title);
    console.log(content.text.slice(0, 1500));
    if (content.text) {
      await messageService.sendMessage(
        bot,
        chatId,
        sectionData.section.title + '\n\n' + content.text.slice(0, 1500)
      )
    return
  } */

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
