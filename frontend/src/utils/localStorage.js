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
  ANALYTICS_LEDGER: 'rockma_analytics_ledger',
  DAILY_INSPIRATION_SESSION: 'rockma_dailyInspiration_session',
  TRANSFORM_SESSION: 'rockma_transform_session',
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
      posted: false,
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
    const drafts = draftsJson ? JSON.parse(draftsJson) : [];
    // Ensure posted property exists (for backward compatibility)
    return drafts.map(draft => ({
      ...draft,
      posted: draft.posted !== undefined ? draft.posted : false,
      postedTimestamp: draft.postedTimestamp || null
    }));
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
      posted: false,
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
    const favorites = favsJson ? JSON.parse(favsJson) : [];
    // Ensure posted property exists (for backward compatibility)
    return favorites.map(fav => ({
      ...fav,
      posted: fav.posted !== undefined ? fav.posted : false,
      postedTimestamp: fav.postedTimestamp || null
    }));
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

/**
 * Get favorite ID by content (for deletion)
 * @param {string} content - The content text to find
 * @returns {string|null} The favorite ID or null if not found
 */
export function getFavoriteIdByContent(content) {
  const favorites = getFavorites();
  const favorite = favorites.find(fav => fav.content === content);
  return favorite ? favorite.id : null;
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
      posted: false,
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
    const queue = queueJson ? JSON.parse(queueJson) : [];
    // Ensure posted property exists (for backward compatibility)
    return queue.map(clip => ({
      ...clip,
      posted: clip.posted !== undefined ? clip.posted : false,
      postedTimestamp: clip.postedTimestamp || null
    }));
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

// ========================================
// CONTENT UPDATE & POSTED STATUS FUNCTIONS
// ========================================

/**
 * Update content for a specific draft
 * @param {string} id - Draft ID
 * @param {string} newContent - New content text
 * @returns {boolean} Success status
 */
export function updateDraftContent(id, newContent) {
  try {
    const drafts = getRecentDrafts();
    const draftIndex = drafts.findIndex(d => d.id === id);
    if (draftIndex === -1) return false;
    
    drafts[draftIndex].content = newContent;
    drafts[draftIndex].snippet = newContent.substring(0, 50) + (newContent.length > 50 ? '...' : '');
    localStorage.setItem(STORAGE_KEYS.RECENT_DRAFTS, JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.error('Error updating draft content:', error);
    return false;
  }
}

/**
 * Update content for a specific favorite
 * @param {string} id - Favorite ID
 * @param {string} newContent - New content text
 * @returns {boolean} Success status
 */
export function updateFavoriteContent(id, newContent) {
  try {
    const favorites = getFavorites();
    const favIndex = favorites.findIndex(f => f.id === id);
    if (favIndex === -1) return false;
    
    favorites[favIndex].content = newContent;
    favorites[favIndex].snippet = newContent.substring(0, 60) + (newContent.length > 60 ? '...' : '');
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error updating favorite content:', error);
    return false;
  }
}

/**
 * Update content for a specific idea clip
 * @param {string} id - Clip ID
 * @param {string} newContent - New content text
 * @returns {boolean} Success status
 */
export function updateIdeaClipContent(id, newContent) {
  try {
    const queue = getRemixQueue();
    const clipIndex = queue.findIndex(c => c.id === id);
    if (clipIndex === -1) return false;
    
    queue[clipIndex].text = newContent.trim();
    queue[clipIndex].snippet = newContent.substring(0, 60) + (newContent.length > 60 ? '...' : '');
    localStorage.setItem(STORAGE_KEYS.REMIX_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Error updating idea clip content:', error);
    return false;
  }
}

/**
 * Mark draft as posted or unposted
 * @param {string} id - Draft ID
 * @param {boolean} posted - Posted status
 * @returns {boolean} Success status
 */
export function markDraftAsPosted(id, posted) {
  try {
    const drafts = getRecentDrafts();
    const draftIndex = drafts.findIndex(d => d.id === id);
    if (draftIndex === -1) return false;
    
    drafts[draftIndex].posted = posted;
    drafts[draftIndex].postedTimestamp = posted ? new Date().toISOString() : null;
    localStorage.setItem(STORAGE_KEYS.RECENT_DRAFTS, JSON.stringify(drafts));
    return true;
  } catch (error) {
    console.error('Error marking draft as posted:', error);
    return false;
  }
}

/**
 * Mark favorite as posted or unposted
 * @param {string} id - Favorite ID
 * @param {boolean} posted - Posted status
 * @returns {boolean} Success status
 */
export function markFavoriteAsPosted(id, posted) {
  try {
    const favorites = getFavorites();
    const favIndex = favorites.findIndex(f => f.id === id);
    if (favIndex === -1) return false;
    
    favorites[favIndex].posted = posted;
    favorites[favIndex].postedTimestamp = posted ? new Date().toISOString() : null;
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error marking favorite as posted:', error);
    return false;
  }
}

/**
 * Mark idea clip as posted or unposted
 * @param {string} id - Clip ID
 * @param {boolean} posted - Posted status
 * @returns {boolean} Success status
 */
export function markIdeaClipAsPosted(id, posted) {
  try {
    const queue = getRemixQueue();
    const clipIndex = queue.findIndex(c => c.id === id);
    if (clipIndex === -1) return false;
    
    queue[clipIndex].posted = posted;
    queue[clipIndex].postedTimestamp = posted ? new Date().toISOString() : null;
    localStorage.setItem(STORAGE_KEYS.REMIX_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    console.error('Error marking idea clip as posted:', error);
    return false;
  }
}

/**
 * Bulk delete multiple drafts by ID array
 * @param {Array<string>} ids - Array of draft IDs to delete
 * @returns {boolean} Success status
 */
export function bulkDeleteDrafts(ids) {
  try {
    const drafts = getRecentDrafts();
    const filtered = drafts.filter(d => !ids.includes(d.id));
    localStorage.setItem(STORAGE_KEYS.RECENT_DRAFTS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error bulk deleting drafts:', error);
    return false;
  }
}

/**
 * Bulk delete multiple favorites by ID array
 * @param {Array<string>} ids - Array of favorite IDs to delete
 * @returns {boolean} Success status
 */
export function bulkDeleteFavorites(ids) {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => !ids.includes(f.id));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error bulk deleting favorites:', error);
    return false;
  }
}

/**
 * Bulk delete multiple idea clips by ID array
 * @param {Array<string>} ids - Array of clip IDs to delete
 * @returns {boolean} Success status
 */
export function bulkDeleteIdeaClips(ids) {
  try {
    const queue = getRemixQueue();
    const filtered = queue.filter(c => !ids.includes(c.id));
    localStorage.setItem(STORAGE_KEYS.REMIX_QUEUE, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error bulk deleting idea clips:', error);
    return false;
  }
}

// ========================================
// SESSION STATE PERSISTENCE FUNCTIONS
// ========================================

/**
 * Save Daily Inspiration session state
 * @param {Array} ideas - Array of generated ideas
 * @param {string|null} product - Featured product name
 * @param {string} selectedProduct - Selected product from dropdown
 * @returns {boolean} Success status
 */
export function saveDailyInspirationSession(ideas, product, selectedProduct) {
  try {
    const sessionData = {
      ideas: ideas || [],
      product: product || null,
      selectedProduct: selectedProduct || '',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.DAILY_INSPIRATION_SESSION, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('Error saving Daily Inspiration session:', error);
    return false;
  }
}

/**
 * Get Daily Inspiration session state
 * @returns {Object|null} Session data or null if not found
 */
export function getDailyInspirationSession() {
  try {
    const sessionJson = localStorage.getItem(STORAGE_KEYS.DAILY_INSPIRATION_SESSION);
    if (!sessionJson) return null;
    return JSON.parse(sessionJson);
  } catch (error) {
    console.error('Error getting Daily Inspiration session:', error);
    return null;
  }
}

/**
 * Clear Daily Inspiration session state
 * @returns {boolean} Success status
 */
export function clearDailyInspirationSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.DAILY_INSPIRATION_SESSION);
    return true;
  } catch (error) {
    console.error('Error clearing Daily Inspiration session:', error);
    return false;
  }
}

/**
 * Save Transform session state
 * @param {string} sourceText - Source content text
 * @param {string} transformedContent - Transformed content
 * @param {string} platform - Target platform
 * @param {string} audience - Target audience
 * @param {string} sourceUrl - Source URL (optional)
 * @returns {boolean} Success status
 */
export function saveTransformSession(sourceText, transformedContent, platform, audience, sourceUrl = '') {
  try {
    const sessionData = {
      sourceText: sourceText || '',
      transformedContent: transformedContent || '',
      platform: platform || 'TikTok',
      audience: audience || 'Core Moms 25-50',
      sourceUrl: sourceUrl || '',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.TRANSFORM_SESSION, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('Error saving Transform session:', error);
    return false;
  }
}

/**
 * Get Transform session state
 * @returns {Object|null} Session data or null if not found
 */
export function getTransformSession() {
  try {
    const sessionJson = localStorage.getItem(STORAGE_KEYS.TRANSFORM_SESSION);
    if (!sessionJson) return null;
    return JSON.parse(sessionJson);
  } catch (error) {
    console.error('Error getting Transform session:', error);
    return null;
  }
}

/**
 * Clear Transform session state
 * @returns {boolean} Success status
 */
export function clearTransformSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSFORM_SESSION);
    return true;
  } catch (error) {
    console.error('Error clearing Transform session:', error);
    return false;
  }
}

