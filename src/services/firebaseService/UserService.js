import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

/**
 * UserService
 * -----------------------------
 * Методы для работы с пользователями в Firestore.
 */
export class UserService {
  constructor(db) {
    this.db = db;
  }

  // Возвращает ссылку на документ пользователя
  _getUserRef(telegramId) {
    return doc(this.db, "users", String(telegramId));
  }

  // Получает snapshot пользователя
  async _getUserSnap(telegramId) {
    const ref = this._getUserRef(telegramId);
    return getDoc(ref);
  }

  /**
   * Создает нового пользователя или обновляет существующего
   * @param {number|string} telegramId - Telegram ID пользователя
   * @param {string} username - Имя пользователя
   */
  async createOrUpdateUser({ telegramId, username }) {
    const userRef = this._getUserRef(telegramId);
    const now = serverTimestamp();

    try {
      const userSnap = await this._getUserSnap(telegramId);
      if (userSnap.exists()) {
        await updateDoc(userRef, { lastInterActionAt: now });
      } else {
        await setDoc(userRef, {
          telegramId,
          username,
          role: "бухгалтер",
          status: "active",
          questionCount: 0,
          dateRegistered: now,
          lastInterActionAt: now,
          storeHouseVersion: "6.3.870",
        });
      }
    } catch (err) {
      console.error('[UserService] createOrUpdateUser error', err);
    }
  }

  /**
   * Увеличивает questionCount и обновляет lastInterActionAt
   * @param {number|string} telegramId
   */
  async incrementQuestionCount(telegramId) {
    try {
      const userRef = this._getUserRef(telegramId);
      const userSnap = await this._getUserSnap(telegramId);
      if (userSnap.exists()) {
        const currentCount = userSnap.data().questionCount || 0;
        await updateDoc(userRef, {
          questionCount: currentCount + 1,
          lastInterActionAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('[UserService] incrementQuestionCount error', err);
    }
  }
}
