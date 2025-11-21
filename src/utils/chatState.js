const chatState = new Map();

function getChatState(chatId) {
  if (!chatState.has(chatId)) {
    chatState.set(chatId, {
      questions: [],
      questionsMsgId: null,
      serviceMsgIds: [],  // Добавляем по умолчанию
      lastUserMessageId: null,
      lastBotMessageId: null,
      lastUserQuestion: null
    });
  }
  return chatState.get(chatId);
}

function setChatState(chatId, key, value) {
  const state = getChatState(chatId);
  state[key] = value;
}

export { chatState, getChatState, setChatState };