// ========================================
// ANALYTICS & BUSINESS INSIGHTS FUNCTIONS
// ========================================

/**
 * Generate a simple hash from content string for de-duplication
 * @param {string} content - Content string to hash
 * @returns {string} Hash string
 */
function generateContentHash(content) {
  // Simple hash function for de-duplication
  let hash = 0;
  const str = content.trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Track an export/adoption event for analytics (Copy or Star action)
 * @param {string} action - Action type: 'copied' or 'starred'
 * @param {string} content - The content text (used for de-duplication)
 * @param {string} type - Content type: 'Daily Idea', 'Translation', etc.
 * @param {string|null} platform - Platform name (TikTok, LinkedIn, Email) or null
 * @param {string|null} product - Product name or null
 * @returns {boolean} Success status (false if duplicate)
 */
export function trackAnalytics(action, content, type, platform = null, product = null) {
  try {
    const ledgerJson = localStorage.getItem(STORAGE_KEYS.ANALYTICS_LEDGER);
    let ledger = ledgerJson ? JSON.parse(ledgerJson) : [];

    // Generate content hash for de-duplication
    const contentHash = generateContentHash(content);

    // Check if this exact content was already tracked (de-duplication)
    const alreadyTracked = ledger.some(entry => entry.contentHash === contentHash && entry.action === action);
    if (alreadyTracked) {
      return false; // Already tracked, don't double-count
    }

    const today = getTodayString();
    const newEntry = {
      id: Date.now().toString(),
      date: today,
      action: action, // 'copied' or 'starred'
      contentHash: contentHash,
      platform: platform,
      product: product,
      type: type,
      timestamp: new Date().toISOString(),
    };

    ledger.unshift(newEntry);

    // Keep only last 1000 entries to avoid storage bloat
    ledger = ledger.slice(0, 1000);

    localStorage.setItem(STORAGE_KEYS.ANALYTICS_LEDGER, JSON.stringify(ledger));
    return true;
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return false;
  }
}

/**
 * Get analytics data filtered by timeframe
 * @param {string} timeframe - 'week' (7 days), 'month' (30 days), or 'all'
 * @returns {Array} Filtered analytics entries
 */
export function getAnalyticsData(timeframe = 'month') {
  try {
    const ledgerJson = localStorage.getItem(STORAGE_KEYS.ANALYTICS_LEDGER);
    const ledger = ledgerJson ? JSON.parse(ledgerJson) : [];

    if (timeframe === 'all') {
      return ledger;
    }

    const today = new Date();
    const daysToFilter = timeframe === 'week' ? 7 : 30;
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - daysToFilter);

    return ledger.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= cutoffDate;
    });
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return [];
  }
}

