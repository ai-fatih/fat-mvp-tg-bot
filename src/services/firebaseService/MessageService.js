import { collection, doc, addDoc, getDocs, query, where, updateDoc } from "firebase/firestore";

/**
 * MessageService
 * -----------------------------
 * Методы для работы с сообщениями пользователей.
 */
export class MessageService {
  constructor(db) {
    this.db = db;
  }

  // Ссылка на коллекцию сообщений
  _getMessagesCollection() {
    return collection(this.db, "messages");
  }

  // Форматирует документ Firestore в объект для бота
  _formatMessage(docSnap) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      text: data.text,
      status: data.status,
      createdAt: data.createdAt?.toDate?.() || null,
    };
  }

  /**
   * Сохраняет сообщение пользователя
   * @param {number|string} telegramId
   * @param {string} text
   */
  async saveUserMessage({ telegramId, text }) {
    try {
      const messagesRef = this._getMessagesCollection();
      await addDoc(messagesRef, {
        telegramId,
        text,
        createdAt: new Date(),
        status: "new",
        isEscalated: false,
      });
    } catch (err) {
      console.error('[MessageService] saveUserMessage error', err);
    }
  }

  /**
   * Получает все сообщения пользователя
   * @param {number|string} telegramId
   * @returns {Array} [{ id, text, status, createdAt }]
   */
  async getUserMessages(telegramId) {
    try {
      const messagesRef = this._getMessagesCollection();
      const q = query(messagesRef, where("telegramId", "==", telegramId));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(docSnap => this._formatMessage(docSnap));
    } catch (err) {
      console.error('[MessageService] getUserMessages error', err);
      return [];
    }
  }

  /**
   * Обновляет статус конкретного сообщения
   * @param {string} messageId
   * @param {string} status
   */
  async updateMessageStatus(messageId, status) {
    try {
      const messageRef = doc(this.db, "messages", messageId);
      await updateDoc(messageRef, { status });
    } catch (err) {
      console.error('[MessageService] updateMessageStatus error', err);
    }
  }
}
