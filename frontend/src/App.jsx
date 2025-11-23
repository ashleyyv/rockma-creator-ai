import { useState, useEffect } from 'react';
import { api } from './services/api.js';
import { copyToClipboard, formatErrorMessage } from './utils/stateHelpers.js';
import { 
  calculateStreak, 
  getStreak,
  getProductOfDay, 
  saveRecentDraft, 
  getRecentDrafts,
  isFirstVisit,
  markVisited,
  saveCompetitorClip,
  getCompetitorClips,
  deleteCompetitorClip,
  saveFavorite,
  getFavorites,
  deleteFavorite,
  isFavorited
} from './utils/localStorage.js';
import AccessGate from './components/AccessGate.jsx';
import { isAuthenticated, clearAccessCode } from './utils/auth.js';

// ========================================
// SKELETON LOADING COMPONENTS
// ========================================

const SkeletonIdea = () => (
  <div className="p-4 bg-zinc-900 rounded-lg border border-amber-900/40 space-y-3 animate-skeleton">
    <div>
      <div className="h-4 w-16 bg-zinc-800 rounded mb-2"></div>
      <div className="h-4 w-full bg-zinc-800 rounded"></div>
    </div>
    <div>
      <div className="h-4 w-16 bg-zinc-800 rounded mb-2"></div>
      <div className="h-20 w-full bg-zinc-800 rounded"></div>
    </div>
    <div>
      <div className="h-4 w-16 bg-zinc-800 rounded mb-2"></div>
      <div className="h-4 w-3/4 bg-zinc-800 rounded"></div>
    </div>
    <div className="h-10 w-full bg-zinc-800 rounded"></div>
  </div>
);

const SkeletonText = () => (
  <div className="animate-skeleton space-y-3">
    <div className="h-4 w-full bg-zinc-800 rounded"></div>
    <div className="h-4 w-full bg-zinc-800 rounded"></div>
    <div className="h-4 w-3/4 bg-zinc-800 rounded"></div>
  </div>
);

// ========================================
// MODAL COMPONENTS
// ========================================

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-xl border border-amber-500/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-900/40">
          <h3 className="text-xl font-bold text-amber-400">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const StarButton = ({ content, type, metadata, onStarred }) => {
  const [isStarred, setIsStarred] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setIsStarred(isFavorited(content));
  }, [content]);

  const handleStar = async () => {
    const success = saveFavorite(content, type, metadata);
    if (success) {
      setIsStarred(true);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      if (onStarred) onStarred();
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleStar}
        disabled={isStarred}
        className={`p-2 rounded transition-colors ${
          isStarred 
            ? 'text-amber-400 cursor-default' 
            : 'text-gray-400 hover:text-amber-400'
        }`}
        aria-label={isStarred ? 'Already starred' : 'Star this content'}
      >
        {isStarred ? '⭐' : '☆'}
      </button>
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-amber-400 text-gray-900 text-xs rounded whitespace-nowrap animate-fade-in">
          Added to favorites!
        </div>
      )}
    </div>
  );
};

// ========================================
// EMPTY STATE COMPONENTS
// ========================================

const EmptyState = ({ icon, title, description }) => (
  <div className="text-center py-12 animate-fade-in">
    <div className="text-6xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-amber-100 mb-2">{title}</h3>
    <p className="text-neutral-400 text-sm max-w-md mx-auto">{description}</p>
  </div>
);

// ========================================
// DASHBOARD COMPONENT
// ========================================

