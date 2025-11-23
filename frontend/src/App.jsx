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
  markVisited 
} from './utils/localStorage.js';

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

  const handleQuickAction = (action) => {
    switch (action) {
      case 'tiktok':
        // Navigate to Daily Inspiration with random product
        onProductSelect('');
        onNavigate('inspiration');
        break;
      case 'email':
        // Navigate to Platform Translator with Email and Core pre-selected
        onNavigate('translator', { platform: 'Email', audience: 'Core Moms 25-50' });
        break;
      case 'competitor':
        // Navigate to Adapt Competitor
        onNavigate('adapt');
        break;
      default:
        break;
    }
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
            onClick={() => handleQuickAction('tiktok')}
            className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/60 hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 group"
            aria-label="Draft new TikTok content"
          >
            <div className="text-3xl mb-2">🎥</div>
            <div className="text-amber-100 font-semibold text-sm mb-1">Draft New TikTok</div>
            <div className="text-amber-200/60 text-xs">Generate fresh ideas</div>
          </button>

          <button
            onClick={() => handleQuickAction('email')}
            className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/60 hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 group"
            aria-label="Write weekly email"
          >
            <div className="text-3xl mb-2">📧</div>
            <div className="text-amber-100 font-semibold text-sm mb-1">Write Weekly Email</div>
            <div className="text-amber-200/60 text-xs">For your core audience</div>
          </button>

          <button
            onClick={() => handleQuickAction('competitor')}
            className="p-4 bg-zinc-800 rounded-lg border border-amber-900/30 hover:border-amber-500/60 hover:bg-zinc-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 group"
            aria-label="Rewrite competitor post"
          >
            <div className="text-3xl mb-2">✍️</div>
            <div className="text-amber-100 font-semibold text-sm mb-1">Rewrite Competitor</div>
            <div className="text-amber-200/60 text-xs">Adapt in your voice</div>
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
              <button
                onClick={() => handleCopy(idea, index)}
                aria-label={`Copy idea ${index + 1} to clipboard`}
                aria-pressed={copiedIndex === index}
                className={`w-full py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-amber-400/50 ${
                  copiedIndex === index
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-800 text-amber-100 hover:bg-zinc-700 border border-amber-900/30'
                }`}
              >
                {copiedIndex === index ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
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
const PagePlatformTranslator = ({ preSelectedPlatform = '', preSelectedAudience = '' }) => {
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
  // 'activePage' is a variable that remembers which page we're on.
  // It starts as 'dashboard' by default.
  const [activePage, setActivePage] = useState('dashboard');
  
  // State for pre-selected values from Dashboard Quick Actions
  const [preSelectedProduct, setPreSelectedProduct] = useState('');
  const [preSelectedPlatform, setPreSelectedPlatform] = useState('');
  const [preSelectedAudience, setPreSelectedAudience] = useState('');

  // --- Style classes for our tabs ---
  const activeTabClass = "flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 bg-amber-400 text-black shadow-lg shadow-amber-400/50 border-2 border-amber-400";
  const inactiveTabClass = "flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-zinc-800 text-amber-100 hover:bg-zinc-700 border-2 border-amber-900/40 hover:border-amber-500/60 hover:shadow-md hover:shadow-amber-500/30";
  // ----------------------------------

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
  };

  // Product selector handler for Dashboard Product Spotlight
  const handleProductSelectFromDashboard = (product) => {
    setPreSelectedProduct(product);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center p-4">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      {/* Main App Container */}
      <div className="w-full max-w-3xl bg-zinc-900 rounded-xl shadow-2xl shadow-amber-500/10 border border-amber-900/40 overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center p-6 bg-zinc-900 border-b border-amber-900/40">
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
              />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default App;