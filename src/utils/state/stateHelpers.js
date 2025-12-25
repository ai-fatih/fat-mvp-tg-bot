import { chatState, determineStatus } from './index.js';
import * as sm from './stateMachine.js';
import { logger } from '../helpers/logger.js';

export function getState(chatId) {
  return chatState.get(chatId);
}
export function setState(chatId, key, value) {
  chatState.set(chatId, key, value);
}
export function setMany(chatId, obj) {
  return chatState.setMany(chatId, obj);
}
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
export function getServiceMessages(chatId) {
  const state = getState(chatId);
  return Array.isArray(state.serviceMsgId) ? state.serviceMsgId : [];
}
export function removeServiceMessage(chatId, messageId) {
  const state = getState(chatId);

  if (!Array.isArray(state.serviceMsgId)) return;

  state.serviceMsgId = state.serviceMsgId.filter(id => id !== messageId);

  logger.debug(
    `[STATE] serviceMsgId - ${messageId} (chatId=${chatId})`
  );
}
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
export function addQuestion(chatId, question) {
  const state = getState(chatId);
  state.questions.push(question);

  logger.debug(
    `[STATE] Добавлен вопрос "${question.text}" (chatId=${chatId})`
  );
}
export function removeQuestion(chatId, questionId) {
  const state = getState(chatId);

  state.questions = state.questions.filter(q => q.id !== questionId);

  logger.debug(
    `[STATE] Вопрос #${questionId} удалён (chatId=${chatId})`
  );
}
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
export function getQuestionsMessageId(chatId) {
    const state = getState(chatId);
    return state.questionsMsgId || null;
  }
export function clearQuestionsMessageId(chatId) {
    const state = getState(chatId);
    state.questionsMsgId = null;
    logger.debug(`[STATE] questionsMsgId cleared (chatId=${chatId})`);
  }
export function getMaxQuestions(chatId) {
    const s = getState(chatId);
    return s.maxQuestions ?? chatState.DEFAULT_MAX;
  }  
// обработка статусов
export function getChatStatus(chatId) {
    const s = getState(chatId) || {};
    return determineStatus(s);
  }
export function updateChatStatus(chatId, status) {
    try {
      return sm.setChatStatus(chatId, status);
    } catch (e) {
      console.error('[stateHelpers] updateChatStatus', e);
      return null;
    }
  }


  /**
 * 🔄 Merge данных из Firebase в runtime state
 * Используется для refresh / внешней синхронизации
 */
export function mergeFromFirebase(chatId, firebaseState) {
  if (!firebaseState) {
    logger.debug('[STATE] mergeFromFirebase: empty firebaseState');
    return;
  }

  const localState = getState(chatId);
  if (!localState) {
    logger.warn('[STATE] mergeFromFirebase: no local state', { chatId });
    return;
  }

  let changed = false;

  /**
   * 1️⃣ Merge глобального статуса чата
   */
  if (
    firebaseState.status &&
    firebaseState.status !== localState.status
  ) {
    updateChatStatus(chatId, firebaseState.status);
    changed = true;

    logger.debug('[STATE] status merged from firebase', {
      chatId,
      status: firebaseState.status,
    });
  }

  /**
   * 2️⃣ Merge вопросов (answer + status)
   */
  if (
    Array.isArray(firebaseState.questions) &&
    Array.isArray(localState.questions)
  ) {
    const mergedQuestions = localState.questions.map(localQ => {
      const remoteQ = firebaseState.questions.find(
        fq => fq.id === localQ.id
      );

      if (!remoteQ) return localQ;

      let questionChanged = false;
      const merged = { ...localQ };

      if (
        remoteQ.answer !== undefined &&
        remoteQ.answer !== localQ.answer
      ) {
        merged.answer = remoteQ.answer;
        questionChanged = true;
      }

      if (
        remoteQ.status &&
        remoteQ.status !== localQ.status
      ) {
        merged.status = remoteQ.status;
        questionChanged = true;
      }

      if (questionChanged) {
        changed = true;

        logger.debug('[STATE] question merged from firebase', {
          chatId,
          questionId: localQ.id,
        });
      }

      return merged;
    });

    if (changed) {
      setState(chatId, 'questions', mergedQuestions);
    }
  }

  if (!changed) {
    logger.debug('[STATE] mergeFromFirebase: no changes', { chatId });
  }
}
