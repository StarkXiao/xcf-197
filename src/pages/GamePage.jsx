import { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { useGameLogic } from '../hooks/useGameLogic';
import { useTimer } from '../hooks/useTimer';
import { useScore } from '../hooks/useScore';
import { getLevelById } from '../data/gameData';

const GamePage = ({ levelId, onBack, onWin, onLose }) => {
  const level = getLevelById(levelId);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const prevMatchedRef = useRef(0);

  const {
    cards,
    matchedPairs,
    moves,
    gameStatus,
    isLocked,
    flipCard,
    resetGame,
    setGameStatus
  } = useGameLogic(level);

  const {
    timeLeft,
    formattedTime,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useTimer(level?.timeLimit || 60, false, () => {
    setGameStatus('lost');
  });

  const {
    score,
    combo,
    maxCombo,
    addMatchScore,
    resetScore
  } = useScore(level?.baseScore || 1000);

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
      const points = addMatchScore(timeLeft, level.timeLimit, moves);
      setEarnedPoints(points);
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 1000);
    }
  }, [matchedPairs.length, timeLeft, level, moves, addMatchScore]);

  useEffect(() => {
    if (gameStatus === 'won') {
      stopTimer();
      const timer = setTimeout(() => {
        onWin && onWin({
          score,
          timeLeft,
          moves,
          levelId,
          maxCombo
        });
      }, 1500);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'lost') {
      stopTimer();
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
  }, [gameStatus, score, timeLeft, moves, levelId, maxCombo, onWin, onLose, stopTimer]);

  const handleCardClick = (cardId) => {
    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }
    flipCard(cardId);
  };

  const handleRestart = () => {
    prevMatchedRef.current = 0;
    resetGame();
    resetTimer(level.timeLimit);
    resetScore();
    setShowPauseModal(false);
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

      <div className="flex justify-around items-center mb-4 bg-star-purple/30 rounded-xl p-3">
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

      <button
        onClick={() => setShowLetterModal(true)}
        className="mb-4 text-sm text-star-gold/80 hover:text-star-gold transition-colors text-center"
      >
        💌 查看情书碎片 ({matchedPairs.length}/{level.pairs})
      </button>

      <div className="flex-1 flex items-center justify-center">
        <div className={`grid ${getGridCols()} gap-2 md:gap-3 w-full max-w-md mx-auto`}>
          {cards.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={handleCardClick}
              disabled={isLocked || (gameStatus !== 'playing' && gameStatus !== 'idle')}
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
