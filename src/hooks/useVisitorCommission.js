import { useState, useEffect, useCallback, useRef } from 'react';
import {
  VISITOR_CHARACTERS,
  VISITOR_COMMISSIONS,
  VISITOR_STORY_CHAPTERS,
  getVisitorById,
  getAffectionLevel,
  getNextAffectionLevel,
  getCommissionsByVisitorId,
  getVisitorStoryChapters,
  getVisitorDialogues,
  checkCommissionBonus,
  calculateCommissionStars,
  getStarById,
  getRarityColor
} from '../data/gameData';

const STORAGE_KEY = 'starTowerVisitorCommission';

const loadVisitorData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load visitor data:', e);
  }
  return null;
};

const saveVisitorData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save visitor data:', e);
  }
};

export const useVisitorCommission = (archive, shop) => {
  const saved = loadVisitorData();

  const [metVisitors, setMetVisitors] = useState(saved?.metVisitors || []);
  const [affectionPoints, setAffectionPoints] = useState(saved?.affectionPoints || {});
  const [completedCommissions, setCompletedCommissions] = useState(saved?.completedCommissions || {});
  const [commissionBestRecords, setCommissionBestRecords] = useState(saved?.commissionBestRecords || {});
  const [unlockedStoryChapters, setUnlockedStoryChapters] = useState(saved?.unlockedStoryChapters || {});
  const [currentVisitor, setCurrentVisitor] = useState(saved?.currentVisitor || null);
  const [currentCommission, setCurrentCommission] = useState(saved?.currentCommission || null);
  const [activeCommissionResult, setActiveCommissionResult] = useState(null);
  const [newVisitorNotification, setNewVisitorNotification] = useState(null);
  const [dialogueHistory, setDialogueHistory] = useState(saved?.dialogueHistory || {});

  const stateRef = useRef({});

  useEffect(() => {
    stateRef.current = {
      metVisitors,
      affectionPoints,
      completedCommissions,
      commissionBestRecords,
      unlockedStoryChapters,
      currentVisitor,
      currentCommission,
      dialogueHistory
    };
  });

  const persist = useCallback((updates) => {
    const s = stateRef.current;
    const data = {
      metVisitors: updates.metVisitors !== undefined ? updates.metVisitors : s.metVisitors,
      affectionPoints: updates.affectionPoints !== undefined ? updates.affectionPoints : s.affectionPoints,
      completedCommissions: updates.completedCommissions !== undefined ? updates.completedCommissions : s.completedCommissions,
      commissionBestRecords: updates.commissionBestRecords !== undefined ? updates.commissionBestRecords : s.commissionBestRecords,
      unlockedStoryChapters: updates.unlockedStoryChapters !== undefined ? updates.unlockedStoryChapters : s.unlockedStoryChapters,
      currentVisitor: updates.currentVisitor !== undefined ? updates.currentVisitor : s.currentVisitor,
      currentCommission: updates.currentCommission !== undefined ? updates.currentCommission : s.currentCommission,
      dialogueHistory: updates.dialogueHistory !== undefined ? updates.dialogueHistory : s.dialogueHistory
    };
    saveVisitorData(data);
  }, []);

  const checkFirstMeetCondition = useCallback((visitor) => {
    if (!archive) return false;
    const cond = visitor.firstMeetCondition;
    if (!cond) return true;

    switch (cond.type) {
      case 'unlockedLevel':
        return archive.unlockedChapters.length >= cond.value;
      case 'collectedFragments':
        return archive.collectedFragments.length >= cond.value;
      case 'threeStarCount':
        return Object.values(archive.chapterStars).filter(s => s >= 3).length >= cond.value;
      case 'playTime':
        return (archive.totalPlayTime || 0) >= cond.value;
      case 'allEndings':
        return (archive.unlockedEndings || []).length >= 3;
      default:
        return false;
    }
  }, [archive]);

  const discoverNewVisitors = useCallback(() => {
    if (!archive) return;
    const newlyMet = [...stateRef.current.metVisitors];
    let hasNew = false;
    let latestNewVisitor = null;

    VISITOR_CHARACTERS.forEach(visitor => {
      if (newlyMet.includes(visitor.id)) return;
      if (checkFirstMeetCondition(visitor)) {
        newlyMet.push(visitor.id);
        hasNew = true;
        latestNewVisitor = visitor;
        if (!stateRef.current.affectionPoints[visitor.id]) {
          stateRef.current.affectionPoints[visitor.id] = 0;
        }
      }
    });

    if (hasNew) {
      setMetVisitors(newlyMet);
      setAffectionPoints({ ...stateRef.current.affectionPoints });
      persist({
        metVisitors: newlyMet,
        affectionPoints: { ...stateRef.current.affectionPoints }
      });
      if (latestNewVisitor) {
        setNewVisitorNotification(latestNewVisitor);
      }
    }
  }, [archive, checkFirstMeetCondition, persist]);

  useEffect(() => {
    discoverNewVisitors();
  }, [discoverNewVisitors, archive?.unlockedChapters?.length, archive?.collectedFragments?.length, archive?.chapterStars, archive?.totalPlayTime, archive?.unlockedEndings]);

  const getMetVisitorsWithStatus = useCallback(() => {
    return VISITOR_CHARACTERS
      .filter(v => metVisitors.includes(v.id))
      .map(visitor => {
        const points = affectionPoints[visitor.id] || 0;
        const affectionLevel = getAffectionLevel(points);
        const nextLevel = getNextAffectionLevel(points);
        const commissions = getCommissionsByVisitorId(visitor.id);
        const completedCount = commissions.filter(c => completedCommissions[c.id]).length;
        const stories = getVisitorStoryChapters(visitor.id);
        const unlockedStories = stories.filter(s => unlockedStoryChapters[s.chapter]?.[visitor.id]).length;

        return {
          ...visitor,
          affectionPoints: points,
          affectionLevel,
          nextLevel,
          affectionProgress: nextLevel
            ? Math.min(100, Math.round(((points - affectionLevel.minPoints) / (nextLevel.minPoints - affectionLevel.minPoints)) * 100))
            : 100,
          totalCommissions: commissions.length,
          completedCommissions: completedCount,
          totalStories: stories.length,
          unlockedStories,
          isAvailable: commissions.some(c => isCommissionAvailable(c))
        };
      });
  }, [metVisitors, affectionPoints, completedCommissions, unlockedStoryChapters]);

  const isCommissionAvailable = useCallback((commission) => {
    const cond = commission.unlockCondition;
    if (!cond) return true;
    if (cond.type === 'affection') {
      const points = stateRef.current.affectionPoints[cond.visitorId] || 0;
      return points >= cond.value;
    }
    return false;
  }, []);

  const getVisitorCommissionsWithStatus = useCallback((visitorId) => {
    const commissions = getCommissionsByVisitorId(visitorId);
    return commissions.map(commission => {
      const isCompleted = !!completedCommissions[commission.id];
      const bestRecord = commissionBestRecords[commission.id] || null;
      const isAvailable = isCommissionAvailable(commission);
      const isNew = !isCompleted && isAvailable;

      return {
        ...commission,
        isCompleted,
        isAvailable,
        isNew,
        bestRecord,
        stars: bestRecord?.stars || 0,
        hasBonus: bestRecord?.hasBonus || false
      };
    });
  }, [completedCommissions, commissionBestRecords, isCommissionAvailable]);

  const getVisitorStoriesWithStatus = useCallback((visitorId) => {
    const chapters = getVisitorStoryChapters(visitorId);
    return chapters.map(chapter => {
      const unlocked = unlockedStoryChapters[chapter.chapter]?.[visitorId] || false;
      let canUnlock = false;
      if (chapter.unlockCondition?.type === 'commission') {
        canUnlock = !!completedCommissions[chapter.unlockCondition.id];
      }
      return {
        ...chapter,
        isUnlocked: unlocked,
        canUnlock: canUnlock && !unlocked
      };
    });
  }, [unlockedStoryChapters, completedCommissions]);

  const addAffection = useCallback((visitorId, points) => {
    if (!visitorId || points <= 0) return 0;

    const oldPoints = stateRef.current.affectionPoints[visitorId] || 0;
    const oldLevel = getAffectionLevel(oldPoints).level;
    const newPoints = oldPoints + points;
    const newLevel = getAffectionLevel(newPoints).level;
    const leveledUp = newLevel > oldLevel;

    const updatedAffection = { ...stateRef.current.affectionPoints, [visitorId]: newPoints };
    setAffectionPoints(updatedAffection);
    persist({ affectionPoints: updatedAffection });

    return {
      addedPoints: points,
      newPoints,
      oldPoints,
      leveledUp,
      oldLevel,
      newLevel
    };
  }, [persist]);

  const selectVisitor = useCallback((visitorId) => {
    if (!metVisitors.includes(visitorId)) return;
    setCurrentVisitor(visitorId);
    persist({ currentVisitor: visitorId });
  }, [metVisitors, persist]);

  const startCommission = useCallback((commissionId) => {
    const commission = VISITOR_COMMISSIONS.find(c => c.id === commissionId);
    if (!commission) return null;
    if (!isCommissionAvailable(commission)) return null;

    setCurrentCommission(commissionId);
    persist({ currentCommission: commissionId });

    const cards = [];
    commission.requiredStars.forEach((starId, index) => {
      const star = getStarById(starId);
      if (!star) return;
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `${commissionId}-${index}-${i}`,
          pairIndex: index,
          star,
          isFlipped: false,
          isMatched: false,
          isHinted: false
        });
      }
    });

    const shuffledCards = cards.sort(() => Math.random() - 0.5);

    return {
      ...commission,
      cards: shuffledCards,
      totalPairs: commission.pairs,
      starConfig: commission.requiredStars
    };
  }, [isCommissionAvailable, persist]);

  const completeCommission = useCallback((commissionId, result) => {
    const commission = VISITOR_COMMISSIONS.find(c => c.id === commissionId);
    if (!commission) return null;

    const stars = calculateCommissionStars(commission, result.timeLeft, result.moves);
    const hasBonus = checkCommissionBonus(commission, { ...result, stars });
    const isFirstComplete = !completedCommissions[commissionId];

    let earnedAffection = 0;
    let earnedStardust = 0;
    let earnedStarShards = 0;
    let unlockedStories = [];

    commission.rewards.forEach(reward => {
      let shouldAward = false;
      if (reward.condition === 'complete') shouldAward = true;
      if (reward.condition === 'bonus' && hasBonus) shouldAward = true;

      if (shouldAward) {
        switch (reward.type) {
          case 'affection':
            earnedAffection += reward.value;
            break;
          case 'stardust':
            earnedStardust += reward.value;
            break;
          case 'starShards':
            earnedStarShards += reward.value;
            break;
          default:
            break;
        }
      }
    });

    const affectionResult = earnedAffection > 0
      ? addAffection(commission.visitorId, earnedAffection)
      : null;

    const updatedCompleted = { ...stateRef.current.completedCommissions, [commissionId]: true };
    setCompletedCommissions(updatedCompleted);

    const oldBest = commissionBestRecords[commissionId];
    const newRecord = !oldBest ||
      stars > oldBest.stars ||
      (stars === oldBest.stars && result.score > oldBest.score);

    if (newRecord || !oldBest) {
      const updatedBest = {
        ...stateRef.current.commissionBestRecords,
        [commissionId]: {
          score: result.score,
          timeLeft: result.timeLeft,
          moves: result.moves,
          stars,
          hasBonus,
          maxCombo: result.maxCombo || 0,
          completedAt: new Date().toISOString()
        }
      };
      setCommissionBestRecords(updatedBest);
      persist({
        completedCommissions: updatedCompleted,
        commissionBestRecords: updatedBest
      });
    } else {
      persist({ completedCommissions: updatedCompleted });
    }

    if (commission.storyProgressUnlock) {
      const updatedStories = { ...stateRef.current.unlockedStoryChapters };
      if (!updatedStories[commission.storyProgressUnlock]) {
        updatedStories[commission.storyProgressUnlock] = {};
      }
      if (!updatedStories[commission.storyProgressUnlock][commission.visitorId]) {
        updatedStories[commission.storyProgressUnlock][commission.visitorId] = true;
        unlockedStories.push({
          visitorId: commission.visitorId,
          chapter: commission.storyProgressUnlock
        });
      }
      setUnlockedStoryChapters(updatedStories);
      persist({ unlockedStoryChapters: updatedStories });
    }

    if (earnedStardust > 0 && shop) {
      shop.addCurrency('stardust', earnedStardust);
    }
    if (earnedStarShards > 0 && shop) {
      shop.addCurrency('starShards', earnedStarShards);
    }

    const dialogueResult = getRandomDialogue(commission.visitorId, hasBonus ? 'afterCommission' : 'afterCommission');
    if (dialogueResult) {
      addDialogueToHistory(commission.visitorId, dialogueResult);
    }

    const finalResult = {
      commissionId,
      visitorId: commission.visitorId,
      stars,
      hasBonus,
      isFirstComplete,
      newRecord,
      earnedAffection,
      earnedStardust,
      earnedStarShards,
      affectionResult,
      unlockedStories,
      dialogue: dialogueResult,
      score: result.score,
      timeLeft: result.timeLeft,
      moves: result.moves,
      maxCombo: result.maxCombo || 0
    };

    setActiveCommissionResult(finalResult);
    setCurrentCommission(null);
    persist({ currentCommission: null });

    return finalResult;
  }, [completedCommissions, commissionBestRecords, addAffection, shop, persist]);

  const getRandomDialogue = useCallback((visitorId, type) => {
    const dialogues = getVisitorDialogues(visitorId);
    const list = dialogues[type] || [];
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }, []);

  const addDialogueToHistory = useCallback((visitorId, dialogue) => {
    if (!dialogue) return;
    const history = stateRef.current.dialogueHistory[visitorId] || [];
    const newEntry = {
      dialogue,
      timestamp: Date.now(),
      type: 'dialogue'
    };
    const updated = {
      ...stateRef.current.dialogueHistory,
      [visitorId]: [newEntry, ...history].slice(0, 50)
    };
    setDialogueHistory(updated);
    persist({ dialogueHistory: updated });
  }, [persist]);

  const unlockStoryChapter = useCallback((visitorId, chapter) => {
    const stories = getVisitorStoryChapters(visitorId);
    const storyChapter = stories.find(s => s.chapter === chapter);
    if (!storyChapter) return false;

    let canUnlock = false;
    if (storyChapter.unlockCondition?.type === 'commission') {
      canUnlock = !!completedCommissions[storyChapter.unlockCondition.id];
    }

    if (!canUnlock) return false;

    const updatedStories = { ...stateRef.current.unlockedStoryChapters };
    if (!updatedStories[chapter]) {
      updatedStories[chapter] = {};
    }
    if (updatedStories[chapter][visitorId]) return false;

    updatedStories[chapter][visitorId] = true;
    setUnlockedStoryChapters(updatedStories);
    persist({ unlockedStoryChapters: updatedStories });
    return true;
  }, [completedCommissions, persist]);

  const getGreetingDialogue = useCallback((visitorId) => {
    const affectionLevel = getAffectionLevel(stateRef.current.affectionPoints[visitorId] || 0).level;
    let dialogue = getRandomDialogue(visitorId, 'greeting');

    if (affectionLevel >= 6) {
      const special = getRandomDialogue(visitorId, 'special');
      if (special && Math.random() < 0.3) {
        dialogue = special;
      }
    }

    if (dialogue) {
      addDialogueToHistory(visitorId, dialogue);
    }
    return dialogue;
  }, [getRandomDialogue, addDialogueToHistory]);

  const getAffectionUpDialogue = useCallback((visitorId) => {
    return getRandomDialogue(visitorId, 'affectionUp');
  }, [getRandomDialogue]);

  const getOverallStats = useCallback(() => {
    const totalVisitors = VISITOR_CHARACTERS.length;
    const metCount = metVisitors.length;
    const totalCommissions = VISITOR_COMMISSIONS.length;
    const completedCount = Object.keys(completedCommissions).length;

    let totalAffection = 0;
    let maxAffectionVisitor = null;
    Object.entries(affectionPoints).forEach(([vid, points]) => {
      totalAffection += points;
      const visitor = getVisitorById(vid);
      if (!maxAffectionVisitor || points > maxAffectionVisitor.points) {
        maxAffectionVisitor = { visitor, points };
      }
    });

    let totalStories = 0;
    let unlockedStoriesCount = 0;
    Object.entries(VISITOR_STORY_CHAPTERS).forEach(([vid, chapters]) => {
      totalStories += chapters.length;
      chapters.forEach(ch => {
        if (unlockedStoryChapters[ch.chapter]?.[vid]) {
          unlockedStoriesCount++;
        }
      });
    });

    const totalStarsEarned = Object.values(commissionBestRecords).reduce((sum, record) => sum + (record.stars || 0), 0);
    const maxPossibleStars = VISITOR_COMMISSIONS.length * 3;

    return {
      totalVisitors,
      metCount,
      totalCommissions,
      completedCount,
      totalAffection,
      maxAffectionVisitor,
      totalStories,
      unlockedStoriesCount,
      totalStarsEarned,
      maxPossibleStars,
      visitorProgress: totalVisitors > 0 ? Math.round((metCount / totalVisitors) * 100) : 0,
      commissionProgress: totalCommissions > 0 ? Math.round((completedCount / totalCommissions) * 100) : 0,
      storyProgress: totalStories > 0 ? Math.round((unlockedStoriesCount / totalStories) * 100) : 0,
      starProgress: maxPossibleStars > 0 ? Math.round((totalStarsEarned / maxPossibleStars) * 100) : 0
    };
  }, [metVisitors, completedCommissions, affectionPoints, unlockedStoryChapters, commissionBestRecords]);

  const clearNewVisitorNotification = useCallback(() => {
    setNewVisitorNotification(null);
  }, []);

  const clearActiveCommissionResult = useCallback(() => {
    setActiveCommissionResult(null);
  }, []);

  const getAvailableVisitorsCount = useCallback(() => {
    let count = 0;
    VISITOR_CHARACTERS.forEach(visitor => {
      if (!metVisitors.includes(visitor.id)) return;
      const commissions = getCommissionsByVisitorId(visitor.id);
      if (commissions.some(c => isCommissionAvailable(c) && !completedCommissions[c.id])) {
        count++;
      }
    });
    return count;
  }, [metVisitors, isCommissionAvailable, completedCommissions]);

  const getUnreadNotifications = useCallback(() => {
    return newVisitorNotification ? 1 : 0 + getAvailableVisitorsCount();
  }, [newVisitorNotification, getAvailableVisitorsCount]);

  return {
    metVisitors,
    affectionPoints,
    completedCommissions,
    commissionBestRecords,
    unlockedStoryChapters,
    currentVisitor,
    currentCommission,
    activeCommissionResult,
    newVisitorNotification,
    dialogueHistory,

    getMetVisitorsWithStatus,
    getVisitorCommissionsWithStatus,
    getVisitorStoriesWithStatus,
    isCommissionAvailable,
    getOverallStats,
    getAvailableVisitorsCount,
    getUnreadNotifications,
    getGreetingDialogue,
    getAffectionUpDialogue,

    selectVisitor,
    startCommission,
    completeCommission,
    addAffection,
    unlockStoryChapter,
    discoverNewVisitors,

    clearNewVisitorNotification,
    clearActiveCommissionResult
  };
};
