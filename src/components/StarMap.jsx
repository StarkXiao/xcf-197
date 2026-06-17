import { useState, useEffect, useRef } from 'react';
import { getChapterById, getChapterStats, NODE_TYPES } from '../data/gameData';

const StarMap = ({ chapterId, onSelectNode, onBack, onBackHome, currentProgress = {}, onClaimReward }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeDetail, setShowNodeDetail] = useState(false);
  const [animatingNodes, setAnimatingNodes] = useState([]);
  const mapRef = useRef(null);
  
  const chapter = getChapterById(chapterId);
  const chapterStats = getChapterStats(
    currentProgress.completedNodes || {}, 
    currentProgress.starRatings || {}
  ).find(s => s.chapterId === chapterId);

  const isNodeUnlocked = (node) => {
    if (!chapter) return false;
    
    const nodeKey = `${chapterId}-${node.id}`;
    if (currentProgress.completedNodes?.[nodeKey]) return true;
    
    const startNodes = chapter.nodes.filter(n => {
      const hasIncoming = chapter.nodes.some(other => 
        other.connections?.includes(n.id)
      );
      return !hasIncoming;
    });
    
    if (startNodes.some(n => n.id === node.id)) {
      return true;
    }
    
    const hasCompletedPredecessor = chapter.nodes.some(potentialPredecessor => {
      if (!potentialPredecessor.connections?.includes(node.id)) return false;
      const predKey = `${chapterId}-${potentialPredecessor.id}`;
      return currentProgress.completedNodes?.[predKey];
    });
    
    return hasCompletedPredecessor;
  };

  const isNodeCompleted = (node) => {
    const nodeKey = `${chapterId}-${node.id}`;
    return !!currentProgress.completedNodes?.[nodeKey];
  };

  const getNodeStars = (node) => {
    const nodeKey = `${chapterId}-${node.id}`;
    return currentProgress.starRatings?.[nodeKey] || 0;
  };

  const getNodeIcon = (type) => {
    const icons = {
      [NODE_TYPES.LEVEL]: '⭐',
      [NODE_TYPES.BOSS]: '👑',
      [NODE_TYPES.CHALLENGE]: '⚔️',
      [NODE_TYPES.REWARD]: '🎁'
    };
    return icons[type] || '⭐';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10b981',
      medium: '#fbbf24',
      hard: '#f97316',
      legendary: '#ec4899'
    };
    return colors[difficulty] || colors.easy;
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      easy: '简单',
      medium: '普通',
      hard: '困难',
      legendary: '传说'
    };
    return texts[difficulty] || '简单';
  };

  const handleNodeClick = (node) => {
    if (!isNodeUnlocked(node)) return;
    
    if (node.type === NODE_TYPES.REWARD) {
      const nodeKey = `${chapterId}-${node.id}`;
      if (!currentProgress.claimedRewards?.includes(nodeKey)) {
        onClaimReward && onClaimReward(chapterId, node.id, node.reward);
      }
      return;
    }
    
    setSelectedNode(node);
    setShowNodeDetail(true);
  };

  const handleStartGame = () => {
    if (selectedNode) {
      onSelectNode(chapterId, selectedNode.id, selectedNode.levelId);
      setShowNodeDetail(false);
    }
  };

  const getConnectionLines = () => {
    if (!chapter) return [];
    
    const lines = [];
    chapter.nodes.forEach(node => {
      if (node.connections) {
        node.connections.forEach(targetId => {
          const targetNode = chapter.nodes.find(n => n.id === targetId);
          if (targetNode) {
            const isUnlocked = isNodeCompleted(node) && isNodeUnlocked(targetNode);
            lines.push({
              id: `${node.id}-${targetId}`,
              from: node.position,
              to: targetNode.position,
              isUnlocked
            });
          }
        });
      }
    });
    return lines;
  };

  const connectionLines = getConnectionLines();

  useEffect(() => {
    if (chapter) {
      const completedNodes = chapter.nodes.filter(n => isNodeCompleted(n));
      completedNodes.forEach((node, index) => {
        setTimeout(() => {
          setAnimatingNodes(prev => [...prev, node.id]);
        }, index * 100);
      });
    }
  }, [chapterId]);

  if (!chapter) return null;

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full
            border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10
            transition-all text-sm z-20"
        >
          <span>←</span>
          <span>章节列表</span>
        </button>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="text-2xl">{chapter.icon}</span>
            <h2 className="text-xl font-bold" style={{ color: chapter.themeColor }}>
              {chapter.name}
            </h2>
          </div>
          <p className="text-xs text-white/50">{chapter.subtitle}</p>
        </div>
        {onBackHome && (
          <button
            onClick={onBackHome}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full
              border border-white/20 bg-white/5 text-white/70 hover:text-white hover:bg-white/10
              transition-all text-sm z-20"
          >
            <span>🏠</span>
            <span>首页</span>
          </button>
        )}
        {!onBackHome && <div className="w-20" />}
      </div>

      <div className="px-4 mb-4">
        <div className="bg-black/30 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ 
              width: `${chapterStats?.progress || 0}%`,
              background: `linear-gradient(90deg, ${chapter.themeColor}, ${chapter.themeColor}80)`
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/50">
          <span>进度 {chapterStats?.progress || 0}%</span>
          <span>⭐ {chapterStats?.earnedStars || 0}/{chapterStats?.totalStars || 0}</span>
        </div>
      </div>

      <div 
        ref={mapRef}
        className={`flex-1 relative overflow-hidden bg-gradient-to-b ${chapter.bgGradient}`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: Math.random() * 2 + 2 + 's',
                opacity: Math.random() * 0.5 + 0.3
              }}
            />
          ))}
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connectionLines.map(line => (
            <line
              key={line.id}
              x1={`${line.from.x}%`}
              y1={`${line.from.y}%`}
              x2={`${line.to.x}%`}
              y2={`${line.to.y}%`}
              stroke={line.isUnlocked ? chapter.themeColor : '#ffffff20'}
              strokeWidth={line.isUnlocked ? 3 : 2}
              strokeDasharray={line.isUnlocked ? 'none' : '8,8'}
              className="transition-all duration-500"
              style={{
                filter: line.isUnlocked ? `drop-shadow(0 0 6px ${chapter.themeColor})` : 'none'
              }}
            />
          ))}
        </svg>

        {chapter.nodes.map((node, index) => {
          const unlocked = isNodeUnlocked(node);
          const completed = isNodeCompleted(node);
          const stars = getNodeStars(node);
          const nodeKey = `${chapter.id}-${node.id}`;
          const isAnimating = animatingNodes.includes(node.id);
          const rewardClaimed = currentProgress.claimedRewards?.includes(nodeKey);
          const isReward = node.type === NODE_TYPES.REWARD;

          return (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500
                ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                ${isAnimating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
                ${isReward && completed && !rewardClaimed ? 'animate-bounce' : ''}
              `}
              style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
                transitionDelay: `${index * 0.05}s`,
                zIndex: node.type === NODE_TYPES.BOSS ? 10 : 5
              }}
              onClick={() => handleNodeClick(node)}
            >
              <div 
                className={`relative flex flex-col items-center
                  ${unlocked && !completed ? 'hover:scale-110 transition-transform' : ''}
                `}
              >
                <div 
                  className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl
                    transition-all duration-300
                    ${completed ? '' : unlocked ? 'animate-pulse-slow' : ''}
                  `}
                  style={{
                    backgroundColor: unlocked 
                      ? (completed ? `${chapter.themeColor}30` : `${chapter.themeColor}20`)
                      : '#ffffff10',
                    border: `3px solid ${unlocked 
                      ? (completed ? chapter.themeColor : `${chapter.themeColor}80`)
                      : '#ffffff20'}`,
                    boxShadow: unlocked && !completed
                      ? `0 0 20px ${chapter.themeColor}60, inset 0 0 20px ${chapter.themeColor}20`
                      : completed
                        ? `0 0 15px ${chapter.themeColor}40`
                        : 'none'
                  }}
                >
                  <span className={`${completed ? '' : unlocked ? '' : 'grayscale opacity-50'}`}>
                    {isReward && rewardClaimed ? '📭' : getNodeIcon(node.type)}
                  </span>
                  
                  {node.type === NODE_TYPES.BOSS && (
                    <div 
                      className="absolute -top-2 -right-2 text-lg"
                      style={{ filter: `drop-shadow(0 0 4px ${chapter.themeColor})` }}
                    >
                      👑
                    </div>
                  )}
                  
                  {node.isHidden && unlocked && !completed && (
                    <div className="absolute -top-1 -left-1 text-sm">
                      ❓
                    </div>
                  )}
                </div>

                {completed && stars > 0 && !isReward && (
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3].map(i => (
                      <span
                        key={i}
                        className={`text-xs ${i <= stars ? 'text-star-gold' : 'text-gray-600'}`}
                        style={{
                          filter: i <= stars ? 'drop-shadow(0 0 3px #ffd700)' : 'none'
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                )}

                <div className={`text-xs mt-1 whitespace-nowrap font-medium
                  ${unlocked ? 'text-white/80' : 'text-white/30'}
                `}>
                  {node.name}
                </div>

                {node.difficulty && unlocked && !isReward && (
                  <div 
                    className="text-[10px] px-1.5 py-0.5 rounded-full mt-0.5"
                    style={{ 
                      backgroundColor: `${getDifficultyColor(node.difficulty)}30`,
                      color: getDifficultyColor(node.difficulty)
                    }}
                  >
                    {getDifficultyText(node.difficulty)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showNodeDetail && selectedNode && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowNodeDetail(false)}
        >
          <div 
            className="w-full max-w-md bg-gradient-to-b from-star-purple/90 to-star-dark/90 rounded-t-3xl p-6 border-t-2 animate-slide-up"
            style={{ borderColor: `${chapter.themeColor}60` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ 
                  backgroundColor: `${chapter.themeColor}30`,
                  border: `2px solid ${chapter.themeColor}`,
                  boxShadow: `0 0 20px ${chapter.themeColor}40`
                }}
              >
                {getNodeIcon(selectedNode.type)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedNode.name}</h3>
                <p className="text-sm text-white/60">{selectedNode.description}</p>
                {selectedNode.difficulty && (
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ 
                      backgroundColor: `${getDifficultyColor(selectedNode.difficulty)}30`,
                      color: getDifficultyColor(selectedNode.difficulty)
                    }}
                  >
                    {getDifficultyText(selectedNode.difficulty)}
                  </span>
                )}
              </div>
            </div>

            {isNodeCompleted(selectedNode) && selectedNode.type !== NODE_TYPES.REWARD && (
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="text-xs text-white/50 mb-2">历史最佳</div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-white/50">星级</div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <span
                          key={i}
                          className={`text-lg ${i <= getNodeStars(selectedNode) ? 'text-star-gold' : 'text-gray-600'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/50">最高分</div>
                    <div className="text-lg font-bold text-star-gold">
                      {currentProgress.highScores?.[`${chapterId}-${selectedNode.id}`] || 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedNode.type === NODE_TYPES.REWARD && (
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="text-xs text-white/50 mb-2">奖励内容</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <span className="text-white">
                    {selectedNode.reward?.type === 'stardust' && `星尘 ×${selectedNode.reward.value}`}
                    {selectedNode.reward?.type === 'starShard' && `星光碎片 ×${selectedNode.reward.value}`}
                  </span>
                </div>
                {currentProgress.claimedRewards?.includes(`${chapterId}-${selectedNode.id}`) ? (
                  <div className="text-sm text-green-400 mt-2">✓ 已领取</div>
                ) : (
                  <div className="text-sm text-star-gold mt-2">点击节点领取奖励</div>
                )}
              </div>
            )}

            {selectedNode.type !== NODE_TYPES.REWARD && (
              <button
                onClick={handleStartGame}
                className="w-full py-4 rounded-full font-bold text-lg transition-all
                  bg-gradient-to-r from-star-gold/20 to-star-pink/20
                  border-2 border-star-gold/50 text-star-gold
                  hover:border-star-gold hover:shadow-lg hover:shadow-star-gold/30
                  active:scale-95"
              >
                {isNodeCompleted(selectedNode) ? '🔄 再次挑战' : '▶️ 开始挑战'}
              </button>
            )}
            
            {selectedNode.type === NODE_TYPES.REWARD && !currentProgress.claimedRewards?.includes(`${chapterId}-${selectedNode.id}`) && (
              <button
                onClick={() => {
                  onClaimReward && onClaimReward(chapterId, selectedNode.id, selectedNode.reward);
                  setShowNodeDetail(false);
                }}
                className="w-full py-4 rounded-full font-bold text-lg transition-all
                  bg-gradient-to-r from-star-gold/20 to-star-pink/20
                  border-2 border-star-gold/50 text-star-gold
                  hover:border-star-gold hover:shadow-lg hover:shadow-star-gold/30
                  active:scale-95"
              >
                🎁 领取奖励
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StarMap;