/**
 * Get platform distribution for pie chart (only exported/copied items)
 * @param {string} timeframe - 'week', 'month', or 'all'
 * @returns {Array} Array of {name, value, percentage} objects
 */
export function getPlatformDistribution(timeframe = 'month') {
  try {
    const data = getAnalyticsData(timeframe);
    
    // Filter only "copied" actions with platform data (exports only)
    const platformEntries = data.filter(entry => 
      entry.action === 'copied' && entry.platform
    );

    // Return empty array if no data exists
    if (platformEntries.length === 0) {
      return [];
    }

    // Count occurrences of each platform
    const platformCounts = {};
    platformEntries.forEach(entry => {
      const platform = entry.platform;
      platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });

    // Convert to array format for charts
    const total = platformEntries.length;
    const distribution = Object.entries(platformCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100),
    }));

    // Sort by value descending
    return distribution.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error calculating platform distribution:', error);
    return [];
  }
}

/**
 * Get product attention metrics (top performers and neglected products) - exported items only
 * @param {string} timeframe - 'week', 'month', or 'all'
 * @returns {Object} { topProducts: Array, neglectedProducts: Array }
 */
export function getProductAttention(timeframe = 'month') {
  try {
    const data = getAnalyticsData(timeframe);
    
    // Filter entries that have product data and were exported (copied or starred)
    const productEntries = data.filter(entry => entry.product && entry.action);

    // Return empty arrays if no data exists
    if (productEntries.length === 0) {
      return {
        topProducts: [],
        neglectedProducts: [],
      };
    }

    // Count unique assets per product (using contentHash to avoid double-counting same content)
    const productCounts = {};
    const productHashes = {}; // Track unique content per product
    
    productEntries.forEach(entry => {
      const product = entry.product;
      if (!productHashes[product]) {
        productHashes[product] = new Set();
      }
      if (entry.contentHash) {
        productHashes[product].add(entry.contentHash);
      }
    });

    // Convert to count object
    Object.keys(productHashes).forEach(product => {
      productCounts[product] = productHashes[product].size;
    });

    // Convert to array and sort
    const allProducts = Object.entries(productCounts).map(([name, count]) => ({
      name,
      count,
    }));

    allProducts.sort((a, b) => b.count - a.count);

    // Get top 3 and bottom 3
    const topProducts = allProducts.slice(0, 3);
    const neglectedProducts = allProducts.slice(-3).reverse();

    // Add products with 0 exports from inventory if needed
    const trackedProductNames = new Set(allProducts.map(p => p.name));
    const zeroGenProducts = PRODUCT_INVENTORY.filter(
      product => !trackedProductNames.has(product)
    ).map(name => ({ name, count: 0 }));

    // Combine neglected products with zero-gen products (prioritize zeros)
    const finalNeglected = [...zeroGenProducts, ...neglectedProducts].slice(0, 3);

    return {
      topProducts,
      neglectedProducts: finalNeglected,
    };
  } catch (error) {
    console.error('Error calculating product attention:', error);
    return { topProducts: [], neglectedProducts: [] };
  }
}

