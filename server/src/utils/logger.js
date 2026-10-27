import env from '../config/env.js';

export const logger = {
  info: (...args) => {
    if (!env.isTest) {
      console.log(`[${new Date().toISOString()}] [INFO]`, ...args);
    }
  },
  warn: (...args) => {
    if (!env.isTest) {
      console.warn(`[${new Date().toISOString()}] [WARN]`, ...args);
    }
  },
  error: (...args) => {
    if (!env.isTest) {
      console.error(`[${new Date().toISOString()}] [ERROR]`, ...args);
    }
  }
};

export default logger;
