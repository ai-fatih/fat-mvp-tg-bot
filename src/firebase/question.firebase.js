import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

/**
 * Firebase persistence слоя для ChatState
 * Firebase = источник истины (persisted state)
 * chatState (Map) = runtime cache
 */
export const questionFirebase = {

  /**
   * Инициализация чата
   * - если есть → возвращаем сохранённый state
   * - если нет → создаём дефолтный snapshot
   */
  async initChat(chatId) {
    if (!chatId) throw new Error('chatId is required');

    const ref = doc(db, 'chats', String(chatId));
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return {
        exists: true,
        state: snap.data(),
      };
    }

    // дефолтный persisted state
    const initialState = {
      chatId,

      // бизнес
      questions: [],
      status: 'EMPTY',

      // UX / сценарий
      tempQuestion: null,

      // UI
      questionsMsgId: null,
      serviceMsgId: [],
      serviceHistory: [],

      // ограничения
      maxQuestions: 20,

      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(ref, initialState);

    return {
      exists: false,
      state: initialState,
    };
  },

  /**
   * Сохранение состояния чата
   * Принимает ВЕСЬ state, фильтрует runtime-поля
   */
  async save(chatId, state) {
    if (!chatId) throw new Error('chatId is required');
    if (!state || typeof state !== 'object') {
      throw new Error('state must be an object');
    }

    /**
     * runtime-поля, которые не имеют смысла
     * хранить между перезапусками
     */
    const {
      lastUserMessageId, // одноразовый
      ...persistedState
    } = state;

    const ref = doc(db, 'chats', String(chatId));

    await setDoc(
      ref,
      {
        ...persistedState,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  },

};
