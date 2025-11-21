// src/handlers/commandHandler.js
import { safeSend } from '../utils/safeSend.js';

export async function commandHandler(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/help') {
    try { 
      await safeSend(bot, chatId, 'Пишите свои вопросы в свободной форме!\nПомощь: @vladislav_fatikhov');
    } catch (err) {
      console.error('[HELP] Ошибка:', err);
      await safeSend(bot, chatId, 'Не удалось.');
    }
  }
}
