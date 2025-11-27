import { UserService } from "./UserService.js";
import { MessageService } from "./MessageService.js";

/**
 * FirebaseService
 * -----------------------------
 * Фасад для доступа к UserService и MessageService.
 * Используется в проекте как единая точка для работы с базой.
 */
export class FirebaseService {
  constructor(db) {
    this.userService = new UserService(db);
    this.messageService = new MessageService(db);
  }
}

// Экземпляр для использования в проекте
import { db } from "../firebase.js";
export const firebaseService = new FirebaseService(db);
