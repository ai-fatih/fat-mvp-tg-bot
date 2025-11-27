// /utils/index.js

// ---------------------------
// Состояния
// ---------------------------
export * as state from './state/index.js';  // chatState.js + stateHelpers.js

// ---------------------------
// Telegram-утилиты
// ---------------------------
export * as telegram from './telegram/index.js'; 
// включает safeSend.js, clearServiceMessages.js, formatMessage.js

// ---------------------------
// Общие хелперы
// ---------------------------
export * as helpers from './helpers/index.js'; 
// включает logger.js, timer.js, arrayUtils.js, textUtils.js
