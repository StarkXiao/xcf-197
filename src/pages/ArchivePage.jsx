import { useState } from 'react';
import FragmentGallery from './archive/FragmentGallery';
import LetterProgress from './archive/LetterProgress';
import ChapterReview from './archive/ChapterReview';
import HiddenEndings from './archive/HiddenEndings';

const ARCHIVE_TABS = [
  { id: 'fragments', name: '碎片图鉴', icon: '✨' },
  { id: 'letter', name: '情书修复', icon: '💌' },
  { id: 'chapters', name: '章节回看', icon: '📖' },
  { id: 'endings', name: '隐藏结局', icon: '🌟' }
];

const ArchivePage = ({ archive, onBack }) => {
  const [activeTab, setActiveTab] = useState('fragments');

  const renderContent = () => {
    switch (activeTab) {
      case 'fragments':
        return <FragmentGallery archive={archive} />;
      case 'letter':
        return <LetterProgress archive={archive} />;
      case 'chapters':
        return <ChapterReview archive={archive} />;
      case 'endings':
        return <HiddenEndings archive={archive} />;
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
          🏛️ 星塔档案馆
        </h1>
        <div className="w-20" />
      </div>

      <div className="flex gap-1 px-4 py-3 overflow-x-auto bg-star-purple/20">
        {ARCHIVE_TABS.map(tab => (
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
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ArchivePage;
