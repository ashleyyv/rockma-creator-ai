import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clock, Video, Linkedin, Mail, AlertCircle } from 'lucide-react';
import {
  getPlatformDistribution,
  getProductAttention,
  calculateCreativeOutput,
  getActivityDataByTimeframe,
} from '../utils/localStorage.js';

// Brand colors for charts
const CHART_COLORS = {
  gold: '#fbbf24',
  darkGrey: '#52525b',
  lightGrey: '#a1a1aa',
  white: '#f5f5f4',
  amber: '#f59e0b',
};

const PLATFORM_COLORS = {
  TikTok: CHART_COLORS.gold,
  LinkedIn: '#0077b5',
  Email: CHART_COLORS.amber,
  Instagram: '#e4405f',
  'Facebook Ad': '#1877f2',
  YouTube: '#ff0000',
};

// Platform icons mapping
const PLATFORM_ICONS = {
  TikTok: Video,
  LinkedIn: Linkedin,
  Email: Mail,
  Instagram: Video,
  'Facebook Ad': Video,
  YouTube: Video,
};

const StrategyDashboard = ({ onBoostProduct }) => {
  const [timeframe, setTimeframe] = useState('month');
  const [platformData, setPlatformData] = useState([]);
  const [productData, setProductData] = useState({ topProducts: [], neglectedProducts: [] });
  const [creativeOutput, setCreativeOutput] = useState(0);
  const [activityData, setActivityData] = useState([]);

  const refreshData = useCallback(() => {
    const platforms = getPlatformDistribution(timeframe);
    const products = getProductAttention(timeframe);
    const output = calculateCreativeOutput(timeframe);
    const activity = getActivityDataByTimeframe(timeframe);

    setPlatformData(platforms);
    setProductData(products);
    setCreativeOutput(output);
    setActivityData(activity);
  }, [timeframe]);

  // Refresh data when timeframe changes or component mounts
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Refresh data when window regains focus
  useEffect(() => {
    // Refresh when user returns to the tab/window
    const handleFocus = () => {
      refreshData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also set up an interval to refresh every 30 seconds while on dashboard
    const intervalId = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [refreshData]);

  const handleBoost = (productName) => {
    if (onBoostProduct) {
      onBoostProduct(productName);
    }
  };

  const timeframeLabel = {
    week: 'This Week',
    month: 'This Month',
    all: 'All Time',
  };

  // Generate conic gradient for donut chart
  const generateConicGradient = (data) => {
    if (data.length === 0) return '';
    
    let gradientParts = [];
    let currentAngle = 0;
    
    data.forEach((item) => {
      const angle = (item.percentage / 100) * 360;
      const color = PLATFORM_COLORS[item.name] || CHART_COLORS.darkGrey;
      gradientParts.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
      currentAngle += angle;
    });
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  return (
    <div className="p-6 bg-zinc-900 rounded-lg border border-amber-900/40 mb-6 animate-fade-in">
      {/* Header with Timeframe Filter */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-amber-300">Content Strategy Insights</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-amber-900/40 rounded-lg text-amber-100 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            aria-label="Refresh analytics data"
            title="Refresh data"
          >
            ↻
          </button>
          <div>
            <label htmlFor="timeframe-select" className="sr-only">
              Select timeframe for analytics
            </label>
            <select
              id="timeframe-select"
              name="timeframe-select"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 bg-zinc-800 border border-amber-900/40 rounded-lg text-amber-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              aria-label="Select timeframe for analytics"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Three-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module A: Platform Mix */}
        <div className="bg-zinc-800/50 rounded-lg p-5 border border-amber-900/30 hover:border-amber-500/40 transition-all duration-200">
          <h4 className="text-sm font-semibold text-amber-300 mb-4">Platform Mix</h4>
          
          {platformData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Video className="w-12 h-12 text-amber-400/40 mb-3" />
              <p className="text-amber-200/60 text-xs max-w-prose mx-auto">No platform data yet</p>
              <p className="text-amber-200/40 text-xs mt-1 max-w-prose mx-auto">Transform content for different platforms</p>
            </div>
          ) : (
            <>
              {/* Donut Chart (CSS-based) */}
              <div className="mb-4 flex justify-center">
                <div className="relative w-40 h-40">
                  {/* Donut chart using CSS conic-gradient */}
                  <div 
                    className="w-full h-full rounded-full"
                    style={{ 
                      background: generateConicGradient(platformData)
                    }}
                  />
                  {/* Center hole for donut effect */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-400">
                        {platformData.reduce((sum, item) => sum + item.value, 0)}
                      </div>
                      <div className="text-xs text-amber-200/60">posts</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {platformData.map((platform, index) => {
                  const Icon = PLATFORM_ICONS[platform.name] || Video;
                  return (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: PLATFORM_COLORS[platform.name] || CHART_COLORS.darkGrey }}
                        />
                        <Icon className="w-3 h-3 text-amber-100/60" />
                        <span className="text-amber-100">{platform.name}</span>
                      </div>
                      <span className="text-amber-400 font-semibold">{platform.value}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Module B: Creation Activity */}
        <div className="bg-zinc-800/50 rounded-lg p-5 border border-amber-900/30 hover:border-amber-500/40 transition-all duration-200">
          <h4 className="text-sm font-semibold text-amber-300 mb-4">Creation Activity</h4>
          
          {activityData.length === 0 || activityData.every(day => day.count === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="w-12 h-12 text-amber-400/40 mb-3" />
              <p className="text-amber-200/60 text-xs max-w-prose mx-auto">No activity data yet</p>
              <p className="text-amber-200/40 text-xs mt-1 max-w-prose mx-auto">Start copying/starring content to see your consistency</p>
            </div>
          ) : (
            <div className="w-full relative" style={{ height: '200px' }}>
              {/* CSS-based Bar Chart */}
              <div className="relative h-full flex items-end justify-between gap-1">
                {/* Y-axis label */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-amber-200/60 pr-2" style={{ width: '60px' }}>
                  <span className="text-xs text-amber-200/40 mb-auto">Assets Created</span>
                  {(() => {
                    const maxCount = Math.max(...activityData.map(d => d.count), 1);
                    const steps = 4;
                    const stepValue = Math.ceil(maxCount / steps);
                    return Array.from({ length: steps + 1 }, (_, i) => (
                      <span key={i}>{stepValue * (steps - i)}</span>
                    ));
                  })()}
                </div>
                
                {/* Horizontal grid lines */}
                <div className="absolute left-16 right-0 top-0 bottom-6 pointer-events-none">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-zinc-700/30"
                      style={{ bottom: `${(i * 25)}%` }}
                    />
                  ))}
                </div>
                
                {/* Chart area */}
                <div className="flex-1 flex items-end justify-between gap-1 pl-16 pb-6">
                  {activityData.map((day, index) => {
                    const maxCount = Math.max(...activityData.map(d => d.count), 1);
                    const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1 relative z-10">
                        {/* Bar */}
                        <div 
                          className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                          style={{
                            height: `${heightPercent}%`,
                            minHeight: day.count > 0 ? '4px' : '0',
                            backgroundColor: CHART_COLORS.gold,
                          }}
                          title={`${day.day}: ${day.count} ${day.count === 1 ? 'asset' : 'assets'} created`}
                        />
                        {/* Day label */}
                        <span className="text-xs text-amber-200/60">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Module C: Creative Output */}
        <div className="bg-zinc-800/50 rounded-lg p-5 border border-amber-900/30 hover:border-amber-500/40 transition-all duration-200">
          <h4 className="text-sm font-semibold text-amber-300 mb-4">Creative Output</h4>
          
          {creativeOutput === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="w-12 h-12 text-amber-400/40 mb-3" />
              <p className="text-amber-200/60 text-xs max-w-prose mx-auto">No assets exported yet</p>
              <p className="text-amber-200/40 text-xs mt-1 max-w-prose mx-auto">Copy or star content to start tracking</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <Clock className="w-12 h-12 text-amber-400 mb-4" />
              <div className="text-center max-w-prose mx-auto">
                <div className="text-5xl font-bold text-amber-400 mb-2">
                  {creativeOutput}
                </div>
                <p className="text-amber-100 text-sm font-medium">
                  Asset{creativeOutput !== 1 ? 's' : ''} Exported
                </p>
                <p className="text-amber-200/60 text-xs mt-2">
                  {timeframeLabel[timeframe]}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-amber-900/30 w-full">
                <p className="text-amber-200/70 text-xs text-center max-w-prose mx-auto">
                  {creativeOutput >= 20 
                    ? "🎉 Your content library is growing!" 
                    : "Every export adds to your asset collection."}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StrategyDashboard;

