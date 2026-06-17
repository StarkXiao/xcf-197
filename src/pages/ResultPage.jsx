import { useState, useEffect } from 'react';
import { getLevelById, FULL_LETTER, getRarityInfo, getAchievementById, getTitleById, getStarRailTitle, getChapterById, getNodeById, getChapterStats, LOVE_LETTER_CONFIG } from '../data/gameData';

const ResultPage = ({ isWin, result, onRestart, onNextLevel, onHome, hasNextLevel, achievements, onOpenAchievements, isChapterMode = false, currentChapter, currentNodeId, onContinue, onBackToStarMap, chapterProgress = {} }) => {
  const level = getLevelById(result?.levelId || 1);
  const chapter = currentChapter ? getChapterById(currentChapter) : null;
  const currentNode = currentChapter && currentNodeId ? getNodeById(currentChapter, currentNodeId) : null;
  const chapterStats = currentChapter ? getChapterStats(
    chapterProgress.completedNodes || {}, 
    chapterProgress.starRatings || {}
  ).find(s => s.chapterId === currentChapter) : null;
  
  const [showAchievementSection, setShowAchievementSection] = useState(false);
  const [showChapterProgress, setShowChapterProgress] = useState(false);
  const [showLoveLetterEnding, setShowLoveLetterEnding] = useState(false);
  const [endingStage, setEndingStage] = useState(0);

  const hasLoveLetterResult = result?.loveLetterResult?.ending;
  const loveLetterEnding = result?.loveLetterResult?.ending;
  const loveLetterStats = result?.loveLetterStats;
  const loveLetterFinalAffection = result?.loveLetterResult?.affection ?? loveLetterStats?.affection ?? 0;
  const loveLetterMaxCombo = result?.loveLetterResult?.maxCombo ?? result?.maxCombo ?? 0;

  useEffect(() => {
    if (hasLoveLetterResult && isWin) {
      const timer1 = setTimeout(() => {
        setShowLoveLetterEnding(true);
        setEndingStage(1);
      }, 500);
      
      const timer2 = setTimeout(() => {
        setEndingStage(2);
      }, 2500);
      
      const timer3 = setTimeout(() => {
        setEndingStage(3);
      }, 5000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [hasLoveLetterResult, isWin]);

  useEffect(() => {
    if (achievements?.newAchievements?.length > 0) {
      const timer = setTimeout(() => {
        setShowAchievementSection(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [achievements?.newAchievements?.length]);

  useEffect(() => {
    if (isChapterMode && isWin) {
      const timer = setTimeout(() => {
        setShowChapterProgress(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isChapterMode, isWin]);

  const getStarsRating = () => {
    if (!isWin) return 0;
    const { timeLeft, moves } = result;
    const timeRatio = timeLeft / (level?.timeLimit || 60);
    const moveRatio = (level?.pairs || 4) * 2 / (moves || 1);

    if (timeRatio > 0.5 && moveRatio > 0.8) return 3;
    if (timeRatio > 0.3 && moveRatio > 0.5) return 2;
    return 1;
  };

  const stars = getStarsRating();

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {showLoveLetterEnding && loveLetterEnding && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${loveLetterEnding.color}20 0%, ${loveLetterEnding.color}40 50%, ${loveLetterEnding.color}60 100%)`,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="text-center max-w-lg mx-auto px-6">
            {endingStage >= 1 && (
              <div className="animate-fade-in mb-8">
                <div className="text-8xl mb-6 animate-float">
                  {loveLetterEnding.icon}
                </div>
                <h2 
                  className="text-4xl font-bold mb-2 animate-slide-up"
                  style={{ 
                    color: loveLetterEnding.color,
                    textShadow: `0 0 30px ${loveLetterEnding.color}60`
                  }}
                >
                  {loveLetterEnding.title}
                </h2>
                <p className="text-white/80 text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  {loveLetterEnding.subtitle}
                </p>
              </div>
            )}

            {endingStage >= 2 && (
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div 
                  className="rounded-2xl p-6 mb-6 border-2 max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: `${loveLetterEnding.color}20`,
                    borderColor: `${loveLetterEnding.color}60`
                  }}
                >
                  <p 
                    className="text-white/90 whitespace-pre-line leading-relaxed text-sm"
                    style={{ color: loveLetterEnding.isSuccess ? '#fce7f3' : '#e0e7ff' }}
                  >
                    {loveLetterEnding.fullText}
                  </p>
                </div>
              </div>
            )}

            {endingStage >= 3 && (
              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <button
                  onClick={() => setShowLoveLetterEnding(false)}
                  className="btn-star px-8 py-3 text-lg font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${loveLetterEnding.color}40 0%, ${loveLetterEnding.color}20 100%)`,
                    border: `2px solid ${loveLetterEnding.color}80`
                  }}
                >
                  查看结算详情 →
                </button>
              </div>
            )}
          </div>

          {loveLetterEnding.id === 'confession_success' && (
            <>
              <div className="absolute top-1/4 left-1/4 text-4xl animate-float" style={{ animationDelay: '0.5s' }}>💕</div>
              <div className="absolute top-1/3 right-1/4 text-3xl animate-float" style={{ animationDelay: '0.7s' }}>💖</div>
              <div className="absolute bottom-1/3 left-1/3 text-3xl animate-float" style={{ animationDelay: '0.9s' }}>✨</div>
              <div className="absolute bottom-1/4 right-1/3 text-4xl animate-float" style={{ animationDelay: '1.1s' }}>💗</div>
            </>
          )}

          {loveLetterEnding.id === 'confession_failure' && (
            <>
              <div className="absolute top-1/4 left-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '0.5s' }}>⭐</div>
              <div className="absolute top-1/3 right-1/4 text-2xl animate-float opacity-50" style={{ animationDelay: '0.7s' }}>💫</div>
              <div className="absolute bottom-1/3 left-1/3 text-2xl animate-float opacity-50" style={{ animationDelay: '0.9s' }}>🌙</div>
              <div className="absolute bottom-1/4 right-1/3 text-3xl animate-float opacity-50" style={{ animationDelay: '1.1s' }}>✨</div>
            </>
          )}
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">
            {isWin ? '🎉' : '💔'}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isWin ? 'text-star-gold glow-text' : 'text-star-pink'}`}>
            {isWin ? '恭喜通关！' : '时间到...'}
          </h1>
          <p className="text-white/70">
            {isWin
              ? `第 ${level?.id} 关 · ${level?.name}`
              : '别灰心，再试一次吧！'
            }
          </p>
        </div>

        {isWin && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className={`text-4xl transition-all duration-500 ${
                  i <= stars
                    ? 'text-star-gold animate-pulse'
                    : 'text-gray-600'
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  filter: i <= stars ? 'drop-shadow(0 0 10px #ffd700)' : 'none'
                }}
              >
                ⭐
              </span>
            ))}
          </div>
        )}

        <div className="bg-star-purple/30 rounded-2xl p-6 mb-6 border border-star-gold/20">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">最终得分</div>
              <div className="text-2xl font-bold text-star-gold">
                {result?.score || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">步数</div>
              <div className="text-2xl font-bold text-white">
                {result?.moves || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">
                {isWin ? '剩余时间' : '用时'}
              </div>
              <div className="text-2xl font-bold text-star-cyan">
                {isWin
                  ? `${Math.floor((result?.timeLeft || 0) / 60)}:${String((result?.timeLeft || 0) % 60).padStart(2, '0')}`
                  : `${level?.timeLimit || 0}s`
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">最高连击</div>
              <div className="text-2xl font-bold text-star-pink">
                x{result?.maxCombo || 0}
              </div>
            </div>
          </div>
        </div>

        {result?.railTitle && (
          <div 
            className="rounded-2xl p-5 mb-6 border-2 text-center animate-slide-in"
            style={{ 
              backgroundColor: `${getRarityInfo(result.railTitle.rarity)?.color}20`,
              borderColor: `${getRarityInfo(result.railTitle.rarity)?.color}60`,
              boxShadow: `0 0 20px ${getRarityInfo(result.railTitle.rarity)?.color}30`
            }}
          >
            <div className="text-xs text-white/60 mb-2">🌟 星轨专属称号</div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl">{result.railTitle.icon}</span>
              <span 
                className="text-xl font-bold"
                style={{ color: getRarityInfo(result.railTitle.rarity)?.color }}
              >
                {result.railTitle.name}
              </span>
            </div>
            <div className="text-xs text-white/60">
              {result.railTitle.description}
            </div>
            <div className="text-xs text-star-gold/80 mt-2">
              最高连击: x{result.railMaxCombo || result.maxCombo || 0}
            </div>
          </div>
        )}

        {loveLetterEnding && isWin && (
          <div 
            className="rounded-2xl p-5 mb-6 border-2 animate-slide-in"
            style={{ 
              backgroundColor: `${loveLetterEnding.color}20`,
              borderColor: `${loveLetterEnding.color}60`
            }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-4xl">{loveLetterEnding.icon}</span>
              <div>
                <h3 
                  className="text-xl font-bold"
                  style={{ color: loveLetterEnding.color }}
                >
                  {loveLetterEnding.name}
                </h3>
                <p className="text-sm text-white/70">{loveLetterEnding.subtitle}</p>
              </div>
            </div>

            <p className="text-sm text-white/80 text-center mb-4">
              {loveLetterEnding.description}
            </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">最终好感度</div>
                  <div 
                    className="text-lg font-bold"
                    style={{ color: loveLetterEnding.color }}
                  >
                    {loveLetterFinalAffection > 0 ? '+' : ''}{loveLetterFinalAffection}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">完美操作</div>
                  <div className="text-lg font-bold text-green-400">
                    {loveLetterStats?.perfectMoves ?? 0}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">失误次数</div>
                  <div className="text-lg font-bold text-red-400">
                    {loveLetterStats?.mistakes ?? 0}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">超时次数</div>
                  <div className="text-lg font-bold text-orange-400">
                    {loveLetterStats?.timeouts ?? 0}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">重开次数</div>
                  <div className="text-lg font-bold text-yellow-400">
                    {loveLetterStats?.restarts ?? 0}
                  </div>
                </div>
                <div className="bg-black/20 rounded-lg p-3 text-center">
                  <div className="text-xs text-white/50 mb-1">最高连击</div>
                  <div className="text-lg font-bold text-purple-400">
                    x{loveLetterMaxCombo}
                  </div>
                </div>
              </div>

            {result?.loveLetterResult?.breakdown && Array.isArray(result.loveLetterResult.breakdown) && (
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-xs text-white/50 mb-2 text-center">结局判定依据</div>
                <div className="space-y-2">
                  {result.loveLetterResult.breakdown.map((item, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between text-sm ${item.isTotal ? 'pt-2 mt-2 border-t border-white/10' : ''}`}
                    >
                      <span className={item.isTotal ? 'text-white font-bold' : 'text-white/70'}>{item.label}</span>
                      <span 
                        className={`font-bold ${item.isTotal ? 'text-base' : ''}`}
                        style={{ 
                          color: item.isTotal 
                            ? (item.value >= LOVE_LETTER_CONFIG?.SUCCESS_THRESHOLD ? '#ec4899' : '#6366f1')
                            : (item.value >= 0 ? '#10b981' : '#ef4444')
                        }}
                      >
                        {item.value > 0 && !item.isTotal ? '+' : ''}{item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isWin && achievements?.newAchievements?.length > 0 && showAchievementSection && (
          <div className="bg-star-purple/30 rounded-2xl p-5 mb-6 border border-star-gold/30 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="font-bold text-star-gold">成就解锁</span>
                <span className="text-xs bg-star-gold/20 text-star-gold px-2 py-0.5 rounded-full">
                  新解锁 ×{achievements.newAchievements.length}
                </span>
              </div>
              {onOpenAchievements && (
                <button
                  onClick={onOpenAchievements}
                  className="text-xs text-star-cyan hover:text-star-cyan/80 transition-colors"
                >
                  查看全部 →
                </button>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {achievements.newAchievements.map((achvId, index) => {
                const achievement = getAchievementById(achvId);
                if (!achievement) return null;
                const rarityInfo = getRarityInfo(achievement.rarity);
                
                return (
                  <div
                    key={achievement.id}
                    className={`flex-shrink-0 w-24 p-3 rounded-xl border-2 rarity-${achievement.rarity} bg-star-purple/50 text-center animate-slide-in`}
                    style={{
                      animationDelay: `${index * 0.15}s`
                    }}
                  >
                    <div
                      className="text-3xl mb-1"
                      style={{
                        filter: `drop-shadow(0 0 6px ${rarityInfo.color})`
                      }}
                    >
                      {achievement.icon}
                    </div>
                    <div
                      className="text-xs font-bold truncate"
                      style={{ color: rarityInfo.color }}
                    >
                      {achievement.name}
                    </div>
                    <div className="text-[10px] text-star-gold mt-1">
                      +{achievement.points}点
                    </div>
                  </div>
                );
              })}
            </div>

            {achievements.newAchievements.some(id => {
              const achv = getAchievementById(id);
              return achv?.titleReward;
            }) && (
              <div className="mt-3 pt-3 border-t border-star-gold/20">
                <div className="text-xs text-star-cyan mb-2">🎖️ 解锁新称号</div>
                <div className="flex gap-2 flex-wrap">
                  {achievements.newAchievements
                    .map(id => getAchievementById(id))
                    .filter(achv => achv?.titleReward)
                    .map(achv => {
                      const title = getTitleById(achv.titleReward);
                      if (!title) return null;
                      const rarityInfo = getRarityInfo(title.rarity);
                      return (
                        <div
                          key={title.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: `${rarityInfo.color}20`,
                            color: rarityInfo.color
                          }}
                        >
                          <span>{title.icon}</span>
                          <span>{title.name}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {isWin && level?.letterFragment && (
          <div className="letter-fragment p-6 mb-8 max-w-sm mx-auto">
            <div className="text-center text-xs text-amber-700/60 mb-3">
              ✨ 情书碎片 ✨
            </div>
            <p className="text-center italic leading-relaxed text-amber-900">
              "{level.letterFragment}"
            </p>
          </div>
        )}

        {isWin && !hasNextLevel && !isChapterMode && (
          <div className="letter-fragment p-6 mb-8 max-w-sm mx-auto">
            <div className="text-center text-xs text-amber-700/60 mb-3">
              💌 完整情书 💌
            </div>
            <div className="text-center text-xs text-amber-900/80 whitespace-pre-line leading-relaxed">
              {FULL_LETTER}
            </div>
          </div>
        )}

        {isChapterMode && isWin && showChapterProgress && chapter && chapterStats && (
          <div className="bg-star-purple/30 rounded-2xl p-5 mb-6 border border-star-gold/20 animate-slide-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{chapter.icon}</span>
              <span className="font-bold" style={{ color: chapter.themeColor }}>
                {chapter.name} · 进度
              </span>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>章节进度</span>
                <span>{chapterStats.completedCount}/{chapterStats.totalNodes} 节点</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${chapterStats.progress}%`,
                    background: `linear-gradient(90deg, ${chapter.themeColor}, ${chapter.themeColor}80)`
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-star-gold">⭐</span>
              <span className="text-white/70 text-sm">
                本章星星: {chapterStats.earnedStars}/{chapterStats.totalStars}
              </span>
            </div>

            {currentNode?.isChapterEnd && (
              <div className="mt-4 pt-4 border-t border-star-gold/20 text-center">
                <div className="text-star-gold font-bold mb-1">🎉 章节完成！</div>
                <div className="text-xs text-white/60">
                  {chapter.id < 5 ? '下一章节已解锁' : '恭喜你完成所有章节！'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {isChapterMode && isWin && (
            <button
              onClick={onContinue}
              className="w-full btn-star text-lg py-4"
            >
              继续冒险 →
            </button>
          )}

          {isChapterMode && (
            <button
              onClick={onBackToStarMap}
              className="w-full py-3 rounded-full border-2 border-star-cyan/50 text-star-cyan hover:bg-star-cyan/10 transition-colors"
            >
              🗺️ 返回星图
            </button>
          )}

          {!isChapterMode && isWin && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full btn-star text-lg py-4"
            >
              下一关 →
            </button>
          )}

          <button
            onClick={onRestart}
            className={`w-full py-3 rounded-full font-bold transition-all ${
              isWin
                ? 'border-2 border-star-gold/50 text-star-gold hover:bg-star-gold/10'
                : 'btn-star'
            }`}
          >
            {isWin ? '再玩一次' : '重新挑战'}
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 rounded-full border-2 border-white/30 text-white/70 hover:bg-white/10 transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
