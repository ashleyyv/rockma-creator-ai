import { useState, useEffect, useCallback } from 'react';
import { api } from './services/api.js';
import { copyToClipboard, formatErrorMessage } from './utils/stateHelpers.js';
import { 
  calculateStreak, 
  getStreak,
  getProductAttention,
  saveRecentDraft, 
  getRecentDrafts,
  isFirstVisit,
  markVisited,
  saveFavorite,
  getFavorites,
  deleteFavorite,
  isFavorited,
  getFavoriteIdByContent,
  saveIdeaClip,
  getRemixQueue,
  deleteIdeaClip,
  getIdeaClipById,
  trackAnalytics,
  saveDailyInspirationSession,
  getDailyInspirationSession,
  clearDailyInspirationSession,
  saveTransformSession,
  getTransformSession,
  clearTransformSession,
  updateDraftContent,
  updateFavoriteContent,
  updateIdeaClipContent,
  markDraftAsPosted,
  markFavoriteAsPosted,
  markIdeaClipAsPosted,
  bulkDeleteDrafts,
  bulkDeleteFavorites,
  bulkDeleteIdeaClips
} from './utils/localStorage.js';
import AccessGate from './components/AccessGate.jsx';
import StrategyDashboard from './components/StrategyDashboard.jsx';
import PlatformQuickAccess from './components/PlatformQuickAccess.jsx';
import { isAuthenticated, clearAccessCode } from './utils/auth.js';
import { Flame, Sparkles, Zap, Pin, Mic, Star, Clock, Lightbulb, Home, RefreshCw, Settings, X, Plus, Trash2, Scissors, ExternalLink, ChevronDown, ChevronUp, Mail, Loader2, TrendingDown, CheckSquare, CheckCircle2, Copy } from 'lucide-react';

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

