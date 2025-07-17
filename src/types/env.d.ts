declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_STORAGE_API_URL?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 