// Logger utility for production-ready logging
const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
  
  auth: (...args: any[]) => {
    if (isDevelopment) {
      console.log('🔧 [Auth]', ...args);
    }
  },
  
  subscription: (...args: any[]) => {
    if (isDevelopment) {
      console.log('💳 [Subscription]', ...args);
    }
  },
  
  profile: (...args: any[]) => {
    if (isDevelopment) {
      console.log('👤 [Profile]', ...args);
    }
  },
  
  match: (...args: any[]) => {
    if (isDevelopment) {
      console.log('❤️ [Match]', ...args);
    }
  }
};