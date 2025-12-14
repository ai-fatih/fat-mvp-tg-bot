// src/bot/services/question.service.js

import { state, helpers } from "../../utils/index.js";
const { logger } = helpers;

export class QuestionService {

  /**
   * Проверка возможности добавить новый вопрос
   */
  canAddQuestion(chatId) {
    const s = state.getState(chatId);

    // 1. Нет временного вопроса
    if (!s.tempQuestion || typeof s.tempQuestion !== "string") {
      return { ok: false, reason: "NO_TEMP" };
    }

    const trimmed = s.tempQuestion.trim();
    if (trimmed.length < 4) {
      return { ok: false, reason: "SHORT" };
    }

    // 2. Проверка лимита
    const limit = state.getMaxQuestions(chatId);
    if (s.questions.length >= limit) {
      return { ok: false, reason: "LIMIT", max: limit };
    }

    return { ok: true };
  }

  /**
   * Формирует объект вопроса
   */
  buildQuestionObject(chatId, text, meta = {}) {
    return {
      id: Date.now(), // для MVP достаточно
      question: text.trim(),
      answer: null,
      files: [],
      status: "черновик (отправьте в работу)",
      createdAt: new Date().toISOString(),

      // доп. данные
      sourceMessageId: meta.sourceMessageId || null,
      high_priority: false,
    };
  }

  /**
   * Атомарно добавляет вопрос
   */
  addQuestion(chatId, meta = {}) {
    const s = state.getState(chatId);

    // 1. Проверки
    const check = this.canAddQuestion(chatId);
    if (!check.ok) {
      logger.warn(
        `[QUESTION] cannot add (chatId=${chatId}, reason=${check.reason})`
      );
      return { ok: false, reason: check.reason, max: check.max };
    }

    const text = s.tempQuestion.trim();

    // 2. Создаём объект вопроса
    const newQuestion = this.buildQuestionObject(chatId, text, meta);

    // 3. Обновляем state атомарно
    state.setMany(chatId, {
      questions: [...s.questions, newQuestion],
      tempQuestion: null,
      chatStatus: "COLLECTING",
    });

    logger.info(
      `[QUESTION] added (chatId=${chatId}, id=${newQuestion.id})`
    );

    return { ok: true, question: newQuestion };
  }

  /**
   * Установка временного вопроса (используется в messageHandler)
   */
  setTempQuestion(chatId, text, meta = {}) {
    state.setMany(chatId, {
      tempQuestion: text,
      chatStatus: "CONFIRMING",
      lastUserMessageId: meta.sourceMessageId || null,
    });

    logger.debug(
      `[QUESTION] tempQuestion set (chatId=${chatId})`
    );

    return { ok: true };
  }

  /**
   * Отмена временного вопроса
   */
  cancelTempQuestion(chatId) {
    const s = state.getState(chatId);

    state.setMany(chatId, {
      tempQuestion: null,
      chatStatus: "COLLECTING",
    });

    logger.info(`[QUESTION] tempQuestion cancelled (chatId=${chatId})`);

    return { text: s.tempQuestion };
  }

  /**
   * Обновляет статус всех вопросов (🚀 отправить в работу)
   */
  updateAllQuestionsStatus(chatId, newStatus) {
    const s = state.getState(chatId);

    if (!s.questions?.length) {
      return { ok: false };
    }

    const updated = s.questions.map(q => ({
      ...q,
      status: newStatus,
    }));

    state.setMany(chatId, { questions: updated });

    logger.info(
      `[QUESTION] statuses updated → ${newStatus} (chatId=${chatId})`
    );

    return { ok: true, questions: updated };
  }
}

// ✅ singleton-инстанс
export const questionService = new QuestionService();
