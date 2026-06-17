import { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import StrategyPanel from '../../components/StrategyPanel';
import { useTimer } from '../../hooks/useTimer';
import { useScore } from '../../hooks/useScore';
import { COMMISSION_EVALUATION_CRITERIA, getRarityColor, calculateCommissionStars, checkCommissionBonus } from '../../data/gameData';

const CommissionGamePage = ({ commission, onBack, onComplete, visitor, skinTheme }) => {
  const [cards, setCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStatus, setGameStatus] = useState('idle');
  const [isLocked, setIsLocked] = useState(false);
  const [flippedCards, setFlippedCards] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showBonusCondition, setShowBonusCondition] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [seenStars, setSeenStars] = useState([]);
  const prevMatchedRef = useRef(0);
  const mistakesRef = useRef(0);

  const {
    timeLeft,
    formattedTime,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useTimer(commission.timeLimit, false, () => {
    setGameStatus('lost');
  });

  const {
    score,
    combo,
    maxCombo,
    addMatchScore,
    resetScore
  } = useScore(commission.pairs * 500);

  useEffect(() => {
    if (commission && commission.cards) {
      setCards(commission.cards.map(c => ({ ...c })));
    }
  }, [commission]);

  useEffect(() => {
    if (gameStatus === 'playing' && !isTimerRunning) {
      startTimer();
    } else if (gameStatus !== 'playing' && isTimerRunning) {
      stopTimer();
    }
  }, [gameStatus, isTimerRunning, startTimer, stopTimer]);

  useEffect(() => {
    if (matchedPairs.length > prevMatchedRef.current) {
      prevMatchedRef.current = matchedPairs.length;
      const points = addMatchScore(timeLeft, commission.timeLimit, moves);
      setEarnedPoints(points);
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 1000);
    }
  }, [matchedPairs.length, timeLeft, commission.timeLimit, moves, addMatchScore]);

  useEffect(() => {
    if (gameStatus === 'won') {
      stopTimer();
      const stars = calculateCommissionStars(commission, timeLeft, moves);
      const hasBonus = checkCommissionBonus(commission, {
        timeLeft,
        moves,
        maxCombo,
        stars,
        perfect: mistakesRef.current === 0
      });
      const timer = setTimeout(() => {
        onComplete && onComplete({
          score,
          timeLeft,
          moves,
          maxCombo,
          stars,
          hasBonus,
          perfect: mistakesRef.current === 0
        });
      }, 1500);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'lost') {
      stopTimer();
      const timer = setTimeout(() => {
        onBack && onBack();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, score, timeLeft, moves, maxCombo, commission, onComplete, onBack, stopTimer]);

  useEffect(() => {
    if (matchedPairs.length === commission.pairs && gameStatus === 'playing') {
      setGameStatus('won');
    }
  }, [matchedPairs.length, commission.pairs, gameStatus]);

  const flipCard = (cardId) => {
    if (isLocked || gameStatus === 'won' || gameStatus === 'lost') return;
    if (flippedCards.length >= 2) return;

    const cardIndex = cards.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = cards[cardIndex];
    if (card.isFlipped || card.isMatched) return;

    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }

    setSeenStars(prev => {
      const existingIndex = prev.findIndex(s => s.starId === card.starId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          seenCount: (updated[existingIndex].seenCount || 1) + 1
        };
        return updated;
      }
      return [...prev, { starId: card.starId, star: card.star, seenCount: 1 }];
    });

    const newCards = [...cards];
    newCards[cardIndex] = { ...card, isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard.pairIndex === secondCard.pairIndex) {
        setTimeout(() => {
          const matchedCards = newCards.map(c => {
            if (c.id === firstId || c.id === secondId) {
              return { ...c, isMatched: true };
            }
            return c;
          });
          setCards(matchedCards);
          setMatchedPairs(prev => [...prev, firstCard.pairIndex]);
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        mistakesRef.current++;
        setTimeout(() => {
          const resetCards = newCards.map(c => {
            if (c.id === firstId || c.id === secondId) {
              return { ...c, isFlipped: false };
            }
            return c;
          });
          setCards(resetCards);
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleRestart = () => {
    const shuffledCards = commission.cards
      .map(c => ({ ...c, isFlipped: false, isMatched: false, isHinted: false }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setMatchedPairs([]);
    setMoves(0);
    setGameStatus('idle');
    setIsLocked(false);
    setFlippedCards([]);
    setSeenStars([]);
    resetTimer(commission.timeLimit);
    resetScore();
    setShowPauseModal(false);
    prevMatchedRef.current = 0;
    mistakesRef.current = 0;
  };

  const getGridCols = () => {
    const pairs = commission.pairs;
    if (pairs <= 4) return 'grid-cols-4';
    if (pairs <= 6) return 'grid-cols-4';
    if (pairs <= 8) return 'grid-cols-4';
    return 'grid-cols-5';
  };

  const getBonusConditionLabel = () => {
    const cond = commission.bonusCondition;
    if (!cond) return '';
    return COMMISSION_EVALUATION_CRITERIA.bonusTypes[cond.type] || '';
  };

  const getBonusConditionHint = () => {
    const cond = commission.bonusCondition;
    if (!cond) return '';
    switch (cond.type) {
      case 'timeLeft':
        return `剩余时间 ≥ ${cond.value}秒`;
      case 'moves':
        return `步数 ≤ ${cond.value}步`;
      case 'combo':
        return `连击 ≥ ${cond.value}次`;
      case 'stars':
        return `获得${cond.value}星评价`;
      case 'perfect':
        return '全程零失误';
      default:
        return '';
    }
  };

  if (!commission) return null;

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
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">{visitor?.avatar}</span>
            <div>
              <div style={{ color: visitor?.color }} className="font-bold text-sm md:text-base">
                {commission.title}
              </div>
              <div className="text-xs text-white/50">
                {visitor?.name}的委托 · 已配对 {matchedPairs.length} / {commission.pairs}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPauseModal(true)}
          className="text-white/70 hover:text-white transition-colors text-xl"
        >
          ⏸
        </button>
      </div>

      {commission.bonusCondition && (
        <div
          className="flex justify-center mb-3"
          onClick={() => setShowBonusCondition(!showBonusCondition)}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all"
            style={{
              backgroundColor: `${getRarityColor('epic')}20`,
              border: `1px solid ${getRarityColor('epic')}50`
            }}
          >
            <span>🎁</span>
            <span style={{ color: getRarityColor('epic') }} className="font-bold">
              奖励条件: {getBonusConditionLabel()}
            </span>
            {showBonusCondition && (
              <span className="text-white/80">· {getBonusConditionHint()}</span>
            )}
          </div>
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
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-white/50">分数</div>
          <div className="text-lg font-bold text-star-gold">
            {score}
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
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className={`grid ${getGridCols()} gap-2 md:gap-3 w-full max-w-md mx-auto`}>
          {cards.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={flipCard}
              disabled={isLocked || (gameStatus !== 'playing' && gameStatus !== 'idle')}
              skinTheme={skinTheme}
            />
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

      {gameStatus === 'won' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-center animate-pulse">
            <div className="text-6xl mb-4">✨</div>
            <div className="text-3xl font-bold text-star-gold glow-text">委托完成！</div>
          </div>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 pointer-events-none">
          <div className="text-center animate-pulse">
            <div className="text-6xl mb-4">⏰</div>
            <div className="text-3xl font-bold text-red-400">时间到...</div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        title={`${visitor?.avatar} ${visitor?.name}的委托`}
        showCloseButton={true}
      >
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${visitor?.bgColor}40 0%, ${visitor?.bgColor}20 100%)`,
              border: `1px solid ${visitor?.color}30`
            }}
          >
            <div className="text-4xl mb-3 text-center">{visitor?.avatar}</div>
            <p className="text-white/90 italic text-center leading-relaxed">
              {commission.commissionStory}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-sm font-bold text-star-gold mb-2">委托目标</h4>
            <p className="text-sm text-white/70 mb-2">{commission.description}</p>
            <div className="flex gap-4 text-xs text-white/50">
              <span>🃏 {commission.pairs}对卡牌</span>
              <span>⏱️ {commission.timeLimit}秒</span>
            </div>
          </div>

          {commission.bonusCondition && (
            <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
              <h4 className="text-sm font-bold text-purple-300 mb-1">🎁 额外奖励条件</h4>
              <p className="text-sm text-purple-200/80">{getBonusConditionLabel()} · {getBonusConditionHint()}</p>
            </div>
          )}

          <button
            onClick={() => setShowStoryModal(false)}
            className="w-full btn-star"
          >
            开始委托
          </button>
        </div>
      </Modal>

      <StrategyPanel
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        onRestart={handleRestart}
        onBack={onBack}
        seenStars={seenStars}
        matchedPairs={matchedPairs}
        totalPairs={commission?.pairs || 0}
        currentMultiplier={1}
        railLevel={null}
        currentCombo={combo}
        maxCombo={maxCombo}
        currentScore={score}
        timeLeft={timeLeft}
        moves={moves}
        loveLetterRestarts={0}
        affection={0}
        hintCount={0}
        protectCount={0}
        hasActiveEffects={false}
        levelName={`${visitor?.name}的委托 · ${commission?.title}`}
      />
    </div>
  );
};

export default CommissionGamePage;
