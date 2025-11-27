// /utils/state/stateHelpers.js
import { getChatState as rawGetChatState, setChatState as rawSetChatState } from './chatState.js';
import { logger } from '../helpers/logger.js';

/**
 * Получить состояние чата
 * @param {number|string} chatId
 * @returns {object} state
 */
export function getState(chatId) {
    return rawGetChatState(chatId);
}

/**
 * Установить конкретное поле в состоянии чата
 * @param {number|string} chatId
 * @param {string} key
 * @param {any} value
 */
export function setState(chatId, key, value) {
    rawSetChatState(chatId, key, value);
}

/**
 * Добавить служебное сообщение (ID) в state
 * @param {number|string} chatId
 * @param {number} messageId
 */
export function addServiceMessage(chatId, messageId) {
    const state = getState(chatId);
    if (!state.serviceMsgIds.includes(messageId)) {
        state.serviceMsgIds.push(messageId);
        setState(chatId, 'serviceMsgIds', state.serviceMsgIds);
        logger.debug(`[STATE] Добавлено служебное сообщение ${messageId} для chatId=${chatId}`);
    }
}

/**
 * Получить массив ID служебных сообщений
 * @param {number|string} chatId
 * @returns {number[]}
 */
export function getServiceMessages(chatId) {
    const state = getState(chatId);
    return state.serviceMsgIds || [];
}

/**
 * Удалить ID служебного сообщения из state
 * @param {number|string} chatId
 * @param {number} messageId
 */
export function removeServiceMessage(chatId, messageId) {
    const state = getState(chatId);
    const index = state.serviceMsgIds.indexOf(messageId);
    if (index !== -1) {
        state.serviceMsgIds.splice(index, 1);
        setState(chatId, 'serviceMsgIds', state.serviceMsgIds);
        logger.debug(`[STATE] Удалено служебное сообщение ${messageId} для chatId=${chatId}`);
    }
}

/**
 * Добавить новый вопрос в state
 * @param {number|string} chatId
 * @param {object} question {id, question, answer?}
 */
export function addQuestion(chatId, question) {
    const state = getState(chatId);
    if (!state.questions) state.questions = [];
    state.questions.push(question);
    setState(chatId, 'questions', state.questions);
    logger.debug(`[STATE] Добавлен вопрос ${question.id} для chatId=${chatId}`);
}

/**
 * Удалить вопрос из state по ID
 * @param {number|string} chatId
 * @param {number} questionId
 */
export function removeQuestion(chatId, questionId) {
    const state = getState(chatId);
    state.questions = state.questions.filter(q => q.id !== questionId);
    setState(chatId, 'questions', state.questions);
    logger.debug(`[STATE] Удалён вопрос ${questionId} для chatId=${chatId}`);
}

/**
 * Очистить временное состояние чата
 * @param {number|string} chatId
 */
export function clearChatState(chatId) {
    const state = getState(chatId);
    state.questions = [];
    state.serviceMsgIds = [];
    state.temp_question = null;
    state.lastUserMessageId = null;
    state.lastBotMessageId = null;
    state.questionsMsgId = null;
    setState(chatId, 'questions', []);
    setState(chatId, 'serviceMsgIds', []);
    logger.debug(`[STATE] Очистка состояния chatId=${chatId}`);
}
