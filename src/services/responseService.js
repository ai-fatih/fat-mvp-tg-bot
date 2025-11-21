import { config } from '../config.js';

export function generateResponse(text) {
  const lower = text.toLowerCase();
  let quickReply = "Вопрос зарегистрирован. Совет уточняется.";

  if (lower.includes("списание")) quickReply = "Перед списанием убедитесь, что приходная накладная проведена.";
  else if (lower.includes("накладная")) quickReply = "Проверьте корректность данных в приходной накладной.";
  else if (lower.includes("отчет")) quickReply = "Отчеты формируются через раздел 'Отчеты' в StoreHouse Pro.";

  const buttons = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Документация", url: config.DOCS_URL }], 
        [{ text: "Новый вопрос", callback_data: "new_question" }]
      ],
    },
  };

  return { text: quickReply, buttons };
}