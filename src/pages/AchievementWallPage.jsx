import { useState } from 'react';
import { ACHIEVEMENT_CATEGORIES, getRarityInfo, getAchievementStats } from '../data/gameData';
import AchievementList from './achievement/AchievementList';
import TitlePanel from './achievement/TitlePanel';
import AchievementStats from './achievement/AchievementStats';

const ACHIEVEMENT_TABS = [
  { id: 'achievements', name: '成就徽章', icon: '🏆' },
  { id: 'titles', name: '称号佩戴', icon: '👑' }
];

const AchievementWallPage = ({ achievements, onBack }) => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [activeCategory, setActiveCategory] = useState('journey');

  const stats = getAchievementStats(achievements.unlockedAchievements);

  const renderContent = () => {
    switch (activeTab) {
      case 'achievements':
        return (
          <div className="space-y-6">
            <AchievementStats stats={stats} />
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {ACHIEVEMENT_CATEGORIES.map(category => {
                const catStats = stats.byCategory[category.id] || { total: 0, unlocked: 0 };
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                      ${activeCategory === category.id
                        ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                      }
                    `}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeCategory === category.id
                        ? 'bg-star-dark/20 text-star-dark'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {catStats.unlocked}/{catStats.total}
                    </span>
                  </button>
                );
              })}
            </div>

            <AchievementList 
              categoryId={activeCategory} 
              achievements={achievements} 
            />
          </div>
        );
      case 'titles':
        return <TitlePanel achievements={achievements} />;
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
          🏆 成就墙
        </h1>
        <div className="w-20" />
      </div>

      <div className="flex gap-1 px-4 py-3 overflow-x-auto bg-star-purple/20">
        {ACHIEVEMENT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default AchievementWallPage;
