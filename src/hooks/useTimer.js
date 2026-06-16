import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (initialTime, isRunning = false, onTimeUp = null) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  useEffect(() => {
    if (isRunning && !isTimerRunning) {
      startTimer();
    } else if (!isRunning && isTimerRunning) {
      stopTimer();
    }
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft <= 0 && isTimerRunning) {
      stopTimer();
      if (onTimeUp) {
        onTimeUp();
      }
    }
  }, [timeLeft, isTimerRunning, onTimeUp]);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;

    setIsTimerRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  const resetTimer = useCallback((newTime = initialTime) => {
    stopTimer();
    setTimeLeft(newTime);
  }, [initialTime, stopTimer]);

  const addTime = useCallback((seconds) => {
    setTimeLeft(prev => prev + seconds);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    isTimerRunning,
    formattedTime: formatTime(timeLeft),
    startTimer,
    stopTimer,
    resetTimer,
    addTime
  };
};
