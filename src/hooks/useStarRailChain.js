import { useState, useCallback, useRef, useEffect } from 'react';
import {
  getStarRailChainLevel,
  getStarRailTitle,
  getStarRailStoryEvent,
  STAR_RAIL_CHAIN_LEVELS
} from '../data/gameData';

export const useStarRailChain = () => {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [showStoryEvent, setShowStoryEvent] = useState(false);
  const [currentStoryEvent, setCurrentStoryEvent] = useState(null);
  const [bonusMultiplier, setBonusMultiplier] = useState(0);
  const [triggeredEvents, setTriggeredEvents] = useState([]);
  const [isChainActive, setIsChainActive] = useState(false);
  const lastMatchTime = useRef(null);
  const chainTimeoutRef = useRef(null);
  const currentLevelRef = useRef(null);
  const triggeredEventsRef = useRef([]);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  useEffect(() => {
    triggeredEventsRef.current = triggeredEvents;
  }, [triggeredEvents]);

  const getTotalMultiplier = useCallback(() => {
    const baseMultiplier = currentLevel?.scoreMultiplier || 1;
    return baseMultiplier + bonusMultiplier;
  }, [currentLevel, bonusMultiplier]);

  const handleMatch = useCallback(() => {
    const now = Date.now();
    const chainWindow = 2500;
    let newComboValue = 1;

    if (lastMatchTime.current && (now - lastMatchTime.current < chainWindow)) {
      newComboValue = combo + 1;
    }

    setCombo(newComboValue);
    setMaxCombo(prev => Math.max(prev, newComboValue));

    const level = getStarRailChainLevel(newComboValue);
    if (level && (!currentLevelRef.current || level.level > currentLevelRef.current.level)) {
      setCurrentLevel(level);
      currentLevelRef.current = level;
    }

    const event = getStarRailStoryEvent(newComboValue);
    if (event && !triggeredEventsRef.current.includes(event.id)) {
      setTriggeredEvents(prev => [...prev, event.id]);
      triggeredEventsRef.current = [...triggeredEventsRef.current, event.id];
      setCurrentStoryEvent(event);
      setShowStoryEvent(true);
    }

    setIsChainActive(true);
    lastMatchTime.current = now;

    if (chainTimeoutRef.current) {
      clearTimeout(chainTimeoutRef.current);
    }

    chainTimeoutRef.current = setTimeout(() => {
      setIsChainActive(false);
    }, chainWindow);

    return newComboValue;
  }, [combo]);

  const handleMistake = useCallback(() => {
    setCombo(0);
    setCurrentLevel(null);
    setIsChainActive(false);
    setBonusMultiplier(0);
    lastMatchTime.current = null;
    currentLevelRef.current = null;

    if (chainTimeoutRef.current) {
      clearTimeout(chainTimeoutRef.current);
    }
  }, []);

  const applyStoryChoice = useCallback((choice) => {
    const effect = choice.effect;
    const result = { success: true };

    switch (effect.type) {
      case 'scoreBonus':
        result.scoreBonus = effect.value;
        break;
      case 'comboBoost':
        setCombo(prev => {
          const newCombo = prev + effect.value;
          setMaxCombo(max => Math.max(max, newCombo));
          
          const newLevel = getStarRailChainLevel(newCombo);
          if (newLevel && (!currentLevelRef.current || newLevel.level > currentLevelRef.current.level)) {
            setCurrentLevel(newLevel);
            currentLevelRef.current = newLevel;
          }
          
          return newCombo;
        });
        result.comboBoost = effect.value;
        break;
      case 'hint':
        result.hints = effect.value;
        break;
      case 'timeBonus':
        result.timeBonus = effect.value;
        break;
      case 'matchPair':
        result.matchPairs = effect.value;
        break;
      case 'multiplierBoost':
        setBonusMultiplier(prev => prev + effect.value);
        result.multiplierBoost = effect.value;
        break;
      case 'perfectStart':
        result.perfectStart = effect.value;
        break;
      default:
        result.success = false;
    }

    setShowStoryEvent(false);
    setCurrentStoryEvent(null);

    return result;
  }, []);

  const closeStoryEvent = useCallback(() => {
    setShowStoryEvent(false);
    setCurrentStoryEvent(null);
  }, []);

  const resetChain = useCallback(() => {
    setCombo(0);
    setMaxCombo(0);
    setCurrentLevel(null);
    setShowStoryEvent(false);
    setCurrentStoryEvent(null);
    setBonusMultiplier(0);
    setTriggeredEvents([]);
    setIsChainActive(false);
    lastMatchTime.current = null;
    currentLevelRef.current = null;
    triggeredEventsRef.current = [];

    if (chainTimeoutRef.current) {
      clearTimeout(chainTimeoutRef.current);
    }
  }, []);

  const getTitle = useCallback(() => {
    return getStarRailTitle(maxCombo);
  }, [maxCombo]);

  const getNextLevel = useCallback(() => {
    if (!currentLevel) {
      return STAR_RAIL_CHAIN_LEVELS[0];
    }
    const nextIndex = STAR_RAIL_CHAIN_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    if (nextIndex < STAR_RAIL_CHAIN_LEVELS.length) {
      return STAR_RAIL_CHAIN_LEVELS[nextIndex];
    }
    return null;
  }, [currentLevel]);

  return {
    combo,
    maxCombo,
    currentLevel,
    isChainActive,
    showStoryEvent,
    currentStoryEvent,
    scoreMultiplier: getTotalMultiplier(),
    baseMultiplier: currentLevel?.scoreMultiplier || 1,
    bonusMultiplier,
    handleMatch,
    handleMistake,
    applyStoryChoice,
    closeStoryEvent,
    resetChain,
    getTitle,
    getNextLevel
  };
};
