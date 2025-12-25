// src/firebase/question.firebase.js

import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

/**
 * Firebase persistence слоя для ChatState
 *
 * Принципы:
 * - Firebase = persisted snapshot
 * - Никакой бизнес-логики
 * - Никакого UI
 * - Никакого merge state → этим занимается runtime
 */
export const questionFirebase = {

  /**
   * 🔹 READ ONLY
   * Безопасное получение persisted state
   * - НЕ создаёт документ
   * - НЕ мутирует данные
   * - Используется для refresh / внешней синхронизации
   */
  async getChat(chatId) {
    if (!chatId) throw new Error('chatId is required');

    const ref = doc(db, 'chats', String(chatId));
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return snap.data();
  },

  /**
   * 🔹 INIT (cold start)
   * Инициализация чата
   * - если есть → возвращаем сохранённый state
   * - если нет → создаём дефолтный snapshot
   *
   * Использовать ТОЛЬКО в /start
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

    // дефолтный persisted snapshot
    const initialState = {
      chatId,

      // бизнес
      questions: [],
      status: 'EMPTY',

      // UX / сценарий
      tempQuestion: null,
      helloShown: false,

      // UI (Telegram-specific)
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
   * 🔹 WRITE
   * Сохранение состояния чата
   * - принимает ВЕСЬ runtime state
   * - фильтрует runtime-only поля
   * - делает merge
   *
   * Вызывать ТОЛЬКО при бизнес-событиях
   */
  async save(chatId, state) {
    if (!chatId) throw new Error('chatId is required');
    if (!state || typeof state !== 'object') {
      throw new Error('state must be an object');
    }

    /**
     * runtime-поля,
     * которые не имеют смысла хранить
     */
    const {
      lastUserMessageId, // одноразовый runtime
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
