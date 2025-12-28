import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

function removeUndefined(obj) {
  if (Array.isArray(obj)) {
    return obj
      .filter(v => v !== undefined)
      .map(v => removeUndefined(v));
  }

  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }

  return obj;
}


/**
 * Firebase persistence слоя для ChatState
 *
 * Принципы:
 * - Firebase = persisted snapshot
 * - Без бизнес-логики
 * - Без UI
 * - Runtime-флаги не храним
 */
export const questionFirebase = {
   

  /**
   * 🔹 READ ONLY
   * Получение persisted state
   * - НЕ создаёт документ
   * - Добавляет runtime-флаг isHydrated
   */
  async getChat(chatId) {
    if (!chatId) throw new Error('chatId is required');

    const ref = doc(db, 'chats', String(chatId));
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return null;
    }

    return {
      ...snap.data(),
      isHydrated: true, // runtime-флаг
    };
  },

  /**
   * 🔹 INIT (cold start)
   * Использовать ТОЛЬКО в /start
   */
  async initChat(chatId) {
    if (!chatId) throw new Error('chatId is required');

    const ref = doc(db, 'chats', String(chatId));
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return {
        exists: true,
        state: {
          ...snap.data(),
          isHydrated: true, // runtime-флаг
        },
      };
    }

    const initialState = {
      chatId,

      // бизнес
      questions: [],
      status: 'EMPTY',

      // UX / сценарий
      tempQuestion: null,
      helloShown: false,

      // UI
      questionsMsgId: null,
      serviceMsgId: [],
      serviceHistory: [],

      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(ref, initialState);

    return {
      exists: false,
      state: {
        ...initialState,
        isHydrated: true, // runtime-флаг
      },
    };
  },

  /**
   * 🔹 WRITE
   * Сохранение состояния чата
   * - принимает runtime state
   * - удаляет runtime-only поля
   * - сохраняет snapshot
   */
  async save(chatId, state) {
    if (!chatId) throw new Error('chatId is required');
    if (!state || typeof state !== 'object') {
      throw new Error('state must be an object');
    }
  
    const {
      // runtime-only
      isHydrated,
      lastUserMessageId,
  
      // всё остальное — persisted
      ...persistedState
    } = state;
  
    const cleanedState = removeUndefined({
      ...persistedState,
      updatedAt: Date.now(),
    });
  
    const ref = doc(db, 'chats', String(chatId));
  
    await setDoc(ref, cleanedState, { merge: true });
  }
  
};
