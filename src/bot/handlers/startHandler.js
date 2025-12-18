// src/bot/handlers/startHandler.js

import { state } from '../../utils/index.js';
import { uiService, chatService } from '../services/index.js';
import { questionFirebase } from '../../firebase/question.firebase.js';
const { chatState } = state

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
     * Нужно, чтобы не удалить его при clearAll
     */
    await uiService.registerMessage(chatId, userMsgId);

    /**
     * 2. Чистим UI от мусора прошлой сессии
     * (сообщения бота, кнопки и т.д.)
     */
    await uiService.clearAll(bot, chatId);

    /**
     * 3. Минимальная инициализация local state
     * ВАЖНО: делаем это ДО Firebase
     * чтобы state существовал даже при ошибке БД
     */
    state.setMany(chatId, {
      chatId,
      username,
    });

    /**
     * 4. Загружаем persisted state из Firebase
     * или создаём дефолтный
     */
    const { state: firebaseState } =
      await questionFirebase.initChat(chatId);

    /**
     * 5. Восстанавливаем состояние
     * defaultState → firebaseState
     * (firebase имеет приоритет)
     */
    state.setMany(chatId, {
      ...chatState._defaultState(chatId),
      ...firebaseState,
    });

    /**
     * 6. Приветственный экран (один раз)
     * Используем persisted-флаг
     */
    const currentState = state.getState(chatId);

    if (!currentState.helloShown) {
      await bot.sendPhoto(
        chatId,
        'src/images/hello.png',
        {
          caption: `${msg.from.first_name || ''} 👋 добро пожаловать!`,
        }
      );

      state.setState(chatId, 'helloShown', true);

      // фиксируем в Firebase
      await questionFirebase.save(chatId, state.getState(chatId));
    }

    /**
     * 7. Отрисовываем UI согласно status
     * НИКАКИХ вычислений из questions.length
     */
    await chatService.updateQuestionsList(bot, chatId);

  } catch (err) {
    console.error('[START] Ошибка:', err);
  }
}
