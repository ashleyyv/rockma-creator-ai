/**
 * LocalStorage utilities for Dashboard persistence
 * Handles streak tracking, product spotlight, recent drafts, and first-visit detection
 */

const STORAGE_KEYS = {
  LAST_ACTIVE: 'rockma_lastActive',
  STREAK_COUNT: 'rockma_streakCount',
  PRODUCT_OF_DAY: 'rockma_productOfDay',
  PRODUCT_TIMESTAMP: 'rockma_productTimestamp',
  RECENT_DRAFTS: 'rockma_recentDrafts',
  FIRST_VISIT: 'rockma_firstVisit',
  FAVORITES: 'rockma_favorites',
  REMIX_QUEUE: 'rockma_remixQueue',
};

// Product inventory (matches backend)
const PRODUCT_INVENTORY = [
  'RockMa Better Body Butter - Vanilla Cream',
  'RockMa Better Body Butter - Choco Love',
  'RockMa Better Body Butter - Cherry Kiss',
  'RockMa Better Body Butter - Coco Beach',
  'RockMa Better Body Butter - Orange Crush',
  'RockMa Better Body Butter - Almondina',
  'RockMa Better Body Butter - Berry Patch',
  'RockMa Lips Organics - Fab 5 Flavor Boxes: Happy',
  'RockMa Lips Organics - Fab 5 Flavor Boxes: Dreamy',
  'RockMa Lips Organics - Fab 5 Flavor Boxes: Cozy',
  'RockMa Lips Organics - Fab 5 Flavor Boxes: Sunny',
  'RockMa Aesthetic Apparel',
  'RockMa Beautiful Accents',
];

/**
 * Get today's date as YYYY-MM-DD string
 */
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Calculate and update creation streak
 * Returns the current streak count
 */
export function calculateStreak() {
  const today = getTodayString();
  const lastActive = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
  let streakCount = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_COUNT) || '0', 10);

  if (!lastActive) {
    // First time using the app
    streakCount = 1;
  } else if (lastActive === today) {
    // Already checked in today, keep current streak
    return streakCount;
  } else {
    // Calculate days difference
    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day, increment streak
      streakCount += 1;
    } else {
      // Streak broken, reset to 1
      streakCount = 1;
    }
  }

  // Update localStorage
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, today);
  localStorage.setItem(STORAGE_KEYS.STREAK_COUNT, streakCount.toString());

  return streakCount;
}

/**
 * Get the current streak without updating it
 */
export function getStreak() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.STREAK_COUNT) || '0', 10);
}

/**
 * Get product of the day (cached for 24 hours)
 * Returns a random product that changes every 24 hours
 */
export function getProductOfDay() {
  const today = getTodayString();
  const storedProduct = localStorage.getItem(STORAGE_KEYS.PRODUCT_OF_DAY);
  const storedTimestamp = localStorage.getItem(STORAGE_KEYS.PRODUCT_TIMESTAMP);

  // Check if we have a cached product for today
  if (storedProduct && storedTimestamp === today) {
    return storedProduct;
  }

  // Generate new product for today
  const randomIndex = Math.floor(Math.random() * PRODUCT_INVENTORY.length);
  const newProduct = PRODUCT_INVENTORY[randomIndex];

  // Cache it
  localStorage.setItem(STORAGE_KEYS.PRODUCT_OF_DAY, newProduct);
  localStorage.setItem(STORAGE_KEYS.PRODUCT_TIMESTAMP, today);

  return newProduct;
}

/**
 * Save a recent draft
 * @param {string} type - Type of content: 'Daily Idea', 'Adaptation', or 'Translation'
 * @param {string} content - The full content text
 * @param {object} metadata - Optional metadata (platform, audience, etc.)
 */
