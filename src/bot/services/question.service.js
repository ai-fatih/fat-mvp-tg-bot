import { state, helpers } from "../../utils/index.js";
import {
  normalize,
  similarity,
  looksLikeSpam,
  extractTags,
  detectCategory,
  detectWarnings,
} from "./question.analysis.js";

const { logger } = helpers;

export class QuestionService {

  /**
   * Проверка возможности добавить новый вопрос
   * Используется:
   * - при вводе (messageHandler)
   * - при подтверждении (callback confirm)
   */
  canAddQuestion(chatId) {
    const s = state.getState(chatId);

    // 1. Нет временного вопроса
    if (!s.tempQuestion || typeof s.tempQuestion !== "string") {
      return { ok: false, reason: "NO_TEMP" };
    }

    const normalized = normalize(s.tempQuestion);

    // 2. Минимальная длина
    if (normalized.length < 4) {
      return { ok: false, reason: "SHORT" };
    }

    // 3. Лимит
    const limit = state.getMaxQuestions(chatId);
    if (s.questions.length >= limit) {
      return { ok: false, reason: "LIMIT", max: limit };
    }

    // 4. Дубликаты
    const isDuplicate = s.questions.some(q =>
      similarity(q.question, normalized) > 0.9
    );
    if (isDuplicate) {
      return { ok: false, reason: "DUPLICATE" };
    }

    // 5. Спам / мусор
    if (looksLikeSpam(normalized)) {
      return { ok: false, reason: "SPAM" };
    }

    // 6. Мягкий анализ (НЕ блокирующий)
    const tags = extractTags(normalized);
    const category = detectCategory(normalized);
    const warnings = detectWarnings(normalized);

    return {
      ok: true,
      meta: {
        normalized,
        tags,
        category,
        warnings,
      },
    };
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
      status: "process",
      createdAt: new Date().toISOString(),

      // доп. данные
      sourceMessageId: meta.sourceMessageId || null,
      tags: meta.tags || [],
      category: meta.category || null,
      warnings: meta.warnings || [],
      high_priority: false,
    };
  }

  /**
   * Атомарно добавляет вопрос (callback confirm)
   */
  addQuestion(chatId, meta = {}) {
    const s = state.getState(chatId);
console.log("в добавлении", s)
    // 1. Проверки
    const check = this.canAddQuestion(chatId);
    if (!check.ok) {
      logger.warn(
        `[QUESTION] cannot add (chatId=${chatId}, reason=${check.reason})`
      );
      return { ok: false, reason: check.reason, max: check.max };
    }

    const text = s.tempQuestion.trim();

    // 2. Создание вопроса
    const newQuestion = this.buildQuestionObject(chatId, text, {
      ...meta,
      ...check.meta,
    });

    // 3. Атомарное обновление state
    state.setMany(chatId, {
      questions: [...s.questions, newQuestion],
      tempQuestion: null,
      tempQuestionMeta: null,
      chatStatus: "COLLECTING",
    }, false);

    logger.info(
      `[QUESTION] added (chatId=${chatId}, id=${newQuestion.id})`
    );

    return { ok: true, question: newQuestion };
  }

  /**
   * Установка временного вопроса
   * Используется в messageHandler
   */
  setTempQuestion(chatId, text, meta = {}) {
    state.setMany(chatId, {
      tempQuestion: text,
      tempQuestionMeta: {
        sourceMessageId: meta.sourceMessageId || null,
      },
    }, false);

    logger.debug(
      `[QUESTION] tempQuestion set (chatId=${chatId})`
    );

    return this.canAddQuestion(chatId);
  }

  /**
   * Отмена временного вопроса
   */
  cancelTempQuestion(chatId) {
    const s = state.getState(chatId);

    state.setMany(chatId, {
      tempQuestion: null,
      tempQuestionMeta: null,
      chatStatus: "COLLECTING",
    }, false);

    logger.info(
      `[QUESTION] tempQuestion cancelled (chatId=${chatId})`
    );

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

    state.setMany(chatId, { questions: updated }, true);

    logger.info(
      `[QUESTION] statuses updated → ${newStatus} (chatId=${chatId})`
    );

    return { ok: true, questions: updated };
  }
}

// ✅ singleton
export const questionService = new QuestionService();
