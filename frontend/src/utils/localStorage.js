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
  COMPETITOR_CLIPS: 'rockma_competitorClips',
  FAVORITES: 'rockma_favorites',
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
 * Save a competitor clip
 * @param {string} text - The competitor content/link
 */
export function saveCompetitorClip(text) {
  try {
    const clipsJson = localStorage.getItem(STORAGE_KEYS.COMPETITOR_CLIPS);
    let clips = clipsJson ? JSON.parse(clipsJson) : [];

    const newClip = {
      id: Date.now().toString(),
      text,
      timestamp: new Date().toISOString(),
      snippet: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
    };

    clips.unshift(newClip);
    clips = clips.slice(0, 10); // Keep last 10

    localStorage.setItem(STORAGE_KEYS.COMPETITOR_CLIPS, JSON.stringify(clips));
    return true;
  } catch (error) {
    console.error('Error saving competitor clip:', error);
    return false;
  }
}

/**
 * Get all competitor clips
 */
export function getCompetitorClips() {
  try {
    const clipsJson = localStorage.getItem(STORAGE_KEYS.COMPETITOR_CLIPS);
    return clipsJson ? JSON.parse(clipsJson) : [];
  } catch (error) {
    console.error('Error getting competitor clips:', error);
    return [];
  }
}

/**
 * Delete a competitor clip by ID
 */
export function deleteCompetitorClip(id) {
  try {
    const clips = getCompetitorClips();
    const filtered = clips.filter(clip => clip.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPETITOR_CLIPS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting competitor clip:', error);
    return false;
  }
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