export function saveRecentDraft(type, content, metadata = {}) {
  try {
    // Get existing drafts
    const draftsJson = localStorage.getItem(STORAGE_KEYS.RECENT_DRAFTS);
    let drafts = draftsJson ? JSON.parse(draftsJson) : [];

    // Create new draft object
    const newDraft = {
      id: Date.now().toString(),
      type,
      content,
      metadata,
      timestamp: new Date().toISOString(),
      snippet: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
    };

    // Add to beginning of array
    drafts.unshift(newDraft);

    // Keep only last 3
    drafts = drafts.slice(0, 3);

    // Save back to localStorage
    localStorage.setItem(STORAGE_KEYS.RECENT_DRAFTS, JSON.stringify(drafts));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

/**
 * Get recent drafts (last 3)
 * Returns array of draft objects
 */
export function getRecentDrafts() {
  try {
    const draftsJson = localStorage.getItem(STORAGE_KEYS.RECENT_DRAFTS);
    return draftsJson ? JSON.parse(draftsJson) : [];
  } catch (error) {
    console.error('Error getting drafts:', error);
    return [];
  }
}

/**
 * Check if this is the user's first visit
 */
export function isFirstVisit() {
  const hasVisited = localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
  return hasVisited !== 'true';
}

/**
 * Mark that the user has visited
 */
export function markVisited() {
  localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
}

/**
 * Clear all dashboard data (for testing/reset)
 */
export function clearDashboardData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * Save a favorite (starred content)
 * @param {string} content - The content text
 * @param {string} type - Type: 'Daily Idea', 'Adaptation', or 'Translation'
 * @param {object} metadata - Optional metadata (platform, audience, etc.)
 */
export function saveFavorite(content, type, metadata = {}) {
  try {
    const favsJson = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    let favorites = favsJson ? JSON.parse(favsJson) : [];

    const newFav = {
      id: Date.now().toString(),
      content,
      type,
      metadata,
      timestamp: new Date().toISOString(),
      snippet: content.substring(0, 60) + (content.length > 60 ? '...' : ''),
    };

    favorites.unshift(newFav);
    favorites = favorites.slice(0, 20); // Keep last 20

    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error saving favorite:', error);
    return false;
  }
}

/**
 * Get all favorites
 */
export function getFavorites() {
  try {
    const favsJson = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favsJson ? JSON.parse(favsJson) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}

/**
 * Delete a favorite by ID
 */
export function deleteFavorite(id) {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => fav.id !== id);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return false;
  }
}

/**
 * Check if content is already favorited
 */
export function isFavorited(content) {
  const favorites = getFavorites();
  return favorites.some(fav => fav.content === content);
}

// ========================================
// REMIX QUEUE (IDEA CLIPPER) FUNCTIONS
// ========================================

/**
 * Save an idea clip to the Remix Queue
 * @param {string} text - The captured content text (required)
 * @param {string} url - Optional source URL for reference
 * @param {string} intent - Transformation intent tag (required)
 * @param {string} notes - Optional user notes
 * @returns {boolean} Success status
 */
export function saveIdeaClip(text, url = '', intent = 'general_rewrite', notes = '') {
  try {
    const queueJson = localStorage.getItem(STORAGE_KEYS.REMIX_QUEUE);
    let queue = queueJson ? JSON.parse(queueJson) : [];

    const newClip = {
      id: Date.now().toString(),
      text: text.trim(),
      url: url.trim(),
      intent,
      notes: notes.trim(),
      timestamp: new Date().toISOString(),
      snippet: text.substring(0, 60) + (text.length > 60 ? '...' : ''),
    };

    // Add to beginning of array
    queue.unshift(newClip);

    // Keep only last 50 ideas
    queue = queue.slice(0, 50);

    localStorage.setItem(STORAGE_KEYS.REMIX_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Error saving idea clip:', error);
    return false;
  }
}

/**
 * Get all idea clips from the Remix Queue
 * @returns {Array} Array of idea clip objects
 */
export function getRemixQueue() {
  try {
    const queueJson = localStorage.getItem(STORAGE_KEYS.REMIX_QUEUE);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting remix queue:', error);
    return [];
  }
}

/**
 * Get a specific idea clip by ID
 * @param {string} id - The clip ID
 * @returns {object|null} The clip object or null if not found
 */
export function getIdeaClipById(id) {
  try {
    const queue = getRemixQueue();
    return queue.find(clip => clip.id === id) || null;
  } catch (error) {
    console.error('Error getting idea clip by ID:', error);
    return null;
  }
}

/**
 * Delete a single idea clip from the Remix Queue
 * @param {string} id - The clip ID to delete
 * @returns {boolean} Success status
 */
export function deleteIdeaClip(id) {
  try {
    const queue = getRemixQueue();
    const filtered = queue.filter(clip => clip.id !== id);
    localStorage.setItem(STORAGE_KEYS.REMIX_QUEUE, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting idea clip:', error);
    return false;
  }
}

/**
 * Clear all idea clips from the Remix Queue
 * @returns {boolean} Success status
 */
export function clearRemixQueue() {
  try {
    localStorage.removeItem(STORAGE_KEYS.REMIX_QUEUE);
    return true;
  } catch (error) {
    console.error('Error clearing remix queue:', error);
    return false;
  }
}

