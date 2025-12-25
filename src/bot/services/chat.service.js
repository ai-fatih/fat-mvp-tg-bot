// chatService.js
import { state, telegram, helpers } from '../../utils/index.js'; 
import { buildServiceMessage } from './message/build.js'; 
import { uiService } from './index.js';
import { questionFirebase } from '../../firebase/question.firebase.js';

const { safeSend, safeEdit } = telegram;
const { logger } = helpers

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
    console.log(status)
    const { text, reply_markup } = buildServiceMessage(status, chatState.questions);
    const sendOptions = { parse_mode: 'HTML', reply_markup }; 
    let questionsMsgId = chatState.questionsMsgId;
    if (deleteOld) {
      await uiService.clearAll(bot, chatId);
    }
    
    logger.debug('[CHAT] updateQuestionsList', {
      chatId,
      status,
      questionsMsgId
  }); 
   
    try { 
      const edited = await safeEdit(bot, chatId, questionsMsgId, text, sendOptions);

      // 1. Всё хорошо — сообщение живо
      if (edited === true || edited === 'NOT_MODIFIED') {
        logger.debug('[CHAT] UI exists and is актуален', { chatId });
        return;
      }
      
      // 2. Сообщение реально потеряно
      if (edited === 'NOT_FOUND') {
        logger.warn('[CHAT] main UI message lost → recreating', {
          chatId,
          oldMessageId: questionsMsgId,
        });
      
        state.setState(chatId, 'questionsMsgId', null);
      
        const sent = await safeSend(bot, chatId, text, sendOptions);
      
        if (sent?.message_id) {
          state.setState(chatId, 'questionsMsgId', sent.message_id);
          await questionFirebase.save(
            chatId,
            state.getState(chatId)
          );
          logger.info('[CHAT] main UI recreated', {
            chatId,
            messageId: sent.message_id,
          });
        }
      }
      
       
    } catch (err) {
      console.error('updateQuestionsList error', err);
    }
  }
}

// Экземпляр для удобного импорта
export const chatService = new ChatService();
