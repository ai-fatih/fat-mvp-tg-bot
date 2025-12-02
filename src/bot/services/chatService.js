// chatService.js
import { state, telegram, helpers } from '../../utils/index.js';
import { determineStatus } from './message/determineStatus.js';
import { buildServiceMessage } from './message/buildServiceMessage.js';

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
 
        const status = determineStatus(chatState); 
        const text = buildServiceMessage(status, chatState.questions);
        
        let m
    try {
      
      // Редактируем существующее или отправляем новое сообщение если не удалось редактирование
        await safeEdit(bot, chatId, chatState.questionsMsgId, text, options) ?
      '' : ( 
        m = await safeSend(bot, chatId, text, options),
        state.setState(chatId, 'questionsMsgId', m.message_id)
      )
      

      // Очистка служебных сообщений
      if (deleteOld) await clearServiceMessages(bot, chatId);

    } catch (err) {
      console.error(`[ChatService] Ошибка обновления списка вопросов:`, err);
    }
  }
}

// Экземпляр для удобного импорта
export const chatService = new ChatService();
