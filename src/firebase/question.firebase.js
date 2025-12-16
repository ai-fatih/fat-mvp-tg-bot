import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

/**
 * Работа с вопросами чата (Firestore v9)
 */
export const questionFirebase = {

  async initChat(chatId) {
    if (!chatId) throw new Error('chatId is required');

    const ref = doc(db, 'chats', String(chatId));
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data()?.questions ?? [];
    }

    // чата нет → создаём
    await setDoc(ref, {
      questions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return [];
  },

  async save(chatId, questions) {
    if (!chatId) throw new Error('chatId is required');
    if (!Array.isArray(questions)) throw new Error('questions must be an array');

    const ref = doc(db, 'chats', String(chatId));

    await setDoc(
      ref,
      {
        questions,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  }
 
};
