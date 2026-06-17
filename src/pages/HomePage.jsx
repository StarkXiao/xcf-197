import { useState } from 'react';
import { LEVELS, getAchievementStats, CURRENCY_INFO, CURRENCY_TYPES, getCurrentSeason } from '../data/gameData';

const HomePage = ({ onStartGame, onSelectLevel, onOpenArchive, onOpenStarAlbum, onOpenDailyChallenge, onOpenAchievements, onOpenShop, onOpenStoryCorridor, onOpenSeasonChallenge, onOpenLetterWorkshop, onOpenVisitorCommission, onOpenRepairRoom, onOpenChapterSelect, unlockedLevel = 1, highScores = {}, collectedStars = 0, achievements, shop, seasonChallenge, letterWorkshop, visitorCommission, repairRoom, chapterProgress = {} }) => {
  const [showClassicLevels, setShowClassicLevels] = useState(false);
  const currentSeason = getCurrentSeason();
  const hasUnclaimedRewards = seasonChallenge?.unclaimedStageRewardsCount > 0 || 
                              seasonChallenge?.unclaimedTaskRewardsCount > 0;
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
          onClick={onOpenChapterSelect}
          className="btn-star text-lg px-12 py-4 animate-pulse-slow relative"
        >
          <span className="flex items-center gap-2 justify-center">
            🗺️ 星图征程
          </span>
          {chapterProgress?.lastPlayedChapter && (
            <span className="absolute -top-2 -right-2 bg-star-pink text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
              继续冒险
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={() => onStartGame(1)}
          className="px-8 py-3 rounded-full font-bold transition-all
            border-2 border-star-cyan/30 text-star-cyan/70 hover:bg-star-cyan/10 hover:border-star-cyan/50
            relative overflow-hidden group"
        >
          <span className="relative z-10">⚡ 快速开始 · 第1关</span>
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
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
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

      {onOpenStoryCorridor && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={onOpenStoryCorridor}
            className="px-8 py-4 rounded-full font-bold transition-all
              border-2 border-amber-400/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/30
              relative overflow-hidden group"
          >
            <span className="relative z-10">🎭 剧情回廊</span>
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
              NEW
            </span>
          </button>
        </div>
      )}

      {onOpenLetterWorkshop && letterWorkshop && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={onOpenLetterWorkshop}
            className="px-8 py-4 rounded-full font-bold transition-all
              border-2 border-rose-400/50 text-rose-300 hover:bg-rose-500/10 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-400/30
              relative overflow-hidden group"
          >
            <span className="relative z-10">✉️ 信笺工坊</span>
            {letterWorkshop.getWorkshopStats().completedLetters > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {letterWorkshop.getWorkshopStats().completedLetters}/{letterWorkshop.getWorkshopStats().totalLetters}
              </span>
            )}
            {letterWorkshop.getWorkshopStats().completedLetters === 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                NEW
              </span>
            )}
          </button>
        </div>
      )}

      {onOpenVisitorCommission && visitorCommission && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={onOpenVisitorCommission}
            className="px-8 py-4 rounded-full font-bold transition-all
              border-2 border-teal-400/50 text-teal-300 hover:bg-teal-500/10 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-400/30
              relative overflow-hidden group"
          >
            <span className="relative z-10">🏛️ 访客委托</span>
            {visitorCommission.getOverallStats().metCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {visitorCommission.getOverallStats().metCount}人
              </span>
            )}
            {(visitorCommission.newVisitorNotification || visitorCommission.getAvailableVisitorsCount() > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
                NEW
              </span>
            )}
            {visitorCommission.getOverallStats().metCount === 0 && !visitorCommission.newVisitorNotification && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                NEW
              </span>
            )}
          </button>
        </div>
      )}

      {onOpenRepairRoom && repairRoom && (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <button
            onClick={onOpenRepairRoom}
            className="px-8 py-4 rounded-full font-bold transition-all
              border-2 border-amber-400/50 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-400/30
              relative overflow-hidden group"
          >
            <span className="relative z-10">🏛️ 情书修复室</span>
            {repairRoom.getStats().repairedFragments > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {repairRoom.getStats().overallProgress}%
              </span>
            )}
            {repairRoom.getStats().repairedFragments === 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                NEW
              </span>
            )}
            {repairRoom.newlyUnlockedSentences?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
                {repairRoom.newlyUnlockedSentences.length}
              </span>
            )}
          </button>
        </div>
      )}

      {onOpenSeasonChallenge && seasonChallenge && (
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={onOpenSeasonChallenge}
            className="px-8 py-4 rounded-full font-bold transition-all
              border-2 border-indigo-400/50 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-400/30
              relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, ${currentSeason.primaryColor}22 0%, ${currentSeason.secondaryColor}22 100%)`,
              borderColor: `${currentSeason.primaryColor}66`
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-xl">{currentSeason.icon}</span>
              <span>{currentSeason.name}</span>
            </span>
            {hasUnclaimedRewards && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
                {seasonChallenge.unclaimedStageRewardsCount + seasonChallenge.unclaimedTaskRewardsCount}
              </span>
            )}
            {!hasUnclaimedRewards && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                NEW
              </span>
            )}
          </button>
        </div>
      )}

      <div className="w-full max-w-md mt-4">
        <button
          onClick={() => setShowClassicLevels(!showClassicLevels)}
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 
            text-white/50 hover:text-white/70 hover:bg-white/10 transition-all
            flex items-center justify-between"
        >
          <span className="text-sm">📋 旧版关卡列表（经典模式）</span>
          <span className={`transition-transform duration-300 ${showClassicLevels ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {showClassicLevels && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="text-xs text-white/40 text-center mb-2">
              ⚠️ 建议使用「星图征程」体验完整章节剧情
            </div>
            {LEVELS.map((level) => {
              const isUnlocked = level.id <= unlockedLevel;
              const highScore = highScores[level.id] || 0;

              return (
                <div
                  key={level.id}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${isUnlocked
                      ? 'border-star-gold/30 bg-star-purple/20 hover:bg-star-purple/40 hover:border-star-gold/50'
                      : 'border-gray-600/20 bg-gray-800/20 opacity-50 cursor-not-allowed'
                    }
                  `}
                  onClick={() => isUnlocked && onSelectLevel(level.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-xl opacity-70">
                        {isUnlocked ? '⭐' : '🔒'}
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${isUnlocked ? 'text-white/80' : 'text-gray-500'}`}>
                          第 {level.id} 关 · {level.name}
                        </div>
                        <div className="text-xs text-white/50">
                          {level.description}
                        </div>
                      </div>
                    </div>
                    {highScore > 0 && (
                      <div className="text-right">
                        <div className="text-star-gold text-xs font-bold">
                          {highScore}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-xs text-white/40">
        <p>💡 提示：快速连续配对可获得连击加分</p>
      </div>
    </div>
  );
};

export default HomePage;
