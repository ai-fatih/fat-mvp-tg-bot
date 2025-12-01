/**
 * Универсальный набор inline-клавиатур.
 * Чистые функции — только генерация JSON без логики бота.
 */
export const keyboards = {

    /**
     * Клавиатура для списка вопросов
     * options: { allowEdit: boolean, allowClear: boolean, allowSend: boolean }
     */
    questionsList: (options = {}) => {
        const {
            allowSend = true,
            allowEdit = true,
            allowClear = true
        } = options;

        const keyboard = [];

        if (allowSend) {
            keyboard.push([
                { text: 'Отправить менеджеру', callback_data: 'send_question' }
            ]);
        }

        const row = [];
        if (allowEdit) row.push({ text: 'Редактировать', callback_data: 'edits_question' });
        if (allowClear) row.push({ text: 'Очистить', callback_data: 'del_question' });

        if (row.length > 0) keyboard.push(row);

        return { inline_keyboard: keyboard };
    },

    /** Кнопка с одним callback */
    singleButton: (text, callback_data) => ({
        inline_keyboard: [[{ text, callback_data }]]
    }),

    /** Кнопка-ссылка (без callback) */
    docsButton: (url) => ({
        inline_keyboard: [[{ text: 'Документация', url }]]
    }),

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
