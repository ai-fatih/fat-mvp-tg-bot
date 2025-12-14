// src/bot/services/ui.service.js

import { state, helpers, telegram } from "../../utils/index.js";
const { logger } = helpers;
const { safeSend, safeDelete } = telegram;

export class UIService {


  /**
   * Регистрирует message_id как служебное
   */
  async registerMessage(chatId, msgId) {
    const ids = state.getServiceMessages(chatId);

    if (!ids.includes(msgId)) {
      state.setMany(chatId, {
        serviceMsgId: [...ids, msgId],
      });

      logger.debug(
        `[UI] register serviceMsgId=${msgId} (chatId=${chatId})`
      );
    }
  }

  /**
   * Отправка временного (служебного) сообщения
   * — автоматически регистрируется
   */
  async sendTempMessage(bot, chatId, text, options = {}) {
    const msg = await safeSend(bot, chatId, text, options);

    /* if (msg?.message_id) {
      await this.registerMessage(chatId, msg.message_id);
    } */

    return msg;
  }

  /**
   * Очистка ВСЕХ служебных сообщений
   */
  async clearAll(bot, chatId) {
    const { serviceMsgId = [], questionsMsgId } = state.getState(chatId);
  
    if (!serviceMsgId.length) return;
  
    logger.debug('[UI] clearAll', {
      chatId,
      count: serviceMsgId.length,
      protected: questionsMsgId,
    });
  
    for (const id of serviceMsgId) {
      if (id === questionsMsgId) continue; // ⛔ защита главного UI
      await safeDelete(bot, chatId, id);
    }
  
    state.setMany(chatId, { serviceMsgId: [] });
  }
  

  /**
   * Удаляет последнее служебное сообщение (LIFO)
   */
  async clearLast(bot, chatId) {
    const ids = state.getServiceMessages(chatId);
    if (!ids.length) return;

    const lastId = ids[ids.length - 1];

    await safeDelete(bot, chatId, lastId);

    state.setMany(chatId, {
      serviceMsgId: ids.slice(0, -1),
    });

    logger.debug(
      `[UI] clearLast id=${lastId} (chatId=${chatId})`
    );
  }

  /**
   * UX-toast:
   * отправляет сообщение и удаляет через timeout
   */
  async toast(bot, chatId, text, timeout = 1500) {
    const msg = await this.sendTempMessage(bot, chatId, text);
    if (!msg?.message_id) return;

    /* setTimeout(async () => {
      await this.clearLast(bot, chatId);
    }, timeout); */
  }

  /**
   * Перерисовка главного экрана
   * (точка расширения UI)
   */
  async refreshScreen(refreshFn, bot, chatId) {
    try {
      await refreshFn(bot, chatId);
    } catch (e) {
      logger.error(
        `[UI] refreshScreen failed (chatId=${chatId}): ${e.message}`
      );
    }
  }
}

// ✅ singleton
export const uiService = new UIService();
