import { useState } from 'react';
import Modal from '../components/Modal';
import { STAR_PATTERNS, RARITY_INFO, getRarityInfo, getStarAlbumStats } from '../data/gameData';

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

  const stats = getStarAlbumStats(archive.collectedFragments);

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

          <div className="grid grid-cols-4 gap-2">
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
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-star-purple/10 scrollbar-hide">
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

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {filteredStars.map((star, index) => {
            const isCollected = archive.collectedFragments.includes(star.id);
            const rarityInfo = getRarityInfo(star.rarity);

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

        {filteredStars.length === 0 && (
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
          <StarDetailModal star={selectedStar} isCollected={archive.collectedFragments.includes(selectedStar.id)} />
        )}
      </Modal>
    </div>
  );
};

const StarDetailModal = ({ star, isCollected }) => {
  const rarityInfo = getRarityInfo(star.rarity);

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
