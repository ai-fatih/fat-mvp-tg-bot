// src/bot/handlers/startHandler.js

import { state } from '../../utils/index.js';
import { uiService, chatService } from '../services/index.js';
import { questionFirebase } from '../../firebase/question.firebase.js';

const { chatState } = state;

/**
 * /start
 * Восстановление или инициализация чата
 * Firebase = источник истины
 */
export async function startHandler(bot, msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username || msg.from.first_name;
  const userMsgId = msg.message_id;

   
  try {
    /**
     * 1. Регистрируем сообщение /start как служебное
     */
    await uiService.registerMessage(chatId, userMsgId);

    await uiService.clearAll(bot, chatId);
 
    state.setMany(chatId, {
      chatId,
      username,
    }, true);
 
  } catch (err) {
    console.error('[START][ERROR]', {
      chatId,
      error: err,
    });
  }
}
