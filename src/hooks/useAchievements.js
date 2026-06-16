import { useState, useEffect, useCallback, useRef } from 'react';
import { ACHIEVEMENTS, TITLES, STAR_PATTERNS, LEVELS, getAchievementById, getTitleById } from '../data/gameData';

const getThreeStarCount = (chapterStars) => {
  return Object.values(chapterStars).filter(stars => stars >= 3).length;
};

const getRareFragmentsCount = (collectedFragments) => {
  return STAR_PATTERNS.filter(star => 
    ['rare', 'epic', 'legendary'].includes(star.rarity) && 
    collectedFragments.includes(star.id)
  ).length;
};

const getLegendaryFragmentsCount = (collectedFragments) => {
  return STAR_PATTERNS.filter(star => 
    star.rarity === 'legendary' && 
    collectedFragments.includes(star.id)
  ).length;
};

export const useAchievements = (archive) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [unlockedTitles, setUnlockedTitles] = useState([]);
  const [equippedTitle, setEquippedTitle] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const stateRef = useRef({});

  useEffect(() => {
    const savedAchievements = localStorage.getItem('starTowerAchievements');
    if (savedAchievements) {
      try {
        const data = JSON.parse(savedAchievements);
        setUnlockedAchievements(data.unlockedAchievements || []);
        setUnlockedTitles(data.unlockedTitles || []);
        setEquippedTitle(data.equippedTitle || null);
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
  }, []);

  useEffect(() => {
    stateRef.current = {
      unlockedAchievements,
      unlockedTitles,
      equippedTitle
    };
  });

  const saveAchievements = useCallback((data) => {
    const s = stateRef.current;
    const achievementData = {
      unlockedAchievements: data.unlockedAchievements !== undefined ? data.unlockedAchievements : s.unlockedAchievements,
      unlockedTitles: data.unlockedTitles !== undefined ? data.unlockedTitles : s.unlockedTitles,
      equippedTitle: data.equippedTitle !== undefined ? data.equippedTitle : s.equippedTitle
    };
    localStorage.setItem('starTowerAchievements', JSON.stringify(achievementData));
  }, []);

  const checkAchievementConditions = useCallback((archiveState) => {
    if (!archiveState) return { newUnlocked: [], newTitles: [] };

    const currentUnlocked = stateRef.current.unlockedAchievements || [];
    const currentTitles = stateRef.current.unlockedTitles || [];
    const newUnlocked = [];
    const newTitles = [];

    ACHIEVEMENTS.forEach((achievement) => {
      if (currentUnlocked.includes(achievement.id)) return;

      const cond = achievement.condition;
      if (!cond) return;

      let shouldUnlock = false;

      switch (cond.type) {
        case 'unlockedLevel':
          shouldUnlock = archiveState.unlockedChapters?.length >= cond.value || 
                        (archiveState.unlockedLevel && archiveState.unlockedLevel > cond.value);
          if (!shouldUnlock && archiveState.unlockedChapters) {
            const maxChapter = Math.max(...archiveState.unlockedChapters, 0);
            shouldUnlock = maxChapter >= cond.value;
          }
          break;

        case 'collectedFragments':
          shouldUnlock = (archiveState.collectedFragments?.length || 0) >= cond.value;
          break;

        case 'rareFragments':
          shouldUnlock = getRareFragmentsCount(archiveState.collectedFragments || []) >= cond.value;
          break;

        case 'legendaryFragments':
          shouldUnlock = getLegendaryFragmentsCount(archiveState.collectedFragments || []) >= cond.value;
          break;

        case 'maxCombo':
          shouldUnlock = (archiveState.maxCombo || 0) >= cond.value;
          break;

        case 'threeStarCount':
          shouldUnlock = getThreeStarCount(archiveState.chapterStars || {}) >= cond.value;
          break;

        case 'fastLevelCount':
          shouldUnlock = (archiveState.fastLevelCount || 0) >= cond.value;
          break;

        case 'totalPlayTime':
          shouldUnlock = (archiveState.totalPlayTime || 0) >= cond.value;
          break;

        case 'unlockedEndings':
          shouldUnlock = (archiveState.unlockedEndings?.length || 0) >= cond.value;
          break;

        case 'letterProgress':
          shouldUnlock = (archiveState.letterProgress || 0) >= cond.value;
          break;

        default:
          shouldUnlock = false;
      }

      if (shouldUnlock) {
        newUnlocked.push(achievement.id);
        if (achievement.titleReward && !currentTitles.includes(achievement.titleReward)) {
          newTitles.push(achievement.titleReward);
        }
      }
    });

    return { newUnlocked, newTitles };
  }, []);

  const unlockAchievements = useCallback((achievementIds, titleIds) => {
    if (achievementIds.length === 0 && titleIds.length === 0) return;

    const currentUnlocked = stateRef.current.unlockedAchievements || [];
    const currentTitles = stateRef.current.unlockedTitles || [];

    const updatedAchievements = [...new Set([...currentUnlocked, ...achievementIds])];
    const updatedTitles = [...new Set([...currentTitles, ...titleIds])];

    setUnlockedAchievements(updatedAchievements);
    setUnlockedTitles(updatedTitles);
    saveAchievements({
      unlockedAchievements: updatedAchievements,
      unlockedTitles: updatedTitles
    });

    if (achievementIds.length > 0) {
      setNewAchievements(prev => [...new Set([...prev, ...achievementIds])]);
      setShowUnlockAnimation(true);
      setShowModal(true);
    }
  }, [saveAchievements]);

  const checkAndUnlockAchievements = useCallback((archiveState) => {
    const { newUnlocked, newTitles } = checkAchievementConditions(archiveState);
    if (newUnlocked.length > 0 || newTitles.length > 0) {
      unlockAchievements(newUnlocked, newTitles);
    }
    return { newUnlocked, newTitles };
  }, [checkAchievementConditions, unlockAchievements]);

  const equipTitle = useCallback((titleId) => {
    if (titleId && !unlockedTitles.includes(titleId)) return false;
    setEquippedTitle(titleId);
    saveAchievements({ equippedTitle: titleId });
    return true;
  }, [unlockedTitles, saveAchievements]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
    setShowUnlockAnimation(false);
    setShowModal(false);
  }, []);

  const getAchievementProgress = useCallback((achievement, archiveState) => {
    if (!achievement?.condition) return { current: 0, total: 1, percentage: 0 };
    
    const cond = achievement.condition;
    let current = 0;
    let total = cond.value || 1;
    const state = archiveState || (archive ? {
      collectedFragments: archive.collectedFragments,
      unlockedChapters: archive.unlockedChapters,
      chapterStars: archive.chapterStars,
      totalPlayTime: archive.totalPlayTime,
      maxCombo: archive.maxCombo,
      letterProgress: archive.letterProgress,
      fastLevelCount: archive.fastLevelCount,
      unlockedEndings: archive.unlockedEndings
    } : {});

    switch (cond.type) {
      case 'unlockedLevel':
        current = state.unlockedChapters ? Math.max(...state.unlockedChapters, 0) : 0;
        total = cond.value;
        break;

      case 'collectedFragments':
        current = state.collectedFragments?.length || 0;
        total = cond.value;
        break;

      case 'rareFragments':
        current = getRareFragmentsCount(state.collectedFragments || []);
        total = cond.value;
        break;

      case 'legendaryFragments':
        current = getLegendaryFragmentsCount(state.collectedFragments || []);
        total = cond.value;
        break;

      case 'maxCombo':
        current = state.maxCombo || 0;
        total = cond.value;
        break;

      case 'threeStarCount':
        current = getThreeStarCount(state.chapterStars || {});
        total = cond.value;
        break;

      case 'fastLevelCount':
        current = state.fastLevelCount || 0;
        total = cond.value;
        break;

      case 'totalPlayTime':
        current = state.totalPlayTime || 0;
        total = cond.value;
        break;

      case 'unlockedEndings':
        current = state.unlockedEndings?.length || 0;
        total = cond.value;
        break;

      case 'letterProgress':
        current = state.letterProgress || 0;
        total = cond.value;
        break;

      default:
        current = 0;
        total = cond.value || 1;
    }

    const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
    
    return {
      current,
      total,
      percentage,
      isComplete: current >= total
    };
  }, [archive]);

  const getAchievementsWithStatus = useCallback(() => {
    return ACHIEVEMENTS.map(achv => {
      const progress = getAchievementProgress(achv);
      return {
        ...achv,
        unlocked: unlockedAchievements.includes(achv.id),
        isNew: newAchievements.includes(achv.id),
        progress
      };
    });
  }, [unlockedAchievements, newAchievements, getAchievementProgress]);

  const getTitlesWithStatus = useCallback(() => {
    return TITLES.map(title => ({
      ...title,
      unlocked: unlockedTitles.includes(title.id),
      equipped: equippedTitle === title.id
    }));
  }, [unlockedTitles, equippedTitle]);

  const getEquippedTitleInfo = useCallback(() => {
    if (!equippedTitle) return null;
    return getTitleById(equippedTitle);
  }, [equippedTitle]);

  const resetAchievements = useCallback(() => {
    setUnlockedAchievements([]);
    setUnlockedTitles([]);
    setEquippedTitle(null);
    setNewAchievements([]);
    localStorage.removeItem('starTowerAchievements');
  }, []);

  useEffect(() => {
    if (archive) {
      const archiveState = {
        collectedFragments: archive.collectedFragments,
        unlockedChapters: archive.unlockedChapters,
        chapterStars: archive.chapterStars,
        totalPlayTime: archive.totalPlayTime,
        maxCombo: archive.maxCombo,
        letterProgress: archive.letterProgress,
        fastLevelCount: archive.fastLevelCount,
        unlockedEndings: archive.unlockedEndings
      };
      checkAndUnlockAchievements(archiveState);
    }
  }, [
    archive?.collectedFragments?.length,
    archive?.unlockedChapters?.length,
    archive?.chapterStars,
    archive?.totalPlayTime,
    archive?.maxCombo,
    archive?.letterProgress,
    archive?.fastLevelCount,
    archive?.unlockedEndings?.length,
    checkAndUnlockAchievements
  ]);

  return {
    unlockedAchievements,
    unlockedTitles,
    equippedTitle,
    newAchievements,
    showUnlockAnimation,
    showModal,
    checkAndUnlockAchievements,
    unlockAchievements,
    equipTitle,
    closeModal,
    clearNewAchievements,
    getAchievementProgress,
    getAchievementsWithStatus,
    getTitlesWithStatus,
    getEquippedTitleInfo,
    resetAchievements
  };
};
