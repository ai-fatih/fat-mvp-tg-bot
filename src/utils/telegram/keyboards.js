export const keyboards = {
    questionsList: (options = {}) => {
        // options: { allowEdit: true, allowClear: true, allowSend: true }
        const keyboard = [];
        
        if (options.allowSend ?? true) {
            keyboard.push([{ text: 'Отправить менеджеру', callback_data: 'send_question' }]);
        }

        const row = [];
        if (options.allowEdit ?? true) {
            row.push({ text: 'Редактировать', callback_data: 'edits_question' });
        }
        if (options.allowClear ?? true) {
            row.push({ text: 'Очистить', callback_data: 'del_question' });
        }
        if (row.length) keyboard.push(row);

        return { inline_keyboard: keyboard };
    },

    singleButton: (text, callback_data) => ({
        inline_keyboard: [[{ text, callback_data }]]
    }),

    docsButton: (url) => ({
        inline_keyboard: [[{ text: 'Документация', url }]]
    }),

    confirmCancel: () => ({
        inline_keyboard: [
            [
                { text: '✅ Подтвердить', callback_data: 'confirm' },
                { text: '❌ Отмена', callback_data: 'cancel' }
            ]
        ]
    }),
};
