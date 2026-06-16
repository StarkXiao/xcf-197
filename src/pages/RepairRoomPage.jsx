import { useState } from 'react';
import FragmentRepair from './repairRoom/FragmentRepair';
import HiddenSentences from './repairRoom/HiddenSentences';
import ChapterReview from './repairRoom/ChapterReview';

const REPAIR_TABS = [
  { id: 'fragment', name: '碎片修复', icon: '🔧' },
  { id: 'sentence', name: '隐藏情话', icon: '💝' },
  { id: 'chapter', name: '章节回看', icon: '📖' }
];

const RepairRoomPage = ({ repairRoom, archive, onBack }) => {
  const [activeTab, setActiveTab] = useState('fragment');
  const stats = repairRoom.getStats();

  const renderContent = () => {
    switch (activeTab) {
      case 'fragment':
        return <FragmentRepair repairRoom={repairRoom} archive={archive} />;
      case 'sentence':
        return <HiddenSentences repairRoom={repairRoom} />;
      case 'chapter':
        return <ChapterReview archive={archive} repairRoom={repairRoom} />;
      default:
        return null;
    }
  };

  const getTabBadge = (tabId) => {
    switch (tabId) {
      case 'fragment':
        return stats.repairedFragments > 0 ? `${stats.repairedFragments}/${stats.totalFragments}` : null;
      case 'sentence':
        return stats.unlockedSentences > 0 ? `${stats.unlockedSentences}/${stats.totalSentences}` : null;
      case 'chapter':
        return stats.completedChapters > 0 ? `${stats.completedChapters}/${stats.totalChapters}` : null;
      default:
        return null;
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-star-gold/20 bg-star-dark/50 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <span className="text-xl">←</span>
          <span>返回</span>
        </button>
        <h1 className="text-xl font-bold text-star-gold glow-text">
          🏛️ 情书修复室
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            {stats.overallProgress}%
          </span>
        </div>
      </div>

      <div className="relative py-4 px-4 bg-gradient-to-r from-star-purple/30 via-star-pink/20 to-star-purple/30 border-b border-star-gold/10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>修复总进度</span>
            <span className="text-star-gold font-bold">{stats.overallProgress}%</span>
          </div>
          <div className="h-3 bg-gray-800/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${stats.overallProgress}%`,
                background: 'linear-gradient(90deg, #fbbf24, #f472b6, #a78bfa, #fbbf24)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2 text-white/40">
            <span>🔧 {stats.repairedFragments} 碎片</span>
            <span>💝 {stats.unlockedSentences} 情话</span>
            <span>📖 {stats.completedChapters} 章节</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 px-4 py-3 overflow-x-auto bg-star-purple/10">
        {REPAIR_TABS.map(tab => {
          const badge = getTabBadge(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
              {badge && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-star-dark/30 text-star-dark font-bold">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default RepairRoomPage;
