import { useState, useEffect, useRef, useCallback } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StrategyPanel from '../components/StrategyPanel';
import { useGameLogic } from '../hooks/useGameLogic';
import { useTimer } from '../hooks/useTimer';
import { useScore } from '../hooks/useScore';
import { useStarRailChain } from '../hooks/useStarRailChain';
import { useGameEvents } from '../hooks/useGameEvents';
import { useLoveLetterEnding } from '../hooks/useLoveLetterEnding';
import { getLevelById, ITEM_EFFECT_TYPES, getItemEffectInfo, getShopItemById, getRarityInfo, getStarRailChainLevel, GAME_EVENT_CATEGORIES, LOVE_LETTER_CONFIG } from '../data/gameData';

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
  const [showRailLevelUp, setShowRailLevelUp] = useState(false);
  const [railLevelUpInfo, setRailLevelUpInfo] = useState(null);
  const [showStoryEventModal, setShowStoryEventModal] = useState(false);
  const [storyEventResult, setStoryEventResult] = useState(null);
  const [eventScorePopup, setEventScorePopup] = useState(null);
  const [eventTimePopup, setEventTimePopup] = useState(null);
  const [showAffectionMeter, setShowAffectionMeter] = useState(true);
  const prevMatchedRef = useRef(0);
  const prevRailLevelRef = useRef(null);
  const effectsAppliedRef = useRef(false);
  const lastTriggerTypeRef = useRef(null);
  const loveLetterEndingRef = useRef(null);

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
    flippedCards,
    getUnmatchedCards,
    shuffleUnmatchedCards,
    instantMatchPair,
    revealAllCards,
    seenStars
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
    resetTimer,
    addTime,
    reduceTime
  } = useTimer(adjustedTimeLimit, false, () => {
    setGameStatus('lost');
  });

  const {
    score,
    combo,
    maxCombo,
    addMatchScore,
    resetScore,
    setScore,
    resetCombo,
    addScore,
    reduceScore
  } = useScore(level?.baseScore || 1000);

  const {
    combo: railCombo,
    maxCombo: railMaxCombo,
    currentLevel: railLevel,
    isChainActive,
    showStoryEvent,
    currentStoryEvent,
    scoreMultiplier: railMultiplier,
    baseMultiplier: railBaseMultiplier,
    bonusMultiplier: railBonusMultiplier,
    handleMatch: handleRailMatch,
    handleMistake: handleRailMistake,
    applyStoryChoice: applyRailStoryChoice,
    closeStoryEvent: closeRailStoryEvent,
    resetChain: resetRailChain,
    getTitle: getRailTitle,
    getNextLevel: getNextRailLevel
  } = useStarRailChain();

  const {
    activeEvents: activeGameEvents,
    currentEvent,
    showEventModal,
    foggedCardIds,
    frozenOperation,
    pendingComboBoost,
    revealedCardIds,
    tryTriggerEvent,
    applyEventEffect,
    closeEventModal,
    removeActiveEvent,
    resetEvents,
    incrementFlipCount,
    resetFlipCount,
    consumePendingComboBoost,
    isCardFogged,
    isCardRevealed
  } = useGameEvents();

  const {
    affection,
    currentEvent: loveLetterEvent,
    showEventPopup: showLoveLetterPopup,
    setShowTendencyHint,
    onMatch: onLoveLetterMatch,
    onMismatch: onLoveLetterMismatch,
    onTimeout: onLoveLetterTimeout,
    onRestart: onLoveLetterRestart,
    onHintUsed: onLoveLetterHintUsed,
    onProtectUsed: onLoveLetterProtectUsed,
    onTimeWarning: onLoveLetterTimeWarning,
    resetSession: resetLoveLetterSession,
    fullReset: fullResetLoveLetter,
    getCurrentTendency,
    getEndingResult,
    getAffectionBreakdown,
    getStatsSummary,
    restarts: loveLetterRestarts,
    timeouts: loveLetterTimeouts,
    perfectMoves,
    mistakes
  } = useLoveLetterEnding(level);

  useEffect(() => {
    loveLetterEndingRef.current = {
      affection,
      getEndingResult,
      getStatsSummary
    };
  }, [affection, getEndingResult, getStatsSummary]);

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
      onLoveLetterProtectUsed();
      setTimeout(() => setShowProtectAnimation(false), 1500);
    }
  }, [mistakeProtected, onLoveLetterProtectUsed]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft <= 10 && timeLeft > 9) {
      onLoveLetterTimeWarning();
    }
  }, [timeLeft, gameStatus, onLoveLetterTimeWarning]);

  useEffect(() => {
    if (matchedPairs.length > prevMatchedRef.current) {
      prevMatchedRef.current = matchedPairs.length;
      
      const comboBoostVal = consumePendingComboBoost();
      
      const newRailCombo = handleRailMatch();
      const currentCombo = Math.max(combo, newRailCombo);
      
      const optimalMoves = level?.pairs || 4;
      const moveEfficiency = Math.max(0, (optimalMoves * 2) / (moves || 1));
      
      onLoveLetterMatch(currentCombo, moveEfficiency);
      
      const currentRailLevel = getStarRailChainLevel(newRailCombo);
      if (currentRailLevel && (!prevRailLevelRef.current || currentRailLevel.level > prevRailLevelRef.current.level)) {
        prevRailLevelRef.current = currentRailLevel;
        setRailLevelUpInfo(currentRailLevel);
        setShowRailLevelUp(true);
        setTimeout(() => setShowRailLevelUp(false), 2000);
      }
      
      const basePoints = addMatchScore(timeLeft, adjustedTimeLimit, moves);
      
      let comboBoostBonus = 0;
      if (comboBoostVal > 0) {
        comboBoostBonus = comboBoostVal * 100;
        setScore(prev => prev + comboBoostBonus);
      }
      
      const currentMultiplier = railMultiplier > 1 ? railMultiplier : 1;
      const bonusPoints = currentMultiplier > 1 ? Math.floor(basePoints * (currentMultiplier - 1)) : 0;
      
      let finalPoints = basePoints + bonusPoints + comboBoostBonus;
      
      if (shop) {
        finalPoints = shop.calculateFinalScore(finalPoints);
        
        if (combo > 1) {
          const comboBonus = shop.calculateComboBonus(combo * 50);
          finalPoints += comboBonus - (combo * 50);
        }
      }
      
      if (bonusPoints > 0) {
        setScore(prev => prev + bonusPoints);
      }
      
      setEarnedPoints(finalPoints);
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 1000);

      setTimeout(() => {
        triggerAndApplyEvent('match');
      }, 300);
    }
  }, [matchedPairs.length, timeLeft, adjustedTimeLimit, moves, addMatchScore, shop, combo, handleRailMatch, railMultiplier, setScore, consumePendingComboBoost, triggerAndApplyEvent, onLoveLetterMatch, level?.pairs]);

  useEffect(() => {
    if (gameStatus === 'won') {
      stopTimer();
      
      if (shop) {
        const stars = getStarsRating(levelId, timeLeft, moves);
        const reward = shop.rewardLevelCompletion(levelId, stars);
        setRewardInfo(reward);
      }
      
      const railTitle = getRailTitle();
      
      const loveLetterResult = loveLetterEndingRef.current?.getEndingResult?.({
        moves,
        maxCombo: Math.max(maxCombo, railMaxCombo),
        timeLeft
      });
      
      const timer = setTimeout(() => {
        onWin && onWin({
          score: shop ? shop.calculateFinalScore(score) : score,
          timeLeft,
          moves,
          levelId,
          maxCombo: Math.max(maxCombo, railMaxCombo),
          rewardInfo,
          railMaxCombo,
          railTitle,
          railLevel,
          loveLetterResult,
          loveLetterStats: loveLetterEndingRef.current?.getStatsSummary?.()
        });
      }, 1500);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'lost') {
      stopTimer();
      
      onLoveLetterTimeout();
      
      if (shop) {
        shop.resetActiveEffects();
      }
      
      const railTitle = getRailTitle();
      
      const loveLetterResult = loveLetterEndingRef.current?.getEndingResult?.({
        moves,
        maxCombo: Math.max(maxCombo, railMaxCombo),
        timeLeft: 0
      });
      
      const timer = setTimeout(() => {
        onLose && onLose({
          score,
          timeLeft: 0,
          moves,
          levelId,
          railMaxCombo,
          railTitle,
          loveLetterResult,
          loveLetterStats: loveLetterEndingRef.current?.getStatsSummary?.()
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, score, timeLeft, moves, levelId, maxCombo, onWin, onLose, stopTimer, shop, rewardInfo, getRailTitle, railMaxCombo, railLevel, onLoveLetterTimeout]);

  const triggerAndApplyEvent = useCallback((triggerType) => {
    const event = tryTriggerEvent(triggerType);
    if (!event) return null;

    const eventActions = {
      addTime: (val) => {
        addTime(val);
        setEventTimePopup({ value: val, positive: true });
        setTimeout(() => setEventTimePopup(null), 1200);
      },
      reduceTime: (val) => {
        reduceTime(val);
        setEventTimePopup({ value: val, positive: false });
        setTimeout(() => setEventTimePopup(null), 1200);
      },
      addScore: (val) => {
        addScore(val);
        setEventScorePopup({ value: val, positive: true });
        setTimeout(() => setEventScorePopup(null), 1200);
      },
      reduceScore: (val) => {
        reduceScore(val);
        setEventScorePopup({ value: val, positive: false });
        setTimeout(() => setEventScorePopup(null), 1200);
      },
      resetCombo: () => {
        resetCombo();
        handleRailMistake();
      },
      getUnmatchedCards: () => getUnmatchedCards(),
      showHint: () => showHint(),
      revealAllCards: (reveal) => revealAllCards(reveal),
      shuffleUnmatchedCards: () => shuffleUnmatchedCards(),
      instantMatchPair: () => instantMatchPair()
    };

    applyEventEffect(event, eventActions);

    setTimeout(() => {
      removeActiveEvent(event.id);
    }, 3000);

    return event;
  }, [tryTriggerEvent, applyEventEffect, removeActiveEvent, addTime, reduceTime, addScore, reduceScore, resetCombo, handleRailMistake, getUnmatchedCards, showHint, revealAllCards, shuffleUnmatchedCards, instantMatchPair]);

  const handleCardClick = (cardId) => {
    if (frozenOperation) return;
    if (isLocked) return;
    
    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }
    
    const flippedCountBefore = flippedCards.length;
    const hasProtect = protectCount > 0;
    const result = flipCard(cardId, { useMistakeProtect: hasProtect });
    
    if (result.mistakeProtected) {
      setProtectCount(prev => Math.max(0, prev - 1));
    }
    
    const isFirstCard = (flippedCountBefore === 0);
    const isSecondCard = (flippedCountBefore === 1);
    const isMismatch = isSecondCard && !result.matched && !result.mistakeProtected;
    
    if (isMismatch) {
      onLoveLetterMismatch();
      setTimeout(() => {
        handleRailMistake();
      }, 1000);
    }

    incrementFlipCount();

    setTimeout(() => {
      triggerAndApplyEvent('flip');
    }, 100);

    if (isMismatch) {
      setTimeout(() => {
        triggerAndApplyEvent('mismatch');
      }, 1200);
    }
  };

  const handleUseHint = () => {
    if (hintCount <= 0 || !shop) return;
    
    const result = shop.useHintItem();
    if (result.success) {
      showHint();
      setHintCount(result.remaining);
      onLoveLetterHintUsed();
    }
  };

  const handleRestart = () => {
    prevMatchedRef.current = 0;
    prevRailLevelRef.current = null;
    effectsAppliedRef.current = false;
    lastTriggerTypeRef.current = null;
    
    onLoveLetterRestart();
    resetLoveLetterSession();
    
    resetGame();
    resetTimer(adjustedTimeLimit);
    resetScore();
    resetRailChain();
    resetEvents();
    setShowPauseModal(false);
    setGameEffects({});
    setHintCount(0);
    setProtectCount(0);
    setRewardInfo(null);
    setShowRailLevelUp(false);
    setRailLevelUpInfo(null);
    setShowStoryEventModal(false);
    setStoryEventResult(null);
    setEventScorePopup(null);
    setEventTimePopup(null);
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

      {railLevel && (
        <div 
          className="star-rail-banner text-center py-2 px-4 rounded-lg mb-3 relative overflow-hidden"
          style={{ backgroundColor: `${railLevel.color}20`, border: `1px solid ${railLevel.color}40` }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">✨</span>
            <span className="font-bold" style={{ color: railLevel.color }}>
              {railLevel.name}
            </span>
            <span className="text-xs opacity-70" style={{ color: railLevel.color }}>
              {railLevel.description}
            </span>
            <span className="multiplier-badge text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
              x{railMultiplier.toFixed(1)}
            </span>
          </div>
          {getNextRailLevel() && (
            <div className="text-xs text-white/50 mt-1">
              距离下一阶段还需 {getNextRailLevel().comboRequired - railCombo} 次连击
            </div>
          )}
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
            {railMultiplier > 1 && (
              <span className="text-xs text-purple-400 ml-1">
                [x{railMultiplier.toFixed(1)}]
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

        <div className="text-center">
          <div className="text-xs text-white/50">连击</div>
          <div 
            className={`text-lg font-bold combo-number ${isChainActive ? 'animate-pulse' : ''}`}
            style={{ color: railLevel?.color || '#ec4899' }}
          >
            x{Math.max(combo, railCombo)}
            {gameEffects[ITEM_EFFECT_TYPES.COMBO_BOOST] > 1 && (
              <span className="text-xs text-orange-400 ml-1">
                (x{gameEffects[ITEM_EFFECT_TYPES.COMBO_BOOST]})
              </span>
            )}
          </div>
        </div>
      </div>

      {showAffectionMeter && (
        <div 
          className="mb-4 rounded-xl p-3 border"
          style={{
            backgroundColor: `${getCurrentTendency().color}15`,
            borderColor: `${getCurrentTendency().color}40`
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getCurrentTendency().icon}</span>
              <span className="text-xs text-white/70">好感度</span>
            </div>
            <span 
              className="text-sm font-bold"
              style={{ color: getCurrentTendency().color }}
            >
              {affection > 0 ? '+' : ''}{affection}
            </span>
          </div>
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((affection + 100) / 2)}%`,
                background: affection >= 30 
                  ? 'linear-gradient(90deg, #ec4899, #f472b6)'
                  : affection >= 0
                  ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(90deg, #6366f1, #8b5cf6)'
              }}
            />
          </div>
          <div className="text-center mt-2">
            <span 
              className="text-xs"
              style={{ color: getCurrentTendency().color }}
            >
              {getCurrentTendency().text}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={handleUseHint}
          disabled={hintCount <= 0 || isLocked || gameStatus !== 'playing' || frozenOperation}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
            ${hintCount > 0 && gameStatus === 'playing' && !isLocked && !frozenOperation
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
        {frozenOperation && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 animate-pulse">
            <span>❄️</span>
            <span className="text-sm text-cyan-300 font-bold">冰封中</span>
          </div>
        )}
        {pendingComboBoost > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/40">
            <span>⚡</span>
            <span className="text-sm text-orange-300 font-bold">连击+{pendingComboBoost}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowLetterModal(true)}
        className="mb-4 text-sm text-star-gold/80 hover:text-star-gold transition-colors text-center"
      >
        💌 查看情书碎片 ({matchedPairs.length}/{level.pairs})
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className={`grid ${getGridCols()} gap-2 md:gap-3 w-full max-w-md mx-auto ${frozenOperation ? 'pointer-events-none' : ''}`}>
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
                disabled={isLocked || (gameStatus !== 'playing' && gameStatus !== 'idle') || frozenOperation}
                skinTheme={skinTheme}
                starRailLevel={railLevel}
                isFogged={isCardFogged(card.id)}
                isRevealed={isCardRevealed(card.id)}
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

      {eventScorePopup && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className={`text-3xl font-bold animate-bounce ${eventScorePopup.positive ? 'text-star-gold' : 'text-red-400'}`}>
            {eventScorePopup.positive ? '+' : '-'}{eventScorePopup.value} 分
          </div>
        </div>
      )}

      {eventTimePopup && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
          <div className={`text-2xl font-bold animate-bounce ${eventTimePopup.positive ? 'text-green-400' : 'text-red-400'}`}>
            ⏱️ {eventTimePopup.positive ? '+' : '-'}{eventTimePopup.value}s
          </div>
        </div>
      )}

      {activeGameEvents.length > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 flex gap-2 z-40 pointer-events-none">
          {activeGameEvents.map(event => (
            <div
              key={`${event.id}-${event.triggeredAt}`}
              className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse"
              style={{
                backgroundColor: `${event.color}30`,
                color: event.color,
                border: `1px solid ${event.color}60`
              }}
            >
              <span>{event.icon}</span>
              <span>{event.shortDescription}</span>
            </div>
          ))}
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

      {showRailLevelUp && railLevelUpInfo && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 rail-level-up">
          <div 
            className="text-center px-8 py-6 rounded-2xl"
            style={{ 
              backgroundColor: `${railLevelUpInfo.color}30`,
              border: `2px solid ${railLevelUpInfo.color}`,
              boxShadow: `0 0 30px ${railLevelUpInfo.color}60`
            }}
          >
            <div className="text-4xl mb-2">✨</div>
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: railLevelUpInfo.color }}
            >
              {railLevelUpInfo.name}
            </div>
            <div className="text-sm text-white/70">
              {railLevelUpInfo.description}
            </div>
            <div 
              className="mt-3 text-lg font-bold"
              style={{ color: railLevelUpInfo.color }}
            >
              分数倍率 x{railLevelUpInfo.scoreMultiplier}
            </div>
          </div>
        </div>
      )}

      {showLoveLetterPopup && loveLetterEvent && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-slide-in">
          <div 
            className="text-center px-6 py-4 rounded-2xl border-2"
            style={{ 
              backgroundColor: `${loveLetterEvent.color}20`,
              borderColor: `${loveLetterEvent.color}60`,
              boxShadow: `0 0 25px ${loveLetterEvent.color}40`
            }}
          >
            <div className="text-3xl mb-2">{loveLetterEvent.icon}</div>
            <div 
              className="text-lg font-bold mb-1"
              style={{ color: loveLetterEvent.color }}
            >
              {loveLetterEvent.title}
            </div>
            <div className="text-sm text-white/80 mb-2">
              {loveLetterEvent.message}
            </div>
            <div 
              className="text-sm font-bold"
              style={{ 
                color: loveLetterEvent.actualChange >= 0 ? '#10b981' : '#ef4444'
              }}
            >
              {loveLetterEvent.actualChange >= 0 ? '+' : ''}{loveLetterEvent.actualChange} 好感度
            </div>
          </div>
        </div>
      )}

      {showStoryEvent && currentStoryEvent && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          title={`🌟 ${currentStoryEvent.title}`}
          showCloseButton={false}
        >
          <div className="max-w-sm">
            <p className="text-white/80 text-center mb-6 leading-relaxed">
              {currentStoryEvent.description}
            </p>
            <div className="space-y-3">
              {currentStoryEvent.choices.map((choice, index) => (
                <button
                  key={choice.id}
                  onClick={() => {
                    const result = applyRailStoryChoice(choice);
                    
                    if (result.scoreBonus) {
                      setScore(prev => prev + result.scoreBonus);
                    }
                    if (result.timeBonus) {
                      addTime(result.timeBonus);
                    }
                    if (result.hints && shop) {
                      setHintCount(prev => prev + result.hints);
                    }
                    
                    setStoryEventResult({ choice, result });
                    setShowStoryEventModal(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl text-left transition-all
                    border-2 border-star-gold/30 hover:border-star-gold/60 
                    hover:bg-star-gold/10 active:scale-95"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="font-bold text-star-gold">
                    {choice.text}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {showStoryEventModal && storyEventResult && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowStoryEventModal(false);
            setStoryEventResult(null);
            closeRailStoryEvent();
          }}
          title="✨ 星轨回应"
          showCloseButton={true}
        >
          <div className="max-w-sm text-center">
            <div className="text-4xl mb-4">🌟</div>
            <p className="text-white/80 mb-6 leading-relaxed">
              {storyEventResult.choice.result}
            </p>
            {storyEventResult.result.scoreBonus && (
              <div className="text-star-gold text-lg font-bold mb-2">
                +{storyEventResult.result.scoreBonus} 分
              </div>
            )}
            {storyEventResult.result.timeBonus && (
              <div className="text-green-400 text-lg font-bold mb-2">
                +{storyEventResult.result.timeBonus} 秒
              </div>
            )}
            {storyEventResult.result.comboBoost && (
              <div className="text-star-pink text-lg font-bold mb-2">
                连击 +{storyEventResult.result.comboBoost}
              </div>
            )}
            {storyEventResult.result.multiplierBoost && (
              <div className="text-purple-400 text-lg font-bold mb-2">
                倍率 +{storyEventResult.result.multiplierBoost}
              </div>
            )}
            <button
              onClick={() => {
                setShowStoryEventModal(false);
                setStoryEventResult(null);
                closeRailStoryEvent();
              }}
              className="w-full btn-star mt-4"
            >
              继续游戏
            </button>
          </div>
        </Modal>
      )}

      {showEventModal && currentEvent && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          title={currentEvent.title}
          showCloseButton={false}
        >
          <div className="max-w-sm text-center">
            <div 
              className="text-6xl mb-4 animate-bounce"
              style={{ filter: `drop-shadow(0 0 20px ${currentEvent.color})` }}
            >
              {currentEvent.icon}
            </div>
            <div 
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{
                backgroundColor: `${currentEvent.color}30`,
                color: currentEvent.color,
                border: `1px solid ${currentEvent.color}60`
              }}
            >
              {currentEvent.category === GAME_EVENT_CATEGORIES.POSITIVE ? '✨ 增益效果' :
               currentEvent.category === GAME_EVENT_CATEGORIES.NEGATIVE ? '⚠️ 干扰事件' : '🎲 中立事件'}
            </div>
            <p className="text-white/80 mb-6 leading-relaxed text-base">
              {currentEvent.description}
            </p>
            <div 
              className="text-xl font-bold mb-6"
              style={{ color: currentEvent.color }}
            >
              {currentEvent.shortDescription}
            </div>
            <button
              onClick={closeEventModal}
              className="w-full btn-star"
              style={{
                background: `linear-gradient(135deg, ${currentEvent.color}40 0%, ${currentEvent.color}20 100%)`,
                border: `2px solid ${currentEvent.color}80`
              }}
            >
              继续游戏
            </button>
          </div>
        </Modal>
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

      <StrategyPanel
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        onRestart={handleRestart}
        onBack={onBack}
        seenStars={seenStars}
        matchedPairs={matchedPairs}
        totalPairs={level?.pairs || 0}
        currentMultiplier={railMultiplier}
        railLevel={railLevel}
        currentCombo={Math.max(combo, railCombo)}
        maxCombo={Math.max(maxCombo, railMaxCombo)}
        currentScore={score}
        timeLeft={timeLeft}
        moves={moves}
        loveLetterRestarts={loveLetterRestarts}
        affection={affection}
        hintCount={hintCount}
        protectCount={protectCount}
        hasActiveEffects={Object.keys(gameEffects).length > 0}
        levelName={`第 ${level?.id} 关 · ${level?.name}`}
      />
    </div>
  );
};

export default GamePage;
