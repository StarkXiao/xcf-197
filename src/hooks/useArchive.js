import { useState, useEffect, useCallback, useRef } from 'react';
import { STAR_PATTERNS, LEVELS, HIDDEN_ENDINGS, REWARDS } from '../data/gameData';

export const useArchive = () => {
  const [collectedFragments, setCollectedFragments] = useState([]);
  const [unlockedEndings, setUnlockedEndings] = useState([]);
  const [unlockedRewards, setUnlockedRewards] = useState([]);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [chapterStars, setChapterStars] = useState({});
  const [totalPlayTime, setTotalPlayTime] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [letterProgress, setLetterProgress] = useState(0);
  const [fastLevelCount, setFastLevelCount] = useState(0);

  const stateRef = useRef({});

  useEffect(() => {
    const savedArchive = localStorage.getItem('starTowerArchive');
    if (savedArchive) {
      try {
        const data = JSON.parse(savedArchive);
        setCollectedFragments(data.collectedFragments || []);
        setUnlockedEndings(data.unlockedEndings || []);
        setUnlockedRewards(data.unlockedRewards || data.claimedRewards || []);
        setClaimedRewards(data.claimedRewards || []);
        setUnlockedChapters(data.unlockedChapters || []);
        setChapterStars(data.chapterStars || {});
        setTotalPlayTime(data.totalPlayTime || 0);
        setMaxCombo(data.maxCombo || 0);
        setLetterProgress(data.letterProgress || 0);
        setFastLevelCount(data.fastLevelCount || 0);
      } catch (e) {
        console.error('Failed to load archive:', e);
      }
    }
  }, []);

  useEffect(() => {
    stateRef.current = {
      collectedFragments,
      unlockedEndings,
      unlockedRewards,
      claimedRewards,
      unlockedChapters,
      chapterStars,
      totalPlayTime,
      maxCombo,
      letterProgress,
      fastLevelCount
    };
  });

  const saveArchive = useCallback((data) => {
    const s = stateRef.current;
    const archiveData = {
      collectedFragments: data.collectedFragments !== undefined ? data.collectedFragments : s.collectedFragments,
      unlockedEndings: data.unlockedEndings !== undefined ? data.unlockedEndings : s.unlockedEndings,
      unlockedRewards: data.unlockedRewards !== undefined ? data.unlockedRewards : s.unlockedRewards,
      claimedRewards: data.claimedRewards !== undefined ? data.claimedRewards : s.claimedRewards,
      unlockedChapters: data.unlockedChapters !== undefined ? data.unlockedChapters : s.unlockedChapters,
      chapterStars: data.chapterStars !== undefined ? data.chapterStars : s.chapterStars,
      totalPlayTime: data.totalPlayTime !== undefined ? data.totalPlayTime : s.totalPlayTime,
      maxCombo: data.maxCombo !== undefined ? data.maxCombo : s.maxCombo,
      letterProgress: data.letterProgress !== undefined ? data.letterProgress : s.letterProgress,
      fastLevelCount: data.fastLevelCount !== undefined ? data.fastLevelCount : s.fastLevelCount
    };
    localStorage.setItem('starTowerArchive', JSON.stringify(archiveData));
  }, []);

  const checkEndingConditions = useCallback((overrides = {}) => {
    const s = { ...stateRef.current, ...overrides };
    const newUnlocked = [...s.unlockedEndings];

    if (s.collectedFragments.length >= 12 && !newUnlocked.includes('ending-1')) {
      newUnlocked.push('ending-1');
    }

    const allChaptersUnlocked = s.unlockedChapters.length >= 5;
    const hasAllThreeStars = LEVELS.every(level => (s.chapterStars[level.id] || 0) >= 3);
    if ((allChaptersUnlocked && hasAllThreeStars) && !newUnlocked.includes('ending-2')) {
      newUnlocked.push('ending-2');
    }

    const allChaptersDone = s.unlockedChapters.length >= 5;
    const hasAnyThreeStar = Object.values(s.chapterStars).some(stars => stars >= 3);
    if (allChaptersDone && hasAnyThreeStar && !newUnlocked.includes('ending-2')) {
      newUnlocked.push('ending-2');
    }

    if (s.fastLevelCount >= 5 && !newUnlocked.includes('ending-3')) {
      newUnlocked.push('ending-3');
    }

    const endingsChanged = newUnlocked.length !== s.unlockedEndings.length;
    if (endingsChanged) {
      setUnlockedEndings(newUnlocked);
      saveArchive({ unlockedEndings: newUnlocked });
    }

    return endingsChanged;
  }, [saveArchive]);

  const checkRewardConditions = useCallback((overrides = {}) => {
    const s = { ...stateRef.current, ...overrides };
    const newUnlockedRewards = [...s.unlockedRewards];

    if (s.unlockedChapters.includes(1) && !newUnlockedRewards.includes('reward-1')) {
      newUnlockedRewards.push('reward-1');
    }

    if (s.maxCombo >= 5 && !newUnlockedRewards.includes('reward-2')) {
      newUnlockedRewards.push('reward-2');
    }

    const hasThreeStars = Object.values(s.chapterStars).some(stars => stars >= 3);
    if (hasThreeStars && !newUnlockedRewards.includes('reward-3')) {
      newUnlockedRewards.push('reward-3');
    }

    if (s.totalPlayTime >= 3600 && !newUnlockedRewards.includes('reward-4')) {
      newUnlockedRewards.push('reward-4');
    }

    if (s.unlockedChapters.length >= 5 && !newUnlockedRewards.includes('reward-5')) {
      newUnlockedRewards.push('reward-5');
    }

    const endingsToCheck = overrides.unlockedEndings || s.unlockedEndings;
    if (endingsToCheck.length >= 3 && !newUnlockedRewards.includes('reward-6')) {
      newUnlockedRewards.push('reward-6');
    }

    const rewardsChanged = newUnlockedRewards.length !== s.unlockedRewards.length;
    if (rewardsChanged) {
      setUnlockedRewards(newUnlockedRewards);
      saveArchive({ unlockedRewards: newUnlockedRewards });
    }

    return rewardsChanged;
  }, [saveArchive]);

  const runAllChecks = useCallback((overrides = {}) => {
    const endingsChanged = checkEndingConditions(overrides);
    if (endingsChanged) {
      const newEndings = stateRef.current.unlockedEndings;
      checkRewardConditions({ ...overrides, unlockedEndings: newEndings });
    } else {
      checkRewardConditions(overrides);
    }
  }, [checkEndingConditions, checkRewardConditions]);

  const collectFragment = useCallback((starId) => {
    if (!collectedFragments.includes(starId)) {
      const newFragments = [...collectedFragments, starId];
      setCollectedFragments(newFragments);
      saveArchive({ collectedFragments: newFragments });
      runAllChecks({ collectedFragments: newFragments });
    }
  }, [collectedFragments, saveArchive, runAllChecks]);

  const collectFragmentsFromLevel = useCallback((levelStars) => {
    const newFragments = [...collectedFragments];
    let changed = false;
    levelStars.forEach(starId => {
      if (!newFragments.includes(starId)) {
        newFragments.push(starId);
        changed = true;
      }
    });
    if (changed) {
      setCollectedFragments(newFragments);
      saveArchive({ collectedFragments: newFragments });
      runAllChecks({ collectedFragments: newFragments });
    }
  }, [collectedFragments, saveArchive, runAllChecks]);

  const unlockChapter = useCallback((chapterId) => {
    if (!unlockedChapters.includes(chapterId)) {
      const newChapters = [...unlockedChapters, chapterId];
      setUnlockedChapters(newChapters);
      saveArchive({ unlockedChapters: newChapters });
      runAllChecks({ unlockedChapters: newChapters });
    }
  }, [unlockedChapters, saveArchive, runAllChecks]);

  const setChapterStarRating = useCallback((chapterId, stars) => {
    const currentStars = chapterStars[chapterId] || 0;
    if (stars > currentStars) {
      const newStars = { ...chapterStars, [chapterId]: stars };
      setChapterStars(newStars);
      saveArchive({ chapterStars: newStars });
      runAllChecks({ chapterStars: newStars });
    }
  }, [chapterStars, saveArchive, runAllChecks]);

  const updateLetterProgress = useCallback((progress) => {
    if (progress > letterProgress) {
      setLetterProgress(progress);
      saveArchive({ letterProgress: progress });
      runAllChecks({ letterProgress: progress });
    }
  }, [letterProgress, saveArchive, runAllChecks]);

  const updateMaxCombo = useCallback((combo) => {
    if (combo > maxCombo) {
      setMaxCombo(combo);
      saveArchive({ maxCombo: combo });
      runAllChecks({ maxCombo: combo });
    }
  }, [maxCombo, saveArchive, runAllChecks]);

  const addPlayTime = useCallback((seconds) => {
    const newTime = totalPlayTime + seconds;
    setTotalPlayTime(newTime);
    saveArchive({ totalPlayTime: newTime });
    runAllChecks({ totalPlayTime: newTime });
  }, [totalPlayTime, saveArchive, runAllChecks]);

  const incrementFastLevel = useCallback(() => {
    const newCount = fastLevelCount + 1;
    setFastLevelCount(newCount);
    saveArchive({ fastLevelCount: newCount });
    runAllChecks({ fastLevelCount: newCount });
  }, [fastLevelCount, saveArchive, runAllChecks]);

  const claimReward = useCallback((rewardId) => {
    if (!claimedRewards.includes(rewardId) && unlockedRewards.includes(rewardId)) {
      const newClaimed = [...claimedRewards, rewardId];
      setClaimedRewards(newClaimed);
      saveArchive({ claimedRewards: newClaimed });
      return true;
    }
    return false;
  }, [claimedRewards, unlockedRewards, saveArchive]);

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
      unlocked: unlockedRewards.includes(reward.id),
      claimed: claimedRewards.includes(reward.id)
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
    setUnlockedRewards([]);
    setClaimedRewards([]);
    setUnlockedChapters([]);
    setChapterStars({});
    setTotalPlayTime(0);
    setMaxCombo(0);
    setLetterProgress(0);
    setFastLevelCount(0);
    localStorage.removeItem('starTowerArchive');
  };

  return {
    collectedFragments,
    unlockedEndings,
    unlockedRewards,
    claimedRewards,
    unlockedChapters,
    chapterStars,
    totalPlayTime,
    maxCombo,
    letterProgress,
    fastLevelCount,
    collectFragment,
    collectFragmentsFromLevel,
    unlockChapter,
    setChapterStarRating,
    updateLetterProgress,
    updateMaxCombo,
    addPlayTime,
    incrementFastLevel,
    claimReward,
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
