import { chatState } from './chatState.js';
import { logger } from '../helpers/logger.js';

/**
 * Получить состояние чата.
 */
export function getState(chatId) {
  return chatState.get(chatId);
}

/**
 * Установить поле в состоянии.
 */
export function setState(chatId, key, value) {
  chatState.set(chatId, key, value);
}

/**
 * Добавить ID сервисного сообщения.
 * Используем новый массив: state.serviceMsgId []
 */
export function addServiceMessage(chatId, messageId) {
  const state = getState(chatId);

  if (!Array.isArray(state.serviceMsgId)) {
    state.serviceMsgId = [];
  }

  if (!state.serviceMsgId.includes(messageId)) {
    state.serviceMsgId.push(messageId);

    logger.debug(
      `[STATE] serviceMsgId + ${messageId} (chatId=${chatId})`
    );
  }
}

/**
 * Список активных сервисных сообщений.
 */
export function getServiceMessages(chatId) {
  const state = getState(chatId);
  return Array.isArray(state.serviceMsgId) ? state.serviceMsgId : [];
}

/**
 * Удалить конкретное сервисное сообщение.
 */
export function removeServiceMessage(chatId, messageId) {
  const state = getState(chatId);

  if (!Array.isArray(state.serviceMsgId)) return;

  state.serviceMsgId = state.serviceMsgId.filter(id => id !== messageId);

  logger.debug(
    `[STATE] serviceMsgId - ${messageId} (chatId=${chatId})`
  );
}

/**
 * Архивировать текущие serviceMsgId
 * (используем в UI-потоке при обновлении экрана).
 */
export function archiveServiceMessages(chatId) {
  const state = getState(chatId);

  if (!state.serviceMsgId || state.serviceMsgId.length === 0) return;

  // переносим в историю
  state.serviceHistory.push([...state.serviceMsgId]);

  logger.debug(
    `[STATE] Архивировано serviceMsgId (${state.serviceMsgId.length}) для chatId=${chatId}`
  );

  // очищаем активные
  state.serviceMsgId = [];
}

/**
 * Добавить вопрос в массив.
 */
export function addQuestion(chatId, question) {
  const state = getState(chatId);
  state.questions.push(question);

  logger.debug(
    `[STATE] Добавлен вопрос "${question.text}" (chatId=${chatId})`
  );
}

/**
 * Удалить вопрос по ID.
 */
export function removeQuestion(chatId, questionId) {
  const state = getState(chatId);

  state.questions = state.questions.filter(q => q.id !== questionId);

  logger.debug(
    `[STATE] Вопрос #${questionId} удалён (chatId=${chatId})`
  );
}

/**
 * Полная очистка state чата.
 * Используется при RESET.
 */
export function clearChatState(chatId) {
  chatState.reset(chatId);

  logger.debug(`[STATE] Reset состояния (chatId=${chatId})`);
}


// Сохранить message_id постоянного сообщения со списком (questions)
export function setQuestionsMessageId(chatId, messageId) {
    const state = getState(chatId);
    state.questionsMsgId = messageId;
    logger.debug(`[STATE] questionsMsgId = ${messageId} (chatId=${chatId})`);
  }
  
  // Получить message_id постоянного сообщения
  export function getQuestionsMessageId(chatId) {
    const state = getState(chatId);
    return state.questionsMsgId || null;
  }
  
  // Удалить ссылку на постоянное сообщение (не удаляет само сообщение в Telegram)
  export function clearQuestionsMessageId(chatId) {
    const state = getState(chatId);
    state.questionsMsgId = null;
    logger.debug(`[STATE] questionsMsgId cleared (chatId=${chatId})`);
  }
  