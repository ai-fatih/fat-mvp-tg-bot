// src/utils/chatUtils.js
import { getChatState, setChatState } from './chatState.js';
import { bot } from '../bot.js';

export async function updateQuestionsList(chatId, deleteOld = true) {
  const state = getChatState(chatId);
  const questions = state.questions;

  // Формируем текст списка
  let text = '📋 Ваши вопросы:\n\n';
  questions.forEach((q, index) => {
    text += `${index + 1}. ${q}\n`;
  });
  text += 'Менеджер вернется к вам с ответами в ближайшее время.'

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
    if (deleteOld && state.serviceMsgIds) {
      for (const msgId of state.serviceMsgIds) {
        try {
          await bot.deleteMessage(chatId, msgId);
          console.log(`[DELETE] Удалено служебное сообщение: ${msgId}`);
        } catch (err) {
          console.error(`[DELETE] Ошибка при удалении ${msgId}:`, err);
        }
      }
      setChatState(chatId, 'serviceMsgIds', []); // Очищаем список
    }
  } catch (err) {
    console.error('[QUESTIONS] Ошибка обновления списка:', err);
  }
}
