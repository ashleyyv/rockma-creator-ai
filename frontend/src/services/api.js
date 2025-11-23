/**
 * API client for making requests to the backend
 */
import { API_ENDPOINTS } from '../utils/constants.js';
import { getAuthHeader, clearAccessCode } from '../utils/auth.js';

/**
 * Generic API request function with error handling and authentication
 * @param {string} url - The API endpoint URL
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} - Parsed JSON response
 */
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(), // Add authentication header to every request
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    // Handle 401/403 - invalid access code
    if (response.status === 401 || response.status === 403) {
      clearAccessCode(); // Clear invalid code
      window.location.reload(); // Force return to login
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'An error occurred',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.message || errorData.error || 'Request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw with more context if it's not already an Error
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`API request failed: ${error.message || error}`);
  }
}

/**
 * API service object with methods for each endpoint
 */
export const api = {
  /**
   * Test endpoint
   */
  async test() {
    return apiRequest(API_ENDPOINTS.TEST, { method: 'GET' });
  },

  /**
   * Health check endpoint
   */
  async healthCheck() {
    return apiRequest(API_ENDPOINTS.HEALTH, { method: 'GET' });
  },

  /**
   * Generate daily inspiration content
   * @param {string|null} selectedProduct - Optional product to generate ideas for (null for random)
   * @returns {Promise<{ideas: Array<{hook: string, script: string, hashtags: string}>, product: string}>}
   */
  async generateDailyInspiration(selectedProduct = null) {
    return apiRequest(API_ENDPOINTS.DAILY_INSPIRATION, {
      method: 'POST',
      body: JSON.stringify({ product: selectedProduct }),
    });
  },

  /**
   * Adapt competitor content for RockMa brand
   * @param {string} competitorText - The competitor's content to adapt
   * @returns {Promise<{adaptedText: string}>}
   */
  async adaptCompetitor(competitorText) {
    return apiRequest(API_ENDPOINTS.ADAPT_COMPETITOR, {
      method: 'POST',
      body: JSON.stringify({ competitorText }),
    });
  },

  /**
   * Translate content for specific platform and audience
   * @param {string} sourceText - The source content
   * @param {string} platform - Target platform (TikTok, Instagram, etc.)
   * @param {string} audience - Target audience (Core Moms 25-50, Gen-Z, etc.)
   * @returns {Promise<{translatedContent: string}>}
   */
  async translatePlatform(sourceText, platform, audience) {
    return apiRequest(API_ENDPOINTS.PLATFORM_TRANSLATOR, {
      method: 'POST',
      body: JSON.stringify({ sourceText, platform, audience }),
    });
  },
};

