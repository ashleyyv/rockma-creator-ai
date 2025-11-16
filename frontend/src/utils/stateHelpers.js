/**
 * Utility hooks and helpers for managing loading and error states
 */

/**
 * Custom hook for managing async operations with loading and error states
 * Usage: const { loading, error, execute } = useAsyncOperation();
 */
export function useAsyncOperation() {
  // This is a pattern that components can follow
  // Since we're not using a state management library, each component will manage its own state
  // This file provides helper functions and patterns
  
  return {
    // Components should use useState for loading and error
    // This is just a reference pattern
  };
}

/**
 * Helper to copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Failed to copy text:', fallbackError);
      return false;
    }
  }
}

/**
 * Format error message for display
 * @param {Error|string} error - Error object or message
 * @returns {string} - Formatted error message
 */
export function formatErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

