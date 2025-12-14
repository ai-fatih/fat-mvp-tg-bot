/**
 * Универсальный набор inline-клавиатур.
 * Чистые функции — только генерация JSON без логики бота.
 */
export const keyboards = {
    /** Стандартная пара “Подтвердить / Отмена” */
    confirmCancel: () => ({
        inline_keyboard: [
            [
                { text: '✅ Подтвердить', callback_data: 'confirm_question' },
                { text: '❌ Отмена', callback_data: 'cancel_question' }
            ]
        ]
    }),
};
 
  export function buildInlineKeyboard(btns) {
    if (!Array.isArray(btns) || !btns.length) return null;
  
    const keyboard = btns.map(row => {
      const buttons = Array.isArray(row) ? row : [row];
  
      return buttons.map(btn => {
        // 🔹 Новый формат
        if (typeof btn === 'object') {
          return {
            text: btn.text,
            callback_data: btn.action,
          };
        }
  
        // 🔸 Legacy-режим (временно)
        if (typeof btn === 'string') {
          return {
            text: btn,
            callback_data: btn
              .replace(/[^\w\s]/g, '')
              .replace(/\s+/g, '_')
              .toLowerCase(),
          };
        }
  
        return null;
      }).filter(Boolean);
    });
  
    return { inline_keyboard: keyboard };
  }