/**
 * Calculate creative output (unique assets exported - copied or starred)
 * @param {string} timeframe - 'week', 'month', or 'all'
 * @returns {number} Count of unique exported assets
 */
export function calculateCreativeOutput(timeframe = 'month') {
  try {
    const data = getAnalyticsData(timeframe);
    
    // Count unique content hashes (each hash = 1 unique asset)
    const uniqueAssets = new Set();
    data.forEach(entry => {
      if (entry.contentHash) {
        uniqueAssets.add(entry.contentHash);
      }
    });

    // Return 0 if no data exists
    return uniqueAssets.size;
  } catch (error) {
    console.error('Error calculating creative output:', error);
    return 0;
  }
}

/**
 * Get weekly activity data for the last 7 days (copied/starred items)
 * @returns {Array} Array of { date: string, day: string, count: number } objects
 */
export function getWeeklyActivityData() {
  try {
    // Get analytics data for last 7 days
    const data = getAnalyticsData('week');
    
    // Filter only copied or starred actions
    const activityEntries = data.filter(entry => 
      entry.action === 'copied' || entry.action === 'starred'
    );

    // Generate last 7 days
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[date.getDay()];
      
      last7Days.push({
        date: dateString,
        day: dayName,
        count: 0
      });
    }

    // Count activities per day
    const dayCounts = {};
    activityEntries.forEach(entry => {
      if (entry.date) {
        dayCounts[entry.date] = (dayCounts[entry.date] || 0) + 1;
      }
    });

    // Merge counts into last7Days array
    return last7Days.map(day => ({
      ...day,
      count: dayCounts[day.date] || 0
    }));
  } catch (error) {
    console.error('Error getting weekly activity data:', error);
    return [];
  }
}

