import { useState, useEffect, useCallback, useRef } from 'react';
import { getBossConfig, FAKE_CARD_SYMBOLS, FAKE_CARD_NAMES } from '../data/gameData';

export const useBossBattle = (levelId, gameStatus, matchedPairs, totalPairs, allMatched = false, triggerBossVictory = null) => {
  const bossConfig = getBossConfig(levelId);
  const isBoss = !!bossConfig;

  const [bossHp, setBossHp] = useState(bossConfig?.maxHp || 0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseTransition, setPhaseTransition] = useState(false);
  const [castingSkill, setCastingSkill] = useState(null);
  const [castProgress, setCastProgress] = useState(0);
  const [interruptReady, setInterruptReady] = useState(false);
  const [fakeCardIds, setFakeCardIds] = useState([]);
  const [showFinale, setShowFinale] = useState(false);
  const [finaleScene, setFinaleScene] = useState(0);
  const [bossAttacked, setBossAttacked] = useState(false);
  const [damagePopup, setDamagePopup] = useState(null);
  const [interruptRewardPopup, setInterruptRewardPopup] = useState(null);

  const skillTimerRef = useRef(null);
  const castTimerRef = useRef(null);
  const castStartRef = useRef(0);
  const lastMatchedRef = useRef(0);
  const finaleTriggeredRef = useRef(false);
  const currentPhaseForFakeCardsRef = useRef(1);

  const getPhase = useCallback((hpPercent) => {
    if (!bossConfig) return null;
    for (let i = bossConfig.phases.length - 1; i >= 0; i--) {
      if (hpPercent <= bossConfig.phases[i].hpThreshold) {
        return bossConfig.phases[i];
      }
    }
    return bossConfig.phases[0];
  }, [bossConfig]);

  const getCurrentPhaseConfig = useCallback(() => {
    if (!bossConfig) return null;
    const hpPercent = (bossHp / (bossConfig.maxHp || 1)) * 100;
    return getPhase(hpPercent);
  }, [bossConfig, bossHp, getPhase]);

  const calculateDamage = useCallback((pairIndex) => {
    if (!bossConfig) return 0;
    const phaseConfig = getCurrentPhaseConfig();
    const baseDamage = bossConfig.maxHp / totalPairs;
    const comboBonus = 1 + (pairIndex * 0.05);
    return Math.floor((baseDamage * comboBonus) / (phaseConfig?.defenseMultiplier || 1));
  }, [bossConfig, totalPairs, getCurrentPhaseConfig]);

  const generateFakeCards = useCallback((cards) => {
    if (!bossConfig || !cards) return [];
    const phaseConfig = getCurrentPhaseConfig();
    if (!phaseConfig) return [];

    const fakeIds = [];
    const unmatchedCards = cards.filter(c => !c.isMatched);
    
    unmatchedCards.forEach(card => {
      if (Math.random() < phaseConfig.fakeCardChance) {
        fakeIds.push(card.id);
      }
    });

    return fakeIds;
  }, [bossConfig, getCurrentPhaseConfig]);

  const isFakeCard = useCallback((cardId) => {
    return fakeCardIds.includes(cardId);
  }, [fakeCardIds]);

  const getFakeCardInfo = useCallback((cardId) => {
    if (!isFakeCard(cardId)) return null;
    const index = Math.floor(Math.random() * FAKE_CARD_SYMBOLS.length);
    return {
      symbol: FAKE_CARD_SYMBOLS[index],
      name: FAKE_CARD_NAMES[index],
      color: '#4b5563'
    };
  }, [isFakeCard]);

  const triggerRandomSkill = useCallback(() => {
    if (!bossConfig || castingSkill || gameStatus !== 'playing') return;

    const skills = bossConfig.skills;
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    
    setCastingSkill(randomSkill);
    setCastProgress(0);
    setInterruptReady(true);
    castStartRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - castStartRef.current;
      const progress = Math.min(100, (elapsed / randomSkill.castTime) * 100);
      setCastProgress(progress);

      if (progress >= 100) {
        executeSkill(randomSkill);
      } else {
        castTimerRef.current = requestAnimationFrame(updateProgress);
      }
    };
    castTimerRef.current = requestAnimationFrame(updateProgress);
  }, [bossConfig, castingSkill, gameStatus]);

  const executeSkill = useCallback((skill) => {
    setCastingSkill(null);
    setCastProgress(0);
    setInterruptReady(false);
    if (castTimerRef.current) {
      cancelAnimationFrame(castTimerRef.current);
    }

    const event = new CustomEvent('bossSkill', { detail: { skill, interrupted: false } });
    window.dispatchEvent(event);
  }, []);

  const interruptSkill = useCallback(() => {
    if (!castingSkill || !interruptReady) return false;

    const interruptedSkill = castingSkill;
    setCastingSkill(null);
    setCastProgress(0);
    setInterruptReady(false);
    if (castTimerRef.current) {
      cancelAnimationFrame(castTimerRef.current);
    }

    setInterruptRewardPopup(bossConfig?.interruptReward || { score: 500, combo: 2, time: 5 });
    setTimeout(() => setInterruptRewardPopup(null), 2000);

    const event = new CustomEvent('bossSkill', { 
      detail: { skill: interruptedSkill, interrupted: true, reward: bossConfig?.interruptReward } 
    });
    window.dispatchEvent(event);

    return true;
  }, [castingSkill, interruptReady, bossConfig]);

  const dealDamageToBoss = useCallback(() => {
    if (!bossConfig) return;
    
    const newMatched = matchedPairs.length;
    if (newMatched <= lastMatchedRef.current) return;

    const pairsGained = newMatched - lastMatchedRef.current;
    let totalDamage = 0;
    
    for (let i = 0; i < pairsGained; i++) {
      totalDamage += calculateDamage(lastMatchedRef.current + i);
    }

    lastMatchedRef.current = newMatched;

    setBossHp(prev => {
      const newHp = Math.max(0, prev - totalDamage);
      const oldPercent = (prev / bossConfig.maxHp) * 100;
      const newPercent = (newHp / bossConfig.maxHp) * 100;
      
      const oldPhase = getPhase(oldPercent);
      const newPhase = getPhase(newPercent);
      
      if (newPhase && oldPhase && newPhase.id > oldPhase.id) {
        setPhaseTransition(true);
        setCurrentPhase(newPhase.id);
        setTimeout(() => setPhaseTransition(false), 2500);
      }

      return newHp;
    });

    setDamagePopup({ value: totalDamage, id: Date.now() });
    setBossAttacked(true);
    setTimeout(() => {
      setBossAttacked(false);
      setDamagePopup(null);
    }, 1000);
  }, [bossConfig, matchedPairs.length, calculateDamage, getPhase]);

  const startFinaleAnimation = useCallback(() => {
    if (!bossConfig?.finaleAnimation) return;
    setShowFinale(true);
    setFinaleScene(0);

    const scenes = bossConfig.finaleAnimation.scenes;
    let currentScene = 0;

    const playScene = () => {
      if (currentScene >= scenes.length) {
        setTimeout(() => {
          setShowFinale(false);
          if (triggerBossVictory) {
            triggerBossVictory();
          }
        }, 1000);
        return;
      }

      setFinaleScene(currentScene);
      setTimeout(() => {
        currentScene++;
        playScene();
      }, scenes[currentScene].duration);
    };

    playScene();
  }, [bossConfig, triggerBossVictory]);

  const refreshFakeCards = useCallback((cards, force = false) => {
    const phaseConfig = getCurrentPhaseConfig();
    const currentPhaseId = phaseConfig?.id || 1;
    
    if (!force && currentPhaseForFakeCardsRef.current === currentPhaseId && fakeCardIds.length > 0) {
      return;
    }
    
    currentPhaseForFakeCardsRef.current = currentPhaseId;
    const revealedCardIds = cards.filter(c => c.isFlipped || c.isMatched).map(c => c.id);
    const unrevealedCards = cards.filter(c => !c.isFlipped && !c.isMatched);
    
    const newFakeIds = generateFakeCards(unrevealedCards).filter(id => !revealedCardIds.includes(id));
    setFakeCardIds(newFakeIds);
  }, [generateFakeCards, getCurrentPhaseConfig, fakeCardIds.length]);

  useEffect(() => {
    if (!isBoss || !bossConfig) return;

    if (gameStatus === 'playing' && !skillTimerRef.current) {
      const phaseConfig = getCurrentPhaseConfig();
      const interval = phaseConfig?.skillInterval || 20000;
      
      skillTimerRef.current = setInterval(() => {
        triggerRandomSkill();
      }, interval);
    }

    return () => {
      if (skillTimerRef.current) {
        clearInterval(skillTimerRef.current);
        skillTimerRef.current = null;
      }
      if (castTimerRef.current) {
        cancelAnimationFrame(castTimerRef.current);
      }
    };
  }, [isBoss, bossConfig, gameStatus, triggerRandomSkill, getCurrentPhaseConfig]);

  useEffect(() => {
    if (isBoss && matchedPairs.length > lastMatchedRef.current) {
      dealDamageToBoss();
    }
  }, [matchedPairs.length, isBoss, dealDamageToBoss]);

  useEffect(() => {
    if (isBoss && bossHp <= 0 && !finaleTriggeredRef.current && (gameStatus === 'playing' || allMatched)) {
      finaleTriggeredRef.current = true;
      setTimeout(() => {
        startFinaleAnimation();
      }, 800);
    }
  }, [bossHp, isBoss, gameStatus, showFinale, allMatched, startFinaleAnimation]);

  useEffect(() => {
    if (!isBoss || gameStatus !== 'playing') return;
    
    const phaseConfig = getCurrentPhaseConfig();
    if (skillTimerRef.current) {
      clearInterval(skillTimerRef.current);
    }
    
    const interval = phaseConfig?.skillInterval || 20000;
    skillTimerRef.current = setInterval(() => {
      triggerRandomSkill();
    }, interval);

    return () => {
      if (skillTimerRef.current) {
        clearInterval(skillTimerRef.current);
      }
    };
  }, [currentPhase, isBoss, gameStatus, triggerRandomSkill, getCurrentPhaseConfig]);

  useEffect(() => {
    if (isBoss && allMatched && bossHp > 0 && gameStatus !== 'won' && !finaleTriggeredRef.current) {
      setBossHp(0);
    }
  }, [allMatched, isBoss, bossHp, gameStatus]);

  useEffect(() => {
    if (isBoss && phaseTransition && fakeCardIds.length > 0) {
      currentPhaseForFakeCardsRef.current = 0;
    }
  }, [phaseTransition, isBoss, fakeCardIds.length]);

  const resetBoss = useCallback(() => {
    if (!bossConfig) return;
    setBossHp(bossConfig.maxHp);
    setCurrentPhase(1);
    setPhaseTransition(false);
    setCastingSkill(null);
    setCastProgress(0);
    setInterruptReady(false);
    setFakeCardIds([]);
    setShowFinale(false);
    setFinaleScene(0);
    setBossAttacked(false);
    setDamagePopup(null);
    setInterruptRewardPopup(null);
    lastMatchedRef.current = 0;
    finaleTriggeredRef.current = false;
    currentPhaseForFakeCardsRef.current = 1;

    if (skillTimerRef.current) {
      clearInterval(skillTimerRef.current);
      skillTimerRef.current = null;
    }
    if (castTimerRef.current) {
      cancelAnimationFrame(castTimerRef.current);
    }
  }, [bossConfig]);

  return {
    isBoss,
    bossConfig,
    bossHp,
    bossHpPercent: bossConfig ? (bossHp / bossConfig.maxHp) * 100 : 0,
    currentPhase,
    currentPhaseConfig: getCurrentPhaseConfig(),
    phaseTransition,
    castingSkill,
    castProgress,
    interruptReady,
    fakeCardIds,
    isFakeCard,
    getFakeCardInfo,
    showFinale,
    finaleScene,
    bossAttacked,
    damagePopup,
    interruptRewardPopup,
    interruptSkill,
    refreshFakeCards,
    resetBoss,
    startFinaleAnimation
  };
};
