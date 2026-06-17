import { useState, useEffect, useCallback } from 'react';
import { CHAPTERS, getChapterById, getNodeById, NODE_TYPES, getChapterStats } from '../data/gameData';

const STORAGE_KEY = 'starTowerChapterProgress';

export const useChapterProgress = (shop = null) => {
  const [progress, setProgress] = useState({
    completedNodes: {},
    starRatings: {},
    highScores: {},
    claimedRewards: [],
    unlockedChapters: [1],
    lastPlayedChapter: null,
    lastPlayedNode: null,
    totalStardust: 0,
    totalStarShards: 0
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProgress(prev => ({ ...prev, ...data }));
      } catch (e) {
        console.error('Failed to load chapter progress:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProgress = useCallback((newProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  }, []);

  const completeNode = useCallback((chapterId, nodeId, { score, stars, timeLeft, moves }) => {
    setProgress(prev => {
      const nodeKey = `${chapterId}-${nodeId}`;
      const newCompletedNodes = { ...prev.completedNodes, [nodeKey]: true };
      
      const newStarRatings = { ...prev.starRatings };
      if (!newStarRatings[nodeKey] || stars > newStarRatings[nodeKey]) {
        newStarRatings[nodeKey] = stars;
      }
      
      const newHighScores = { ...prev.highScores };
      if (!newHighScores[nodeKey] || score > newHighScores[nodeKey]) {
        newHighScores[nodeKey] = score;
      }

      const chapter = getChapterById(chapterId);
      let newUnlockedChapters = [...prev.unlockedChapters];
      
      if (chapter) {
        const bossNode = chapter.nodes.find(n => n.isChapterEnd);
        if (bossNode && bossNode.id === nodeId) {
          const nextChapterId = chapterId + 1;
          if (nextChapterId <= CHAPTERS.length && !newUnlockedChapters.includes(nextChapterId)) {
            newUnlockedChapters.push(nextChapterId);
          }
        }
      }

      const newProgress = {
        ...prev,
        completedNodes: newCompletedNodes,
        starRatings: newStarRatings,
        highScores: newHighScores,
        unlockedChapters: newUnlockedChapters,
        lastPlayedChapter: chapterId,
        lastPlayedNode: nodeId
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  const claimReward = useCallback((chapterId, nodeId, reward) => {
    setProgress(prev => {
      const nodeKey = `${chapterId}-${nodeId}`;
      if (prev.claimedRewards.includes(nodeKey)) return prev;

      let newTotalStardust = prev.totalStardust;
      let newTotalStarShards = prev.totalStarShards;

      if (reward?.type === 'stardust') {
        newTotalStardust += reward.value;
        if (shop?.addStardust) {
          shop.addStardust(reward.value);
        }
      } else if (reward?.type === 'starShard') {
        newTotalStarShards += reward.value;
        if (shop?.addStarShards) {
          shop.addStarShards(reward.value);
        }
      }

      const newProgress = {
        ...prev,
        claimedRewards: [...prev.claimedRewards, nodeKey],
        totalStardust: newTotalStardust,
        totalStarShards: newTotalStarShards
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, [shop]);

  const isNodeUnlocked = useCallback((chapterId, nodeId) => {
    const chapter = getChapterById(chapterId);
    if (!chapter) return false;
    
    const node = getNodeById(chapterId, nodeId);
    if (!node) return false;
    
    const nodeKey = `${chapterId}-${nodeId}`;
    if (progress.completedNodes[nodeKey]) return true;
    
    const startNodes = chapter.nodes.filter(n => {
      const hasIncoming = chapter.nodes.some(other => 
        other.connections?.includes(n.id)
      );
      return !hasIncoming;
    });
    
    if (startNodes.some(n => n.id === nodeId)) {
      return true;
    }
    
    return chapter.nodes.some(potentialPredecessor => {
      if (!potentialPredecessor.connections?.includes(nodeId)) return false;
      const predKey = `${chapterId}-${potentialPredecessor.id}`;
      return progress.completedNodes?.[predKey];
    });
  }, [progress.completedNodes]);

  const isChapterUnlocked = useCallback((chapterId) => {
    return progress.unlockedChapters?.includes(chapterId);
  }, [progress.unlockedChapters]);

  const getChapterProgress = useCallback((chapterId) => {
    const stats = getChapterStats(progress.completedNodes, progress.starRatings);
    return stats.find(s => s.chapterId === chapterId);
  }, [progress.completedNodes, progress.starRatings]);

  const getOverallProgress = useCallback(() => {
    const stats = getChapterStats(progress.completedNodes, progress.starRatings);
    const totalNodes = stats.reduce((sum, s) => sum + s.totalNodes, 0);
    const completedNodes = stats.reduce((sum, s) => sum + s.completedCount, 0);
    const totalStars = stats.reduce((sum, s) => sum + s.totalStars, 0);
    const earnedStars = stats.reduce((sum, s) => sum + s.earnedStars, 0);
    
    return {
      totalNodes,
      completedNodes,
      progress: totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0,
      totalStars,
      earnedStars,
      completedChapters: stats.filter(s => s.isCompleted).length,
      totalChapters: CHAPTERS.length
    };
  }, [progress.completedNodes, progress.starRatings]);

  const setLastPlayed = useCallback((chapterId, nodeId) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        lastPlayedChapter: chapterId,
        lastPlayedNode: nodeId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const initialProgress = {
      completedNodes: {},
      starRatings: {},
      highScores: {},
      claimedRewards: [],
      unlockedChapters: [1],
      lastPlayedChapter: null,
      lastPlayedNode: null,
      totalStardust: 0,
      totalStarShards: 0
    };
    setProgress(initialProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));
  }, []);

  return {
    progress,
    isLoaded,
    completeNode,
    claimReward,
    isNodeUnlocked,
    isChapterUnlocked,
    getChapterProgress,
    getOverallProgress,
    setLastPlayed,
    resetProgress,
    saveProgress
  };
};

export default useChapterProgress;