// Dashboard - The Command Center
const PageDashboard = ({ onNavigate, onProductSelect }) => {
  const [streak, setStreak] = useState(0);
  const [productOfDay, setProductOfDay] = useState('');
  const [recentDrafts, setRecentDrafts] = useState([]);
  
  // Modal states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);
  const [showRemixModal, setShowRemixModal] = useState(false);
  
  // Form states
  const [pinText, setPinText] = useState('');
  const [brainDumpText, setBrainDumpText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Calculate and update streak
    const currentStreak = calculateStreak();
    setStreak(currentStreak);

    // Get product of the day
    const product = getProductOfDay();
    setProductOfDay(product);

    // Load recent drafts
    const drafts = getRecentDrafts();
    setRecentDrafts(drafts);
  }, []);

  const handleProductSpotlight = () => {
    // Pre-select the product and navigate to Daily Inspiration
    onProductSelect(productOfDay);
    onNavigate('inspiration');
  };

  // Pin Competitor handlers
  const handlePinCompetitor = () => {
    setShowPinModal(true);
  };

  const handleSavePin = () => {
    if (!pinText.trim()) return;
    const success = saveCompetitorClip(pinText.trim());
    if (success) {
      setPinText('');
      setShowPinModal(false);
    }
  };

  // Brain Dump handlers
  const handleBrainDump = () => {
    setShowBrainDumpModal(true);
  };

  const handleSaveBrainDump = () => {
    if (!brainDumpText.trim()) return;
    saveRecentDraft('Raw Idea', brainDumpText.trim());
    setBrainDumpText('');
    setShowBrainDumpModal(false);
    // Refresh drafts
    setRecentDrafts(getRecentDrafts());
  };

  const handleStartRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setBrainDumpText(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Remix Favorite handler
  const handleRemixFavorite = () => {
    setShowRemixModal(true);
  };

  const handleSelectFavorite = (favorite) => {
    setShowRemixModal(false);
    // Navigate to translator with pre-filled content
    onNavigate('translator', { preFilledText: favorite.content });
  };

  const handleCopyDraft = async (content) => {
    await copyToClipboard(content);
  };

  return (
    <div className="text-amber-50">
      {/* Welcome Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-amber-400 mb-2">Welcome Back! 👋</h2>
        <p className="text-amber-100 text-sm">
          Your Command Center for consistent, on-brand content creation.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        
        {/* Section 1: Creation Streak */}
        <div className="p-6 bg-gradient-to-br from-amber-900/40 to-zinc-900 rounded-lg border border-amber-600/50 animate-pulse-gold">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-300">Creation Streak</h3>
            <span className="text-4xl">🔥</span>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-amber-400 mb-2 animate-count-up">
              {streak}
            </div>
            <p className="text-amber-100 text-sm font-medium">
              {streak === 1 ? 'Day' : 'Days'} in a Row
            </p>
            <p className="text-amber-200/70 text-xs mt-2">
              {streak >= 7 
                ? "Amazing! You're crushing your consistency goals! 🎉" 
                : "Keep the momentum going! Consistency builds brands."}
            </p>
          </div>
        </div>

        {/* Section 2: Product Spotlight */}
        <div className="p-6 bg-zinc-900 rounded-lg border border-amber-900/40 hover:border-amber-500/60 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-300">Today's Spotlight</h3>
            <span className="text-4xl">✨</span>
          </div>
          <div className="mb-4">
            <p className="text-amber-100 text-sm mb-2">Feature this product today:</p>
            <p className="text-amber-400 font-bold text-lg leading-tight">
              {productOfDay.replace('RockMa Better Body Butter - ', '').replace('RockMa Lips Organics - Fab 5 Flavor Boxes: ', '').replace('RockMa ', '')}
            </p>
          </div>
          <button
            onClick={handleProductSpotlight}
            className="w-full py-3 px-4 bg-amber-400 text-gray-900 rounded-lg font-semibold text-sm hover:bg-amber-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50"
            aria-label={`Generate content ideas for ${productOfDay}`}
          >
            ✨ Generate Ideas for This
          </button>
        </div>
      </div>

      {/* Section 3: Quick Actions */}
      <div className="p-6 bg-zinc-900 rounded-lg border border-amber-900/40 mb-4">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">Quick Actions ⚡</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            onClick={handlePinCompetitor}
            className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/60 hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 group"
            aria-label="Pin competitor content for later"
          >
            <div className="text-3xl mb-2">📌</div>
            <div className="text-amber-100 font-semibold text-sm mb-1">Pin Competitor</div>
            <div className="text-amber-200/60 text-xs">Save for later</div>
          </button>

          <button
            onClick={handleBrainDump}
            className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/60 hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 group"
            aria-label="Quick brain dump or voice note"
          >
            <div className="text-3xl mb-2">🎤</div>
            <div className="text-amber-100 font-semibold text-sm mb-1">Brain Dump</div>
            <div className="text-amber-200/60 text-xs">Capture ideas</div>
          </button>

          <button
            onClick={handleRemixFavorite}
            className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/60 hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 group"
            aria-label="Remix a favorited script"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-amber-100 font-semibold text-sm mb-1">Remix Favorite</div>
            <div className="text-amber-200/60 text-xs">Reuse success</div>
          </button>
        </div>
      </div>

      {/* Section 4: Recent Drafts */}
      <div className="p-6 bg-zinc-900 rounded-lg border border-amber-900/40">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">Recent Drafts 🕒</h3>
        
        {recentDrafts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-amber-200/60 text-sm">No drafts yet. Generate some content to see it here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentDrafts.map((draft) => (
              <article
                key={draft.id}
                className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-amber-900/40 text-amber-300 text-xs font-semibold rounded">
                        {draft.type}
                      </span>
                      <time className="text-amber-200/50 text-xs">
                        {new Date(draft.timestamp).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-amber-100 text-sm truncate">
                      {draft.snippet}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyDraft(draft.content)}
                    className="flex-shrink-0 p-2 bg-zinc-700 hover:bg-zinc-600 text-amber-100 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    aria-label={`Copy ${draft.type} content`}
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Pin Competitor Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="📌 Pin Competitor Content">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">Save a competitor's link or text to adapt later.</p>
          <textarea
            value={pinText}
            onChange={(e) => setPinText(e.target.value)}
            placeholder="Paste competitor link or text here..."
            className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[120px]"
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowPinModal(false)}
              className="px-4 py-2 bg-zinc-700 text-gray-300 rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePin}
              disabled={!pinText.trim()}
              className="px-4 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Pin
            </button>
          </div>
        </div>
      </Modal>

      {/* Brain Dump Modal */}
      <Modal isOpen={showBrainDumpModal} onClose={() => setShowBrainDumpModal(false)} title="🎤 Brain Dump">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">Capture your raw thoughts and ideas.</p>
          <textarea
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            placeholder="What's on your mind? Type or click the mic to speak..."
            className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[200px]"
            autoFocus
          />
          <div className="flex gap-3 justify-between">
            <button
              onClick={handleStartRecording}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              {isRecording ? '⏹ Stop' : '🎤 Voice Input'}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBrainDumpModal(false)}
                className="px-4 py-2 bg-zinc-700 text-gray-300 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBrainDump}
                disabled={!brainDumpText.trim()}
                className="px-4 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Idea
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Remix Favorite Modal */}
      <Modal isOpen={showRemixModal} onClose={() => setShowRemixModal(false)} title="⭐ Remix a Favorite">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">Select a favorite to remix for a different platform.</p>
          {getFavorites().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No favorites yet. Star content from any feature to save it!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getFavorites().map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => handleSelectFavorite(fav)}
                  className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/60 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-400">{fav.type}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFavorite(fav.id);
                        setShowRemixModal(false);
                        setTimeout(() => setShowRemixModal(true), 10);
                      }}
                      className="text-gray-500 hover:text-red-400 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2">{fav.snippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// Daily Inspiration Component
const PageDailyInspiration = ({ preSelectedProduct = '' }) => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [product, setProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');

  // Set selected product from Dashboard Product Spotlight
  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProduct(preSelectedProduct);
    }
  }, [preSelectedProduct]);

  // Product inventory for dropdown (matches backend)
  const productInventory = {
    'Body Butters': [
      'RockMa Better Body Butter - Vanilla Cream',
      'RockMa Better Body Butter - Choco Love',
      'RockMa Better Body Butter - Cherry Kiss',
      'RockMa Better Body Butter - Coco Beach',
      'RockMa Better Body Butter - Orange Crush',
      'RockMa Better Body Butter - Almondina',
      'RockMa Better Body Butter - Berry Patch'
    ],
    'Lips': [
      'RockMa Lips Organics - Fab 5 Flavor Boxes: Happy',
      'RockMa Lips Organics - Fab 5 Flavor Boxes: Dreamy',
      'RockMa Lips Organics - Fab 5 Flavor Boxes: Cozy',
      'RockMa Lips Organics - Fab 5 Flavor Boxes: Sunny'
    ],
    'Apparel': ['RockMa Aesthetic Apparel'],
    'Accents': ['RockMa Beautiful Accents']
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setIdeas([]);
    setProduct(null);
    setCopiedIndex(null);

    try {
      const response = await api.generateDailyInspiration(selectedProduct || null);
      if (response.success && response.ideas) {
        setIdeas(response.ideas);
        setProduct(response.product || null);
        
        // Save each idea to recent drafts
        response.ideas.forEach((idea) => {
          const content = `${idea.hook}\n\n${idea.script}\n\n${idea.hashtags}`;
          saveRecentDraft('Daily Idea', content, { product: response.product });
        });
      } else {
        setError(response.message || 'Failed to generate ideas');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (idea, index) => {
    const fullText = `${idea.hook}\n\n${idea.script}\n\n${idea.hashtags}`;
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="text-amber-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">Daily Inspiration</h2>
        <p className="text-amber-100 text-sm">
          Get 3-5 unique content ideas with hooks, scripts, and hashtags for your RockMa products.
        </p>
      </div>

      {/* Product Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="product-select" className="block text-sm font-medium text-amber-100 mb-2">
          Choose a Product (optional)
        </label>
        <select
          id="product-select"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          disabled={loading}
          className="w-full p-3 bg-zinc-900 border border-amber-900/40 rounded-lg text-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">✨ Surprise Me (Random Product)</option>
          {Object.entries(productInventory).map(([category, products]) => (
            <optgroup key={category} label={category}>
              {products.map((product) => (
                <option key={product} value={product}>
                  {product.replace('RockMa Better Body Butter - ', '').replace('RockMa Lips Organics - Fab 5 Flavor Boxes: ', '').replace('RockMa ', '')}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        aria-label="Generate daily content ideas for RockMa products"
        aria-busy={loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
          loading
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-amber-400 text-gray-900 hover:bg-amber-500'
        }`}
      >
        {loading ? 'Generating Ideas...' : 'Get My Daily Ideas'}
      </button>

      {error && (
        <div 
          role="alert" 
          aria-live="polite"
          className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg animate-fade-in"
        >
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mt-6 space-y-4">
          <div className="h-6 w-40 bg-zinc-800 rounded animate-skeleton mb-4"></div>
          <SkeletonIdea />
          <SkeletonIdea />
          <SkeletonIdea />
        </div>
      )}

      {!loading && !error && ideas.length === 0 && (
        <EmptyState
          icon="💡"
          title="Ready to Create Magic?"
          description="Click the button above to generate 3-5 unique content ideas featuring your RockMa products. Each idea includes a hook, script, and hashtags."
        />
      )}

      {product && !loading && (
        <div className="mt-4 p-3 bg-zinc-900 rounded-lg border border-amber-900/40 animate-fade-in">
          <p className="text-sm text-neutral-400">Featured Product:</p>
          <p className="text-amber-400 font-semibold">{product}</p>
        </div>
      )}

      {ideas.length > 0 && !loading && (
        <div className="mt-6 space-y-4" aria-live="polite">
          <h3 className="text-lg font-semibold text-amber-100">Generated Ideas</h3>
          {ideas.map((idea, index) => (
            <article
              key={index}
              className="p-4 bg-zinc-900 rounded-lg border border-amber-900/40 space-y-3 animate-fade-in transition-all duration-200 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10"
              aria-label={`Content idea ${index + 1}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div>
                <h4 className="text-sm font-semibold text-amber-500 mb-1">Hook</h4>
                <p className="text-amber-50 text-sm">{idea.hook}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-500 mb-1">Script</h4>
                <p className="text-amber-50 text-sm whitespace-pre-wrap">{idea.script}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-500 mb-1">Hashtags</h4>
                <p className="text-amber-100 text-sm">{idea.hashtags}</p>
              </div>
              <div className="flex gap-2">
                <StarButton 
                  content={`${idea.hook}\n\n${idea.script}\n\n${idea.hashtags}`}
                  type="Daily Idea"
                  metadata={{ product }}
                />
                <button
                  onClick={() => handleCopy(idea, index)}
                  aria-label={`Copy idea ${index + 1} to clipboard`}
                  aria-pressed={copiedIndex === index}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
                    copiedIndex === index
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-amber-100 hover:bg-zinc-700 border border-amber-900/30'
                  }`}
                >
                  {copiedIndex === index ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

// Adapt a Competitor Component
const PageAdaptACompetitor = () => {
  const [competitorText, setCompetitorText] = useState('');
  const [adaptedText, setAdaptedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [pinnedClips, setPinnedClips] = useState([]);
  const [selectedClipId, setSelectedClipId] = useState('');

  useEffect(() => {
    setPinnedClips(getCompetitorClips());
  }, []);

  const handleAdapt = async () => {
    if (!competitorText.trim()) {
      setError('Please paste competitor content first');
      return;
    }

    setLoading(true);
    setError(null);
    setAdaptedText('');
    setCopied(false);

    try {
      const response = await api.adaptCompetitor(competitorText);
      if (response.success && response.adaptedText) {
        setAdaptedText(response.adaptedText);
        
        // Save to recent drafts
        saveRecentDraft('Adaptation', response.adaptedText);
      } else {
        setError(response.message || 'Failed to adapt content');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!adaptedText) return;
    const success = await copyToClipboard(adaptedText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setCompetitorText('');
    setAdaptedText('');
    setError(null);
    setCopied(false);
  };

  return (
    <div className="text-amber-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">Adapt a Competitor</h2>
        <p className="text-amber-100 text-sm">
          Paste competitor content and rewrite it in RockMa's "Mama's Love" brand voice.
        </p>
      </div>

      <div className="space-y-4">
        {/* Load Pinned Clip Dropdown */}
        {pinnedClips.length > 0 && (
          <div className="mb-4">
            <label htmlFor="pinned-clip-selector" className="block text-sm font-medium text-amber-300 mb-2">
              Load Pinned Clip (Optional)
            </label>
            <select
              id="pinned-clip-selector"
              value={selectedClipId}
              onChange={(e) => {
                const clipId = e.target.value;
                setSelectedClipId(clipId);
                if (clipId) {
                  const clip = pinnedClips.find(c => c.id === clipId);
                  if (clip) setCompetitorText(clip.text);
                }
              }}
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">-- Select a pinned clip --</option>
              {pinnedClips.map((clip) => (
                <option key={clip.id} value={clip.id}>{clip.snippet}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="competitor-text" className="block text-sm font-medium text-amber-100 mb-2">
            Competitor Content
          </label>
          <textarea
            id="competitor-text"
            value={competitorText}
            onChange={(e) => setCompetitorText(e.target.value)}
            placeholder="Paste competitor content here (e.g., from Burt's Bees, EOS, etc.)..."
            aria-describedby={error ? "adapt-error" : undefined}
            className="w-full h-40 p-3 bg-zinc-900 border border-amber-900/40 rounded-lg text-amber-50 placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-amber-400/50 resize-none"
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAdapt}
            disabled={loading || !competitorText.trim()}
            aria-label="Adapt competitor content for RockMa brand voice"
            aria-busy={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
              loading || !competitorText.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-amber-400 text-gray-900 hover:bg-amber-500'
            }`}
          >
            {loading ? 'Adapting...' : 'Adapt for RockMa'}
          </button>
          <button
            onClick={handleClear}
            disabled={loading}
            aria-label="Clear all content and start over"
            className="py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-zinc-800 text-amber-100 hover:bg-zinc-700 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-500/50 border border-amber-900/30"
          >
            Clear
          </button>
        </div>

        {error && (
          <div 
            id="adapt-error"
            role="alert" 
            aria-live="polite"
            className="p-4 bg-red-900/30 border border-red-700 rounded-lg animate-fade-in"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div>
            <div className="h-5 w-48 bg-zinc-800 rounded animate-skeleton mb-2"></div>
            <div className="p-4 bg-zinc-900 border border-amber-900/40 rounded-lg">
              <SkeletonText />
            </div>
          </div>
        )}

        {!loading && !error && !adaptedText && !competitorText && (
          <EmptyState
            icon="✨"
            title="Transform Competitor Content"
            description="Paste any competitor's marketing content above, and we'll rewrite it in RockMa's warm, authentic 'Mama's Love' brand voice."
          />
        )}

        {adaptedText && !loading && (
          <div aria-live="polite" className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-amber-100">
                Adapted Content (RockMa Voice)
              </label>
              <div className="flex gap-2">
                <StarButton 
                  content={adaptedText}
                  type="Adaptation"
                />
                <button
                  onClick={handleCopy}
                  aria-label="Copy adapted content to clipboard"
                  aria-pressed={copied}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-amber-100 hover:bg-zinc-700 border border-amber-900/30'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-4 bg-zinc-900 border border-amber-900/40 rounded-lg transition-all duration-200 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10">
              <p className="text-amber-50 text-sm whitespace-pre-wrap">{adaptedText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Platform Translator Component
const PagePlatformTranslator = ({ preSelectedPlatform = '', preSelectedAudience = '', preFilledText = '' }) => {
  const [sourceText, setSourceText] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [audience, setAudience] = useState('Core Moms 25-50');
  const [translatedContent, setTranslatedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const platforms = ['TikTok', 'Instagram', 'Facebook Ad', 'Email', 'YouTube'];
  const audiences = ['Core Moms 25-50', 'Gen-Z', 'Wellness Enthusiasts', 'B2B'];

  // Set pre-selected platform and audience from Dashboard Quick Actions
  useEffect(() => {
    if (preSelectedPlatform) setPlatform(preSelectedPlatform);
    if (preSelectedAudience) setAudience(preSelectedAudience);
  }, [preSelectedPlatform, preSelectedAudience]);

  // Handle pre-filled text from Remix Favorite
  useEffect(() => {
    if (preFilledText) {
      setSourceText(preFilledText);
    }
  }, [preFilledText]);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Please enter source content first');
      return;
    }

    setLoading(true);
    setError(null);
    setTranslatedContent('');
    setCopied(false);

    try {
      const response = await api.translatePlatform(sourceText, platform, audience);
      if (response.success && response.translatedContent) {
        setTranslatedContent(response.translatedContent);
        
        // Save to recent drafts
        saveRecentDraft('Translation', response.translatedContent, { platform, audience });
      } else {
        setError(response.message || 'Failed to translate content');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!translatedContent) return;
    const success = await copyToClipboard(translatedContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedContent('');
    setError(null);
    setCopied(false);
  };

  return (
    <div className="text-amber-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">Platform Translator</h2>
        <p className="text-amber-100 text-sm">
          Repurpose your content for different platforms and audiences.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="source-text" className="block text-sm font-medium text-amber-100 mb-2">
            Source Content
          </label>
          <textarea
            id="source-text"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste your core idea or content here..."
            aria-describedby={error ? "translate-error" : undefined}
            className="w-full h-40 p-3 bg-zinc-900 border border-amber-900/40 rounded-lg text-amber-50 placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-amber-400/50 resize-none"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="platform-select" className="block text-sm font-medium text-amber-100 mb-2">
              Target Platform
            </label>
            <select
              id="platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              aria-label="Select target platform for content adaptation"
              className="w-full p-3 bg-zinc-900 border border-amber-900/40 rounded-lg text-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-400/50"
              disabled={loading}
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="audience-select" className="block text-sm font-medium text-amber-100 mb-2">
              Target Audience
            </label>
            <select
              id="audience-select"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              aria-label="Select target audience for content adaptation"
              className="w-full p-3 bg-zinc-900 border border-amber-900/40 rounded-lg text-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-400/50"
              disabled={loading}
            >
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleTranslate}
            disabled={loading || !sourceText.trim()}
            aria-label={`Generate content for ${platform} targeting ${audience} audience`}
            aria-busy={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
              loading || !sourceText.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-amber-400 text-gray-900 hover:bg-amber-500'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
          <button
            onClick={handleClear}
            disabled={loading}
            aria-label="Clear all content and start over"
            className="py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-zinc-800 text-amber-100 hover:bg-zinc-700 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-500/50 border border-amber-900/30"
          >
            Clear
          </button>
        </div>

        {error && (
          <div 
            id="translate-error"
            role="alert" 
            aria-live="polite"
            className="p-4 bg-red-900/30 border border-red-700 rounded-lg animate-fade-in"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div>
            <div className="h-5 w-64 bg-zinc-800 rounded animate-skeleton mb-2"></div>
            <div className="p-4 bg-zinc-900 border border-amber-900/40 rounded-lg">
              <SkeletonText />
            </div>
          </div>
        )}

        {!loading && !error && !translatedContent && !sourceText && (
          <EmptyState
            icon="🔄"
            title="Repurpose for Any Platform"
            description="Enter your content above, select a platform and audience, and we'll adapt it with the right tone, format, and length for maximum engagement."
          />
        )}

        {translatedContent && !loading && (
          <div aria-live="polite" className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-amber-100">
                Translated Content ({platform} - {audience})
              </label>
              <div className="flex gap-2">
                <StarButton 
                  content={translatedContent}
                  type="Translation"
                  metadata={{ platform, audience }}
                />
                <button
                  onClick={handleCopy}
                  aria-label={`Copy translated content for ${platform} - ${audience} to clipboard`}
                  aria-pressed={copied}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-zinc-800 text-amber-100 hover:bg-zinc-700 border border-amber-900/30'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-4 bg-zinc-900 border border-amber-900/40 rounded-lg transition-all duration-200 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10">
              <p className="text-amber-50 text-sm whitespace-pre-wrap">{translatedContent}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// --------------------------------------------------------


function App() {
  // Authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 'activePage' is a variable that remembers which page we're on.
  // It starts as 'dashboard' by default.
  const [activePage, setActivePage] = useState('dashboard');
  
  // State for pre-selected values from Dashboard Quick Actions
  const [preSelectedProduct, setPreSelectedProduct] = useState('');
  const [preSelectedPlatform, setPreSelectedPlatform] = useState('');
  const [preSelectedAudience, setPreSelectedAudience] = useState('');
  const [preFilledText, setPreFilledText] = useState('');

  // --- Style classes for our tabs ---
  const activeTabClass = "flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 bg-amber-400 text-black shadow-lg shadow-amber-400/50 border-2 border-amber-400";
  const inactiveTabClass = "flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-zinc-800 text-amber-100 hover:bg-zinc-700 border-2 border-amber-900/40 hover:border-amber-500/60 hover:shadow-md hover:shadow-amber-500/30";
  // ----------------------------------

  // Check if user is already authenticated on mount
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setCheckingAuth(false);
  }, []);

  // First-visit detection: Show dashboard on first load
  useEffect(() => {
    if (isFirstVisit()) {
      setActivePage('dashboard');
      markVisited();
    }
  }, []);

  // Navigation handler for Dashboard Quick Actions
  const handleNavigateFromDashboard = (page, options = {}) => {
    setActivePage(page);
    
    // Set pre-selected values if provided
    if (options.platform) setPreSelectedPlatform(options.platform);
    if (options.audience) setPreSelectedAudience(options.audience);
    if (options.preFilledText) setPreFilledText(options.preFilledText);
  };

  // Product selector handler for Dashboard Product Spotlight
  const handleProductSelectFromDashboard = (product) => {
    setPreSelectedProduct(product);
  };

  // Handle logout
  const handleLogout = () => {
    clearAccessCode();
    setAuthenticated(false);
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    return <AccessGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  // Show main app if authenticated
  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-4">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      {/* Main App Container */}
      <div className="w-full max-w-3xl bg-zinc-900 rounded-xl shadow-2xl shadow-amber-500/10 border border-amber-900/40 overflow-hidden">
        
        {/* Header Section */}
        <div className="relative text-center p-6 bg-zinc-900 border-b border-amber-900/40">
          {/* Logout Button - Top Right */}
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded hover:bg-gray-800"
            aria-label="Logout"
          >
            Logout
          </button>
          
          {/* RockMa Logo */}
          <div className="mb-4 flex justify-center">
            <img 
              src="/LOGO2.png" 
              alt="RockMa Logo" 
              className="h-28 drop-shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:drop-shadow-[0_0_35px_rgba(251,191,36,0.7)] transition-all duration-300"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-amber-400">RockMa Creator AI</h1>
          <p className="text-amber-100 mt-1">On-Brand, Every Time</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-2 p-4 bg-black border-b border-amber-900/40 overflow-x-auto" role="tablist" aria-label="Main features">
          <button 
            role="tab"
            aria-selected={activePage === 'dashboard'}
            aria-controls="dashboard-panel"
            className={activePage === 'dashboard' ? activeTabClass : inactiveTabClass}
            onClick={() => setActivePage('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            role="tab"
            aria-selected={activePage === 'inspiration'}
            aria-controls="inspiration-panel"
            className={activePage === 'inspiration' ? activeTabClass : inactiveTabClass}
            onClick={() => setActivePage('inspiration')}
          >
            💡 Daily Inspiration
          </button>
          <button 
            role="tab"
            aria-selected={activePage === 'adapt'}
            aria-controls="adapt-panel"
            className={activePage === 'adapt' ? activeTabClass : inactiveTabClass}
            onClick={() => setActivePage('adapt')}
          >
            ✨ Adapt Competitor
          </button>
          <button 
            role="tab"
            aria-selected={activePage === 'translator'}
            aria-controls="translator-panel"
            className={activePage === 'translator' ? activeTabClass : inactiveTabClass}
            onClick={() => setActivePage('translator')}
          >
            🔄 Translator
          </button>
        </nav>

        {/* Main Content Area (this is where the 4 pages will swap) */}
        <main id="main-content" className="p-6 md:p-8" tabIndex="-1">
          {activePage === 'dashboard' && (
            <div id="dashboard-panel" role="tabpanel" aria-labelledby="Dashboard" className="animate-fade-in">
              <PageDashboard 
                onNavigate={handleNavigateFromDashboard}
                onProductSelect={handleProductSelectFromDashboard}
              />
            </div>
          )}
          {activePage === 'inspiration' && (
            <div id="inspiration-panel" role="tabpanel" aria-labelledby="Daily Inspiration" className="animate-fade-in">
              <PageDailyInspiration preSelectedProduct={preSelectedProduct} />
            </div>
          )}
          {activePage === 'adapt' && (
            <div id="adapt-panel" role="tabpanel" aria-labelledby="Adapt a Competitor" className="animate-fade-in">
              <PageAdaptACompetitor />
            </div>
          )}
          {activePage === 'translator' && (
            <div id="translator-panel" role="tabpanel" aria-labelledby="Platform Translator" className="animate-fade-in">
              <PagePlatformTranslator 
                preSelectedPlatform={preSelectedPlatform}
                preSelectedAudience={preSelectedAudience}
                preFilledText={preFilledText}
              />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default App;