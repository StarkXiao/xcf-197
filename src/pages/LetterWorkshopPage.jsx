import { useState } from 'react';
import FragmentAssembly from './letterWorkshop/FragmentAssembly';
import SpecialSentences from './letterWorkshop/SpecialSentences';
import LetterCollection from './letterWorkshop/LetterCollection';
import SharePoster from './letterWorkshop/SharePoster';

const WORKSHOP_TABS = [
  { id: 'assembly', name: '碎片拼接', icon: '📝' },
  { id: 'sentences', name: '特殊句段', icon: '💬' },
  { id: 'collection', name: '收藏展示', icon: '💎' },
  { id: 'poster', name: '分享海报', icon: '🎨' }
];

const LetterWorkshopPage = ({ workshop, archive, onBack }) => {
  const [activeTab, setActiveTab] = useState('assembly');
  const stats = workshop.getWorkshopStats();

  const renderContent = () => {
    switch (activeTab) {
      case 'assembly':
        return <FragmentAssembly workshop={workshop} archive={archive} />;
      case 'sentences':
        return <SpecialSentences workshop={workshop} />;
      case 'collection':
        return <LetterCollection workshop={workshop} />;
      case 'poster':
        return <SharePoster workshop={workshop} />;
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
          ✉️ 信笺工坊
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            {stats.completedLetters}封 · {stats.unlockedSentences}句
          </span>
        </div>
      </div>

      <div className="flex gap-1 px-4 py-3 overflow-x-auto bg-star-purple/20">
        {WORKSHOP_TABS.map(tab => (
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
            {tab.id === 'assembly' && stats.assembledFragments > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-star-dark/30 text-star-dark font-bold">
                {stats.assembledFragments}/{stats.totalFragments}
              </span>
            )}
            {tab.id === 'sentences' && stats.unlockedSentences > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-star-dark/30 text-star-dark font-bold">
                {stats.unlockedSentences}
              </span>
            )}
            {tab.id === 'collection' && stats.favoriteCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-star-dark/30 text-star-dark font-bold">
                {stats.favoriteCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default LetterWorkshopPage;
