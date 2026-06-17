import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  LOVE_LETTER_CONFIG,
  LOVE_LETTER_BRANCH_EVENTS,
  getTendencyHint,
  calculateLoveLetterEnding
} from '../data/gameData';

export const useLoveLetterEnding = (level) => {
  const [affection, setAffection] = useState(LOVE_LETTER_CONFIG.BASE_AFFECTION);
  const [perfectMoves, setPerfectMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [timeouts, setTimeouts] = useState(0);
  const [restarts, setRestarts] = useState(0);
  const [hintUsage, setHintUsage] = useState(0);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState(0);
  const [lastMatchWasPerfect, setLastMatchWasPerfect] = useState(false);
  const [showTendencyHint, setShowTendencyHint] = useState(false);
  const [affectionHistory, setAffectionHistory] = useState([]);

  const stateRef = useRef({});
  const lastTriggeredEventsRef = useRef([]);

  useEffect(() => {
    stateRef.current = {
      affection,
      perfectMoves,
      mistakes,
      timeouts,
      restarts,
      hintUsage,
      consecutiveMistakes,
      lastMatchWasPerfect
    };
  });

  const triggerEvent = useCallback((eventType, customChange = 0) => {
    const event = LOVE_LETTER_BRANCH_EVENTS[eventType];
    if (!event) return;

    const change = customChange !== 0 ? customChange : event.affectionChange;

    setAffection(prev => {
      const newValue = Math.max(
        LOVE_LETTER_CONFIG.MIN_AFFECTION,
        Math.min(LOVE_LETTER_CONFIG.MAX_AFFECTION,
        prev + change)
      );

      setAffectionHistory(history => [...history.slice(-9), { value: newValue, timestamp: Date.now(), event: event.id }]);

      return newValue;
    });

    setCurrentEvent({ ...event, actualChange: change });
    setShowEventPopup(true);

    lastTriggeredEventsRef.current.push(event.id);
    if (lastTriggeredEventsRef.current.length > 5) {
      lastTriggeredEventsRef.current.shift();
    }

    setTimeout(() => {
      setShowEventPopup(false);
    }, 2000);
  }, []);

  const onMatch = useCallback((comboCount, moveEfficiency) => {
  const isPerfect = moveEfficiency >= 0.8;

  if (isPerfect) {
    setPerfectMoves(prev => prev + 1);
    setLastMatchWasPerfect(true);
  } else {
    setLastMatchWasPerfect(false);
  }

  if (comboCount >= 5 && comboCount % 5 === 0) {
    triggerEvent('GREAT_COMBO');
  } else if (isPerfect && Math.random() < 0.3) {
    triggerEvent('PERFECT_MATCH');
  }

  setConsecutiveMistakes(0);
}, [triggerEvent]);

  const onMismatch = useCallback(() => {
    setMistakes(prev => prev + 1);
    setLastMatchWasPerfect(false);

    setConsecutiveMistakes(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        triggerEvent('TOO_MANY_MISTAKES');
      }
      return newCount;
    });
  }, [triggerEvent]);

  const onTimeout = useCallback(() => {
    setTimeouts(prev => prev + 1);
    triggerEvent('TIMEOUT_OCCURRED');
    setConsecutiveMistakes(0);
  }, [triggerEvent]);

  const onRestart = useCallback(() => {
    setRestarts(prev => prev + 1);
    
    if ((stateRef.current.restarts + 1) % 2 === 0) {
      triggerEvent('RESTART_TOO_MANY');
    }

    setAffection(prev => Math.max(
      LOVE_LETTER_CONFIG.MIN_AFFECTION,
      Math.min(LOVE_LETTER_CONFIG.MAX_AFFECTION,
      prev - LOVE_LETTER_CONFIG.RESTART_PENALTY)
    ));
  }, [triggerEvent]);

  const onHintUsed = useCallback(() => {
    setHintUsage(prev => prev + 1);
    triggerEvent('HINT_USED');
  }, [triggerEvent]);

  const onProtectUsed = useCallback(() => {
    triggerEvent('PROTECT_USED');
  }, [triggerEvent]);

  const onTimeWarning = useCallback(() => {
    if (!lastTriggeredEventsRef.current.includes('time_running_out')) {
      triggerEvent('TIME_RUNNING_OUT');
    }
  }, [triggerEvent]);

  const resetSession = useCallback(() => {
    setAffection(prevAffection => {
      const newValue = Math.max(
        LOVE_LETTER_CONFIG.MIN_AFFECTION,
        Math.min(LOVE_LETTER_CONFIG.MAX_AFFECTION,
        prevAffection - LOVE_LETTER_CONFIG.RESTART_PENALTY)
      );
      return newValue;
    });
    setPerfectMoves(0);
    setMistakes(0);
    setConsecutiveMistakes(0);
    setLastMatchWasPerfect(false);
    setCurrentEvent(null);
    setShowEventPopup(false);
    setAffectionHistory([]);
  }, []);

  const fullReset = useCallback(() => {
    setAffection(LOVE_LETTER_CONFIG.BASE_AFFECTION);
    setPerfectMoves(0);
    setMistakes(0);
    setTimeouts(0);
    setRestarts(0);
    setHintUsage(0);
    setConsecutiveMistakes(0);
    setLastMatchWasPerfect(false);
    setCurrentEvent(null);
    setShowEventPopup(false);
    setAffectionHistory([]);
    lastTriggeredEventsRef.current = [];
  }, []);

  const getCurrentTendency = useCallback(() => {
    return getTendencyHint(affection);
  }, [affection]);

  const getEndingResult = useCallback((finalStats) => {
    const stats = {
      moves: finalStats.moves,
      maxCombo: finalStats.maxCombo,
      timeouts,
      restarts,
      level,
      perfectMoves,
      mistakes,
      ...finalStats
    };

    return calculateLoveLetterEnding(stats);
  }, [timeouts, restarts, level, perfectMoves, mistakes]);

  const getAffectionBreakdown = useCallback(() => {
    return {
      current: affection,
      base: LOVE_LETTER_CONFIG.BASE_AFFECTION,
      perfectBonus: perfectMoves * LOVE_LETTER_CONFIG.PERFECT_MOVE_BONUS,
      mistakePenalty: -mistakes * LOVE_LETTER_CONFIG.MISTAKE_PENALTY,
      timeoutPenalty: -timeouts * LOVE_LETTER_CONFIG.TIMEOUT_PENALTY,
      restartPenalty: -restarts * LOVE_LETTER_CONFIG.RESTART_PENALTY,
      hintPenalty: -hintUsage * 3,
      progress: ((affection + 100) / 2)
    };
  }, [affection, perfectMoves, mistakes, timeouts, restarts, hintUsage]);

  const getStatsSummary = useCallback(() => {
    return {
      affection,
      perfectMoves,
      mistakes,
      timeouts,
      restarts,
      hintUsage,
      consecutiveMistakes,
      lastMatchWasPerfect,
      tendency: getCurrentTendency()
    };
  }, [affection, perfectMoves, mistakes, timeouts, restarts, hintUsage, consecutiveMistakes, lastMatchWasPerfect, getCurrentTendency]);

  return {
    affection,
    perfectMoves,
    mistakes,
    timeouts,
    restarts,
    hintUsage,
    currentEvent,
    showEventPopup,
    showTendencyHint,
    setShowTendencyHint,
    consecutiveMistakes,
    lastMatchWasPerfect,
    affectionHistory,
    onMatch,
    onMismatch,
    onTimeout,
    onRestart,
    onHintUsed,
    onProtectUsed,
    onTimeWarning,
    resetSession,
    fullReset,
    getCurrentTendency,
    getEndingResult,
    getAffectionBreakdown,
    getStatsSummary,
    triggerEvent
  };
};
