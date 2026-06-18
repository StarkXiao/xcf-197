import { useState, useEffect, useCallback, useRef } from 'react';
import { getStarById, isBossLevel } from '../data/gameData';

export const useGameLogic = (level, options = {}) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [gameStatus, setGameStatus] = useState('idle');
  const [hintCards, setHintCards] = useState([]);
  const [mistakeProtected, setMistakeProtected] = useState(false);
  const [seenStars, setSeenStars] = useState([]);

  const initializedRef = useRef(false);
  const isBoss = level ? isBossLevel(level.id) : false;
  const [allMatched, setAllMatched] = useState(false);

  const initializeCards = useCallback(() => {
    if (!level) return;

    const cardPairs = level.stars.map(starId => {
      const star = getStarById(starId);
      return [
        { id: `${starId}-a`, starId, star, isFlipped: false, isMatched: false, isHinted: false },
        { id: `${starId}-b`, starId, star, isFlipped: false, isMatched: false, isHinted: false }
      ];
    }).flat();

    let shuffled = shuffleArray(cardPairs);
    
    if (options.perfectStart && !initializedRef.current) {
      initializedRef.current = true;
      const firstStarId = shuffled[0]?.starId;
      if (firstStarId) {
        shuffled = shuffled.map(card => ({
          ...card,
          isMatched: card.starId === firstStarId,
          isFlipped: card.starId === firstStarId
        }));
        setMatchedPairs([firstStarId]);
      }
    }

    setCards(shuffled);
    setFlippedCards([]);
    if (!options.perfectStart || initializedRef.current) {
      setMatchedPairs([]);
    }
    setMoves(0);
    setIsLocked(false);
    setGameStatus('idle');
    setHintCards([]);
    setMistakeProtected(false);
    setSeenStars([]);
  }, [level, options.perfectStart]);

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

  const flipCard = useCallback((cardId, { useMistakeProtect = false } = {}) => {
    if (isLocked) return { matched: false, mistakeProtected: false };
    if (gameStatus !== 'playing' && gameStatus !== 'idle') return { matched: false, mistakeProtected: false };

    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return { matched: false, mistakeProtected: false };

    if (gameStatus === 'idle') {
      setGameStatus('playing');
    }

    setHintCards([]);
    setCards(prev => prev.map(c => ({ ...c, isHinted: false })));

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
        return { matched: true, mistakeProtected: false };
      } else {
        const shouldProtect = useMistakeProtect && options.hasMistakeProtect;
        
        if (shouldProtect) {
          setMistakeProtected(true);
          setTimeout(() => {
            setCards(prev => prev.map(c =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            ));
            setFlippedCards([]);
            setIsLocked(false);
            setMistakeProtected(false);
          }, 1000);
          return { matched: false, mistakeProtected: true };
        } else {
          setTimeout(() => {
            setCards(prev => prev.map(c =>
              newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
            ));
            setFlippedCards([]);
            setIsLocked(false);
          }, 1000);
          return { matched: false, mistakeProtected: false };
        }
      }
    }
    return { matched: false, mistakeProtected: false };
  }, [cards, flippedCards, isLocked, gameStatus, options.hasMistakeProtect]);

  const showHint = useCallback(() => {
    const unmatchedCards = cards.filter(c => !c.isMatched && !c.isFlipped);
    if (unmatchedCards.length < 2) return null;

    const firstUnmatched = unmatchedCards[0];
    const pairCard = unmatchedCards.find(c => 
      c.starId === firstUnmatched.starId && c.id !== firstUnmatched.id
    );

    if (!pairCard) return null;

    const hintPair = [firstUnmatched.id, pairCard.id];
    setHintCards(hintPair);
    setCards(prev => prev.map(c => ({
      ...c,
      isHinted: hintPair.includes(c.id)
    })));

    setTimeout(() => {
      setHintCards([]);
      setCards(prev => prev.map(c => ({ ...c, isHinted: false })));
    }, 3000);

    return hintPair;
  }, [cards]);

  useEffect(() => {
    if (level && matchedPairs.length === level.pairs && gameStatus === 'playing') {
      if (isBoss) {
        setAllMatched(true);
      } else {
        setGameStatus('won');
      }
    }
  }, [matchedPairs, level, gameStatus, isBoss]);

  const triggerBossVictory = useCallback(() => {
    if (isBoss) {
      setGameStatus('won');
    }
  }, [isBoss]);

  const getUnmatchedCards = useCallback(() => {
    return cards.filter(c => !c.isMatched);
  }, [cards]);

  const shuffleUnmatchedCards = useCallback(() => {
    const unmatched = cards.filter(c => !c.isMatched && !c.isFlipped);
    const matched = cards.filter(c => c.isMatched || c.isFlipped);
    
    const shuffled = [...unmatched];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setCards([...matched, ...shuffled]);
  }, [cards]);

  const instantMatchPair = useCallback(() => {
    const unmatched = cards.filter(c => !c.isMatched);
    if (unmatched.length < 2) return null;
    
    const firstCard = unmatched[0];
    const pairCard = unmatched.find(c => c.starId === firstCard.starId && c.id !== firstCard.id);
    
    if (!pairCard) return null;
    
    setIsLocked(true);
    setCards(prev => prev.map(c =>
      c.starId === firstCard.starId ? { ...c, isFlipped: true } : c
    ));
    
    setTimeout(() => {
      setCards(prev => prev.map(c =>
        c.starId === firstCard.starId ? { ...c, isMatched: true } : c
      ));
      setMatchedPairs(prev => [...prev, firstCard.starId]);
      setIsLocked(false);
    }, 600);
    
    return [firstCard.id, pairCard.id];
  }, [cards]);

  const revealAllCards = useCallback((reveal) => {
    setCards(prev => prev.map(c => ({
      ...c,
      isFlipped: reveal ? true : (c.isMatched ? true : false)
    })));
  }, []);

  const setIsLockedExternal = useCallback((locked) => {
    setIsLocked(locked);
  }, []);

  const resetGame = useCallback(() => {
    initializedRef.current = false;
    setAllMatched(false);
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
    setGameStatus,
    showHint,
    hintCards,
    mistakeProtected,
    getUnmatchedCards,
    shuffleUnmatchedCards,
    instantMatchPair,
    revealAllCards,
    setIsLockedExternal,
    seenStars,
    allMatched,
    triggerBossVictory,
    isBoss
  };
};
