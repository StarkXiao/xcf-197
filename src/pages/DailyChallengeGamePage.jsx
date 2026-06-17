import { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import StrategyPanel from '../components/StrategyPanel';
import { useGameLogic } from '../hooks/useGameLogic';
import { useTimer } from '../hooks/useTimer';
import { useScore } from '../hooks/useScore';
import { getStarById, STAR_PATTERNS, DAILY_CHALLENGE_TASKS, getRarityColor } from '../data/gameData';

const createDailyChallengeLevel = (config, themeDeck) => {
  const deckSource = themeDeck && themeDeck.length > 0 ? themeDeck : [...STAR_PATTERNS].sort(() => Math.random() - 0.5);
  const selectedStars = deckSource.slice(0, config.pairs).map(s => s.id);
  
  return {
    id: 'daily-challenge',
    name: '每日挑战',
    description: config.theme ? `${config.theme.icon} ${config.theme.name}` : '今日占卜挑战',
    pairs: config.pairs,
    timeLimit: config.timeLimit,
    baseScore: config.baseScore,
    stars: selectedStars,
    letterFragment: '每一次挑战都是命运的指引...'
  };
};

const DailyChallengeGamePage = ({ dailyChallenge, onBack, onComplete, skinTheme }) => {
  const challengeConfig = dailyChallenge.getChallengeConfig();
  const themeDeck = dailyChallenge.generateThemeDeck();
  const [challengeLevel] = useState(() => createDailyChallengeLevel(challengeConfig, themeDeck));
  const [showThemeModal, setShowThemeModal] = useState(true);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [challengeResult, setChallengeResult] = useState(null);
  const [earnedShards, setEarnedShards] = useState(null);
  const [completedTasksInfo, setCompletedTasksInfo] = useState([]);
  const prevMatchedRef = useRef(0);

  const theme = challengeConfig.theme;
  const themeShard = dailyChallenge.getCurrentThemeShard();

  const {
    cards,
    matchedPairs,
    moves,
    gameStatus,
    isLocked,
    flipCard,
    resetGame,
    setGameStatus,
    seenStars
  } = useGameLogic(challengeLevel);

  const {
    timeLeft,
    formattedTime,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useTimer(challengeLevel.timeLimit, false, () => {
    setGameStatus('lost');
  });

  const {
    score,
    combo,
    maxCombo,
    addMatchScore,
    calculateFinalScore,
    resetScore
  } = useScore(challengeLevel.baseScore);

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
      const matchPoints = addMatchScore(timeLeft, challengeLevel.timeLimit, moves);
      const bonusPoints = dailyChallenge.calculateChallengeScore(
        matchPoints, combo, timeLeft, challengeLevel.timeLimit, moves
      );
      const totalPoints = bonusPoints - matchPoints + matchPoints;
      setEarnedPoints(matchPoints);
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 1000);
    }
  }, [matchedPairs.length, timeLeft, challengeLevel, moves, combo, addMatchScore, dailyChallenge]);

  const getStarsRating = () => {
    const timeRatio = timeLeft / challengeLevel.timeLimit;
    const moveRatio = (challengeLevel.pairs * 2) / moves;
    if (timeRatio > 0.5 && moveRatio > 0.8) return 3;
    if (timeRatio > 0.3 && moveRatio > 0.5) return 2;
    return 1;
  };

  useEffect(() => {
    if (gameStatus === 'won') {
      stopTimer();
      const timer = setTimeout(() => {
        const baseScore = calculateFinalScore(
          timeLeft,
          challengeLevel.timeLimit,
          moves,
          matchedPairs.length,
          challengeLevel.pairs
        );
        const finalScore = dailyChallenge.calculateChallengeScore(
          baseScore, maxCombo, timeLeft, challengeLevel.timeLimit, moves
        );
        const stars = getStarsRating();
        
        const result = {
          score: finalScore,
          timeLeft,
          timeLimit: challengeLevel.timeLimit,
          moves,
          maxCombo,
          stars,
          isWin: true
        };
        
        let recordResult = null;
        try {
          recordResult = dailyChallenge.recordChallengeResult(result);
        } catch (e) {
          console.error('记录挑战结果失败:', e);
        }
        
        if (recordResult) {
          if (recordResult.shardResult && recordResult.shardResult.shard) {
            setEarnedShards(recordResult.shardResult);
            console.log('[游戏] 胜利结算获得碎片:', recordResult.shardResult);
          }
          if (recordResult.newlyCompletedTasks && recordResult.newlyCompletedTasks.length > 0) {
            setCompletedTasksInfo(recordResult.newlyCompletedTasks);
            console.log('[游戏] 新完成任务:', recordResult.newlyCompletedTasks);
          }
        }
        
        setChallengeResult(result);
        setShowResultModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (gameStatus === 'lost') {
      stopTimer();
      const timer = setTimeout(() => {
        const stars = 1;
        const result = {
          score,
          timeLeft: 0,
          timeLimit: challengeLevel.timeLimit,
          moves,
          maxCombo,
          stars,
          isWin: false
        };
        
        let recordResult = null;
        try {
          recordResult = dailyChallenge.recordChallengeResult(result);
        } catch (e) {
          console.error('记录挑战结果失败:', e);
        }
        
        if (recordResult) {
          if (recordResult.shardResult && recordResult.shardResult.shard) {
            setEarnedShards(recordResult.shardResult);
            console.log('[游戏] 失败结算获得碎片:', recordResult.shardResult);
          }
          if (recordResult.newlyCompletedTasks && recordResult.newlyCompletedTasks.length > 0) {
            setCompletedTasksInfo(recordResult.newlyCompletedTasks);
          }
        }
        
        setChallengeResult(result);
        setShowResultModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, score, timeLeft, moves, maxCombo, calculateFinalScore, dailyChallenge, challengeLevel, matchedPairs.length]);

  const handleCardClick = (cardId) => {
    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }
    flipCard(cardId);
  };

  const handleRestart = () => {
    prevMatchedRef.current = 0;
    resetGame();
    resetTimer(challengeLevel.timeLimit);
    resetScore();
    setShowPauseModal(false);
    setShowResultModal(false);
    setChallengeResult(null);
    setEarnedShards(null);
    setCompletedTasksInfo([]);
  };

  const handlePause = () => {
    setShowPauseModal(true);
  };

  const handleBack = () => {
    onBack && onBack();
  };

  const handleContinue = () => {
    setShowResultModal(false);
    onComplete && onComplete(challengeResult);
  };

  const getGridCols = () => {
    const pairs = challengeLevel?.pairs || 4;
    if (pairs <= 4) return 'grid-cols-4';
    if (pairs <= 6) return 'grid-cols-4';
    if (pairs <= 8) return 'grid-cols-4';
    if (pairs <= 10) return 'grid-cols-5';
    return 'grid-cols-6';
  };

  const getBonusDescription = () => {
    if (!theme) return '';
    switch (theme.bonusType) {
      case 'score':
        return `得分 ×${theme.bonusValue}`;
      case 'combo':
        return `连击加成 ×${theme.bonusValue}`;
      case 'time':
        return `额外 +${theme.bonusValue}秒`;
      default:
        return '';
    }
  };

  if (!challengeLevel) return null;

  return (
    <div className="relative z-10 min-h-screen flex flex-col px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          className="text-white/70 hover:text-white transition-colors text-2xl"
        >
          ←
        </button>

        <div className="text-center">
          <div
            className="text-sm md:text-base font-bold"
            style={{ color: theme?.color || '#ffd700' }}
          >
            🔮 每日挑战 · {theme?.name || '占卜'}
          </div>
          <div className="text-xs text-white/50">
            已配对 {matchedPairs.length} / {challengeLevel.pairs}
          </div>
        </div>

        <button
          onClick={handlePause}
          className="text-white/70 hover:text-white transition-colors text-xl"
        >
          ⏸
        </button>
      </div>

      {theme && (
        <div
          className="mb-4 p-2 rounded-xl flex items-center justify-between text-xs"
          style={{
            background: `${theme.color}20`,
            border: `1px solid ${theme.color}40`
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{theme.icon}</span>
            <span style={{ color: theme.color }}>{theme.name}</span>
          </div>
          <span className="text-white/70">
            ✨ {getBonusDescription()}
          </span>
        </div>
      )}

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

      <div className="flex-1 flex items-center justify-center">
        <div className={`grid ${getGridCols()} gap-2 md:gap-3 w-full max-w-md mx-auto`}>
          {cards.map(card => (
            <Card
              key={card.id}
              card={card}
              onClick={handleCardClick}
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

      <Modal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title="🔮 今日运势"
        showCloseButton={false}
      >
        {theme && (
          <div className="text-center">
            <div
              className="text-6xl mb-4"
              style={{ filter: `drop-shadow(0 0 15px ${theme.color})` }}
            >
              {theme.icon}
            </div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: theme.color }}
            >
              {theme.name}
            </h3>
            <p className="text-white/70 mb-4">{theme.description}</p>
            <div
              className="p-3 rounded-xl mb-4"
              style={{ background: `${theme.color}15`, border: `1px solid ${theme.color}30` }}
            >
              <div className="text-sm text-white/60 mb-1">今日主题加成</div>
              <div className="text-lg font-bold" style={{ color: theme.color }}>
                ✨ {getBonusDescription()}
              </div>
            </div>
            <div className="text-xs text-white/40 mb-4">
              挑战配置: {challengeLevel.pairs}对卡牌 · {challengeLevel.timeLimit}秒 · {challengeLevel.baseScore}基础分
            </div>
            <button
              onClick={() => setShowThemeModal(false)}
              className="w-full btn-star"
            >
              开始挑战
            </button>
          </div>
        )}
      </Modal>

      <StrategyPanel
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        onRestart={handleRestart}
        onBack={handleBack}
        seenStars={seenStars}
        matchedPairs={matchedPairs}
        totalPairs={challengeLevel?.pairs || 0}
        currentMultiplier={theme?.bonusType === 'score' ? theme.bonusValue : 1}
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
        levelName={`每日挑战 · ${theme?.name || '占卜'}`}
      />

      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={challengeResult?.isWin ? '🎉 挑战完成！' : '⏰ 时间到！'}
        showCloseButton={false}
      >
        {challengeResult && (
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3].map(star => (
                <span
                  key={star}
                  className={`text-3xl ${star <= challengeResult.stars ? 'text-star-gold animate-pulse' : 'text-white/20'}`}
                  style={{ animationDelay: `${star * 0.2}s` }}
                >
                  ⭐
                </span>
              ))}
            </div>
            
            <div className="text-4xl font-bold text-star-gold mb-2">
              {challengeResult.score.toLocaleString()}
            </div>
            <div className="text-sm text-white/50 mb-4">
              {challengeResult.isWin ? '挑战成功！' : '继续加油！'}
            </div>

            {earnedShards && earnedShards.shard && earnedShards.amount > 0 && (
              <div
                className="mb-4 p-3 rounded-xl border-2 animate-pulse-slow"
                style={{
                  borderColor: `${getRarityColor(earnedShards.shard.rarity || 'rare')}60`,
                  background: `linear-gradient(135deg, ${getRarityColor(earnedShards.shard.rarity || 'rare')}15 0%, ${getRarityColor(earnedShards.shard.rarity || 'rare')}05 100%)`
                }}
              >
                <div className="text-xs text-white/60 mb-1">获得限定碎片</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">{earnedShards.shard.icon || '💎'}</span>
                  <div className="text-left">
                    <div className="font-bold" style={{ color: getRarityColor(earnedShards.shard.rarity || 'rare') }}>
                      {earnedShards.shard.name || '神秘碎片'}
                    </div>
                    <div className="text-star-gold font-bold">
                      ×{earnedShards.amount}
                    </div>
                  </div>
                </div>
                {earnedShards.newlyUnlockedRewards && earnedShards.newlyUnlockedRewards.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-xs text-green-400 mb-1">🎉 解锁新奖励</div>
                    {earnedShards.newlyUnlockedRewards.map((reward, idx) => (
                      <div key={idx} className="text-xs text-white/80 flex items-center justify-center gap-1">
                        <span>{reward.icon}</span>
                        <span>{reward.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {completedTasksInfo && completedTasksInfo.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="text-xs text-green-400 mb-2">🎉 新完成任务</div>
                <div className="space-y-1">
                  {completedTasksInfo.map((taskId, idx) => {
                    const task = DAILY_CHALLENGE_TASKS.find(t => t.id === taskId);
                    return task ? (
                      <div key={idx} className="flex items-center justify-center gap-2 text-sm">
                        <span>{task.icon}</span>
                        <span className="text-white">{task.name}</span>
                        <span className="text-star-gold">+{task.reward.value}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-star-purple/20 rounded-xl p-3">
                <div className="text-xl text-star-pink mb-1">⚡</div>
                <div className="text-xl font-bold text-white">x{challengeResult.maxCombo}</div>
                <div className="text-xs text-white/50">最高连击</div>
              </div>
              <div className="bg-star-purple/20 rounded-xl p-3">
                <div className="text-xl text-star-cyan mb-1">⏱️</div>
                <div className="text-xl font-bold text-white">
                  {challengeResult.timeLimit - challengeResult.timeLeft}s
                </div>
                <div className="text-xs text-white/50">完成用时</div>
              </div>
              <div className="bg-star-purple/20 rounded-xl p-3">
                <div className="text-xl text-white mb-1">👟</div>
                <div className="text-xl font-bold text-white">{challengeResult.moves}</div>
                <div className="text-xs text-white/50">总步数</div>
              </div>
              <div className="bg-star-purple/20 rounded-xl p-3">
                <div className="text-xl text-green-400 mb-1">💚</div>
                <div className="text-xl font-bold text-white">{challengeResult.timeLeft}s</div>
                <div className="text-xs text-white/50">剩余时间</div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full btn-star"
              >
                🔄 再来一次
              </button>
              <button
                onClick={handleContinue}
                className="w-full py-3 rounded-full border-2 border-star-cyan/50 text-star-cyan hover:bg-star-cyan/10 transition-colors"
              >
                查看排行
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DailyChallengeGamePage;
