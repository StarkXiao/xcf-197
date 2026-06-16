import { LEVELS, getAchievementStats, CURRENCY_INFO, CURRENCY_TYPES } from '../data/gameData';

const HomePage = ({ onStartGame, onSelectLevel, onOpenArchive, onOpenStarAlbum, onOpenDailyChallenge, onOpenAchievements, onOpenShop, unlockedLevel = 1, highScores = {}, collectedStars = 0, achievements, shop }) => {
  const achievementStats = achievements ? getAchievementStats(achievements.unlockedAchievements) : null;
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {shop && (
        <div className="absolute top-4 right-4 flex gap-3">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 rounded-full border border-blue-500/30">
            <span style={{ color: CURRENCY_INFO[CURRENCY_TYPES.STARDUST]?.color }}>
              {CURRENCY_INFO[CURRENCY_TYPES.STARDUST]?.icon}
            </span>
            <span className="text-sm font-bold text-blue-400">
              {shop.stardust.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 rounded-full border border-purple-500/30">
            <span style={{ color: CURRENCY_INFO[CURRENCY_TYPES.STAR_SHARD]?.color }}>
              {CURRENCY_INFO[CURRENCY_TYPES.STAR_SHARD]?.icon}
            </span>
            <span className="text-sm font-bold text-purple-400">
              {shop.starShards.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <div className="text-6xl mb-4 animate-float">🌟</div>
        <h1 className="text-4xl md:text-5xl font-bold text-star-gold mb-4 glow-text">
          星塔占卜
        </h1>
        <p className="text-lg text-star-cyan mb-2">
          修复破碎情书
        </p>
        <p className="text-sm text-white/60 max-w-md">
          翻开神秘的星纹卡牌，配对相同的星座，
          逐步修复那封被星光撕碎的情书...
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => onStartGame(1)}
          className="btn-star text-lg px-12 py-4 animate-pulse-slow"
        >
          ✨ 开始占卜 ✨
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={onOpenDailyChallenge}
          className="px-8 py-4 rounded-full font-bold transition-all
            border-2 border-star-pink/50 text-star-pink hover:bg-star-pink/10 hover:border-star-pink hover:shadow-lg hover:shadow-star-pink/30
            relative overflow-hidden group"
        >
          <span className="relative z-10">🔮 每日挑战</span>
          <span className="absolute -top-1 -right-1 bg-star-pink text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
            NEW
          </span>
        </button>
        <button
          onClick={onOpenArchive}
          className="px-8 py-4 rounded-full font-bold transition-all
            border-2 border-star-cyan/50 text-star-cyan hover:bg-star-cyan/10 hover:border-star-cyan hover:shadow-lg hover:shadow-star-cyan/30"
        >
          🏛️ 星塔档案馆
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <button
          onClick={onOpenStarAlbum}
          className="px-8 py-4 rounded-full font-bold transition-all
            border-2 border-star-gold/50 text-star-gold hover:bg-star-gold/10 hover:border-star-gold hover:shadow-lg hover:shadow-star-gold/30
            relative overflow-hidden group"
        >
          <span className="relative z-10">📖 星纹图鉴</span>
          {collectedStars > 0 && (
            <span className="absolute -top-1 -right-1 bg-star-gold text-star-dark text-xs px-2 py-0.5 rounded-full font-bold">
              {collectedStars}/12
            </span>
          )}
        </button>
      </div>

      {onOpenShop && (
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={onOpenShop}
            className="px-8 py-4 rounded-full font-bold transition-all
              border-2 border-star-orange/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/30
              relative overflow-hidden group"
          >
            <span className="relative z-10">🏪 占卜商店</span>
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
              NEW
            </span>
          </button>
        </div>
      )}

      {onOpenAchievements && (
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={onOpenAchievements}
            className="px-8 py-4 rounded-full font-bold transition-all
              border-2 border-star-purple/50 text-white hover:bg-star-purple/30 hover:border-star-purple hover:shadow-lg hover:shadow-star-purple/30
              relative overflow-hidden group"
          >
            <span className="relative z-10">🏆 成就墙</span>
            {achievementStats && achievementStats.unlocked > 0 && (
              <span className="absolute -top-1 -right-1 bg-star-pink text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {achievementStats.unlocked}/{achievementStats.total}
              </span>
            )}
            {achievements?.newAchievements?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                NEW
              </span>
            )}
          </button>
        </div>
      )}

      <div className="w-full max-w-md">
        <h3 className="text-lg font-bold text-star-gold mb-4 text-center">
          选择关卡
        </h3>
        <div className="space-y-3">
          {LEVELS.map((level) => {
            const isUnlocked = level.id <= unlockedLevel;
            const highScore = highScores[level.id] || 0;

            return (
              <div
                key={level.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer
                  ${isUnlocked
                    ? 'border-star-gold/50 bg-star-purple/30 hover:bg-star-purple/50 hover:border-star-gold'
                    : 'border-gray-600/30 bg-gray-800/30 opacity-50 cursor-not-allowed'
                  }
                `}
                onClick={() => isUnlocked && onSelectLevel(level.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {isUnlocked ? '⭐' : '🔒'}
                    </div>
                    <div>
                      <div className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        第 {level.id} 关 · {level.name}
                      </div>
                      <div className="text-sm text-white/60">
                        {level.description}
                      </div>
                    </div>
                  </div>
                  {highScore > 0 && (
                    <div className="text-right">
                      <div className="text-star-gold text-sm font-bold">
                        {highScore}
                      </div>
                      <div className="text-xs text-white/40">
                        最高分
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-white/50">
                  <span>⏱️ {level.timeLimit}秒</span>
                  <span>🃏 {level.pairs}对</span>
                  <span>🎯 {level.baseScore}分</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-white/40">
        <p>💡 提示：快速连续配对可获得连击加分</p>
      </div>
    </div>
  );
};

export default HomePage;
