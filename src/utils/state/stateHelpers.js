// stateHelpers.js
import { chatState } from './chatState.js';
import { logger } from '../helpers/logger.js';

// Получить состояние чата
export function getState(chatId) {
    return chatState.get(chatId);
}
// Установить поле в состоянии
export function setState(chatId, key, value) {
    chatState.set(chatId, key, value);
}
// Добавить service message
export function addServiceMessage(chatId, messageId) {
    const state = getState(chatId);

    if (!state.serviceMsgIds.includes(messageId)) {
        state.serviceMsgIds.push(messageId);
        setState(chatId, 'serviceMsgIds', state.serviceMsgIds);

        logger.debug(`[STATE] Добавлено сервисное сообщение ${messageId} для chatId=${chatId}`);
    }
}
export function getServiceMessages(chatId) {
    return getState(chatId).serviceMsgIds || [];
}
export function removeServiceMessage(chatId, messageId) {
    const state = getState(chatId);
    state.serviceMsgIds = state.serviceMsgIds.filter(id => id !== messageId);
    setState(chatId, 'serviceMsgIds', state.serviceMsgIds);
}
export function addQuestion(chatId, question) {
    const state = getState(chatId);
    state.questions.push(question);
    setState(chatId, 'questions', state.questions);
}
export function removeQuestion(chatId, questionId) {
    const state = getState(chatId);
    state.questions = state.questions.filter(q => q.id !== questionId);
    setState(chatId, 'questions', state.questions);
}
export function clearChatState(chatId) {
    chatState.reset(chatId); // ✔ вызов реальной функции
}