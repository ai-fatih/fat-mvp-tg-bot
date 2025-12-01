// chatService.js
import { state, telegram, helpers } from '../../utils/index.js';

const { safeSend, safeEdit, clearServiceMessages, fmt, headers } = telegram;


/**
 * Сервис для работы с логикой чата:
 * - добавление/удаление вопросов
 * - обновление сообщений с вопросами
 * - получение текущих вопросов
 */
export class ChatService {
  /**
   * Добавить вопрос в состояние чата
   * @param {number|string} chatId 
   * @param {string} question
   */
  addQuestion(chatId, question) {
    const chatState = state.getState(chatId);

    if (!chatState.questions) chatState.questions = [];
    if (chatState.questions.length >= 20) return false;

    const id = chatState.questions.length + 1;
    chatState.questions.push({ id, question, answer: null });
    state.setState(chatId, 'questions', chatState.questions);
    return true;
  }

  /**
   * Очистить все вопросы
   * @param {number|string} chatId 
   */
  clearQuestions(chatId) {
    state.setState(chatId, 'questions', []);
    state.setState(chatId, 'questionsMsgId', null);
  }

  /**
   * Получить список вопросов
   * @param {number|string} chatId 
   */
  getQuestions(chatId) {
    const chatState = state.getState(chatId);
    return chatState.questions || [];
  }

  /**
   * Обновить сообщение со списком вопросов
   * @param {object} bot - экземпляр TelegramBot
   * @param {number|string} chatId 
   * @param {object} options - дополнительные опции
   * @param {boolean} deleteOld - удалять ли старые служебные сообщения
   */
  async updateQuestionsList(bot, chatId, options = {}, deleteOld = true) {
    const chatState = state.getState(chatId);
    const questions = chatState.questions || [];

    // Формируем текст
    let text = `${headers.questions()} (${questions.length} из 20)\n\n`;
    questions.forEach(q => {
      text += `${fmt.italic(q.id + '. ' + q.question)}\n`;
      if (q.answer) text += `Ответ: ${q.answer}\n`;
    });
    text += `\n${headers.waiting()}`;

    try {
      if (chatState.questionsMsgId) {
        // Редактируем существующее сообщение
        await safeEdit(bot, chatId, chatState.questionsMsgId, text, options);
      } else {
        // Отправляем новое сообщение
        const msg = await safeSend(bot, chatId, text, options);
        state.setState(chatId, 'questionsMsgId', msg.message_id);
      }

      // Очистка служебных сообщений
      if (deleteOld) await clearServiceMessages(bot, chatId);

    } catch (err) {
      console.error(`[ChatService] Ошибка обновления списка вопросов:`, err);
    }
  }
}

// Экземпляр для удобного импорта
export const chatService = new ChatService();
