import { setState } from './index.js';
export function setChatStatus(chatId, newStatus) {
  setState(chatId, 'status', newStatus);
  return newStatus;
}
