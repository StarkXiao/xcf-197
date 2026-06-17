import { useState, useCallback, useRef } from 'react';

export const useScore = (baseScore = 1000) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const lastMatchTime = useRef(null);

  const calculateMatchScore = useCallback((timeLeft, timeLimit, moves) => {
    const timeBonus = Math.floor((timeLeft / timeLimit) * 500);
    const moveBonus = Math.max(0, 300 - moves * 10);
    const comboBonus = combo * 50;
    const base = Math.floor(baseScore / 10);

    return base + timeBonus + moveBonus + comboBonus;
  }, [baseScore, combo]);

  const addMatchScore = useCallback((timeLeft, timeLimit, moves) => {
    const now = Date.now();
    const isCombo = lastMatchTime.current && (now - lastMatchTime.current < 2000);

    if (isCombo) {
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(max => Math.max(max, newCombo));
        return newCombo;
      });
    } else {
      setCombo(1);
      setMaxCombo(prev => Math.max(prev, 1));
    }

    lastMatchTime.current = now;

    const points = calculateMatchScore(timeLeft, timeLimit, moves);
    setScore(prev => prev + points);

    return points;
  }, [calculateMatchScore]);

  const calculateFinalScore = useCallback((timeLeft, timeLimit, moves, matchedPairs, totalPairs) => {
    const completionBonus = Math.floor((matchedPairs / totalPairs) * baseScore);
    const timeBonus = Math.floor((timeLeft / timeLimit) * baseScore * 0.5);
    const efficiencyBonus = Math.max(0, baseScore * 0.3 - moves * 5);
    
    return score + completionBonus + timeBonus + efficiencyBonus;
  }, [baseScore, score]);

  const resetScore = useCallback(() => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    lastMatchTime.current = null;
  }, []);

  const resetCombo = useCallback(() => {
    setCombo(0);
    lastMatchTime.current = null;
  }, []);

  const addScore = useCallback((points) => {
    setScore(prev => prev + points);
  }, []);

  const reduceScore = useCallback((points) => {
    setScore(prev => Math.max(0, prev - points));
  }, []);

  return {
    score,
    combo,
    maxCombo,
    addMatchScore,
    calculateFinalScore,
    resetScore,
    setScore,
    resetCombo,
    addScore,
    reduceScore
  };
};
