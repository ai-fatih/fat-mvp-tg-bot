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
    if (!btns || !btns.length) return null;
    
    const keyboard = btns.map(row => {
    // Если строка → превращаем в один массив
    if (typeof row === "string") {
    return [{
    text: row,
    callback_data: row.replace(/\s+/g, '_').toLowerCase()
    }];
    }
    
    // Если массив → это строка с несколькими кнопками
    if (Array.isArray(row)) {
    return row.map(text => ({
    text,
    callback_data: text.replace(/\s+/g, '_').toLowerCase()
    }));
    }
    
    return [];
    });
    
    return { inline_keyboard: keyboard };
  } 