import { useState, useEffect, useCallback, useRef } from 'react';
import { getStarById } from '../data/gameData';

export const useGameLogic = (level) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStatus, setGameStatus] = useState('idle');

  const initializeCards = useCallback(() => {
    if (!level) return;

    const cardPairs = level.stars.map(starId => {
      const star = getStarById(starId);
      return [
        { id: `${starId}-a`, starId, star, isFlipped: false, isMatched: false },
        { id: `${starId}-b`, starId, star, isFlipped: false, isMatched: false }
      ];
    }).flat();

    const shuffled = shuffleArray(cardPairs);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setIsLocked(false);
    setGameStatus('idle');
  }, [level]);

  useEffect(() => {
    if (level) {
      initializeCards();
    }
  }, [level, initializeCards]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const flipCard = useCallback((cardId) => {
    if (isLocked) return;
    if (gameStatus !== 'playing' && gameStatus !== 'idle') return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      setIsLocked(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard.starId === secondCard.starId) {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.starId === firstCard.starId ? { ...c, isMatched: true } : c
          ));
          setMatchedPairs(prev => [...prev, firstCard.starId]);
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  }, [cards, flippedCards, isLocked, gameStatus]);

  useEffect(() => {
    if (level && matchedPairs.length === level.pairs && gameStatus === 'playing') {
      setGameStatus('won');
    }
  }, [matchedPairs, level, gameStatus]);

  const resetGame = useCallback(() => {
    initializeCards();
  }, [initializeCards]);

  return {
    cards,
    flippedCards,
    matchedPairs,
    moves,
    gameStatus,
    isLocked,
    flipCard,
    resetGame,
    setGameStatus
  };
};