// Loading Spinner Component
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
    <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
    <p className="text-amber-200 text-sm font-medium">{message}</p>
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
  const [tooltipMessage, setTooltipMessage] = useState('');

  useEffect(() => {
    setIsStarred(isFavorited(content));
  }, [content]);

  const handleStar = async () => {
    if (isStarred) {
      // Unstar: find and delete the favorite
      const favoriteId = getFavoriteIdByContent(content);
      if (favoriteId) {
        const success = deleteFavorite(favoriteId);
        if (success) {
          setIsStarred(false);
          setTooltipMessage('Removed from favorites');
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 2000);
          if (onStarred) onStarred();
        }
      }
    } else {
      // Star: save the favorite
      const success = saveFavorite(content, type, metadata);
      if (success) {
        setIsStarred(true);
        setTooltipMessage('Added to favorites!');
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
        
        // Track export action (starred = saved for future use)
        const platform = metadata?.platform || null;
        const product = metadata?.product || null;
        trackAnalytics('starred', content, type, platform, product);
        
        if (onStarred) onStarred();
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleStar}
        className={`p-2 rounded transition-colors ${
          isStarred 
            ? 'text-amber-400 hover:text-amber-300' 
            : 'text-gray-400 hover:text-amber-400'
        }`}
        aria-label={isStarred ? 'Unstar this content' : 'Star this content'}
        title={isStarred ? 'Click to remove from favorites' : 'Click to add to favorites'}
      >
        {isStarred ? '⭐' : '☆'}
      </button>
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-amber-400 text-gray-900 text-xs rounded whitespace-nowrap animate-fade-in z-50">
          {tooltipMessage}
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
    <div className="mb-4">{icon}</div>
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
  const [focusProduct, setFocusProduct] = useState(null);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(true);
  
  // Library workflow queue states
  const [activeLibraryTab, setActiveLibraryTab] = useState('history');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    drafts: [],
    favorites: [],
    clips: []
  });
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  
  // Modal states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);
  const [showRemixModal, setShowRemixModal] = useState(false);
  
  // Form states
  const [pinText, setPinText] = useState('');
  const [pinIntent, setPinIntent] = useState('general_rewrite');
  const [pinUrl, setPinUrl] = useState('');
  const [pinNotes, setPinNotes] = useState('');
  const [brainDumpText, setBrainDumpText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Calculate and update streak
    const currentStreak = calculateStreak();
    setStreak(currentStreak);

    // Get focus product (lowest count/neglected product)
    const productData = getProductAttention('month');
    const neglectedProduct = productData.neglectedProducts && productData.neglectedProducts.length > 0 
      ? productData.neglectedProducts[0] 
      : null;
    setFocusProduct(neglectedProduct);

    // Load recent drafts
    const drafts = getRecentDrafts();
    setRecentDrafts(drafts);
  }, []);

  const handleProductSpotlight = () => {
    if (focusProduct) {
      // Pre-select the product and navigate to Daily Inspiration
      onProductSelect(focusProduct.name);
      onNavigate('inspiration');
    }
  };

  // Pin Competitor handlers
  const handlePinCompetitor = () => {
    setShowPinModal(true);
  };

  const handleSavePin = () => {
    console.log('handleSavePin called!', { pinText, pinIntent, pinUrl, pinNotes });
    if (!pinText.trim() || pinText.trim().length < 10) {
      alert('Please enter at least 10 characters of content to clip.');
      return;
    }
    const success = saveIdeaClip(pinText.trim(), pinUrl.trim(), pinIntent, pinNotes.trim());
    console.log('Save result:', success);
    if (success) {
      setPinText('');
      setPinIntent('general_rewrite');
      setPinUrl('');
      setPinNotes('');
      setShowPinModal(false);
      alert('✓ Clipped! Load it from the Transform page or Library.');
    } else {
      alert('Failed to save clip. Check console for errors.');
    }
  };

  // Vault handlers
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

  const handleCopyDraft = async (content, draft) => {
    const success = await copyToClipboard(content);
    if (success) {
      // Track export action - try to extract platform/product from metadata
      const platform = draft?.metadata?.platform || null;
      const product = draft?.metadata?.product || null;
      trackAnalytics('copied', content, draft?.type || 'Unknown', platform, product);
    }
  };

  const handleBoostProduct = (productName) => {
    onProductSelect(productName);
    onNavigate('inspiration');
  };

  // Library workflow queue handlers
  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (multiSelectMode) {
      // Clear selections when exiting multi-select
      setSelectedItems({ drafts: [], favorites: [], clips: [] });
    }
  };

  const handleTabChange = (tab) => {
    setActiveLibraryTab(tab);
    // Clear selections when switching tabs
    setSelectedItems({ drafts: [], favorites: [], clips: [] });
    setMultiSelectMode(false);
  };

  const handleItemSelect = (itemId) => {
    if (!multiSelectMode) return;
    setSelectedItems(prev => {
      const newSelections = { ...prev };
      const sectionKey = activeLibraryTab === 'history' ? 'drafts' : activeLibraryTab === 'favorites' ? 'favorites' : 'clips';
      if (newSelections[sectionKey].includes(itemId)) {
        newSelections[sectionKey] = newSelections[sectionKey].filter(id => id !== itemId);
      } else {
        newSelections[sectionKey] = [...newSelections[sectionKey], itemId];
      }
      return newSelections;
    });
  };

  const handleBulkDelete = () => {
    const sectionKey = activeLibraryTab === 'history' ? 'drafts' : activeLibraryTab === 'favorites' ? 'favorites' : 'clips';
    const selected = selectedItems[sectionKey];
    if (selected.length === 0) return;

    if (!window.confirm(`Delete ${selected.length} selected item(s)?`)) return;

    let success = false;
    if (activeLibraryTab === 'history') {
      success = bulkDeleteDrafts(selected);
    } else if (activeLibraryTab === 'favorites') {
      success = bulkDeleteFavorites(selected);
    } else if (activeLibraryTab === 'clips') {
      success = bulkDeleteIdeaClips(selected);
    }

    if (success) {
      setRecentDrafts(getRecentDrafts());
      setSelectedItems({ drafts: [], favorites: [], clips: [] });
      setMultiSelectMode(false);
    }
  };

  const handleToggleFavorite = (item, itemType) => {
    const content = itemType === 'clip' ? item.text : item.content;
    if (isFavorited(content)) {
      const favoriteId = getFavoriteIdByContent(content);
      if (favoriteId) {
        deleteFavorite(favoriteId);
      }
    } else {
      saveFavorite(content, item.type || 'Content', item.metadata || {});
    }
    setRecentDrafts(getRecentDrafts());
  };

  const handleQuickDelete = (itemId, itemType) => {
    if (!window.confirm('Delete this item?')) return;
    let success = false;
    if (itemType === 'draft') {
      success = bulkDeleteDrafts([itemId]);
    } else if (itemType === 'favorite') {
      success = bulkDeleteFavorites([itemId]);
    } else if (itemType === 'clip') {
      success = bulkDeleteIdeaClips([itemId]);
    }
    if (success) {
      setRecentDrafts(getRecentDrafts());
    }
  };

  const openDetailModal = (item, itemType) => {
    setSelectedItemForModal({ ...item, itemType });
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItemForModal(null);
    // Refresh data after closing modal
    setRecentDrafts(getRecentDrafts());
  };

  // Refresh modal item data
  const refreshModalItem = (itemType) => {
    if (!selectedItemForModal) return;
    let refreshedItem = null;
    if (itemType === 'draft') {
      const drafts = getRecentDrafts();
      refreshedItem = drafts.find(d => d.id === selectedItemForModal.id);
    } else if (itemType === 'favorite') {
      const favorites = getFavorites();
      refreshedItem = favorites.find(f => f.id === selectedItemForModal.id);
    } else if (itemType === 'clip') {
      const clips = getRemixQueue();
      refreshedItem = clips.find(c => c.id === selectedItemForModal.id);
    }
    if (refreshedItem) {
      setSelectedItemForModal({ ...refreshedItem, itemType });
    }
  };

  const handleSaveItemContent = (itemId, itemType, newContent) => {
    let success = false;
    if (itemType === 'draft') {
      success = updateDraftContent(itemId, newContent);
    } else if (itemType === 'favorite') {
      success = updateFavoriteContent(itemId, newContent);
    } else if (itemType === 'clip') {
      success = updateIdeaClipContent(itemId, newContent);
    }
    if (success && selectedItemForModal) {
      setSelectedItemForModal({ ...selectedItemForModal, content: newContent, text: newContent });
      setRecentDrafts(getRecentDrafts());
    }
  };

  const handleTogglePosted = (itemId, itemType, posted) => {
    let success = false;
    if (itemType === 'draft') {
      success = markDraftAsPosted(itemId, posted);
    } else if (itemType === 'favorite') {
      success = markFavoriteAsPosted(itemId, posted);
    } else if (itemType === 'clip') {
      success = markIdeaClipAsPosted(itemId, posted);
    }
    if (success) {
      setRecentDrafts(getRecentDrafts());
      // Refresh modal item to get updated timestamp
      refreshModalItem(itemType);
    }
  };

  const handleDeleteItem = (itemId, itemType) => {
    let success = false;
    if (itemType === 'draft') {
      success = bulkDeleteDrafts([itemId]);
    } else if (itemType === 'favorite') {
      success = bulkDeleteFavorites([itemId]);
    } else if (itemType === 'clip') {
      success = bulkDeleteIdeaClips([itemId]);
    }
    if (success) {
      closeDetailModal();
      setRecentDrafts(getRecentDrafts());
    }
  };

  // Detail Card Modal Component
  const DetailCardModal = ({ isOpen, onClose, item, itemType, onSaveContent, onTogglePosted, onDelete, onNavigate }) => {
    const [editedContent, setEditedContent] = useState('');
    const [posted, setPosted] = useState(false);
    const [postedTimestamp, setPostedTimestamp] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveTimeout, setSaveTimeout] = useState(null);

    useEffect(() => {
      if (item) {
        const content = itemType === 'clip' ? item.text : item.content;
        setEditedContent(content);
        setPosted(item.posted || false);
        setPostedTimestamp(item.postedTimestamp || null);
        setHasChanges(false);
      }
      return () => {
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
      };
    }, [item, itemType, saveTimeout]);

    if (!isOpen || !item) return null;

    const content = itemType === 'clip' ? item.text : item.content;
    const handleSave = () => {
      if (editedContent.trim() && editedContent.trim() !== content) {
        onSaveContent(item.id, itemType, editedContent.trim());
        setHasChanges(false);
      }
    };

    const handleContentChange = (e) => {
      const newContent = e.target.value;
      setEditedContent(newContent);
      setHasChanges(newContent !== content);
      
      // Clear existing timeout
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      // Set new debounced save
      const timeout = setTimeout(() => {
        if (newContent.trim() && newContent.trim() !== content) {
          handleSave();
        }
      }, 1000); // 1 second debounce
      
      setSaveTimeout(timeout);
    };

    const handleBlur = () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        setSaveTimeout(null);
      }
      handleSave();
    };

    const handleCopy = async () => {
      const success = await copyToClipboard(editedContent);
      if (success) {
        const platform = item.metadata?.platform || null;
        const product = item.metadata?.product || null;
        trackAnalytics('copied', editedContent, item.type || 'Unknown', platform, product);
      }
    };

    const handleRemix = () => {
      onNavigate('transform', { preFilledText: editedContent });
      onClose();
    };

    const handleOpenGmail = () => {
      const subject = encodeURIComponent('RockMa Content');
      const body = encodeURIComponent(editedContent);
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank', 'noopener,noreferrer');
    };

    const handleOpenTikTok = async () => {
      await copyToClipboard(editedContent);
      window.open('https://www.tiktok.com/upload', '_blank', 'noopener,noreferrer');
    };

    // Extract platform and audience
    const getPlatform = () => {
      if (itemType === 'clip') {
        const platformMap = {
          'format_linkedin_sales': 'LinkedIn',
          'format_email_newsletter': 'Email',
          'format_tiktok_visual': 'TikTok',
          'general_rewrite': null
        };
        return platformMap[item.intent] || null;
      }
      return item.metadata?.platform || null;
    };

    const getAudience = () => {
      return item.metadata?.audience || null;
    };

    const platform = getPlatform();
    const audience = getAudience();
    const hasPlatform = platform || (itemType === 'clip' && item.intent);

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return null;
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Content Details">
        <div className="space-y-4">
          {/* Metadata Header */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-4 text-sm">
              {platform && (
                <div>
                  <span className="text-amber-200/60">Platform: </span>
                  <span className="text-amber-300 font-semibold">{platform}</span>
                </div>
              )}
              {audience && (
                <div>
                  <span className="text-amber-200/60">Audience: </span>
                  <span className="text-amber-300 font-semibold">{audience}</span>
                </div>
              )}
            </div>
            <time className="text-amber-200/50 text-xs block">
              Created: {new Date(item.timestamp).toLocaleDateString()}
            </time>
          </div>

          {/* Editable Content Area */}
          <div>
            <label className="block text-sm font-medium text-amber-100 mb-2">
              Content
            </label>
            <textarea
              value={editedContent}
              onChange={handleContentChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[200px] resize-y"
              placeholder="Edit content..."
            />
            {hasChanges && (
              <p className="mt-2 text-xs text-amber-200/60">Changes will auto-save...</p>
            )}
          </div>

          {/* Posted Status Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={posted}
                onChange={(e) => {
                  const isPosted = e.target.checked;
                  setPosted(isPosted);
                  onTogglePosted(item.id, itemType, isPosted);
                }}
                className="w-4 h-4 text-amber-400 bg-zinc-800 border-gray-700 rounded focus:ring-amber-400"
              />
              <span className="text-sm text-amber-100">Posted</span>
              {posted && postedTimestamp && (
                <span className="text-xs text-amber-200/60">
                  {formatTimestamp(postedTimestamp)}
                </span>
              )}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-amber-900/40">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-100 rounded-lg text-sm font-semibold transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={handleRemix}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-lg text-sm font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Remix
            </button>
            {hasPlatform && (
              <>
                {(item.metadata?.platform === 'Email' || item.intent === 'format_email_newsletter') && (
                  <button
                    onClick={handleOpenGmail}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-100 rounded-lg text-sm font-semibold transition-colors border border-amber-400/30"
                  >
                    <Mail className="w-4 h-4" />
                    Open Gmail
                  </button>
                )}
                {(item.metadata?.platform === 'TikTok' || item.intent === 'format_tiktok_visual') && (
                  <button
                    onClick={handleOpenTikTok}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-100 rounded-lg text-sm font-semibold transition-colors border border-amber-400/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open TikTok
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => {
                if (window.confirm('Delete this item?')) {
                  onDelete(item.id, itemType);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm font-semibold transition-colors border border-red-700/30"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="text-amber-50">
      {/* Welcome Header */}
      <div className="mb-6 max-w-prose">
        <h2 className="text-3xl font-bold text-amber-400 mb-2">Welcome Back!</h2>
        <p className="text-amber-100 text-sm">
          Your Command Center for consistent, on-brand content creation.
        </p>
      </div>

      {/* Productivity Action Row - FAB Style */}
      <div className="mb-6 flex justify-center items-center gap-6">
        {/* Vault FAB */}
        <button
          onClick={handleBrainDump}
          className="flex flex-col items-center group"
          aria-label="Quick vault or voice note"
        >
          <div className="w-16 h-16 bg-amber-400 hover:bg-amber-500 text-black rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 shadow-lg hover:shadow-xl">
            <Mic className="w-8 h-8" />
          </div>
          <span className="text-xs text-amber-100 mt-2 font-medium">Vault</span>
        </button>

        {/* Clip Idea FAB */}
        <button
          onClick={handlePinCompetitor}
          className="flex flex-col items-center group"
          aria-label="Clip content or competitor inspiration for later"
        >
          <div className="w-16 h-16 bg-amber-400 hover:bg-amber-500 text-black rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 shadow-lg hover:shadow-xl">
            <Pin className="w-8 h-8" />
          </div>
          <span className="text-xs text-amber-100 mt-2 font-medium">Clip Idea</span>
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        
        {/* Section 1: Creation Streak */}
        <div className="p-6 bg-gradient-to-br from-amber-900/40 to-zinc-900 rounded-lg border border-amber-600/50 animate-pulse-gold">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-300">Creation Streak</h3>
            <Flame className="w-10 h-10 text-amber-400" />
          </div>
          <div className="text-center">
            <div className="text-7xl font-bold text-amber-400 mb-2 animate-count-up">
              {streak}
            </div>
            <p className="text-amber-100 text-sm font-medium">
              {streak === 1 ? 'Day' : 'Days'} in a Row
            </p>
            <p className="text-amber-200/70 text-xs mt-2 max-w-prose mx-auto">
              {streak >= 7 
                ? "Amazing! You're crushing your consistency goals! 🎉" 
                : "Keep the momentum going! Consistency builds brands."}
            </p>
          </div>
        </div>

        {/* Section 2: Focus Recommendation */}
        <div className="p-6 bg-zinc-900 rounded-lg border border-amber-900/40 hover:border-amber-500/60 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-300">Focus Recommendation</h3>
            <TrendingDown className="w-10 h-10 text-amber-400" />
          </div>
          {focusProduct ? (
            <>
              <div className="mb-4">
                <p className="text-amber-100 text-sm mb-2">
                  Neglected: {focusProduct.count} {focusProduct.count === 1 ? 'post' : 'posts'} this month
                </p>
                <p className="text-amber-400 font-bold text-2xl leading-tight max-w-prose mx-auto">
                  {focusProduct.name.replace('RockMa Better Body Butter - ', '').replace('RockMa Lips Organics - Fab 5 Flavor Boxes: ', '').replace('RockMa ', '')}
                </p>
              </div>
              <button
                onClick={handleProductSpotlight}
                className="w-full max-w-xs mx-auto py-3 px-4 bg-amber-400 text-gray-900 rounded-lg font-semibold text-sm hover:bg-amber-500 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 flex items-center justify-center gap-2"
                aria-label={`Boost ${focusProduct.name}`}
              >
                <Sparkles className="w-4 h-4" />
                Boost {focusProduct.name.replace('RockMa Better Body Butter - ', '').replace('RockMa Lips Organics - Fab 5 Flavor Boxes: ', '').replace('RockMa ', '')}
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-amber-200/60 text-sm">No product data yet</p>
              <p className="text-amber-200/40 text-xs mt-1">Generate content to see recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* Strategy Dashboard / Business Insights */}
      <StrategyDashboard onBoostProduct={handleBoostProduct} />

      {/* Section 3: Library - Tabbed Interface */}
      <div className="p-6 bg-zinc-900 rounded-lg border border-amber-900/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-300">Library</h3>
          <button
            onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
            className="p-1 text-amber-400 hover:text-amber-300 transition-colors"
            aria-label={isLibraryExpanded ? 'Collapse library' : 'Expand library'}
          >
            {isLibraryExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {isLibraryExpanded && (
          <div>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b border-amber-900/40">
              <button
                onClick={() => handleTabChange('history')}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeLibraryTab === 'history'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-amber-100/60 hover:text-amber-100'
                }`}
              >
                Recent History
              </button>
              <button
                onClick={() => handleTabChange('favorites')}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeLibraryTab === 'favorites'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-amber-100/60 hover:text-amber-100'
                }`}
              >
                Favorites
              </button>
              <button
                onClick={() => handleTabChange('clips')}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeLibraryTab === 'clips'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-amber-100/60 hover:text-amber-100'
                }`}
              >
                Idea Clips
              </button>
            </div>

            {/* Multi-Select Mode Toggle & Bulk Actions */}
            <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-amber-900/30 mb-4">
              <button
                onClick={toggleMultiSelectMode}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-amber-100 rounded text-sm font-semibold transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                {multiSelectMode ? 'Exit Select Mode' : 'Select Multiple'}
              </button>
              {multiSelectMode && (() => {
                const sectionKey = activeLibraryTab === 'history' ? 'drafts' : activeLibraryTab === 'favorites' ? 'favorites' : 'clips';
                const selectedCount = selectedItems[sectionKey].length;
                return selectedCount > 0 ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-amber-200/60">
                      {selectedCount} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-sm font-semibold transition-colors border border-red-700/30"
                    >
                      Delete Selected
                    </button>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Tab Content */}
            {activeLibraryTab === 'history' && (
              <div>
                {recentDrafts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-amber-200/60 text-sm">No drafts yet. Generate some content to see it here!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentDrafts.map((draft) => {
                      const content = draft.content;
                      const isFav = isFavorited(content);
                      return (
                        <article
                          key={draft.id}
                          onClick={() => !multiSelectMode && openDetailModal(draft, 'draft')}
                          className={`p-3 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/40 transition-all duration-200 ${
                            multiSelectMode ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {multiSelectMode && (
                              <input
                                type="checkbox"
                                checked={selectedItems.drafts.includes(draft.id)}
                                onChange={() => handleItemSelect(draft.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-amber-400 bg-zinc-800 border-gray-700 rounded focus:ring-amber-400"
                              />
                            )}
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {draft.posted && (
                                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )}
                                <time className="text-amber-200/50 text-xs whitespace-nowrap">
                                  {new Date(draft.timestamp).toLocaleDateString()}
                                </time>
                                <p className="text-amber-100 text-sm truncate">
                                  {draft.snippet}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(draft, 'draft');
                                }}
                                className={`p-1.5 rounded transition-colors ${
                                  isFav ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'
                                }`}
                                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickDelete(draft.id, 'draft');
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('transform', { preFilledText: draft.content });
                                }}
                                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded text-xs font-semibold transition-all duration-200"
                                title="Remix"
                              >
                                Remix
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeLibraryTab === 'favorites' && (
              <div>
                {getFavorites().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-amber-200/60 text-sm">No favorites yet. Star content from any feature to save it!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getFavorites().map((fav) => {
                      const content = fav.content;
                      return (
                        <article
                          key={fav.id}
                          onClick={() => !multiSelectMode && openDetailModal(fav, 'favorite')}
                          className={`p-3 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/40 transition-all duration-200 ${
                            multiSelectMode ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {multiSelectMode && (
                              <input
                                type="checkbox"
                                checked={selectedItems.favorites.includes(fav.id)}
                                onChange={() => handleItemSelect(fav.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-amber-400 bg-zinc-800 border-gray-700 rounded focus:ring-amber-400"
                              />
                            )}
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {fav.posted && (
                                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )}
                                <time className="text-amber-200/50 text-xs whitespace-nowrap">
                                  {new Date(fav.timestamp).toLocaleDateString()}
                                </time>
                                <p className="text-amber-100 text-sm truncate">
                                  {fav.snippet}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(fav, 'favorite');
                                }}
                                className="p-1.5 text-amber-400 rounded transition-colors"
                                title="Remove from favorites"
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickDelete(fav.id, 'favorite');
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('transform', { preFilledText: fav.content });
                                }}
                                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded text-xs font-semibold transition-all duration-200"
                                title="Remix"
                              >
                                Remix
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeLibraryTab === 'clips' && (
              <div>
                {getRemixQueue().length === 0 ? (
                  <div className="text-center py-8">
                    <Scissors className="w-12 h-12 text-amber-400/40 mx-auto mb-3" />
                    <p className="text-amber-100 font-semibold mb-2">No Ideas Clipped Yet</p>
                    <p className="text-amber-200/60 text-sm max-w-xs mx-auto">Use the Clip button above to capture content from competitors or save inspiration for later.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getRemixQueue().map((clip) => {
                      const content = clip.text;
                      const isFav = isFavorited(content);
                      return (
                        <article
                          key={clip.id}
                          onClick={() => !multiSelectMode && openDetailModal(clip, 'clip')}
                          className={`p-3 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/40 transition-all duration-200 ${
                            multiSelectMode ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {multiSelectMode && (
                              <input
                                type="checkbox"
                                checked={selectedItems.clips.includes(clip.id)}
                                onChange={() => handleItemSelect(clip.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-amber-400 bg-zinc-800 border-gray-700 rounded focus:ring-amber-400"
                              />
                            )}
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {clip.posted && (
                                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                )}
                                <time className="text-amber-200/50 text-xs whitespace-nowrap">
                                  {new Date(clip.timestamp).toLocaleDateString()}
                                </time>
                                <p className="text-amber-100 text-sm truncate">
                                  {clip.snippet}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(clip, 'clip');
                                }}
                                className={`p-1.5 rounded transition-colors ${
                                  isFav ? 'text-amber-400' : 'text-gray-400 hover:text-amber-400'
                                }`}
                                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickDelete(clip.id, 'clip');
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigate('transform', { preFilledIdeaId: clip.id });
                                }}
                                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded text-xs font-semibold transition-all duration-200"
                                title="Load in Transformer"
                              >
                                Load
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Card Modal */}
      <DetailCardModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        item={selectedItemForModal}
        itemType={selectedItemForModal?.itemType}
        onSaveContent={handleSaveItemContent}
        onTogglePosted={handleTogglePosted}
        onDelete={handleDeleteItem}
        onNavigate={onNavigate}
      />

      {/* Clip Idea Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="Clip an Idea">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">Capture competitor content or inspiration for later transformation</p>
          
          {/* Content Textarea (Required) */}
          <div>
            <label htmlFor="clip-content" className="block text-sm font-medium text-amber-100 mb-2">
              Content to Transform <span className="text-red-400">*</span>
            </label>
            <textarea
              id="clip-content"
              value={pinText}
              onChange={(e) => setPinText(e.target.value)}
              placeholder="Paste the text you want to transform..."
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[150px]"
              autoFocus
            />
          </div>

          {/* Transformation Intent (Required) */}
          <div>
            <label htmlFor="clip-intent" className="block text-sm font-medium text-amber-100 mb-2">
              What will you use this for? <span className="text-red-400">*</span>
            </label>
            <select
              id="clip-intent"
              value={pinIntent}
              onChange={(e) => setPinIntent(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="general_rewrite">General / Rewrite Competitor</option>
              <option value="format_linkedin_sales">Format: LinkedIn (Sales)</option>
              <option value="format_email_newsletter">Format: Email (Newsletter)</option>
              <option value="format_tiktok_visual">Format: TikTok (Visual)</option>
            </select>
          </div>

          {/* Source URL (Optional) */}
          <div>
            <label htmlFor="clip-url" className="block text-sm font-medium text-amber-100 mb-2">
              Source Link <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="clip-url"
              type="text"
              value={pinUrl}
              onChange={(e) => setPinUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <p className="text-xs text-gray-500 mt-1">For reference only - not required</p>
          </div>

          {/* Personal Note (Optional) */}
          <div>
            <label htmlFor="clip-notes" className="block text-sm font-medium text-amber-100 mb-2">
              Quick Note <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="clip-notes"
              type="text"
              value={pinNotes}
              onChange={(e) => setPinNotes(e.target.value)}
              placeholder="Why did this catch your eye?"
              maxLength={100}
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowPinModal(false);
                setPinText('');
                setPinIntent('general_rewrite');
                setPinUrl('');
                setPinNotes('');
              }}
              className="px-4 py-2 bg-zinc-700 text-gray-300 rounded-lg hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePin}
              disabled={!pinText.trim() || pinText.trim().length < 10}
              className="px-4 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clip It
            </button>
          </div>
        </div>
      </Modal>

      {/* Vault Modal */}
      <Modal isOpen={showBrainDumpModal} onClose={() => setShowBrainDumpModal(false)} title="Vault">
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">Capture your raw thoughts and ideas.</p>
          <div>
            <label htmlFor="brain-dump-text" className="block text-sm font-medium text-amber-100 mb-2">
              Your Ideas
            </label>
            <textarea
              id="brain-dump-text"
              name="brain-dump-text"
              value={brainDumpText}
              onChange={(e) => setBrainDumpText(e.target.value)}
              placeholder="What's on your mind? Type or click the mic to speak..."
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[200px]"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-between">
            <button
              onClick={handleStartRecording}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              <Mic className="w-4 h-4" />
              {isRecording ? 'Stop' : 'Voice Input'}
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
      <Modal isOpen={showRemixModal} onClose={() => setShowRemixModal(false)} title="Remix a Favorite">
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

  // Load persisted session on mount
  useEffect(() => {
    const savedSession = getDailyInspirationSession();
    if (savedSession && savedSession.ideas && savedSession.ideas.length > 0) {
      setIdeas(savedSession.ideas);
      setProduct(savedSession.product);
      if (savedSession.selectedProduct) {
        setSelectedProduct(savedSession.selectedProduct);
      }
    }
  }, []);

  // Set selected product from Dashboard Product Spotlight
  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProduct(preSelectedProduct);
    }
  }, [preSelectedProduct]);

  // Save session when selectedProduct changes (if we have ideas)
  useEffect(() => {
    if (ideas.length > 0) {
      saveDailyInspirationSession(ideas, product, selectedProduct);
    }
  }, [selectedProduct]);

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
        
        // Save session state
        saveDailyInspirationSession(response.ideas, response.product || null, selectedProduct);
        
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
      // Track export action
      trackAnalytics('copied', fullText, 'Daily Idea', null, product);
    }
  };

  const handleReset = () => {
    setIdeas([]);
    setProduct(null);
    setError(null);
    setCopiedIndex(null);
    clearDailyInspirationSession();
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
          <option value="">Surprise Me (Random Product)</option>
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

      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          aria-label="Generate daily content ideas for RockMa products"
          aria-busy={loading}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
            loading
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-amber-400 text-gray-900 hover:bg-amber-500'
          }`}
        >
          {loading ? 'Generating Ideas...' : 'Get My Daily Ideas'}
        </button>
        {ideas.length > 0 && (
          <button
            onClick={handleReset}
            disabled={loading}
            aria-label="Reset and clear all generated ideas"
            className="py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-zinc-800 text-amber-100 hover:bg-zinc-700 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-500/50 border border-amber-900/30"
          >
            Reset
          </button>
        )}
      </div>

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
        <div className="mt-6">
          <LoadingSpinner message="Generating your daily ideas..." />
          <div className="mt-6 space-y-4">
            <div className="h-6 w-40 bg-zinc-800 rounded animate-skeleton mb-4"></div>
            <SkeletonIdea />
            <SkeletonIdea />
            <SkeletonIdea />
          </div>
        </div>
      )}

      {!loading && !error && ideas.length === 0 && (
        <EmptyState
          icon={<Lightbulb className="w-16 h-16 text-amber-400 mx-auto" />}
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

      {/* Platform Quick Access */}
      {ideas.length > 0 && (
        <PlatformQuickAccess 
          content={ideas[0] ? `${ideas[0].hook}\n\n${ideas[0].script}\n\n${ideas[0].hashtags}` : ''} 
        />
      )}
    </div>
  );
};

// Content Transformer Component (Unified: Adapt + Translate)
const PageContentTransformer = ({ preFilledText = '', preFilledIdeaId = '' }) => {
  const [sourceText, setSourceText] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [audience, setAudience] = useState('Core Moms 25-50');
  const [transformedContent, setTransformedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedIdeaClipId, setSelectedIdeaClipId] = useState('');
  const [loadedFromClip, setLoadedFromClip] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');

  const platforms = ['TikTok', 'Instagram', 'Facebook Ad', 'Email', 'YouTube'];
  const audiences = ['Core Moms 25-50', 'Gen-Z', 'Wellness Enthusiasts', 'B2B'];

  // Load persisted session on mount (like Daily Inspiration)
  useEffect(() => {
    const savedSession = getTransformSession();
    if (savedSession) {
      if (savedSession.sourceText) {
        setSourceText(savedSession.sourceText);
      }
      if (savedSession.transformedContent) {
        setTransformedContent(savedSession.transformedContent);
      }
      if (savedSession.platform) {
        setPlatform(savedSession.platform);
      }
      if (savedSession.audience) {
        setAudience(savedSession.audience);
      }
      if (savedSession.sourceUrl) {
        setSourceUrl(savedSession.sourceUrl);
      }
    }
  }, []);

  // Handle pre-filled text from Remix Favorite (overrides saved session)
  useEffect(() => {
    if (preFilledText) {
      setSourceText(preFilledText);
    }
  }, [preFilledText]);

  // Function to load an idea clip
  const loadIdeaClip = useCallback((clip) => {
    setSourceText(clip.text);
    setSourceUrl(clip.url || '');
    
    // Map intent to platform
    const platformMap = {
      'format_linkedin_sales': 'LinkedIn',
      'format_email_newsletter': 'Email',
      'format_tiktok_visual': 'TikTok'
    };
    
    if (platformMap[clip.intent]) {
      setPlatform(platformMap[clip.intent]);
    }
    
    setLoadedFromClip(true);
    setTimeout(() => setLoadedFromClip(false), 3000); // Auto-dismiss banner after 3s
  }, []);

  // Handle pre-filled idea clip from Dashboard
  useEffect(() => {
    if (preFilledIdeaId) {
      const clip = getIdeaClipById(preFilledIdeaId);
      if (clip) {
        loadIdeaClip(clip);
      }
    }
  }, [preFilledIdeaId, loadIdeaClip]);

  const handleTransform = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to transform');
      return;
    }

    setLoading(true);
    setError(null);
    setTransformedContent('');
    setCopied(false);

    try {
      // Always use Platform Translator API with selected platform and audience
      const response = await api.translatePlatform(sourceText, platform, audience);
      const draftType = 'Translation';
      
      if (response.success && response.translatedContent) {
        setTransformedContent(response.translatedContent);
        // Save session state
        saveTransformSession(sourceText, response.translatedContent, platform, audience, sourceUrl);
        saveRecentDraft(draftType, response.translatedContent, { platform, audience });
      } else {
        setError(response.message || 'Failed to transform content');
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!transformedContent) return;
    const success = await copyToClipboard(transformedContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // Track export action
      trackAnalytics('copied', transformedContent, 'Translation', platform, null);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTransformedContent('');
    setError(null);
    setCopied(false);
    setSourceUrl('');
    clearTransformSession();
  };

  // Save session when inputs change (debounced to avoid too many saves)
  useEffect(() => {
    if (sourceText || transformedContent) {
      const timeoutId = setTimeout(() => {
        saveTransformSession(sourceText, transformedContent, platform, audience, sourceUrl);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [sourceText, transformedContent, platform, audience, sourceUrl]);

  return (
    <div className="text-amber-50">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">Content Transformer</h2>
        <p className="text-amber-100 text-sm">
          Transform your content for any purpose - rewrite competitor content or format for different platforms.
        </p>
      </div>

      <div className={`space-y-4 ${platform === 'Email' && transformedContent ? 'pb-24' : ''}`}>
        {/* Load from Idea Clips Section */}
        {getRemixQueue().length > 0 && (
          <div className="p-4 bg-amber-900/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="idea-clip-selector" className="block text-sm font-semibold text-amber-300">
                Load from Idea Clips
              </label>
              <span className="text-xs text-amber-200/60">
                You have {getRemixQueue().length} clipped {getRemixQueue().length === 1 ? 'idea' : 'ideas'}
              </span>
            </div>
            <select
              id="idea-clip-selector"
              value={selectedIdeaClipId}
              onChange={(e) => {
                const clipId = e.target.value;
                setSelectedIdeaClipId(clipId);
                if (clipId) {
                  const clip = getIdeaClipById(clipId);
                  if (clip) loadIdeaClip(clip);
                }
              }}
              className="w-full px-4 py-3 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">-- Choose an idea to load --</option>
              {getRemixQueue().map((clip) => {
                const intentLabels = {
                  'format_linkedin_sales': 'LinkedIn',
                  'format_email_newsletter': 'Email',
                  'format_tiktok_visual': 'TikTok',
                  'general_rewrite': 'General'
                };
                const label = intentLabels[clip.intent] || 'General';
                const date = new Date(clip.timestamp).toLocaleDateString();
                return (
                  <option key={clip.id} value={clip.id}>
                    [{label}] {clip.snippet} ({date})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Success Banner - Loaded from Clip */}
        {loadedFromClip && (
          <div className="p-3 bg-green-900/30 border border-green-500/40 rounded-lg animate-fade-in">
            <p className="text-green-200 text-sm">
              ✓ Loaded from Idea Clips - you can edit the text or change transformation mode
            </p>
          </div>
        )}

        {/* Source URL Info Box */}
        {sourceUrl && (
          <div className="p-3 bg-zinc-800 border border-amber-900/40 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-100">Source:</span>
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-amber-400 hover:text-amber-300 underline truncate max-w-xs"
              >
                {sourceUrl}
              </a>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sourceUrl);
              }}
              className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-amber-100 rounded transition-colors"
            >
              Copy Link
            </button>
          </div>
        )}


        <div>
          <label htmlFor="source-text" className="block text-sm font-medium text-amber-100 mb-2">
            Source Content
          </label>
          <textarea
            id="source-text"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Paste text to transform..."
            aria-describedby={error ? "transform-error" : undefined}
            className="w-full h-48 p-3 bg-zinc-900 border border-amber-900/40 rounded-lg text-amber-50 placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-amber-400/50 resize-none"
            disabled={loading}
          />
        </div>

        {/* Platform + Audience fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="platform-select" className="block text-sm font-medium text-amber-100 mb-2">
              Target Platform
            </label>
            <select
              id="platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
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
            onClick={handleTransform}
            disabled={loading || !sourceText.trim()}
            aria-label="Transform content"
            aria-busy={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
              loading || !sourceText.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-amber-400 text-gray-900 hover:bg-amber-500'
            }`}
          >
            {loading ? 'Transforming...' : 'Generate Transform'}
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
            id="transform-error"
            role="alert" 
            aria-live="polite"
            className="p-4 bg-red-900/30 border border-red-700 rounded-lg animate-fade-in"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div>
            <LoadingSpinner message="Transforming your content..." />
            <div className="mt-4">
              <div className="h-5 w-48 bg-zinc-800 rounded animate-skeleton mb-2"></div>
              <div className="p-4 bg-zinc-900 border border-amber-900/40 rounded-lg">
                <SkeletonText />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && !transformedContent && !sourceText && (
          <EmptyState
            icon={<RefreshCw className="w-16 h-16 text-amber-400 mx-auto" />}
            title="Transform Your Content"
            description="Choose a transformation goal, paste your content, and we'll adapt it for your needs - whether that's rewriting in RockMa's voice or formatting for different platforms."
          />
        )}

        {transformedContent && !loading && (
          <div aria-live="polite" className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-amber-100">
                Transformed Content
              </label>
              <div className="flex gap-2">
                <StarButton 
                  content={transformedContent}
                  type="Translation"
                  metadata={{ platform, audience }}
                />
                <button
                  onClick={handleCopy}
                  aria-label="Copy transformed content to clipboard"
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
              <p className="text-amber-50 text-sm whitespace-pre-wrap">{transformedContent}</p>
            </div>

            {/* Email Deep Link Buttons */}
            {platform === 'Email' && transformedContent && (
              <div className="flex gap-3 mt-3 mb-4 relative z-50">
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent('RockMa Content')}&body=${encodeURIComponent(transformedContent)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400 text-amber-400 hover:bg-amber-400/10 transition-all duration-200 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-zinc-900"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Gmail
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent('RockMa Content')}&body=${encodeURIComponent(transformedContent)}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-400 text-amber-400 hover:bg-amber-400/10 transition-all duration-200 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 bg-zinc-900"
                >
                  <Mail className="w-4 h-4" />
                  Open Mail App
                </a>
              </div>
            )}
          </div>
        )}

        {/* Platform Quick Access */}
        {transformedContent && (
          <PlatformQuickAccess content={transformedContent} />
        )}
      </div>
    </div>
  );
};

