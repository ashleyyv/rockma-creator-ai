/**
 * Authentication utilities for access code management
 */

const STORAGE_KEY = 'rockma_access_code';
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Get stored access code from localStorage
 */
export function getStoredAccessCode() {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Store access code in localStorage
 */
export function storeAccessCode(code) {
  localStorage.setItem(STORAGE_KEY, code);
}

/**
 * Remove access code from localStorage
 */
export function clearAccessCode() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if user is authenticated (has valid code stored)
 */
export function isAuthenticated() {
  return !!getStoredAccessCode();
}

/**
 * Validate access code with backend
 * @param {string} code - Access code to validate
 * @returns {Promise<boolean>} - True if valid, false otherwise
 */
export async function validateAccessCode(code) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${code}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.success === true;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating access code:', error);
    return false;
  }
}

/**
 * Get Authorization header for API requests
 */
export function getAuthHeader() {
  const code = getStoredAccessCode();
  return code ? { 'Authorization': `Bearer ${code}` } : {};
}

