import { useState } from 'react';
import BranchStoryReview from './storyCorridor/BranchStoryReview';
import ChoiceTimeline from './storyCorridor/ChoiceTimeline';
import ConstellationRelations from './storyCorridor/ConstellationRelations';
import RelationGraph from './storyCorridor/RelationGraph';
import FinaleSummary from './storyCorridor/FinaleSummary';

const CORRIDOR_TABS = [
  { id: 'branches', name: '分支剧情', icon: '📜' },
  { id: 'choices', name: '选择记录', icon: '⏳' },
  { id: 'relations', name: '守护关系', icon: '💫' },
  { id: 'finale', name: '终章汇总', icon: '🌟' }
];

const StoryCorridorPage = ({ archive, onBack }) => {
  const [activeTab, setActiveTab] = useState('branches');
  const [showRelationGraph, setShowRelationGraph] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'branches':
        return <BranchStoryReview archive={archive} />;
      case 'choices':
        return <ChoiceTimeline archive={archive} />;
      case 'relations':
        return (
          <ConstellationRelations
            archive={archive}
            onOpenRelationGraph={() => setShowRelationGraph(true)}
          />
        );
      case 'finale':
        return <FinaleSummary archive={archive} />;
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
          🎭 剧情回廊
        </h1>
        <div className="w-20" />
      </div>

      <div className="flex gap-1 px-4 py-3 overflow-x-auto bg-star-purple/20">
        {CORRIDOR_TABS.map(tab => (
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

      {showRelationGraph && (
        <RelationGraph
          archive={archive}
          onClose={() => setShowRelationGraph(false)}
        />
      )}
    </div>
  );
};

export default StoryCorridorPage;
