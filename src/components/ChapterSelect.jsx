import { CHAPTERS, getChapterStats, getRarityInfo } from '../data/gameData';

const ChapterSelect = ({ onSelectChapter, onContinue, currentProgress = {}, lastPlayedChapter = null, lastPlayedNode = null }) => {
  const chapterStats = getChapterStats(currentProgress.completedNodes || {}, currentProgress.starRatings || {});
  
  const isChapterUnlocked = (chapterId) => {
    const chapter = CHAPTERS.find(ch => ch.id === chapterId);
    if (!chapter) return false;
    if (!chapter.unlockCondition) return true;
    if (chapter.unlockCondition.type === 'chapter') {
      const prevChapterStats = chapterStats.find(s => s.chapterId === chapter.unlockCondition.value);
      return prevChapterStats?.isCompleted || currentProgress.unlockedChapters?.includes(chapterId);
    }
    return false;
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

  const getNodeIcon = (type) => {
    const icons = {
      level: '⭐',
      boss: '👑',
      challenge: '⚔️',
      reward: '🎁'
    };
    return icons[type] || '⭐';
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">🗺️</div>
        <h1 className="text-3xl md:text-4xl font-bold text-star-gold mb-2 glow-text">
          星图征程
        </h1>
        <p className="text-white/60 text-sm">
          选择章节，踏上你的星途之旅
        </p>
      </div>

      {lastPlayedChapter && lastPlayedNode && (
        <button
          onClick={() => onContinue && onContinue(lastPlayedChapter, lastPlayedNode)}
          className="mb-8 px-8 py-3 rounded-full font-bold text-lg transition-all
            bg-gradient-to-r from-star-gold/20 to-star-pink/20 
            border-2 border-star-gold/50 text-star-gold
            hover:border-star-gold hover:shadow-lg hover:shadow-star-gold/30
            animate-pulse-slow"
        >
          ▶️ 继续冒险 · 第{lastPlayedChapter}章
        </button>
      )}

      <div className="w-full max-w-2xl space-y-4">
        {CHAPTERS.map((chapter, index) => {
          const stats = chapterStats.find(s => s.chapterId === chapter.id);
          const unlocked = isChapterUnlocked(chapter.id);
          const isLastPlayed = lastPlayedChapter === chapter.id;

          return (
            <div
              key={chapter.id}
              className={`relative overflow-hidden rounded-2xl transition-all duration-500
                ${unlocked 
                  ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl' 
                  : 'opacity-60 cursor-not-allowed'
                }
                ${isLastPlayed ? 'ring-2 ring-star-gold ring-offset-2 ring-offset-transparent' : ''}
              `}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: unlocked ? 'slideIn 0.5s ease-out forwards' : 'none',
                opacity: unlocked ? 1 : 0.5
              }}
              onClick={() => unlocked && onSelectChapter(chapter.id)}
            >
              <div className={`bg-gradient-to-r ${chapter.bgGradient} p-6 border-2 rounded-2xl`}
                style={{ borderColor: `${chapter.themeColor}40` }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="text-5xl w-16 h-16 flex items-center justify-center rounded-xl"
                    style={{ 
                      backgroundColor: `${chapter.themeColor}20`,
                      boxShadow: unlocked ? `0 0 20px ${chapter.themeColor}40` : 'none'
                    }}
                  >
                    {unlocked ? chapter.icon : '🔒'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ 
                          backgroundColor: `${chapter.themeColor}30`,
                          color: chapter.themeColor 
                        }}
                      >
                        第 {chapter.id} 章
                      </span>
                      {isLastPlayed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-star-gold/20 text-star-gold">
                          上次进度
                        </span>
                      )}
                    </div>
                    <h3 className={`text-xl font-bold mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                      {chapter.name}
                    </h3>
                    <p className="text-sm text-white/60">
                      {chapter.subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    {unlocked && stats && (
                      <>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-star-gold">⭐</span>
                          <span className="font-bold text-star-gold">
                            {stats.earnedStars}/{stats.totalStars}
                          </span>
                        </div>
                        <div className="text-xs text-white/50">
                          进度 {stats.progress}%
                        </div>
                      </>
                    )}
                    {!unlocked && (
                      <div className="text-xs text-gray-500">
                        通关第{chapter.unlockCondition?.value}章解锁
                      </div>
                    )}
                  </div>
                </div>

                {unlocked && stats && (
                  <div className="mt-4">
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${stats.progress}%`,
                          background: `linear-gradient(90deg, ${chapter.themeColor}, ${chapter.themeColor}80)`
                        }}
                      />
                    </div>
                  </div>
                )}

                {unlocked && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {chapter.nodes.slice(0, 5).map((node, nodeIndex) => {
                      const nodeKey = `${chapter.id}-${node.id}`;
                      const isCompleted = currentProgress.completedNodes?.[nodeKey];
                      const nodeStars = currentProgress.starRatings?.[nodeKey] || 0;

                      return (
                        <div
                          key={node.id}
                          className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm
                            transition-all duration-300
                            ${isCompleted 
                              ? 'bg-star-gold/30 border border-star-gold/50' 
                              : 'bg-white/5 border border-white/10'
                            }
                          `}
                          title={node.name}
                        >
                          {isCompleted ? (
                            <span className="text-yellow-400">✓</span>
                          ) : (
                            <span className="text-white/40">{getNodeIcon(node.type)}</span>
                          )}
                        </div>
                      );
                    })}
                    {chapter.nodes.length > 5 && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs text-white/40 bg-white/5 border border-white/10">
                        +{chapter.nodes.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                <div 
                  className="w-full h-full rounded-full blur-3xl"
                  style={{ backgroundColor: chapter.themeColor }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-xs text-white/40 max-w-md">
        <p>💡 完成每个章节的BOSS节点后解锁下一章节</p>
        <p className="mt-1">🌟 收集星星获得更多奖励</p>
      </div>
    </div>
  );
};

export default ChapterSelect;
