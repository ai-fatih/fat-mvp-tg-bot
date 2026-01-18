// src/bot/handlers/messageHandler.js

import { uiService, questionService, messageService } from '../services/index.js';
import { getAIAnswer } from '../../ai/ai.service.js'


export async function messageHandler(bot, msg) {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Игнорируем команды и пустые сообщения
  if (!text || text.startsWith('/')) return;

  
  try {  
    const aiReply = await getAIAnswer(text); 
    console.log('ai:', aiReply)
    await bot.sendMessage(chatId, aiReply || 'AI не ответил');
    

  } catch (err) {
    console.error('[MESSAGE_HANDLER] Ошибка:', err);

    // Фолбэк для пользователя
    await uiService.toast(
      bot,
      chatId,
      'Произошла ошибка при обработке сообщения.'
    );
  }
}
