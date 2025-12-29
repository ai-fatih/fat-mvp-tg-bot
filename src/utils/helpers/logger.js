const isProd = process.env.NODE_ENV === 'production';
const isDebug = process.env.DEBUG === 'true' && !isProd;

export const logger = {
  debug: (...args) => {
    if (isDebug) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args) => {
    if (!isProd) {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  cleanup: (...args) => {
    if (!isProd) {
      console.log('[CLEANUP]', ...args);
    }
  },
};
