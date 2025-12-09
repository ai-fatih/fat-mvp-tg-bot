// chatService.js
import { state, telegram, helpers } from '../../utils/index.js'; 
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
    const status = state.getChatStatus(chatId);  
    console.log('глобальный статус:', status)

    const { text, reply_markup } = buildServiceMessage(status, chatState.questions);
    const sendOptions = { parse_mode: 'HTML', reply_markup };
     
    try {
      let questionsMsgId = chatState.questionsMsgId;
  // Очистка служебных сообщений
    if (deleteOld) await clearServiceMessages(bot, chatId);

    if (questionsMsgId) {
        const edited = await safeEdit(bot, chatId, questionsMsgId, text, sendOptions);

        if (edited === 'NOT_MODIFIED') {
            // ничего не делаем
            return;
        }

        if (edited === false) {
            // сообщение не найдено — нужно отправить новое
            const sent = await safeSend(bot, chatId, text, sendOptions);
            if (sent?.message_id) {
                state.setState(chatId, 'questionsMsgId', sent.message_id);
            }
            return;
        }

        // если edited === true → всё успешно → выходим
        return;
    }

    // если вопросов ещё не было или id утерян
    const sent = await safeSend(bot, chatId, text, sendOptions);
      if (sent?.message_id) {
        state.setState(chatId, 'questionsMsgId', sent.message_id);
    }

       
    } catch (err) {
      console.error('updateQuestionsList error', err);
    }
       
 
  }
}

// Экземпляр для удобного импорта
export const chatService = new ChatService();
