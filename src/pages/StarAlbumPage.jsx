import { useState } from 'react';
import Modal from '../components/Modal';
import { STAR_PATTERNS, RARITY_INFO, getRarityInfo, getStarAlbumStats, LEVELS, getLevelById } from '../data/gameData';

const FILTER_TABS = [
  { id: 'all', name: '全部', icon: '✨' },
  { id: 'common', name: '普通', icon: '⚪' },
  { id: 'rare', name: '稀有', icon: '🔵' },
  { id: 'epic', name: '史诗', icon: '🟣' },
  { id: 'legendary', name: '传说', icon: '🌟' }
];

const StarAlbumPage = ({ archive, onBack }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedStar, setSelectedStar] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const stats = getStarAlbumStats(archive.collectedFragments);
  const chaptersWithStatus = archive.getChaptersWithStatus();
  const collectionStats = archive.getCollectionStats();

  const filteredStars = activeFilter === 'all'
    ? STAR_PATTERNS
    : STAR_PATTERNS.filter(star => star.rarity === activeFilter);

  const handleStarClick = (star) => {
    setSelectedStar(star);
    setShowDetail(true);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setSelectedStar(null);
  };

  const getStarsForChapter = (chapterId) => {
    const level = getLevelById(chapterId);
    if (!level) return [];
    return level.stars.map(starId => STAR_PATTERNS.find(s => s.id === starId)).filter(Boolean);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
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
          📖 星纹图鉴
        </h1>
        <div className="w-20" />
      </div>

      <div className="px-4 py-6 bg-gradient-to-b from-star-purple/30 to-transparent">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold gold-gradient-text mb-2">
              {stats.collected} / {stats.total}
            </div>
            <div className="text-white/60 text-sm">
              已收集星座
            </div>
          </div>

          <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-6">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-star-gold to-star-pink rounded-full transition-all duration-700 progress-glow"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(stats.byRarity).map(([rarity, data]) => {
              const info = RARITY_INFO[rarity];
              return (
                <div
                  key={rarity}
                  className="text-center p-2 rounded-lg"
                  style={{ backgroundColor: info.bgColor }}
                >
                  <div className="text-lg">{info.icon}</div>
                  <div className="text-sm font-bold" style={{ color: info.color }}>
                    {data.collected}/{data.total}
                  </div>
                  <div className="text-xs text-white/50">{info.name}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-star-cyan text-lg font-bold">{collectionStats.unlockedChapters}/{collectionStats.totalChapters}</div>
              <div className="text-xs text-white/50">章节解锁</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-star-pink text-lg font-bold">{collectionStats.threeStarCount}</div>
              <div className="text-xs text-white/50">三星关卡</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-star-gold text-lg font-bold">{collectionStats.unlockedEndings}/{collectionStats.totalEndings}</div>
              <div className="text-xs text-white/50">隐藏结局</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-2 bg-star-purple/10">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
            ${viewMode === 'grid'
              ? 'bg-star-gold text-star-dark'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }
          `}
        >
          🌟 图鉴视图
        </button>
        <button
          onClick={() => setViewMode('chapter')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all
            ${viewMode === 'chapter'
              ? 'bg-star-gold text-star-dark'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }
          `}
        >
          📚 按章节
        </button>
      </div>

      {viewMode === 'grid' && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-star-purple/5 scrollbar-hide">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                ${activeFilter === tab.id
                  ? 'tab-active'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filteredStars.map((star, index) => {
              const isCollected = archive.collectedFragments.includes(star.id);
              const rarityInfo = getRarityInfo(star.rarity);
              const isNew = archive.unlockedConstellationStories?.includes(star.id) && 
                           archive.collectedFragments.includes(star.id);

              return (
                <div
                  key={star.id}
                  onClick={() => handleStarClick(star)}
                  className={`relative aspect-square rounded-xl cursor-pointer transition-all duration-300 card-hover
                    border-2 backdrop-blur-sm overflow-hidden
                    ${isCollected ? `rarity-${star.rarity}` : 'border-white/10 bg-white/5'}
                  `}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    backgroundColor: isCollected ? rarityInfo.bgColor : undefined
                  }}
                >
                  {isCollected ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <div
                        className="text-4xl md:text-5xl mb-2 animate-float"
                        style={{ filter: `drop-shadow(0 0 8px ${star.color})` }}
                      >
                        {star.symbol}
                      </div>
                      <div className="text-xs font-bold text-center text-white/90 truncate w-full">
                        {star.name}
                      </div>
                      <div
                        className="text-xs mt-1 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: rarityInfo.color + '30', color: rarityInfo.color }}
                      >
                        {rarityInfo.name}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                      <div className="text-4xl md:text-5xl mb-2 text-white/20">
                        ❓
                      </div>
                      <div className="text-xs font-bold text-center text-white/30">
                        ???
                      </div>
                      <div className="text-xs mt-1 text-white/20">
                        {rarityInfo.name}
                      </div>
                    </div>
                  )}

                  {isCollected && star.rarity === 'legendary' && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1 right-1 text-sm animate-pulse">
                        ✨
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {chaptersWithStatus.map((chapter) => {
              const chapterStars = getStarsForChapter(chapter.id);
              const collectedInChapter = chapterStars.filter(s => archive.collectedFragments.includes(s.id)).length;

              return (
                <div
                  key={chapter.id}
                  className={`rounded-2xl p-5 border-2 transition-all
                    ${chapter.unlocked
                      ? 'bg-star-purple/20 border-star-gold/30'
                      : 'bg-gray-800/20 border-gray-700/30 opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{chapter.unlocked ? '⭐' : '🔒'}</div>
                      <div>
                        <h3 className="font-bold text-white">
                          第 {chapter.id} 章 · {chapter.name}
                        </h3>
                        <p className="text-xs text-white/50">{chapter.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-star-gold font-bold">
                        {collectedInChapter}/{chapterStars.length}
                      </div>
                      <div className="text-xs text-white/50">星座收集</div>
                    </div>
                  </div>

                  {chapter.unlocked && chapter.bestScore > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-white/10">
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="text-star-gold font-bold text-sm">{chapter.bestScore}</div>
                        <div className="text-[10px] text-white/50">最高分</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="text-star-cyan font-bold text-sm">
                          {chapter.bestMoves || '-'}
                        </div>
                        <div className="text-[10px] text-white/50">最少步数</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="text-star-pink font-bold text-sm">
                          {chapter.bestTimeLeft ? formatTime(chapter.bestTimeLeft) : '-'}
                        </div>
                        <div className="text-[10px] text-white/50">最快通关</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {chapterStars.map((star) => {
                      const isCollected = archive.collectedFragments.includes(star.id);
                      const rarityInfo = getRarityInfo(star.rarity);

                      return (
                        <div
                          key={star.id}
                          onClick={() => isCollected && handleStarClick(star)}
                          className={`aspect-square rounded-lg border transition-all overflow-hidden
                            ${isCollected
                              ? `rarity-${star.rarity} cursor-pointer hover:scale-105`
                              : 'border-white/10 bg-white/5 opacity-50'
                            }
                          `}
                          style={{ backgroundColor: isCollected ? rarityInfo.bgColor : undefined }}
                        >
                          <div className="h-full flex flex-col items-center justify-center p-1">
                            <div
                              className={`text-2xl ${isCollected ? '' : 'grayscale opacity-30'}`}
                              style={{ filter: isCollected ? `drop-shadow(0 0 4px ${star.color})` : 'none' }}
                            >
                              {star.symbol}
                            </div>
                            <div className="text-[10px] font-medium text-center truncate w-full mt-1">
                              {isCollected ? star.name : '???'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredStars.length === 0 && viewMode === 'grid' && (
          <div className="text-center py-12 text-white/40">
            <div className="text-4xl mb-4">🔍</div>
            <p>该分类下暂无星座</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDetail && selectedStar}
        onClose={closeDetail}
        title=""
        showCloseButton={true}
      >
        {selectedStar && (
          <StarDetailModal 
            star={selectedStar} 
            isCollected={archive.collectedFragments.includes(selectedStar.id)}
            archive={archive}
          />
        )}
      </Modal>
    </div>
  );
};

const StarDetailModal = ({ star, isCollected, archive }) => {
  const rarityInfo = getRarityInfo(star.rarity);
  const chaptersWithStatus = archive.getChaptersWithStatus();
  
  const getRelatedChapter = () => {
    for (let i = 1; i <= 5; i++) {
      const level = getLevelById(i);
      if (level && level.stars.includes(star.id)) {
        return chaptersWithStatus.find(c => c.id === i);
      }
    }
    return null;
  };

  const relatedChapter = getRelatedChapter();

  if (!isCollected) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-6 text-white/20">❓</div>
        <h3 className="text-2xl font-bold text-white/40 mb-4">未解锁</h3>
        <p className="text-white/50 mb-6">完成特定条件以解锁此星座</p>

        <div
          className="p-4 rounded-xl border-2"
          style={{ borderColor: rarityInfo.borderColor, backgroundColor: rarityInfo.bgColor }}
        >
          <div className="text-sm text-white/70 mb-2">🔓 收录条件</div>
          <div className="text-white font-medium">{star.unlockCondition}</div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span style={{ color: rarityInfo.color }}>{rarityInfo.icon}</span>
          <span style={{ color: rarityInfo.color }} className="font-medium">
            {rarityInfo.name}品质
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      <div
        className="relative rounded-xl p-6 mb-6 border-2 text-center overflow-hidden"
        style={{ borderColor: rarityInfo.borderColor, backgroundColor: rarityInfo.bgColor }}
      >
        {star.rarity === 'legendary' && (
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
        )}

        <div
          className="text-6xl mb-4 inline-block animate-float"
          style={{ filter: `drop-shadow(0 0 15px ${star.color})` }}
        >
          {star.symbol}
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 glow-text">
          {star.name}
        </h2>

        <p className="text-white/70 text-sm mb-3">{star.description}</p>

        <div
          className="inline-block px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: rarityInfo.color + '30', color: rarityInfo.color }}
        >
          {rarityInfo.icon} {rarityInfo.name}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-1">元素</div>
            <div className="text-white font-medium">
              <span className="mr-1">🔮</span>
              {star.element}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-xs text-white/50 mb-1">守护神</div>
            <div className="text-white font-medium">
              <span className="mr-1">👤</span>
              {star.guardian}
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/50 mb-1">象征意义</div>
          <div className="text-white font-medium">
            <span className="mr-1">💫</span>
            {star.meaning}
          </div>
        </div>

        {relatedChapter && relatedChapter.bestScore > 0 && (
          <div className="bg-star-purple/20 rounded-lg p-4 border border-star-gold/20">
            <div className="text-sm font-bold text-star-gold mb-3 flex items-center gap-2">
              <span>🏆</span>
              <span>第{relatedChapter.id}章最佳成绩</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-star-gold font-bold">{relatedChapter.bestScore}</div>
                <div className="text-[10px] text-white/50">最高分</div>
              </div>
              <div className="text-center">
                <div className="text-star-cyan font-bold">{relatedChapter.bestMoves || '-'}</div>
                <div className="text-[10px] text-white/50">最少步数</div>
              </div>
              <div className="text-center">
                <div className="text-star-pink font-bold">
                  {relatedChapter.bestTimeLeft ? `${Math.floor(relatedChapter.bestTimeLeft / 60)}:${String(relatedChapter.bestTimeLeft % 60).padStart(2, '0')}` : '-'}
                </div>
                <div className="text-[10px] text-white/50">剩余时间</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-sm font-bold text-star-gold mb-3 flex items-center gap-2">
            <span>📜</span>
            <span>星座传说</span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            {star.story}
          </p>
        </div>

        <div className="bg-star-gold/10 border border-star-gold/30 rounded-lg p-3">
          <div className="text-xs text-star-gold/80 mb-1">✨ 收录条件</div>
          <div className="text-star-gold text-sm font-medium">
            {star.unlockCondition}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarAlbumPage;
