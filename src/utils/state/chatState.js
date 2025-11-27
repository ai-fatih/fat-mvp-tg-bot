/**
 * ChatState — менеджер временного состояния чатов
 * Хранит краткосрочные данные:
 * - временный вопрос
 * - id сервисных сообщений
 * - последние сообщения пользователя/бота
 * - список вопросов до записи в Firebase
 * - id сообщений со списками
 *
 * Данные хранятся в памяти (Map), очищаются только при рестарте бота.
 */

class ChatState {
    constructor() {
      this.state = new Map(); // { chatId: { ...state } }
    }
  
    /**
     * Получение состояния конкретного чата
     * Если чата нет — создаём структуру по умолчанию
     */
    get(chatId) {
      if (!this.state.has(chatId)) {
        this.state.set(chatId, this._defaultState());
      }
      return this.state.get(chatId);
    }
  
    /**
     * Установка произвольного поля
     * Пример:
     * chatState.set(123, "temp_question", "Как провести списание?");
     */
    set(chatId, key, value) {
      const chat = this.get(chatId);
      chat[key] = value;
    }
  
    /**
     * Добавить сервисное сообщение (чтобы потом удалить)
     * Пример:
     * chatState.addServiceMsgId(chatId, messageId);
     */
    addServiceMsgId(chatId, messageId) {
      const chat = this.get(chatId);
      chat.serviceMsgIds.push(messageId);
    }
  
    /**
     * Очистить все сервисные сообщения
     * (используется при переходе между экранами)
     */
    clearServiceMessages(chatId) {
      const chat = this.get(chatId);
      chat.serviceMsgIds = [];
    }
  
    /**
     * Сохранить временный вопрос (до записи в Firebase)
     */
    setTempQuestion(chatId, text) {
      this.set(chatId, "temp_question", text);
    }
  
    /**
     * Получить временный вопрос
     */
    getTempQuestion(chatId) {
      return this.get(chatId).temp_question;
    }
  
    /**
     * Установить последний вопрос пользователя
     * (может пригодиться для диалогов)
     */
    setLastUserMessage(chatId, msgId) {
      this.set(chatId, "lastUserMessageId", msgId);
    }
  
    /**
     * Полная очистка состояния чата (но не Map целиком)
     */
    reset(chatId) {
      this.state.set(chatId, this._defaultState());
    }
  
    /**
     * Полная очистка всех чатов (при необходимости)
     */
    clearAll() {
      this.state.clear();
    }
  
    /**
     * Базовая структура состояния
     * (повторяет старый стейт, но аккуратно)
     */
    _defaultState() {
      return {
        chat_id: null,
  
        questions: [],          // список набранных вопросов
        questionsMsg: null,     // сообщение со списком вопросов
        questionsMsgId: null,   // id сообщения со списком вопросов
  
        serviceMsgIds: [],      // временные "лишние" сообщения
  
        lastUserMessageId: null,
        lastBotMessageId: null,
  
        lastUserQuestion: null, // последнее отправленное пользователем сообщение
        temp_question: null,    // временный вопрос перед подтверждением
  
        welcomeMsg: null,
        welcomeMsgId: null,
      };
    }
  }
  
  export const chatState = new ChatState();
  