// DEPRECATED: Platform Translator Component (Now unified in ContentTransformer)
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
            icon={<RefreshCw className="w-16 h-16 text-amber-400 mx-auto" />}
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

// Settings Drawer Component
const SettingsDrawer = ({ isOpen, onClose }) => {
  const [seasonality, setSeasonality] = useState('none');
  const [pillar, setPillar] = useState('support');
  const [newProduct, setNewProduct] = useState('');
  const [customProducts, setCustomProducts] = useState([]);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSeasonality = localStorage.getItem('rockma_seasonality') || 'none';
    const savedPillar = localStorage.getItem('rockma_pillar') || 'support';
    const savedProducts = JSON.parse(localStorage.getItem('rockma_customProducts') || '[]');
    
    setSeasonality(savedSeasonality);
    setPillar(savedPillar);
    setCustomProducts(savedProducts);
  }, [isOpen]);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('rockma_seasonality', seasonality);
    localStorage.setItem('rockma_pillar', pillar);
    localStorage.setItem('rockma_customProducts', JSON.stringify(customProducts));
  };

  useEffect(() => {
    if (isOpen) {
      saveSettings();
    }
  }, [seasonality, pillar, customProducts, isOpen]);

  const handleAddProduct = () => {
    if (newProduct.trim() && !customProducts.includes(newProduct.trim())) {
      setCustomProducts([...customProducts, newProduct.trim()]);
      setNewProduct('');
    }
  };

  const handleDeleteProduct = (productToDelete) => {
    setCustomProducts(customProducts.filter(p => p !== productToDelete));
  };

  const handleFactoryReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      localStorage.removeItem('rockma_seasonality');
      localStorage.removeItem('rockma_pillar');
      localStorage.removeItem('rockma_customProducts');
      window.location.reload();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full lg:w-96 bg-zinc-900 border-l border-amber-900/40 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-900/40">
          <h2 className="text-2xl font-bold text-amber-400 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-6 h-6 text-amber-100" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100%-160px)]">
          {/* Section A: Seasonality Tuner */}
          <div className="mb-6">
            <label htmlFor="seasonality" className="block text-sm font-semibold text-amber-100 mb-2">
              Seasonal Theme
            </label>
            <select
              id="seasonality"
              value={seasonality}
              onChange={(e) => setSeasonality(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-amber-900/40 rounded-lg text-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-400/50"
            >
              <option value="none">None</option>
              <option value="christmas">Christmas</option>
              <option value="new_year">New Year</option>
              <option value="easter">Easter</option>
              <option value="mothers_day">Mother's Day</option>
              <option value="summer">Summer</option>
              <option value="back_to_school">Back to School</option>
            </select>
          </div>

          {/* Section B: Communication Pillar */}
          <div className="mb-6">
            <label htmlFor="pillar" className="block text-sm font-semibold text-amber-100 mb-2">
              Content Focus
            </label>
            <select
              id="pillar"
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-amber-900/40 rounded-lg text-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-400/50"
            >
              <option value="support">Support</option>
              <option value="safety">Safety</option>
              <option value="motivation">Motivation</option>
              <option value="behind_brand">Behind the Brand</option>
              <option value="product_education">Product Education</option>
            </select>
          </div>

          {/* Section C: Inventory Manager */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-amber-100 mb-2">
              Product Inventory
            </label>
            <p className="text-xs text-amber-200/60 mb-3">
              Add custom products to the inventory (used in Daily Inspiration).
            </p>
            
            {/* Product List */}
            {customProducts.length > 0 && (
              <div className="space-y-2 mb-3">
                {customProducts.map((product, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg border border-amber-900/30"
                  >
                    <span className="text-sm text-amber-100">{product}</span>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="p-1 hover:bg-red-900/30 rounded transition-colors"
                      aria-label={`Delete ${product}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Product Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                placeholder="Add custom product..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-amber-900/40 rounded-lg text-amber-50 placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                onClick={handleAddProduct}
                className="p-2 bg-amber-400 hover:bg-amber-500 text-black rounded-lg transition-colors"
                aria-label="Add product"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-amber-900/40 bg-zinc-900">
          <button
            onClick={handleFactoryReset}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Factory Reset
          </button>
        </div>
      </div>
    </>
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
  const [preFilledIdeaId, setPreFilledIdeaId] = useState('');
  
  // Settings drawer state
  const [showSettings, setShowSettings] = useState(false);

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
    // Map old page names to new unified transformer
    const pageMap = {
      'translator': 'transform',
      'adapt': 'transform'
    };
    const targetPage = pageMap[page] || page;
    
    // Clear previous state before setting new values
    setPreFilledText('');
    setPreFilledIdeaId('');
    
    // Set pre-selected values if provided
    if (options.platform) setPreSelectedPlatform(options.platform);
    if (options.audience) setPreSelectedAudience(options.audience);
    if (options.preFilledText) setPreFilledText(options.preFilledText);
    if (options.preFilledIdeaId) setPreFilledIdeaId(options.preFilledIdeaId);
    
    // Navigate after state is set
    setActivePage(targetPage);
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
    <>
      <div className="bg-black min-h-screen flex items-center justify-center p-4">
        {/* Skip to main content link for keyboard navigation */}
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        
        {/* Main App Container */}
        <div className="w-full max-w-3xl md:max-w-5xl lg:max-w-7xl bg-zinc-900 rounded-xl shadow-2xl shadow-amber-500/10 border border-amber-900/40 overflow-hidden">
        
        {/* Header Section */}
        <div className="relative text-center p-6 bg-zinc-900 border-b border-amber-900/40">
          {/* Settings & Logout Buttons - Top Right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors rounded hover:bg-gray-800"
              aria-label="Open settings"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded hover:bg-gray-800"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
          
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
            <span className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </span>
          </button>
          <button 
            role="tab"
            aria-selected={activePage === 'inspiration'}
            aria-controls="inspiration-panel"
            className={activePage === 'inspiration' ? activeTabClass : inactiveTabClass}
            onClick={() => setActivePage('inspiration')}
          >
            <span className="flex items-center justify-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Daily Inspiration
            </span>
          </button>
          <button 
            role="tab"
            aria-selected={activePage === 'transform'}
            aria-controls="transform-panel"
            className={activePage === 'transform' ? activeTabClass : inactiveTabClass}
            onClick={() => setActivePage('transform')}
          >
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Transform
            </span>
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
          {activePage === 'transform' && (
            <div id="transform-panel" role="tabpanel" aria-labelledby="Content Transformer" className="animate-fade-in">
              <PageContentTransformer 
                preFilledText={preFilledText}
                preFilledIdeaId={preFilledIdeaId}
              />
            </div>
          )}
          {activePage === 'adapt' && (
            <div id="adapt-panel" role="tabpanel" aria-labelledby="Adapt a Competitor" className="animate-fade-in">
              <PageContentTransformer preFilledText={preFilledText} preFilledIdeaId={preFilledIdeaId} />
            </div>
          )}
          {activePage === 'translator' && (
            <div id="translator-panel" role="tabpanel" aria-labelledby="Platform Translator" className="animate-fade-in">
              <PageContentTransformer preFilledText={preFilledText} preFilledIdeaId={preFilledIdeaId} />
            </div>
          )}
        </main>

        </div>
      </div>
      
      {/* Settings Drawer */}
      <SettingsDrawer isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}

export default App;