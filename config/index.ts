// Configuración del entorno
const ENV = {
  dev: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'ws://localhost:3000',
    ENVIRONMENT: 'development',
  },
  staging: {
    API_URL: 'https://staging-api.goplan.com',
    SOCKET_URL: 'wss://staging-api.goplan.com',
    ENVIRONMENT: 'staging',
  },
  prod: {
    API_URL: 'https://api.goplan.com',
    SOCKET_URL: 'wss://api.goplan.com',
    ENVIRONMENT: 'production',
  },
};

// Por defecto, usar configuración de desarrollo
const currentEnv = ENV.dev;

export const API_URL = currentEnv.API_URL;
export const SOCKET_URL = currentEnv.SOCKET_URL;
export const ENVIRONMENT = currentEnv.ENVIRONMENT;

// Configuración de la aplicación
export const APP_CONFIG = {
  // Timeouts
  SOCKET_TIMEOUT: 10000, // 10 segundos
  API_TIMEOUT: 30000, // 30 segundos
  CACHE_TTL: 3600, // 1 hora en segundos

  // Límites
  MAX_MESSAGE_LENGTH: 500,
  MAX_PARTICIPANTS: 20,
  MAX_PLANS_PER_USER: 10,

  // Notificaciones
  NOTIFICATION_TYPES: {
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    PLAN_UPDATE: 'PLAN_UPDATE',
    PLAN_REMINDER: 'PLAN_REMINDER',
    NEW_MATCH: 'NEW_MATCH',
  },

  // Intervalos
  CHAT_POLLING_INTERVAL: 3000, // 3 segundos (fallback si websocket falla)
  LOCATION_UPDATE_INTERVAL: 300000, // 5 minutos

  // Almacenamiento
  STORAGE_KEYS: {
    USER_DATA: 'user_data',
    AUTH_TOKEN: 'auth_token',
    APP_SETTINGS: 'app_settings',
    CACHED_PLANS: 'cached_plans',
    CHAT_MESSAGES: 'chat_messages',
  },

  // Validación
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
  },
};

// Configuración de la interfaz de usuario
export const UI_CONFIG = {
  // Colores principales
  COLORS: {
    PRIMARY: '#FF6B6B',
    SECONDARY: '#4CAF50',
    BACKGROUND: '#FFFFFF',
    TEXT: '#333333',
    GRAY: '#666666',
    LIGHT_GRAY: '#EEEEEE',
    ERROR: '#F44336',
    WARNING: '#FFC107',
    SUCCESS: '#4CAF50',
  },

  // Animaciones
  ANIMATIONS: {
    DURATION: 300, // milisegundos
    SPRING_CONFIG: {
      tension: 40,
      friction: 7,
    },
  },

  // Dimensiones
  DIMENSIONS: {
    HEADER_HEIGHT: 60,
    TAB_BAR_HEIGHT: 50,
    CARD_BORDER_RADIUS: 10,
    INPUT_HEIGHT: 50,
    BUTTON_HEIGHT: 48,
  },

  // Espaciado
  SPACING: {
    TINY: 4,
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    XLARGE: 32,
  },

  // Tipografía
  TYPOGRAPHY: {
    SIZES: {
      TINY: 12,
      SMALL: 14,
      MEDIUM: 16,
      LARGE: 18,
      XLARGE: 24,
      TITLE: 32,
    },
    WEIGHTS: {
      REGULAR: '400',
      MEDIUM: '500',
      BOLD: '700',
    },
  },
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  ENABLE_LOGS: true,
  MOCK_LOCATION: false,
  DISABLE_ANIMATIONS: false,
  FORCE_ERROR_STATE: false,
};
