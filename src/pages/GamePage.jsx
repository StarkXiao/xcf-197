import { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useGameLogic } from '../hooks/useGameLogic';
import { useTimer } from '../hooks/useTimer';
import { useScore } from '../hooks/useScore';
import { getLevelById, ITEM_EFFECT_TYPES, getItemEffectInfo, getShopItemById } from '../data/gameData';

const GamePage = ({ levelId, onBack, onWin, onLose, shop, skinTheme }) => {
  const level = getLevelById(levelId);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [showItemSelectModal, setShowItemSelectModal] = useState(false);
  const [gameEffects, setGameEffects] = useState({});
  const [hintCount, setHintCount] = useState(0);
  const [protectCount, setProtectCount] = useState(0);
  const [showProtectAnimation, setShowProtectAnimation] = useState(false);
  const [rewardInfo, setRewardInfo] = useState(null);
  const prevMatchedRef = useRef(0);
  const effectsAppliedRef = useRef(false);

  const {
    cards,
    matchedPairs,
    moves,
    gameStatus,
    isLocked,
    flipCard,
    resetGame,
    setGameStatus,
    showHint,
    mistakeProtected,
    flippedCards
  } = useGameLogic(level, {
    perfectStart: shop?.hasPerfectStart?.(),
    hasMistakeProtect: (gameEffects[ITEM_EFFECT_TYPES.MISTAKE_PROTECT] || 0) > 0
  });

  const baseTimeLimit = level?.timeLimit || 60;
  const bonusTime = gameEffects[ITEM_EFFECT_TYPES.TIME_EXTEND] || 0;
  const adjustedTimeLimit = baseTimeLimit + bonusTime;

  const {
    timeLeft,
    formattedTime,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useTimer(adjustedTimeLimit, false, () => {
    setGameStatus('lost');
  });

  const {
    score,
    combo,
    maxCombo,
    addMatchScore,
    resetScore,
    setScore
  } = useScore(level?.baseScore || 1000);

  useEffect(() => {
    if (shop && shop.selectedItems.length > 0 && !effectsAppliedRef.current && gameStatus === 'idle') {
      effectsAppliedRef.current = true;
      const { modifiedConfig, effects } = shop.applyItemEffects({ timeLimit: level?.timeLimit || 60 });
      setGameEffects(effects);
      setHintCount(effects[ITEM_EFFECT_TYPES.HINT] || 0);
      setProtectCount(effects[ITEM_EFFECT_TYPES.MISTAKE_PROTECT] || 0);
      
      if (effects[ITEM_EFFECT_TYPES.SCORE_BOOST]) {
        setScore(prev => Math.floor(prev * (1 + effects[ITEM_EFFECT_TYPES.SCORE_BOOST])));
      }
    }
  }, [shop, gameStatus]);

  useEffect(() => {
    if (gameStatus === 'playing' && !isTimerRunning) {
      startTimer();
    } else if (gameStatus !== 'playing' && isTimerRunning) {
      stopTimer();
    }
  }, [gameStatus, isTimerRunning, startTimer, stopTimer]);

  useEffect(() => {
    if (mistakeProtected) {
      setShowProtectAnimation(true);
      setProtectCount(prev => Math.max(0, prev - 1));
      setTimeout(() => setShowProtectAnimation(false), 1500);
    }
  }, [mistakeProtected]);

  useEffect(() => {
    if (matchedPairs.length > prevMatchedRef.current) {
      prevMatchedRef.current = matchedPairs.length;
      
      let points = addMatchScore(timeLeft, adjustedTimeLimit, moves);
      
      if (shop) {
        points = shop.calculateFinalScore(points);
        
        if (combo > 1) {
          const comboBonus = shop.calculateComboBonus(combo * 50);
          points += comboBonus - (combo * 50);
        }
      }
      
      setEarnedPoints(points);
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 1000);
    }
  }, [matchedPairs.length, timeLeft, adjustedTimeLimit, moves, addMatchScore, shop, combo]);

  useEffect(() => {
    if (gameStatus === 'won') {
      stopTimer();
      
      if (shop) {
        const stars = getStarsRating(levelId, timeLeft, moves);
        const reward = shop.rewardLevelCompletion(levelId, stars);
        setRewardInfo(reward);
      }
      
      const timer = setTimeout(() => {
        onWin && onWin({
          score: shop ? shop.calculateFinalScore(score) : score,
          timeLeft,
          moves,
          levelId,
          maxCombo,
          rewardInfo
        });
      }, 1500);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'lost') {
      stopTimer();
      if (shop) {
        shop.resetActiveEffects();
      }
      const timer = setTimeout(() => {
        onLose && onLose({
          score,
          timeLeft: 0,
          moves,
          levelId
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, score, timeLeft, moves, levelId, maxCombo, onWin, onLose, stopTimer, shop, rewardInfo]);

  const handleCardClick = (cardId) => {
    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }
    
    const hasProtect = protectCount > 0;
    const result = flipCard(cardId, { useMistakeProtect: hasProtect });
    
    if (result.mistakeProtected) {
      setProtectCount(prev => Math.max(0, prev - 1));
    } else if (!result.matched && flippedCards.length === 1) {
    }
  };

  const handleUseHint = () => {
    if (hintCount <= 0 || !shop) return;
    
    const result = shop.useHintItem();
    if (result.success) {
      showHint();
      setHintCount(result.remaining);
    }
  };

  const handleRestart = () => {
    prevMatchedRef.current = 0;
    effectsAppliedRef.current = false;
    resetGame();
    resetTimer(adjustedTimeLimit);
    resetScore();
    setShowPauseModal(false);
    setGameEffects({});
    setHintCount(0);
    setProtectCount(0);
    setRewardInfo(null);
    if (shop) {
      shop.resetActiveEffects();
    }
  };

  const handlePause = () => {
    setShowPauseModal(true);
  };

  const getGridCols = () => {
    const pairs = level?.pairs || 4;
    if (pairs <= 4) return 'grid-cols-4';
    if (pairs <= 6) return 'grid-cols-4';
    if (pairs <= 8) return 'grid-cols-4';
    if (pairs <= 10) return 'grid-cols-5';
    return 'grid-cols-6';
  };

  const getActiveEffectIcons = () => {
    const effects = [];
    Object.entries(gameEffects).forEach(([type, value]) => {
      if (value && value !== 0) {
        const info = getItemEffectInfo(type);
        if (info) {
          effects.push({ type, value, info });
        }
      }
    });
    return effects;
  };

  const getStarsRating = (levelId, timeLeft, moves) => {
    const level = getLevelById(levelId);
    if (!level) return 1;
    const timeRatio = timeLeft / adjustedTimeLimit;
    const moveRatio = (level.pairs * 2) / moves;
    if (timeRatio > 0.5 && moveRatio > 0.8) return 3;
    if (timeRatio > 0.3 && moveRatio > 0.5) return 2;
    return 1;
  };

  if (!level) return null;

  return (
    <div className="relative z-10 min-h-screen flex flex-col px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="text-white/70 hover:text-white transition-colors text-2xl"
        >
          ←
        </button>

        <div className="text-center">
          <div className="text-star-gold font-bold text-sm md:text-base">
            第 {level.id} 关 · {level.name}
          </div>
          <div className="text-xs text-white/50">
            已配对 {matchedPairs.length} / {level.pairs}
          </div>
        </div>

        <button
          onClick={handlePause}
          className="text-white/70 hover:text-white transition-colors text-xl"
        >
          ⏸
        </button>
      </div>

      {getActiveEffectIcons().length > 0 && (
        <div className="flex justify-center gap-2 mb-3 flex-wrap">
          {getActiveEffectIcons().map(({ type, value, info }) => (
            <div
              key={type}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
              style={{ backgroundColor: `${info.color}20`, color: info.color }}
            >
              <span>{info.icon}</span>
              <span className="font-bold">
                {typeof value === 'boolean' ? info.name : `${info.name} ${typeof value === 'number' && value > 1 ? `x${value}` : value > 0 ? value : ''}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-around items-center mb-4 rounded-xl p-3"
        style={{ 
          backgroundColor: `${skinTheme?.cardColor || '#2d1b69'}4d`,
          border: `1px solid ${skinTheme?.cardBorder || '#4c1d95'}40`
        }}
      >
        <div className="text-center">
          <div className="text-xs text-white/50">时间</div>
          <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-star-cyan'}`}>
            {formattedTime}
            {bonusTime > 0 && (
              <span className="text-xs text-green-400 ml-1">(+{bonusTime}s)</span>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-white/50">分数</div>
          <div className="text-lg font-bold text-star-gold">
            {score}
            {gameEffects[ITEM_EFFECT_TYPES.SCORE_BOOST] > 0 && (
              <span className="text-xs text-pink-400 ml-1">
                (+{Math.floor(gameEffects[ITEM_EFFECT_TYPES.SCORE_BOOST] * 100)}%)
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-white/50">步数</div>
          <div className="text-lg font-bold text-white">
            {moves}
          </div>
        </div>

        {combo > 1 && (
          <div className="text-center">
            <div className="text-xs text-white/50">连击</div>
            <div className="text-lg font-bold text-star-pink animate-pulse">
              x{combo}
              {gameEffects[ITEM_EFFECT_TYPES.COMBO_BOOST] > 1 && (
                <span className="text-xs text-orange-400 ml-1">
                  (x{gameEffects[ITEM_EFFECT_TYPES.COMBO_BOOST]})
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={handleUseHint}
          disabled={hintCount <= 0 || isLocked || gameStatus !== 'playing'}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
            ${hintCount > 0 && gameStatus === 'playing' && !isLocked
              ? 'bg-yellow-500/80 text-white hover:bg-yellow-500 active:scale-95'
              : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span>💡</span>
          <span>提示 ({hintCount})</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <span>🛡️</span>
          <span className="text-sm text-purple-300">护符: {protectCount}</span>
        </div>
      </div>

      <button
        onClick={() => setShowLetterModal(true)}
        className="mb-4 text-sm text-star-gold/80 hover:text-star-gold transition-colors text-center"
      >
        💌 查看情书碎片 ({matchedPairs.length}/{level.pairs})
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className={`grid ${getGridCols()} gap-2 md:gap-3 w-full max-w-md mx-auto`}>
          {cards.map(card => (
            <div key={card.id} className="relative">
              {card.isHinted && (
                <div className="absolute inset-0 rounded-xl animate-pulse z-20 pointer-events-none"
                  style={{
                    boxShadow: '0 0 20px 5px rgba(251, 191, 36, 0.6)',
                    border: '2px solid rgba(251, 191, 36, 0.8)'
                  }}
                />
              )}
              <Card
                card={card}
                onClick={handleCardClick}
                disabled={isLocked || (gameStatus !== 'playing' && gameStatus !== 'idle')}
                skinTheme={skinTheme}
              />
            </div>
          ))}
        </div>
      </div>

      {showPointsPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="text-star-gold text-3xl font-bold animate-bounce glow-text">
            +{earnedPoints}
          </div>
        </div>
      )}

      {showProtectAnimation && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className="text-purple-400 text-4xl font-bold animate-bounce">
            🛡️ 护符生效！
          </div>
        </div>
      )}

      {rewardInfo && rewardInfo.multiplier > 1 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-40">
          <div className="bg-green-500/90 text-white px-6 py-3 rounded-xl text-center animate-pulse">
            <div className="text-sm">✨ 双倍奖励生效！</div>
            <div className="text-lg font-bold">
              +{rewardInfo.total} 星尘 ({rewardInfo.base} × {rewardInfo.multiplier})
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showLetterModal}
        onClose={() => setShowLetterModal(false)}
        title="💌 情书碎片"
      >
        <div className="letter-fragment p-6 max-w-sm">
          {matchedPairs.length > 0 ? (
            <>
              <p className="text-center italic leading-relaxed">
                "{level.letterFragment}"
              </p>
              <div className="mt-4 text-center text-xs opacity-60">
                — 第 {level.id} 片碎片
              </div>
            </>
          ) : (
            <p className="text-center opacity-50">
              配对星纹来解锁情书碎片...
            </p>
          )}
        </div>
        <div className="mt-4 text-center text-xs text-white/40">
          已收集 {matchedPairs.length} / {level.pairs} 块碎片
        </div>
      </Modal>

      <Modal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        title="游戏暂停"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <button
            onClick={() => setShowPauseModal(false)}
            className="w-full btn-star"
          >
            继续游戏
          </button>
          <button
            onClick={handleRestart}
            className="w-full py-3 rounded-full border-2 border-star-gold/50 text-star-gold hover:bg-star-gold/10 transition-colors"
          >
            重新开始
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-full border-2 border-white/30 text-white/70 hover:bg-white/10 transition-colors"
          >
            返回主页
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default GamePage;
