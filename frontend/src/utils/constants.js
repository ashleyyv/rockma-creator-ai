/**
 * API endpoint constants
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  TEST: `${API_BASE_URL}/api/test`,
  HEALTH: `${API_BASE_URL}/api/health`,
  DAILY_INSPIRATION: `${API_BASE_URL}/api/daily-inspiration/generate`,
  ADAPT_COMPETITOR: `${API_BASE_URL}/api/adapt-competitor/rewrite`,
  PLATFORM_TRANSLATOR: `${API_BASE_URL}/api/platform-translator/translate`,
};

