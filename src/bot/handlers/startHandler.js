// src/bot/handlers/startHandler.js

import { state } from '../../utils/index.js';
import { uiService, chatService } from '../services/index.js';
import { questionFirebase } from '../../firebase/question.firebase.js';

/**
 * /start
 * Инициализация чата и отрисовка стартового экрана
 */
export async function startHandler(bot, msg) {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    console.log(msg.from)
    const userMsgId = msg.message_id;

    try {

    // 1. Регистрируем /start как служебное (если нужно)
       await uiService.registerMessage(chatId, userMsgId);
 
       // 2. Чистим мусор от прошлых сессий
       await uiService.clearAll(bot, chatId);

       // 3. Инициализируем состояние
       state.setMany(chatId, {
           chatId,
           username,
       }); 
            // 👉 4. приветственная картинка (один раз)
    await bot.sendPhoto(
        chatId,
        'src/images/hello.png',
        { caption: `${msg.from.first_name} ${msg.from.last_name}👋 добро пожаловать!` }
      );
        // 4. Инициализация чата в Firebase
            let questions = [];
            try {
            questions = await questionFirebase.initChat(chatId);
            } catch (err) {
            console.error('[START] Firebase init failed', err);
            }
        // 5. Кладём вопросы в state
        state.setState(chatId, 'questions', Array.isArray(questions) ? questions : []);
        state.setState(chatId, 'status', Array.isArray(questions) ? 'COLLECTING' : 'EMPTY');


       // 4. Рисуем стартовый экран
       await chatService.updateQuestionsList(bot, chatId);

    } catch (err) {
        console.error('[START] Ошибка:', err);
    }
}
