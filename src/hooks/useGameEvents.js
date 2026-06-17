import { useState, useCallback, useRef } from 'react';
import {
  pickRandomEvent,
  shouldTriggerEvent,
  GAME_EVENT_CONFIG,
  GAME_EVENT_TYPES,
  GAME_EVENT_CATEGORIES
} from '../data/gameData';

export const useGameEvents = (options = {}) => {
  const [activeEvents, setActiveEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [foggedCardIds, setFoggedCardIds] = useState([]);
  const [frozenOperation, setFrozenOperation] = useState(false);
  const [pendingComboBoost, setPendingComboBoost] = useState(0);
  const [revealedCardIds, setRevealedCardIds] = useState([]);

  const flipCountSinceLastEventRef = useRef(0);
  const lastEventIdsRef = useRef([]);

  const incrementFlipCount = useCallback(() => {
    flipCountSinceLastEventRef.current += 1;
  }, []);

  const resetFlipCount = useCallback(() => {
    flipCountSinceLastEventRef.current = 0;
  }, []);

  const tryTriggerEvent = useCallback((triggerType, cards = []) => {
    if (!shouldTriggerEvent(triggerType, flipCountSinceLastEventRef.current)) {
      return null;
    }
    if (activeEvents.length >= GAME_EVENT_CONFIG.maxActiveEvents) {
      return null;
    }

    const event = pickRandomEvent(triggerType, lastEventIdsRef.current);
    if (!event) return null;

    lastEventIdsRef.current = [event.id, ...lastEventIdsRef.current].slice(0, 3);
    flipCountSinceLastEventRef.current = 0;

    setCurrentEvent(event);
    setShowEventModal(true);
    setActiveEvents(prev => [...prev, { ...event, triggeredAt: Date.now() }]);

    return event;
  }, [activeEvents.length]);

  const applyEventEffect = useCallback((event, actions = {}) => {
    if (!event || !event.effect) return;

    const { type, value, duration } = event.effect;

    switch (type) {
      case 'addTime':
        if (actions.addTime) actions.addTime(value);
        break;
      case 'reduceTime':
        if (actions.reduceTime) actions.reduceTime(value);
        break;
      case 'addScore':
        if (actions.addScore) actions.addScore(value);
        break;
      case 'reduceScore':
        if (actions.reduceScore) actions.reduceScore(value);
        break;
      case 'resetCombo':
        if (actions.resetCombo) actions.resetCombo();
        break;
      case 'comboBoost':
        setPendingComboBoost(prev => prev + value);
        break;
      case 'freezeOperation':
        setFrozenOperation(true);
        setTimeout(() => setFrozenOperation(false), duration || 2000);
        break;
      case 'fogCards': {
        const unmatched = actions.getUnmatchedCards ? actions.getUnmatchedCards() : [];
        const coverage = event.effect.coverage || 0.5;
        const count = Math.max(2, Math.floor(unmatched.length * coverage));
        const shuffled = [...unmatched].sort(() => Math.random() - 0.5);
        const fogged = shuffled.slice(0, count).map(c => c.id);
        setFoggedCardIds(fogged);
        setTimeout(() => setFoggedCardIds([]), duration || 3000);
        break;
      }
      case 'revealPair': {
        const hintPair = actions.showHint ? actions.showHint() : null;
        if (hintPair) {
          setRevealedCardIds(hintPair);
          setTimeout(() => setRevealedCardIds([]), duration || 2000);
        }
        break;
      }
      case 'revealAll': {
        if (actions.revealAllCards) actions.revealAllCards(true);
        setTimeout(() => {
          if (actions.revealAllCards) actions.revealAllCards(false);
        }, duration || 2000);
        break;
      }
      case 'shuffleUnmatched':
        if (actions.shuffleUnmatchedCards) actions.shuffleUnmatchedCards();
        break;
      case 'instantMatch':
        if (actions.instantMatchPair) actions.instantMatchPair();
        break;
      default:
        break;
    }
  }, []);

  const consumePendingComboBoost = useCallback(() => {
    const boost = pendingComboBoost;
    setPendingComboBoost(0);
    return boost;
  }, [pendingComboBoost]);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setTimeout(() => setCurrentEvent(null), 300);
  }, []);

  const removeActiveEvent = useCallback((eventId) => {
    setActiveEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const resetEvents = useCallback(() => {
    setActiveEvents([]);
    setCurrentEvent(null);
    setShowEventModal(false);
    setFoggedCardIds([]);
    setFrozenOperation(false);
    setPendingComboBoost(0);
    setRevealedCardIds([]);
    flipCountSinceLastEventRef.current = 0;
    lastEventIdsRef.current = [];
  }, []);

  const isCardFogged = useCallback((cardId) => {
    return foggedCardIds.includes(cardId);
  }, [foggedCardIds]);

  const isCardRevealed = useCallback((cardId) => {
    return revealedCardIds.includes(cardId);
  }, [revealedCardIds]);

  return {
    activeEvents,
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
  };
};
