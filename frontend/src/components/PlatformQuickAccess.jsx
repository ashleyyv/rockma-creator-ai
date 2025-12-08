import PlatformIconButton from './PlatformIconButton.jsx';
import { copyToClipboard } from '../utils/stateHelpers.js';
import { trackAnalytics } from '../utils/localStorage.js';

const PlatformQuickAccess = ({ content }) => {
  if (!content || !content.trim()) {
    return null;
  }

  const handleCopy = async (text, platform) => {
    const success = await copyToClipboard(text);
    if (success && platform) {
      // Track analytics with platform information
      trackAnalytics('copied', text, 'Platform Quick Access', platform, null);
    }
  };

  const platforms = ['TikTok', 'Instagram', 'Facebook Ad', 'YouTube'];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm border-t border-amber-900/40 px-4 py-3 z-40">
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-4">
        <span className="text-xs text-amber-200/60 mr-2">Quick Post:</span>
        {platforms.map((platform) => (
          <PlatformIconButton
            key={platform}
            platform={platform}
            content={content}
            onCopy={(text) => handleCopy(text, platform)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlatformQuickAccess;

