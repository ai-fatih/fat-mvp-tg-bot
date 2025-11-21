const chatState = new Map();

function getChatState(chatId) {
  if (!chatState.has(chatId)) {
    chatState.set(chatId, {
      chat_id: null,
      questions: [],
      questionsMsgId: null,
      serviceMsgIds: [],  
      lastUserMessageId: null,
      lastBotMessageId: null,
      lastUserQuestion: null,
      welcomeMsg: null,
      welcomeMsgId: null,
      questionsMsg: null,
      questionsMsgId: null,
      temp_question: null
    });
  }
  return chatState.get(chatId);
}

function setChatState(chatId, key, value) {
  const state = getChatState(chatId);
  state[key] = value;
}

export { chatState, getChatState, setChatState };
