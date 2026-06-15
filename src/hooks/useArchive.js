import { useState, useEffect, useCallback } from 'react';
import { STAR_PATTERNS, LEVELS, HIDDEN_ENDINGS, REWARDS, getRarityColor } from '../data/gameData';

export const useArchive = () => {
  const [collectedFragments, setCollectedFragments] = useState([]);
  const [unlockedEndings, setUnlockedEndings] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [chapterStars, setChapterStars] = useState({});
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [letterProgress, setLetterProgress] = useState(0);

  useEffect(() => {
    const savedArchive = localStorage.getItem('starTowerArchive');
    if (savedArchive) {
      try {
        const data = JSON.parse(savedArchive);
        setCollectedFragments(data.collectedFragments || []);
        setUnlockedEndings(data.unlockedEndings || []);
        setClaimedRewards(data.claimedRewards || []);
        setUnlockedChapters(data.unlockedChapters || []);
        setChapterStars(data.chapterStars || {});
        setTotalPlayTime(data.totalPlayTime || 0);
        setMaxCombo(data.maxCombo || 0);
        setLetterProgress(data.letterProgress || 0);
      } catch (e) {
        console.error('Failed to load archive:', e);
      }
    }
  }, []);

  const saveArchive = useCallback((data) => {
    const archiveData = {
      collectedFragments: data.collectedFragments || collectedFragments,
      unlockedEndings: data.unlockedEndings || unlockedEndings,
      claimedRewards: data.claimedRewards || claimedRewards,
      unlockedChapters: data.unlockedChapters || unlockedChapters,
      chapterStars: data.chapterStars || chapterStars,
      totalPlayTime: data.totalPlayTime !== undefined ? data.totalPlayTime : totalPlayTime,
      maxCombo: data.maxCombo !== undefined ? data.maxCombo : maxCombo,
      letterProgress: data.letterProgress !== undefined ? data.letterProgress : letterProgress
    };
    localStorage.setItem('starTowerArchive', JSON.stringify(archiveData));
  }, [collectedFragments, unlockedEndings, claimedRewards, unlockedChapters, chapterStars, totalPlayTime, maxCombo, letterProgress]);

  const collectFragment = useCallback((starId) => {
    if (!collectedFragments.includes(starId)) {
      const newFragments = [...collectedFragments, starId];
      setCollectedFragments(newFragments);
      saveArchive({ collectedFragments: newFragments });
      checkEndingConditions();
      checkRewardConditions();
    }
  }, [collectedFragments, saveArchive]);

  const collectFragmentsFromLevel = useCallback((levelStars) => {
    levelStars.forEach(starId => {
      if (!collectedFragments.includes(starId)) {
        collectFragment(starId);
      }
    });
  }, [collectedFragments, collectFragment]);

  const unlockChapter = useCallback((chapterId) => {
    if (!unlockedChapters.includes(chapterId)) {
      const newChapters = [...unlockedChapters, chapterId];
      setUnlockedChapters(newChapters);
      saveArchive({ unlockedChapters: newChapters });
      checkEndingConditions();
      checkRewardConditions();
    }
  }, [unlockedChapters, saveArchive]);

  const setChapterStarRating = useCallback((chapterId, stars) => {
    const currentStars = chapterStars[chapterId] || 0;
    if (stars > currentStars) {
      const newStars = { ...chapterStars, [chapterId]: stars };
      setChapterStars(newStars);
      saveArchive({ chapterStars: newStars });
      checkEndingConditions();
      checkRewardConditions();
    }
  }, [chapterStars, saveArchive]);

  const updateLetterProgress = useCallback((progress) => {
    if (progress > letterProgress) {
      setLetterProgress(progress);
      saveArchive({ letterProgress: progress });
      checkEndingConditions();
      checkRewardConditions();
    }
  }, [letterProgress, saveArchive]);

  const updateMaxCombo = useCallback((combo) => {
    if (combo > maxCombo) {
      setMaxCombo(combo);
      saveArchive({ maxCombo: combo });
      checkRewardConditions();
    }
  }, [maxCombo, saveArchive]);

  const addPlayTime = useCallback((seconds) => {
    const newTime = totalPlayTime + seconds;
    setTotalPlayTime(newTime);
    saveArchive({ totalPlayTime: newTime });
    checkRewardConditions();
  }, [totalPlayTime, saveArchive]);

  const checkEndingConditions = useCallback(() => {
    const newUnlocked = [];

    if (collectedFragments.length >= 12 && !unlockedEndings.includes('ending-1')) {
      newUnlocked.push('ending-1');
    }

    const allChaptersThreeStars = LEVELS.every(level => (chapterStars[level.id] || 0) >= 3);
    if (allChaptersThreeStars && unlockedChapters.length >= 5 && !unlockedEndings.includes('ending-2')) {
      newUnlocked.push('ending-2');
    }

    if (newUnlocked.length > 0) {
      const updatedEndings = [...unlockedEndings, ...newUnlocked];
      setUnlockedEndings(updatedEndings);
      saveArchive({ unlockedEndings: updatedEndings });
      checkRewardConditions();
    }
  }, [collectedFragments, chapterStars, unlockedChapters, unlockedEndings, saveArchive]);

  const checkRewardConditions = useCallback(() => {
    const newRewards = [];

    if (unlockedChapters.includes(1) && !claimedRewards.includes('reward-1')) {
      newRewards.push('reward-1');
    }

    if (maxCombo >= 5 && !claimedRewards.includes('reward-2')) {
      newRewards.push('reward-2');
    }

    const hasThreeStars = Object.values(chapterStars).some(stars => stars >= 3);
    if (hasThreeStars && !claimedRewards.includes('reward-3')) {
      newRewards.push('reward-3');
    }

    if (totalPlayTime >= 3600 && !claimedRewards.includes('reward-4')) {
      newRewards.push('reward-4');
    }

    if (unlockedChapters.length >= 5 && !claimedRewards.includes('reward-5')) {
      newRewards.push('reward-5');
    }

    if (unlockedEndings.length >= 3 && !claimedRewards.includes('reward-6')) {
      newRewards.push('reward-6');
    }

    if (newRewards.length > 0) {
      const updatedRewards = [...claimedRewards, ...newRewards];
      setClaimedRewards(updatedRewards);
      saveArchive({ claimedRewards: updatedRewards });
    }
  }, [unlockedChapters, maxCombo, chapterStars, totalPlayTime, unlockedEndings, claimedRewards, saveArchive]);

  const getFragmentCollection = () => {
    return STAR_PATTERNS.map(star => ({
      ...star,
      collected: collectedFragments.includes(star.id)
    }));
  };

  const getEndingsWithStatus = () => {
    return HIDDEN_ENDINGS.map(ending => ({
      ...ending,
      unlocked: unlockedEndings.includes(ending.id)
    }));
  };

  const getRewardsWithStatus = () => {
    return REWARDS.map(reward => ({
      ...reward,
      unlocked: claimedRewards.includes(reward.id)
    }));
  };

  const getChaptersWithStatus = () => {
    return LEVELS.map(level => ({
      ...level,
      unlocked: unlockedChapters.includes(level.id),
      stars: chapterStars[level.id] || 0
    }));
  };

  const getLetterProgressPercent = () => {
    return Math.min(100, (letterProgress / 5) * 100);
  };

  const resetArchive = () => {
    setCollectedFragments([]);
    setUnlockedEndings([]);
    setClaimedRewards([]);
    setUnlockedChapters([]);
    setChapterStars({});
    setTotalPlayTime(0);
    setMaxCombo(0);
    setLetterProgress(0);
    localStorage.removeItem('starTowerArchive');
  };

  return {
    collectedFragments,
    unlockedEndings,
    claimedRewards,
    unlockedChapters,
    chapterStars,
    totalPlayTime,
    maxCombo,
    letterProgress,
    collectFragment,
    collectFragmentsFromLevel,
    unlockChapter,
    setChapterStarRating,
    updateLetterProgress,
    updateMaxCombo,
    addPlayTime,
    getFragmentCollection,
    getEndingsWithStatus,
    getRewardsWithStatus,
    getChaptersWithStatus,
    getLetterProgressPercent,
    checkEndingConditions,
    checkRewardConditions,
    resetArchive
  };
};
