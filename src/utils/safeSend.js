import { chatState, setChatState } from './chatState.js';

export async function safeSend(bot, chatId, text, options = {}) {
    const retries = 3;
    let sentMessage = null;

    for (let i = 0; i < retries; i++) {
      try {
        sentMessage = await bot.sendMessage(chatId, text, {
          ...options,
          parse_mode: 'HTML'  // Для жирного текста в подтверждении
        });
        
        console.log(`[SEND] message_id=${sentMessage.message_id}`);
        console.log('Всё хранилище:', chatState);

        // Запоминаем ID в зависимости от типа сообщения
        if (text.includes('Привет,') && text.includes('Я ассистент по StoreHouse Pro')) {
          // Это приветственное сообщение
          setChatState(chatId, 'welcomeMessageId', sentMessage.message_id);
        } else {
          // Это обычный ответ бота
          setChatState(chatId, 'lastBotMessageId', sentMessage.message_id);
        }
        console.log(chatState.get(chatId));
        return sentMessage;
      } catch (err) {
        console.error(`[SEND] попытка ${i+1} ошибка:`, err.code || err.message);
        if (i === retries - 1) throw err;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }