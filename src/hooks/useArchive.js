import { useState, useEffect, useCallback, useRef } from 'react';
import { STAR_PATTERNS, LEVELS, HIDDEN_ENDINGS, REWARDS, STORY_BRANCHES, CHARACTER_RELATIONS, getPlayerType, getCharacterByStarId, getRelationLevel } from '../data/gameData';

const getThreeStarCount = (chapterStars) => {
  return Object.values(chapterStars).filter(stars => stars >= 3).length;
};

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
  const [storyChoices, setStoryChoices] = useState({});
  const [characterAffection, setCharacterAffection] = useState({});
  const [unlockedStoryBranches, setUnlockedStoryBranches] = useState([]);
  const [unlockedCharacterStories, setUnlockedCharacterStories] = useState([]);

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
        setStoryChoices(data.storyChoices || {});
        setCharacterAffection(data.characterAffection || {});
        setUnlockedStoryBranches(data.unlockedStoryBranches || []);
        setUnlockedCharacterStories(data.unlockedCharacterStories || []);
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
      fastLevelCount,
      storyChoices,
      characterAffection,
      unlockedStoryBranches,
      unlockedCharacterStories
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
      fastLevelCount: data.fastLevelCount !== undefined ? data.fastLevelCount : s.fastLevelCount,
      storyChoices: data.storyChoices !== undefined ? data.storyChoices : s.storyChoices,
      characterAffection: data.characterAffection !== undefined ? data.characterAffection : s.characterAffection,
      unlockedStoryBranches: data.unlockedStoryBranches !== undefined ? data.unlockedStoryBranches : s.unlockedStoryBranches,
      unlockedCharacterStories: data.unlockedCharacterStories !== undefined ? data.unlockedCharacterStories : s.unlockedCharacterStories
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

  const checkStarUnlockConditions = useCallback((overrides = {}) => {
    const s = { ...stateRef.current, ...overrides };
    const newFragments = [...s.collectedFragments];
    let changed = false;

    const stateToCheck = {
      unlockedChapters: s.unlockedChapters,
      chapterStars: s.chapterStars,
      totalPlayTime: s.totalPlayTime,
      unlockedEndings: overrides.unlockedEndings || s.unlockedEndings
    };

    const threeStarCount = getThreeStarCount(stateToCheck.chapterStars);

    STAR_PATTERNS.forEach((star) => {
      if (newFragments.includes(star.id)) return;

      const cond = star.unlockConditionData;
      if (!cond) return;

      let shouldUnlock = false;

      switch (cond.type) {
        case 'level':
          shouldUnlock = stateToCheck.unlockedChapters.includes(cond.value);
          break;

        case 'threeStarCount':
          shouldUnlock = threeStarCount >= cond.value;
          break;

        case 'playTime':
          shouldUnlock = stateToCheck.totalPlayTime >= cond.value;
          break;

        case 'allEndings':
          shouldUnlock = stateToCheck.unlockedEndings.length >= (HIDDEN_ENDINGS ? HIDDEN_ENDINGS.length : 3);
          break;

        default:
          shouldUnlock = false;
      }

      if (shouldUnlock) {
        newFragments.push(star.id);
        changed = true;
      }
    });

    if (changed) {
      setCollectedFragments(newFragments);
      saveArchive({ collectedFragments: newFragments });
    }

    return { changed, newFragments };
  }, [saveArchive]);

  const runAllChecks = useCallback((overrides = {}, depth = 0) => {
    if (depth > 3) return;

    const endingsChanged = checkEndingConditions(overrides);

    let latestUnlockedEndings = overrides.unlockedEndings || stateRef.current.unlockedEndings;
    if (endingsChanged) {
      latestUnlockedEndings = stateRef.current.unlockedEndings;
    }

    const rewardsOverrides = { ...overrides, unlockedEndings: latestUnlockedEndings };
    checkRewardConditions(rewardsOverrides);

    const starOverrides = { ...overrides, unlockedEndings: latestUnlockedEndings };
    const starResult = checkStarUnlockConditions(starOverrides);

    if (starResult.changed) {
      const latestRewards = stateRef.current.unlockedRewards;
      checkRewardConditions({
        collectedFragments: starResult.newFragments,
        unlockedEndings: latestUnlockedEndings,
        unlockedRewards: latestRewards
      });
      const finalEndings = checkEndingConditions({
        collectedFragments: starResult.newFragments,
        unlockedChapters: stateRef.current.unlockedChapters,
        chapterStars: stateRef.current.chapterStars,
        fastLevelCount: stateRef.current.fastLevelCount
      });
      if (finalEndings) {
        runAllChecks({
          collectedFragments: starResult.newFragments,
          unlockedEndings: stateRef.current.unlockedEndings
        }, depth + 1);
      }
    }
  }, [checkEndingConditions, checkRewardConditions, checkStarUnlockConditions]);

  const collectFragmentsFromLevel = useCallback((levelStars) => {
    runAllChecks({});
  }, [runAllChecks]);

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
    setStoryChoices({});
    setCharacterAffection({});
    setUnlockedStoryBranches([]);
    setUnlockedCharacterStories([]);
    localStorage.removeItem('starTowerArchive');
  };

  const makeStoryChoice = useCallback((choicePointId, optionId) => {
    const newChoices = { ...storyChoices, [choicePointId]: optionId };
    setStoryChoices(newChoices);
    saveArchive({ storyChoices: newChoices });

    let branch = null;
    STORY_BRANCHES.forEach(b => {
      if (b.choicePoint.id === choicePointId) {
        branch = b;
      }
    });

    if (branch) {
      const option = branch.choicePoint.options.find(o => o.id === optionId);
      if (option) {
        const newAffection = { ...characterAffection };
        Object.entries(option.affectionChanges).forEach(([starId, value]) => {
          newAffection[starId] = (newAffection[starId] || 0) + value;
        });
        setCharacterAffection(newAffection);
        saveArchive({ characterAffection: newAffection });

        const newUnlockedBranches = [...unlockedStoryBranches];
        if (!newUnlockedBranches.includes(optionId)) {
          newUnlockedBranches.push(optionId);
          setUnlockedStoryBranches(newUnlockedBranches);
          saveArchive({ unlockedStoryBranches: newUnlockedBranches });
        }

        const newCharStories = [...unlockedCharacterStories];
        Object.keys(option.affectionChanges).forEach(starId => {
          const char = getCharacterByStarId(starId);
          if (char) {
            const affection = newAffection[starId] || 0;
            char.stories.forEach(story => {
              const storyKey = `${starId}-${story.affection}`;
              if (affection >= story.affection && !newCharStories.includes(storyKey)) {
                newCharStories.push(storyKey);
              }
            });
          }
        });
        setUnlockedCharacterStories(newCharStories);
        saveArchive({ unlockedCharacterStories: newCharStories });
      }
    }

    return newChoices;
  }, [storyChoices, characterAffection, unlockedStoryBranches, unlockedCharacterStories, saveArchive]);

  const getStoryChoicesList = () => {
    return STORY_BRANCHES.map(branch => {
      const chosenOptionId = storyChoices[branch.choicePoint.id] || null;
      const chosenOption = branch.choicePoint.options.find(o => o.id === chosenOptionId) || null;
      const unchosenOption = branch.choicePoint.options.find(o => o.id !== chosenOptionId) || null;
      return {
        ...branch,
        chosenOptionId,
        chosenOption,
        unchosenOption,
        isChosen: !!chosenOptionId,
        branchContent: chosenOptionId ? branch.branches[chosenOptionId] : null
      };
    });
  };

  const getCharacterRelationsWithStatus = () => {
    return CHARACTER_RELATIONS.map(char => {
      const affection = characterAffection[char.starId] || 0;
      const relationLevel = getRelationLevel(affection);
      const unlockedStories = char.stories
        .filter(story => {
          const key = `${char.starId}-${story.affection}`;
          return unlockedCharacterStories.includes(key);
        })
        .map(story => ({
          ...story,
          unlocked: affection >= story.affection
        }));

      return {
        ...char,
        affection,
        relationLevel,
        unlockedStories,
        nextStoryAffection: char.stories.find(s => s.affection > affection)?.affection || null
      };
    });
  };

  const getPlayerTypeInfo = () => {
    const choiceIds = Object.values(storyChoices);
    return getPlayerType(choiceIds);
  };

  const getChoiceCount = () => {
    return Object.keys(storyChoices).length;
  };

  const isStoryCorridorUnlocked = () => {
    return unlockedChapters.length >= 1;
  };

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const timer = setTimeout(() => {
      runAllChecks({});
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runAllChecks]);

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
    storyChoices,
    characterAffection,
    unlockedStoryBranches,
    unlockedCharacterStories,
    checkStarUnlockConditions,
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
    makeStoryChoice,
    getStoryChoicesList,
    getCharacterRelationsWithStatus,
    getPlayerTypeInfo,
    getChoiceCount,
    isStoryCorridorUnlocked,
    resetArchive
  };
};
