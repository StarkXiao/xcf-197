import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DAILY_CHALLENGE_THEMES,
  DAILY_CHALLENGE_TASKS,
  getDailyThemeById,
  getDailyRewardByRank
} from '../data/gameData';

const STORAGE_KEY = 'starTowerDailyChallenge';
const CHALLENGE_PAIRS = 6;
const CHALLENGE_TIME_LIMIT = 90;
const CHALLENGE_BASE_SCORE = 3000;

export const useDailyChallenge = () => {
  const [currentTheme, setCurrentTheme] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [claimedTasks, setClaimedTasks] = useState([]);
  const [challengeRecords, setChallengeRecords] = useState([]);
  const [todayBestScore, setTodayBestScore] = useState(0);
  const [totalBonusPoints, setTotalBonusPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [reminderShown, setReminderShown] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [rankRewardClaimed, setRankRewardClaimed] = useState(false);
  const [starShards, setStarShards] = useState(0);

  const stateRef = useRef({});

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const getTomorrowResetTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  };

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateDailyChallenge = useCallback((dateStr) => {
    const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    const themeIndex = Math.floor(seededRandom(seed) * DAILY_CHALLENGE_THEMES.length);
    const theme = DAILY_CHALLENGE_THEMES[themeIndex];
    
    const taskIndices = [];
    let currentSeed = seed;
    while (taskIndices.length < 3) {
      currentSeed += 1;
      const idx = Math.floor(seededRandom(currentSeed) * DAILY_CHALLENGE_TASKS.length);
      if (!taskIndices.includes(idx)) {
        taskIndices.push(idx);
      }
    }
    const tasks = taskIndices.map(idx => DAILY_CHALLENGE_TASKS[idx]);
    
    return { theme, tasks };
  }, []);

  const generateMockLeaderboard = useCallback((dateStr, currentScore) => {
    const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const players = [
      { name: '星光使者', avatar: '🌟' },
      { name: '月下占卜师', avatar: '🌙' },
      { name: '银河旅人', avatar: '🌌' },
      { name: '星座守护者', avatar: '⭐' },
      { name: '命运编织者', avatar: '🎭' },
      { name: '星辰收藏家', avatar: '💫' },
      { name: '梦境探索者', avatar: '✨' },
      { name: '时空漫游者', avatar: '🚀' },
      { name: '星尘炼金师', avatar: '🔮' },
      { name: '暮光预言家', avatar: '🌅' }
    ];
    
    const leaderboardData = players.map((player, idx) => {
      const playerSeed = seed + idx * 100;
      const baseScore = 8000 - idx * 500;
      const variance = Math.floor(seededRandom(playerSeed) * 1000) - 500;
      return {
        ...player,
        score: Math.max(1000, baseScore + variance),
        rank: idx + 1
      };
    });
    
    if (currentScore > 0) {
      const playerEntry = {
        name: '你',
        avatar: '👤',
        score: currentScore,
        isCurrentPlayer: true
      };
      leaderboardData.push(playerEntry);
      leaderboardData.sort((a, b) => b.score - a.score);
      leaderboardData.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });
    }
    
    return leaderboardData;
  }, []);

  const saveDailyChallenge = useCallback((data) => {
    const s = stateRef.current;
    const saveData = {
      currentTheme: data.currentTheme !== undefined ? data.currentTheme : s.currentTheme,
      dailyTasks: data.dailyTasks !== undefined ? data.dailyTasks : s.dailyTasks,
      completedTasks: data.completedTasks !== undefined ? data.completedTasks : s.completedTasks,
      claimedTasks: data.claimedTasks !== undefined ? data.claimedTasks : s.claimedTasks,
      challengeRecords: data.challengeRecords !== undefined ? data.challengeRecords : s.challengeRecords,
      todayBestScore: data.todayBestScore !== undefined ? data.todayBestScore : s.todayBestScore,
      totalBonusPoints: data.totalBonusPoints !== undefined ? data.totalBonusPoints : s.totalBonusPoints,
      lastResetDate: data.lastResetDate !== undefined ? data.lastResetDate : s.lastResetDate,
      reminderShown: data.reminderShown !== undefined ? data.reminderShown : s.reminderShown,
      rankRewardClaimed: data.rankRewardClaimed !== undefined ? data.rankRewardClaimed : s.rankRewardClaimed,
      starShards: data.starShards !== undefined ? data.starShards : s.starShards
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, []);

  const resetDailyChallenge = useCallback(() => {
    const todayStr = getTodayDateString();
    const { theme, tasks } = generateDailyChallenge(todayStr);
    
    const newTheme = theme.id;
    const newTasks = tasks.map(t => t.id);
    
    setCurrentTheme(newTheme);
    setDailyTasks(newTasks);
    setCompletedTasks([]);
    setClaimedTasks([]);
    setChallengeRecords([]);
    setTodayBestScore(0);
    setLastResetDate(todayStr);
    setReminderShown(false);
    setLeaderboard(generateMockLeaderboard(todayStr, 0));
    setRankRewardClaimed(false);
    
    saveDailyChallenge({
      currentTheme: newTheme,
      dailyTasks: newTasks,
      completedTasks: [],
      claimedTasks: [],
      challengeRecords: [],
      todayBestScore: 0,
      lastResetDate: todayStr,
      reminderShown: false,
      rankRewardClaimed: false
    });
  }, [generateDailyChallenge, generateMockLeaderboard, saveDailyChallenge]);

  const checkAndResetDaily = useCallback(() => {
    const todayStr = getTodayDateString();
    if (lastResetDate !== todayStr) {
      resetDailyChallenge();
      return true;
    }
    return false;
  }, [lastResetDate, resetDailyChallenge]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCurrentTheme(data.currentTheme);
        setDailyTasks(data.dailyTasks || []);
        setCompletedTasks(data.completedTasks || []);
        setClaimedTasks(data.claimedTasks || []);
        setChallengeRecords(data.challengeRecords || []);
        setTodayBestScore(data.todayBestScore || 0);
        setTotalBonusPoints(data.totalBonusPoints || 0);
        setLastResetDate(data.lastResetDate);
        setReminderShown(data.reminderShown || false);
        setRankRewardClaimed(data.rankRewardClaimed || false);
        setStarShards(data.starShards || 0);
      } catch (e) {
        console.error('Failed to load daily challenge:', e);
      }
    }
  }, []);

  useEffect(() => {
    stateRef.current = {
      currentTheme,
      dailyTasks,
      completedTasks,
      claimedTasks,
      challengeRecords,
      todayBestScore,
      totalBonusPoints,
      lastResetDate,
      reminderShown,
      rankRewardClaimed,
      starShards
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAndResetDaily();
    }, 100);
    return () => clearTimeout(timer);
  }, [checkAndResetDaily]);

  useEffect(() => {
    const updateTimeUntilReset = () => {
      const now = Date.now();
      const tomorrow = getTomorrowResetTime();
      const diff = tomorrow - now;
      setTimeUntilReset(Math.max(0, diff));
      
      if (diff < 3600000 && !reminderShown) {
        setReminderShown(true);
        saveDailyChallenge({ reminderShown: true });
      }
    };
    
    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 1000);
    return () => clearInterval(interval);
  }, [reminderShown, saveDailyChallenge]);

  useEffect(() => {
    if (lastResetDate) {
      setLeaderboard(generateMockLeaderboard(lastResetDate, todayBestScore));
    }
  }, [lastResetDate, todayBestScore, generateMockLeaderboard]);

  const getChallengeConfig = useCallback(() => {
    const theme = currentTheme ? getDailyThemeById(currentTheme) : null;
    let bonusTime = 0;
    
    if (theme && theme.bonusType === 'time') {
      bonusTime = theme.bonusValue;
    }
    
    return {
      pairs: CHALLENGE_PAIRS,
      timeLimit: CHALLENGE_TIME_LIMIT + bonusTime,
      baseScore: CHALLENGE_BASE_SCORE,
      theme: theme
    };
  }, [currentTheme]);

  const calculateChallengeScore = useCallback((matchScore, combo, timeLeft, timeLimit, moves) => {
    let finalScore = matchScore;
    const theme = currentTheme ? getDailyThemeById(currentTheme) : null;
    
    if (theme) {
      if (theme.bonusType === 'score') {
        finalScore = Math.floor(finalScore * theme.bonusValue);
      } else if (theme.bonusType === 'combo') {
        const comboBonus = combo * 100 * theme.bonusValue;
        finalScore += comboBonus;
      }
    }
    
    return finalScore;
  }, [currentTheme]);

  const checkTaskCompletion = useCallback((result) => {
    const newlyCompleted = [];
    
    dailyTasks.forEach(taskId => {
      if (completedTasks.includes(taskId)) return;
      
      const task = DAILY_CHALLENGE_TASKS.find(t => t.id === taskId);
      if (!task) return;
      
      let completed = false;
      const req = task.requirement;
      
      switch (req.type) {
        case 'combo':
          completed = result.maxCombo >= req.value;
          break;
        case 'timeLeft':
          completed = result.timeLeft >= req.value;
          break;
        case 'moves':
          completed = result.moves <= req.value;
          break;
        case 'stars':
          completed = result.stars >= req.value;
          break;
        case 'perfect':
          completed = result.moves === CHALLENGE_PAIRS;
          break;
        case 'completeTime':
          completed = (result.timeLimit - result.timeLeft) <= req.value;
          break;
        case 'score':
          completed = result.score >= req.value;
          break;
        default:
          break;
      }
      
      if (completed) {
        newlyCompleted.push(taskId);
      }
    });
    
    if (newlyCompleted.length > 0) {
      const newCompleted = [...completedTasks, ...newlyCompleted];
      setCompletedTasks(newCompleted);
      saveDailyChallenge({ completedTasks: newCompleted });
    }
    
    return newlyCompleted;
  }, [dailyTasks, completedTasks, saveDailyChallenge]);

  const claimTaskReward = useCallback((taskId) => {
    if (claimedTasks.includes(taskId) || !completedTasks.includes(taskId)) {
      return false;
    }
    
    const task = DAILY_CHALLENGE_TASKS.find(t => t.id === taskId);
    if (!task) return false;
    
    const newClaimed = [...claimedTasks, taskId];
    setClaimedTasks(newClaimed);
    
    const newPoints = totalBonusPoints + task.reward.value;
    setTotalBonusPoints(newPoints);
    
    saveDailyChallenge({
      claimedTasks: newClaimed,
      totalBonusPoints: newPoints
    });
    
    return task.reward.value;
  }, [claimedTasks, completedTasks, totalBonusPoints, saveDailyChallenge]);

  const recordChallengeResult = useCallback((result) => {
    const completeTime = result.timeLimit - result.timeLeft;
    const record = {
      id: Date.now(),
      date: getTodayDateString(),
      score: result.score,
      maxCombo: result.maxCombo,
      timeLeft: result.timeLeft,
      completeTime,
      moves: result.moves,
      stars: result.stars,
      tasksCompleted: checkTaskCompletion({ ...result, timeLimit: result.timeLimit })
    };
    
    const newRecords = [record, ...challengeRecords].slice(0, 20);
    setChallengeRecords(newRecords);
    
    if (result.score > todayBestScore) {
      setTodayBestScore(result.score);
      saveDailyChallenge({
        challengeRecords: newRecords,
        todayBestScore: result.score
      });
    } else {
      saveDailyChallenge({ challengeRecords: newRecords });
    }
    
    return record;
  }, [challengeRecords, todayBestScore, checkTaskCompletion, saveDailyChallenge]);

  const getCurrentRank = useCallback(() => {
    const playerEntry = leaderboard.find(e => e.isCurrentPlayer);
    return playerEntry ? playerEntry.rank : null;
  }, [leaderboard]);

  const getRankReward = useCallback(() => {
    const rank = getCurrentRank();
    if (!rank) return null;
    return getDailyRewardByRank(rank);
  }, [getCurrentRank]);

  const getShardRewardAmount = (rank) => {
    if (rank === 1) return 20;
    if (rank === 2) return 10;
    if (rank === 3) return 5;
    if (rank <= 10) return 3;
    return 1;
  };

  const claimRankReward = useCallback(() => {
    if (rankRewardClaimed) {
      return { success: false, message: '今日排行奖励已领取' };
    }
    
    const rank = getCurrentRank();
    if (!rank) {
      return { success: false, message: '暂无排名，完成一次挑战后领取' };
    }
    
    const reward = getRankReward();
    if (!reward) {
      return { success: false, message: '无法获取奖励信息' };
    }
    
    const shardAmount = getShardRewardAmount(rank);
    
    setRankRewardClaimed(true);
    const newShards = starShards + shardAmount;
    setStarShards(newShards);
    
    const newPoints = totalBonusPoints + reward.bonusPoints;
    setTotalBonusPoints(newPoints);
    
    saveDailyChallenge({
      rankRewardClaimed: true,
      starShards: newShards,
      totalBonusPoints: newPoints
    });
    
    return {
      success: true,
      message: `领取成功！`,
      rank,
      reward,
      points: reward.bonusPoints,
      shards: shardAmount
    };
  }, [rankRewardClaimed, getCurrentRank, getRankReward, starShards, totalBonusPoints, saveDailyChallenge]);

  const getTasksWithStatus = useCallback(() => {
    return dailyTasks.map(taskId => {
      const task = DAILY_CHALLENGE_TASKS.find(t => t.id === taskId);
      return {
        ...task,
        completed: completedTasks.includes(taskId),
        claimed: claimedTasks.includes(taskId)
      };
    });
  }, [dailyTasks, completedTasks, claimedTasks]);

  const getTimeUntilResetFormatted = useCallback(() => {
    const hours = Math.floor(timeUntilReset / 3600000);
    const minutes = Math.floor((timeUntilReset % 3600000) / 60000);
    const seconds = Math.floor((timeUntilReset % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeUntilReset]);

  const shouldShowResetReminder = useCallback(() => {
    return timeUntilReset < 3600000;
  }, [timeUntilReset]);

  return {
    currentTheme,
    dailyTasks,
    completedTasks,
    claimedTasks,
    challengeRecords,
    todayBestScore,
    totalBonusPoints,
    leaderboard,
    lastResetDate,
    timeUntilReset,
    reminderShown,
    rankRewardClaimed,
    starShards,
    getChallengeConfig,
    calculateChallengeScore,
    recordChallengeResult,
    checkTaskCompletion,
    claimTaskReward,
    claimRankReward,
    getCurrentRank,
    getRankReward,
    getTasksWithStatus,
    getTimeUntilResetFormatted,
    shouldShowResetReminder,
    checkAndResetDaily,
    resetDailyChallenge
  };
};
