/**
 * ChatState — менеджер временного состояния чатов.
 * Хранит краткосрочные данные:
 * - список вопросов до записи в Firebase
 * - сервисные сообщения, которые нужно удалить
 * - последний ID сообщения пользователя
 * - черновик вопроса
 * - статус потока (WELCOME → FIRST → ACTIVE → ...)
 *
 * Хранится в памяти (Map).
 * Очищается только при рестарте бота.
 */

class ChatState {
  constructor() {
    this.state = new Map(); // { chatId: { ...state } }
  }

  /**
   * Получить состояние.
   * Если нет — создаём по умолчанию.
   */
  get(chatId) {
    if (!this.state.has(chatId)) {
      this.state.set(chatId, this._defaultState(chatId));
    }
    return this.state.get(chatId);
  }

  /**
   * Установить любое поле.
   */
  set(chatId, key, value) {
    const chat = this.get(chatId);
    chat[key] = value;
    chat.updatedAt = Date.now();
  }

  /**
   * Добавить ID сервисного сообщения (для последующего удаления).
   */
  addServiceMsgId(chatId, messageId) {
    const chat = this.get(chatId);
    chat.serviceMsgId.push(messageId);
    chat.updatedAt = Date.now();
  }

  /**
   * Переносим текущий список сервисных сообщений в history
   * и очищаем активные.
   */
  archiveServiceMessages(chatId) {
    const chat = this.get(chatId);

    if (chat.serviceMsgId.length > 0) {
      chat.serviceHistory.push([...chat.serviceMsgId]);
      chat.serviceMsgId = [];
      chat.updatedAt = Date.now();
    }
  }

  /**
   * Полное очищение текущих serviceMsgId (без архивации).
   */
  clearServiceMessages(chatId) {
    const chat = this.get(chatId);
    chat.serviceMsgId = [];
    chat.updatedAt = Date.now();
  }

  /**
   * Работа с временным вопросом.
   */
  setTempQuestion(chatId, text) {
    this.set(chatId, "tempQuestion", text);
  }

  getTempQuestion(chatId) {
    return this.get(chatId).tempQuestion;
  }

  /**
   * Сохранение последнего сообщения пользователя.
   */
  setLastUserMessage(chatId, msgId) {
    this.set(chatId, "lastUserMessageId", msgId);
  }

  /**
   * Полный сброс состояния конкретного чата.
   */
  reset(chatId) {
    this.state.set(chatId, this._defaultState(chatId));
  }

  /**
   * Полный сброс ВСЕХ чатов.
   * Используем только для отладки / админ команд.
   */
  clearAll() {
    this.state.clear();
  }

  // Установить questionsMsgId (единичное, перезаписываемое)
setQuestionsMsgId(chatId, messageId) {
  const chat = this.get(chatId);
  chat.questionsMsgId = messageId;
  chat.updatedAt = Date.now();
}

// Получить questionsMsgId
getQuestionsMsgId(chatId) {
  return this.get(chatId).questionsMsgId;
}

  /**
   * Базовая структура состояния.
   * Лаконичная и оптимальная под нашу логику бота:
   * — вопросы
   * — сервисные сообщения
   * — последний user msg
   * — draft вопрос
   * — status flow
   */
  _defaultState(chatId = null) {
    return {
      chatId,
      questions: [],          // { text, answer?, createdAt }
      
      // временные сообщения — удаляем после обновлений экрана
      serviceMsgId: [],       // массив активных сервисных сообщений
      serviceHistory: [],     // история массивов serviceMsgId
      
      // сообщение со списком вопросов, которое НЕ удаляем (единичное)
      questionsMsgId: null,   // numeric message_id (или null)

      lastUserMessageId: null,
      tempQuestion: null,
      status: null,           // ENUM: WELCOME | FIRST | ACTIVE | LIMIT | SENT | CLEARED | RESUMED
      updatedAt: Date.now()
    };
  }
}

export const chatState = new ChatState();
