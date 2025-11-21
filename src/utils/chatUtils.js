// src/utils/chatUtils.js
import { getChatState, setChatState } from './chatState.js';
import { bot } from '../bot.js';
import { clearChatExceptImportant } from './clearServiceMessages.js';

export async function updateQuestionsList(chatId, deleteOld = true) {
  const state = getChatState(chatId);
  const questions = state.questions;

  // Формируем текст списка
  let text = '📋 Здесь ваши вопросы:\n\n';
  questions.forEach((q, index) => {
    text += `${index + 1}. ${q}\n`;
  });
  text += '\nМенеджер обработает и вернется с ответами в ближайшее время.';
  text += '\nМаксимум 20 вопросов.';

  try {
    if (state.questionsMsgId) {
      // Редактируем существующее сообщение
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: state.questionsMsgId,
        parse_mode: 'HTML'
      });
      console.log(`[QUESTIONS] Список обновлён (ID: ${state.questionsMsgId})`);
    } else {
      // Отправляем новое сообщение
      const msg = await bot.sendMessage(chatId, text, { parse_mode: 'HTML' });
      setChatState(chatId, 'questionsMsgId', msg.message_id);
      console.log(`[QUESTIONS] Новый список (ID: ${msg.message_id})`);
    }

    // Удаляем старые служебные сообщения (если нужно)
    if (deleteOld) {
        await clearChatExceptImportant(bot, chatId); // Используем новую функцию
    }
  } catch (err) {
    console.error('[QUESTIONS] Ошибка обновления списка:', err);
  }
}