/**
 * Get activity data formatted for the selected timeframe
 * @param {string} timeframe - 'week', 'month', or 'all'
 * @returns {Array} Array of { day: string, date: string, count: number } objects
 */
export function getActivityDataByTimeframe(timeframe = 'month') {
  try {
    // Get analytics data for the timeframe
    const data = getAnalyticsData(timeframe);
    
    // Filter only copied or starred actions
    const activityEntries = data.filter(entry => 
      entry.action === 'copied' || entry.action === 'starred'
    );

    if (timeframe === 'week') {
      // Last 7 days with day names
      const today = new Date();
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = dayNames[date.getDay()];
        
        last7Days.push({
          date: dateString,
          day: dayName,
          count: 0
        });
      }

    // Count activities per day
    const dayCounts = {};
    activityEntries.forEach(entry => {
      if (entry.date) {
        dayCounts[entry.date] = (dayCounts[entry.date] || 0) + 1;
      }
    });

    // Return data with 0 counts if no real data exists
    return last7Days.map(day => ({
      ...day,
      count: dayCounts[day.date] || 0
    }));
    } else if (timeframe === 'month') {
      // Days of the month: 1, 5, 10, 15, 20, 25, 30
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Target days to show
      const targetDays = [1, 5, 10, 15, 20, 25, 30].filter(day => day <= daysInMonth);
      
      const monthDays = targetDays.map(dayNum => {
        const date = new Date(currentYear, currentMonth, dayNum);
        const dateString = date.toISOString().split('T')[0];
        return {
          date: dateString,
          day: dayNum.toString(),
          count: 0
        };
      });

      // Count activities per day
      const dayCounts = {};
      activityEntries.forEach(entry => {
        if (entry.date) {
          const entryDate = new Date(entry.date);
          const entryDay = entryDate.getDate();
          // Only count if it's one of our target days
          if (targetDays.includes(entryDay)) {
            dayCounts[entry.date] = (dayCounts[entry.date] || 0) + 1;
          }
        }
      });

      // Return data with 0 counts if no real data exists
      return monthDays.map(day => ({
        ...day,
        count: dayCounts[day.date] || 0
      }));
    } else {
      // 'all' - show last 30 days with day numbers
      const today = new Date();
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayNum = date.getDate();
        
        last30Days.push({
          date: dateString,
          day: dayNum.toString(),
          count: 0
        });
      }

      // Count activities per day
      const dayCounts = {};
      activityEntries.forEach(entry => {
        if (entry.date) {
          dayCounts[entry.date] = (dayCounts[entry.date] || 0) + 1;
        }
      });

      // Show every 5th day for readability (1, 6, 11, 16, 21, 26)
      const filteredDays = last30Days.filter((_, index) => index % 5 === 0 || index === last30Days.length - 1);
      
      // Return data with 0 counts if no real data exists
      return filteredDays.map(day => ({
        ...day,
        count: dayCounts[day.date] || 0
      }));
    }
  } catch (error) {
    console.error('Error getting activity data by timeframe:', error);
    return [];
  }
}

