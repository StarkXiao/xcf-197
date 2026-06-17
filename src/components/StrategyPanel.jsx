import { getRarityInfo } from '../data/gameData';

const StrategyPanel = ({
  isOpen,
  onClose,
  onRestart,
  onBack,
  seenStars = [],
  matchedPairs = [],
  totalPairs = 0,
  currentMultiplier = 1,
  railLevel = null,
  currentCombo = 0,
  maxCombo = 0,
  currentScore = 0,
  timeLeft = 0,
  moves = 0,
  loveLetterRestarts = 0,
  affection = 0,
  hintCount = 0,
  protectCount = 0,
  hasActiveEffects = false,
  isChapterMode = false,
  levelName = ''
}) => {
  const remainingPairs = totalPairs - matchedPairs.length;
  const seenButUnmatched = seenStars.filter(s => !matchedPairs.includes(s.starId));

  const getRestartCost = () => {
    const costs = [];
    if (currentScore > 0) {
      costs.push({ label: '当前得分', value: currentScore, icon: '⭐', color: '#ffd700' });
    }
    if (currentMultiplier > 1) {
      costs.push({ label: '倍率加成', value: `x${currentMultiplier.toFixed(1)}`, icon: '✨', color: '#c084fc' });
    }
    if (currentCombo > 0) {
      costs.push({ label: '当前连击', value: `x${currentCombo}`, icon: '🔥', color: '#ec4899' });
    }
    if (maxCombo > 0) {
      costs.push({ label: '最高连击', value: `x${maxCombo}`, icon: '💫', color: '#06b6d4' });
    }
    if (affection !== 0) {
      costs.push({ label: '好感度', value: `${affection > 0 ? '+' : ''}${affection}`, icon: '💕', color: affection > 0 ? '#ec4899' : '#6366f1' });
    }
    if (timeLeft > 0) {
      costs.push({ label: '剩余时间', value: `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`, icon: '⏱️', color: '#10b981' });
    }
    if (hintCount > 0) {
      costs.push({ label: '剩余提示', value: hintCount, icon: '💡', color: '#f59e0b' });
    }
    if (protectCount > 0) {
      costs.push({ label: '护符数量', value: protectCount, icon: '🛡️', color: '#8b5cf6' });
    }
    return costs;
  };

  const restartCosts = getRestartCost();

  const getSeenStarDisplay = (starId) => {
    const seen = seenStars.find(s => s.starId === starId);
    if (!seen) return null;
    const isMatched = matchedPairs.includes(starId);
    return { ...seen, isMatched, seenCount: seen.seenCount || 1 };
  };

  const uniqueSeenStars = [...new Set(seenStars.map(s => s.starId))].map(starId => getSeenStarDisplay(starId)).filter(Boolean);

  const getProgressPercentage = () => {
    if (totalPairs === 0) return 0;
    return Math.floor((matchedPairs.length / totalPairs) * 100);
  };

  const getStrategyTips = () => {
    const tips = [];
    if (seenButUnmatched.length >= 2) {
      const possiblePairs = seenButUnmatched.filter((s, i) => 
        seenButUnmatched.findIndex(s2 => s2.starId === s.starId) !== i
      );
      if (possiblePairs.length > 0) {
        tips.push({
          icon: '🎯',
          text: `你已见过 ${possiblePairs.length / 2} 对可配对的星纹，回忆它们的位置！`,
          color: '#10b981'
        });
      }
    }
    if (currentMultiplier > 1.5 && remainingPairs > 0) {
      tips.push({
        icon: '⚡',
        text: `当前倍率 x${currentMultiplier.toFixed(1)}，保持连击可获得更高分数！`,
        color: '#c084fc'
      });
    }
    if (timeLeft < 30 && remainingPairs > 2) {
      tips.push({
        icon: '⚠️',
        text: '时间紧迫，优先配对你记得位置的星纹！',
        color: '#f59e0b'
      });
    }
    if (hintCount > 0 && seenButUnmatched.length < 2) {
      tips.push({
        icon: '💡',
        text: '使用提示可以快速找到一对星纹，适合当前使用！',
        color: '#06b6d4'
      });
    }
    if (protectCount > 0) {
      tips.push({
        icon: '🛡️',
        text: `你还有 ${protectCount} 个护符，可以抵消失误惩罚！`,
        color: '#8b5cf6'
      });
    }
    if (affection < -20) {
      tips.push({
        icon: '💔',
        text: '好感度较低，尽量减少失误来提升结局评价！',
        color: '#ef4444'
      });
    }
    if (tips.length === 0) {
      tips.push({
        icon: '🌟',
        text: '保持专注，记录每张星纹的位置，你一定可以的！',
        color: '#ffd700'
      });
    }
    return tips;
  };

  const strategyTips = getStrategyTips();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content relative max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-star-gold mb-2 text-center glow-text">
          🔮 策略面板
        </h2>
        {levelName && (
          <p className="text-center text-white/60 text-sm mb-4">{levelName}</p>
        )}

        <div className="space-y-4">
          <div className="bg-star-purple/30 rounded-xl p-4 border border-star-gold/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🌟</span>
              <span className="font-bold text-star-gold">已见星纹记录</span>
              <span className="text-xs bg-star-gold/20 text-star-gold px-2 py-0.5 rounded-full">
                {uniqueSeenStars.length}/{totalPairs} 种
              </span>
            </div>
            
            {uniqueSeenStars.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                {uniqueSeenStars.map((seen) => {
                  const rarityInfo = getRarityInfo(seen.star?.rarity || 'common');
                  return (
                    <div
                      key={seen.starId}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm border ${
                        seen.isMatched 
                          ? 'bg-green-500/20 border-green-500/40' 
                          : 'bg-star-purple/50 border-star-gold/30'
                      }`}
                      title={`${seen.star?.name} - 见过 ${seen.seenCount} 次`}
                    >
                      <span className="text-lg">{seen.star?.symbol}</span>
                      <span className={`text-xs font-medium ${seen.isMatched ? 'text-green-400' : ''}`}
                            style={{ color: seen.isMatched ? undefined : rarityInfo.color }}>
                        {seen.star?.name}
                      </span>
                      {seen.seenCount > 1 && (
                        <span className="text-[10px] text-white/50">×{seen.seenCount}</span>
                      )}
                      {seen.isMatched && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/50 text-sm text-center">还没有见过任何星纹</p>
            )}
          </div>

          <div className="bg-star-purple/30 rounded-xl p-4 border border-star-cyan/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔗</span>
                <span className="font-bold text-star-cyan">配对进度</span>
              </div>
              <span className="text-star-cyan font-bold">
                {matchedPairs.length} / {totalPairs}
              </span>
            </div>
            
            <div className="h-3 bg-black/30 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  background: 'linear-gradient(90deg, #06b6d4, #10b981)'
                }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>剩余 {remainingPairs} 对</span>
              <span>进度 {getProgressPercentage()}%</span>
            </div>

            {seenButUnmatched.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <p className="text-xs text-star-gold/80">
                  💡 已见过但未配对的星纹：{seenButUnmatched.length} 张
                </p>
              </div>
            )}
          </div>

          <div className="bg-star-purple/30 rounded-xl p-4 border border-star-pink/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">✨</span>
              <span className="font-bold text-star-pink">当前倍率状态</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-black/20 rounded-lg p-2">
                <div className="text-xs text-white/50 mb-1">基础倍率</div>
                <div className="text-lg font-bold text-white">x1.0</div>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <div className="text-xs text-white/50 mb-1">星轨加成</div>
                <div className="text-lg font-bold" style={{ color: railLevel?.color || '#c084fc' }}>
                  x{(currentMultiplier - 1).toFixed(1)}
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <div className="text-xs text-white/50 mb-1">总倍率</div>
                <div className="text-lg font-bold text-star-gold glow-text">
                  x{currentMultiplier.toFixed(1)}
                </div>
              </div>
            </div>

            {railLevel && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{railLevel.icon || '🌟'}</span>
                    <span className="text-sm font-medium" style={{ color: railLevel.color }}>
                      {railLevel.name}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">
                    连击 x{currentCombo}
                  </span>
                </div>
                <p className="text-xs text-white/50 mt-1">{railLevel.description}</p>
              </div>
            )}
          </div>

          <div className="bg-star-purple/30 rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚠️</span>
              <span className="font-bold text-orange-400">重开代价说明</span>
            </div>
            
            {restartCosts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-white/60 mb-2">重新开始将会失去以下进度：</p>
                <div className="grid grid-cols-2 gap-2">
                  {restartCosts.map((cost, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2"
                    >
                      <span className="text-lg">{cost.icon}</span>
                      <div>
                        <div className="text-xs text-white/50">{cost.label}</div>
                        <div className="text-sm font-bold" style={{ color: cost.color }}>
                          {cost.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {loveLetterRestarts > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs text-red-400/80">
                      🔄 本次游戏已重开 {loveLetterRestarts} 次，影响结局评价
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/60 text-sm text-center">游戏刚开始，还没有太多损失</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-star-gold/10 to-star-pink/10 rounded-xl p-4 border border-star-gold/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">💫</span>
              <span className="font-bold text-star-gold">策略建议</span>
            </div>
            <div className="space-y-2">
              {strategyTips.map((tip, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="mt-0.5">{tip.icon}</span>
                  <p style={{ color: tip.color }} className="leading-relaxed">
                    {tip.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">当前步数</div>
              <div className="text-lg font-bold text-white">{moves}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">当前得分</div>
              <div className="text-lg font-bold text-star-gold">{currentScore}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">剩余时间</div>
              <div className={`text-lg font-bold ${timeLeft < 30 ? 'text-red-400' : 'text-star-cyan'}`}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onClose}
              className="w-full btn-star"
            >
              继续游戏 →
            </button>
            <button
              onClick={onRestart}
              className="w-full py-3 rounded-full border-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 transition-colors"
            >
              🔄 重新开始
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-full border-2 border-white/30 text-white/70 hover:bg-white/10 transition-colors"
            >
              {isChapterMode ? '🗺️ 返回星图' : '🏠 返回主页'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyPanel;
