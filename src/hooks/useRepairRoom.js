import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  REPAIR_ROOM_CHAPTERS, 
  REPAIR_HIDDEN_SENTENCES, 
  REPAIR_ACHIEVEMENTS,
  getRepairRoomStats,
  getRepairChapterById,
  getRepairHiddenSentenceById
} from '../data/gameData';

const STORAGE_KEY = 'starTowerRepairRoom';

const loadRepairRoomData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load repair room data:', e);
  }
  return null;
};

const saveRepairRoomData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save repair room data:', e);
  }
};

export const useRepairRoom = (archive, shop) => {
  const saved = loadRepairRoomData();

  const [repairedFragments, setRepairedFragments] = useState(saved?.repairedFragments || []);
  const [completedChapters, setCompletedChapters] = useState(saved?.completedChapters || []);
  const [unlockedSentences, setUnlockedSentences] = useState(saved?.unlockedSentences || []);
  const [claimedRewards, setClaimedRewards] = useState(saved?.claimedRewards || []);
  const [newlyUnlockedSentences, setNewlyUnlockedSentences] = useState([]);
  const [recentlyCompletedChapter, setRecentlyCompletedChapter] = useState(null);

  const stateRef = useRef({});

  useEffect(() => {
    stateRef.current = {
      repairedFragments,
      completedChapters,
      unlockedSentences,
      claimedRewards
    };
  });

  const persist = useCallback((updates) => {
    const s = stateRef.current;
    const data = {
      repairedFragments: updates.repairedFragments !== undefined ? updates.repairedFragments : s.repairedFragments,
      completedChapters: updates.completedChapters !== undefined ? updates.completedChapters : s.completedChapters,
      unlockedSentences: updates.unlockedSentences !== undefined ? updates.unlockedSentences : s.unlockedSentences,
      claimedRewards: updates.claimedRewards !== undefined ? updates.claimedRewards : s.claimedRewards
    };
    saveRepairRoomData(data);
  }, []);

  const canRepairFragment = useCallback((fragment) => {
    if (!archive || !fragment.requiredStars) return false;
    return fragment.requiredStars.every(starId => archive.collectedFragments.includes(starId));
  }, [archive]);

  const repairFragment = useCallback((chapterId, fragmentId) => {
    const chapter = getRepairChapterById(chapterId);
    if (!chapter) return false;

    const fragment = chapter.fragments.find(f => f.id === fragmentId);
    if (!fragment) return false;

    if (repairedFragments.includes(fragmentId)) return false;

    if (!canRepairFragment(fragment)) return false;

    const newRepaired = [...repairedFragments, fragmentId];
    setRepairedFragments(newRepaired);
    persist({ repairedFragments: newRepaired });

    const allFragmentIds = chapter.fragments.map(f => f.id);
    const isChapterComplete = allFragmentIds.every(id => newRepaired.includes(id));

    if (isChapterComplete && !completedChapters.includes(chapterId)) {
      const newCompleted = [...completedChapters, chapterId];
      setCompletedChapters(newCompleted);
      setRecentlyCompletedChapter(chapterId);
      persist({ completedChapters: newCompleted });

      if (chapter.hiddenSentenceId && !unlockedSentences.includes(chapter.hiddenSentenceId)) {
        const newUnlocked = [...unlockedSentences, chapter.hiddenSentenceId];
        setUnlockedSentences(newUnlocked);
        setNewlyUnlockedSentences(prev => [...prev, chapter.hiddenSentenceId]);
        persist({ unlockedSentences: newUnlocked });
      }

      if (chapter.reward && shop) {
        const rewardKey = `reward-${chapterId}`;
        if (!claimedRewards.includes(rewardKey)) {
          if (chapter.reward.type === 'stardust') {
            shop.addStardust(chapter.reward.value);
          } else if (chapter.reward.type === 'starShard') {
            shop.addStarShards(chapter.reward.value);
          }
          const newClaimed = [...claimedRewards, rewardKey];
          setClaimedRewards(newClaimed);
          persist({ claimedRewards: newClaimed });
        }
      }

      checkFinalHiddenSentence(newUnlocked || unlockedSentences);
    }

    return true;
  }, [repairedFragments, completedChapters, unlockedSentences, claimedRewards, canRepairFragment, persist, shop]);

  const checkFinalHiddenSentence = useCallback((currentUnlocked) => {
    const unlocked = currentUnlocked || unlockedSentences;
    const basicSentences = REPAIR_HIDDEN_SENTENCES.filter(s => s.id !== 'rhs-6');
    const allBasicUnlocked = basicSentences.every(s => unlocked.includes(s.id));
    
    if (allBasicUnlocked && !unlocked.includes('rhs-6')) {
      const newUnlocked = [...unlocked, 'rhs-6'];
      setUnlockedSentences(newUnlocked);
      setNewlyUnlockedSentences(prev => [...prev, 'rhs-6']);
      persist({ unlockedSentences: newUnlocked });
    }
  }, [unlockedSentences, persist]);

  const getChapterRepairStatus = useCallback((chapterId) => {
    const chapter = getRepairChapterById(chapterId);
    if (!chapter) return null;

    const fragments = chapter.fragments.map(f => ({
      ...f,
      isUnlocked: canRepairFragment(f),
      isRepaired: repairedFragments.includes(f.id)
    }));

    const repairedCount = fragments.filter(f => f.isRepaired).length;
    const isComplete = completedChapters.includes(chapterId);
    const hiddenSentence = chapter.hiddenSentenceId 
      ? getRepairHiddenSentenceById(chapter.hiddenSentenceId) 
      : null;
    const isSentenceUnlocked = chapter.hiddenSentenceId 
      ? unlockedSentences.includes(chapter.hiddenSentenceId) 
      : false;

    return {
      ...chapter,
      fragments,
      repairedCount,
      totalFragments: chapter.fragments.length,
      progress: Math.round((repairedCount / chapter.fragments.length) * 100),
      isComplete,
      hiddenSentence,
      isSentenceUnlocked
    };
  }, [repairedFragments, completedChapters, unlockedSentences, canRepairFragment]);

  const getAllChaptersStatus = useCallback(() => {
    return REPAIR_ROOM_CHAPTERS.map(chapter => getChapterRepairStatus(chapter.id));
  }, [getChapterRepairStatus]);

  const isChapterAvailable = useCallback((chapter) => {
    if (!archive) return false;
    return archive.unlockedChapters.includes(chapter.chapter);
  }, [archive]);

  const getHiddenSentencesWithStatus = useCallback(() => {
    return REPAIR_HIDDEN_SENTENCES.map(sentence => ({
      ...sentence,
      isUnlocked: unlockedSentences.includes(sentence.id)
    }));
  }, [unlockedSentences]);

  const getStats = useCallback(() => {
    return getRepairRoomStats(repairedFragments, completedChapters, unlockedSentences);
  }, [repairedFragments, completedChapters, unlockedSentences]);

  const clearNewNotifications = useCallback(() => {
    setNewlyUnlockedSentences([]);
    setRecentlyCompletedChapter(null);
  }, []);

  const getAchievementProgress = useCallback(() => {
    const achievements = REPAIR_ACHIEVEMENTS.map(achv => {
      let current = 0;
      let target = achv.condition.value;

      switch (achv.condition.type) {
        case 'repairedFragments':
          current = repairedFragments.length;
          break;
        case 'completedChapters':
          current = completedChapters.length;
          break;
        case 'unlockedSentences':
          current = unlockedSentences.length;
          break;
        default:
          current = 0;
      }

      return {
        ...achv,
        current,
        target,
        isCompleted: current >= target
      };
    });

    return achievements;
  }, [repairedFragments, completedChapters, unlockedSentences]);

  return {
    repairedFragments,
    completedChapters,
    unlockedSentences,
    claimedRewards,
    newlyUnlockedSentences,
    recentlyCompletedChapter,
    repairFragment,
    canRepairFragment,
    getChapterRepairStatus,
    getAllChaptersStatus,
    isChapterAvailable,
    getHiddenSentencesWithStatus,
    getStats,
    clearNewNotifications,
    getAchievementProgress
  };
};
