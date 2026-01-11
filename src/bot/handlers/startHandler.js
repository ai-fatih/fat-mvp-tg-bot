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

  console.log('[START][ENTER]', {
    chatId,
    userMsgId,
  });

  try {
    /**
     * 1. Регистрируем сообщение /start как служебное
     */
    await uiService.registerMessage(chatId, userMsgId);

    console.log('[START][AFTER_REGISTER_MESSAGE]', {
      chatId,
      userMsgId,
    });

    /**
     * 2. Чистим UI от мусора прошлой сессии
     */
    console.log('[START][BEFORE_CLEAR_UI]', {
      questionsMsgId: state.getState(chatId)?.questionsMsgId,
    });

    await uiService.clearAll(bot, chatId);

    console.log('[START][AFTER_CLEAR_UI]', {
      questionsMsgIdStillInState: state.getState(chatId)?.questionsMsgId,
    });

    /**
     * 3. Минимальная инициализация local state
     */
    state.setMany(chatId, {
      chatId,
      username,
    }, true);

    console.log('[START][AFTER_MIN_RUNTIME_INIT]', {
      runtimeState: state.getState(chatId),
    });

    /**
     * 4. Загружаем persisted state из Firebase
     */
    const { state: firebaseState } =
      await questionFirebase.initChat(chatId);

    console.log('[START][FIREBASE_LOADED]', {
      firebaseQuestionsMsgId: firebaseState.questionsMsgId,
      firebaseState,
    });

    /**
     * 5. Восстанавливаем состояние
     */
    state.setMany(chatId, {
      ...chatState._defaultState(chatId),
      ...firebaseState,
    }, true);

    console.log('[START][AFTER_MERGE]', {
      runtimeQuestionsMsgId: state.getState(chatId).questionsMsgId,
      fullRuntimeState: state.getState(chatId),
    });

    /**
     * 6. Приветственный экран (один раз)
      
    const currentState = state.getState(chatId);

     console.log('[START][HELLO_CHECK]', {
      helloShown: currentState.helloShown,
    });

    if (!currentState.helloShown) {
      await bot.sendPhoto(
        chatId,
        'src/images/hello.png',
        {
          caption: `${msg.from.first_name || ''} 👋 добро пожаловать!`,
        }
      );

      state.setState(chatId, 'helloShown', true);

      console.log('[START][HELLO_SENT]', {
        helloShownNow: state.getState(chatId).helloShown,
      });

      await questionFirebase.save(chatId, state.getState(chatId));
    }
 */
    /**
     * 7. Отрисовываем UI согласно status
     */
    console.log('[START][BEFORE_UPDATE_QUESTIONS_LIST]', {
      questionsMsgId: state.getState(chatId).questionsMsgId,
    });

    await chatService.updateQuestionsList(bot, chatId);

    console.log('[START][AFTER_UPDATE_QUESTIONS_LIST]', {
      questionsMsgId: state.getState(chatId).questionsMsgId,
    });

  } catch (err) {
    console.error('[START][ERROR]', {
      chatId,
      error: err,
    });
  }
}
