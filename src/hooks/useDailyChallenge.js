import { useState, useEffect, useCallback, useRef } from 'react';
import {
  DAILY_CHALLENGE_THEMES,
  DAILY_CHALLENGE_TASKS,
  DAILY_CHALLENGE_ENTRY_STATUS,
  getDailyThemeById,
  getDailyRewardByRank,
  getDailyShardByThemeId,
  getShardRewardProgress,
  getThemeDeckConfig,
  STAR_PATTERNS,
  getRarityColor
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
  const [collectedShards, setCollectedShards] = useState({});
  const [totalShardsCollected, setTotalShardsCollected] = useState(0);
  const [todayShardsEarned, setTodayShardsEarned] = useState(0);
  const [shardRewardsUnlocked, setShardRewardsUnlocked] = useState([]);
  const [challengeEntryStatus, setChallengeEntryStatus] = useState(DAILY_CHALLENGE_ENTRY_STATUS.NOT_STARTED);
  const [isNewTheme, setIsNewTheme] = useState(false);
  const [lastThemeId, setLastThemeId] = useState(null);
  const [leaderboardHistory, setLeaderboardHistory] = useState([]);

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
      starShards: data.starShards !== undefined ? data.starShards : s.starShards,
      collectedShards: data.collectedShards !== undefined ? data.collectedShards : s.collectedShards,
      totalShardsCollected: data.totalShardsCollected !== undefined ? data.totalShardsCollected : s.totalShardsCollected,
      todayShardsEarned: data.todayShardsEarned !== undefined ? data.todayShardsEarned : s.todayShardsEarned,
      shardRewardsUnlocked: data.shardRewardsUnlocked !== undefined ? data.shardRewardsUnlocked : s.shardRewardsUnlocked,
      challengeEntryStatus: data.challengeEntryStatus !== undefined ? data.challengeEntryStatus : s.challengeEntryStatus,
      lastThemeId: data.lastThemeId !== undefined ? data.lastThemeId : s.lastThemeId,
      leaderboardHistory: data.leaderboardHistory !== undefined ? data.leaderboardHistory : s.leaderboardHistory
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, []);

  const resetDailyChallenge = useCallback(() => {
    const todayStr = getTodayDateString();
    const { theme, tasks } = generateDailyChallenge(todayStr);
    
    const newTheme = theme.id;
    const newTasks = tasks.map(t => t.id);
    
    const themeChanged = lastThemeId && lastThemeId !== newTheme;
    if (themeChanged) {
      setIsNewTheme(true);
    }
    setLastThemeId(newTheme);
    
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
    setTodayShardsEarned(0);
    setChallengeEntryStatus(DAILY_CHALLENGE_ENTRY_STATUS.NOT_STARTED);
    
    saveDailyChallenge({
      currentTheme: newTheme,
      dailyTasks: newTasks,
      completedTasks: [],
      claimedTasks: [],
      challengeRecords: [],
      todayBestScore: 0,
      lastResetDate: todayStr,
      reminderShown: false,
      rankRewardClaimed: false,
      todayShardsEarned: 0,
      challengeEntryStatus: DAILY_CHALLENGE_ENTRY_STATUS.NOT_STARTED,
      lastThemeId: newTheme
    });
  }, [generateDailyChallenge, generateMockLeaderboard, saveDailyChallenge, lastThemeId]);

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
        setCollectedShards(data.collectedShards || {});
        setTotalShardsCollected(data.totalShardsCollected || 0);
        setTodayShardsEarned(data.todayShardsEarned || 0);
        setShardRewardsUnlocked(data.shardRewardsUnlocked || []);
        setChallengeEntryStatus(data.challengeEntryStatus || DAILY_CHALLENGE_ENTRY_STATUS.NOT_STARTED);
        setLastThemeId(data.lastThemeId || null);
        setLeaderboardHistory(data.leaderboardHistory || []);
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
      starShards,
      collectedShards,
      totalShardsCollected,
      todayShardsEarned,
      shardRewardsUnlocked,
      challengeEntryStatus,
      lastThemeId,
      leaderboardHistory
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
    let pairs = CHALLENGE_PAIRS;
    
    if (theme) {
      if (theme.bonusType === 'time') {
        bonusTime = theme.bonusValue;
      }
      if (theme.deckRules?.pairsBonus) {
        pairs += theme.deckRules.pairsBonus;
      }
    }
    
    const deckConfig = getThemeDeckConfig(currentTheme);
    
    return {
      pairs,
      timeLimit: CHALLENGE_TIME_LIMIT + bonusTime,
      baseScore: CHALLENGE_BASE_SCORE,
      theme,
      deckConfig
    };
  }, [currentTheme]);

  const generateThemeDeck = useCallback(() => {
    const theme = currentTheme ? getDailyThemeById(currentTheme) : null;
    if (!theme || !theme.deckRules) {
      return [...STAR_PATTERNS].sort(() => Math.random() - 0.5);
    }

    const { preferredElements, preferredStars } = theme.deckRules;
    let deck = [...STAR_PATTERNS];

    if (preferredStars && preferredStars.length > 0) {
      const preferred = deck.filter(s => preferredStars.includes(s.id));
      const others = deck.filter(s => !preferredStars.includes(s.id));
      const shuffledPreferred = preferred.sort(() => Math.random() - 0.5);
      const shuffledOthers = others.sort(() => Math.random() - 0.5);
      deck = [...shuffledPreferred, ...shuffledOthers];
    } else if (preferredElements && preferredElements.length > 0) {
      const preferred = deck.filter(s => preferredElements.includes(s.element));
      const others = deck.filter(s => !preferredElements.includes(s.element));
      const shuffledPreferred = preferred.sort(() => Math.random() - 0.5);
      const shuffledOthers = others.sort(() => Math.random() - 0.5);
      deck = [...shuffledPreferred, ...shuffledOthers];
    } else {
      deck.sort(() => Math.random() - 0.5);
    }

    return deck;
  }, [currentTheme]);

  const collectLimitedShard = useCallback((themeId, amount = 1) => {
    try {
      const shardInfo = getDailyShardByThemeId(themeId);
      if (!shardInfo) {
        console.warn('collectLimitedShard: 未找到主题对应的碎片，themeId:', themeId);
        return null;
      }
      if (amount <= 0) {
        console.warn('collectLimitedShard: 碎片数量必须大于0，amount:', amount);
        return null;
      }

      const shardId = shardInfo.id;
      const newCollected = { ...(collectedShards || {}) };
      newCollected[shardId] = (newCollected[shardId] || 0) + amount;
      
      const newTotal = (totalShardsCollected || 0) + amount;
      const newToday = (todayShardsEarned || 0) + amount;

      setCollectedShards(newCollected);
      setTotalShardsCollected(newTotal);
      setTodayShardsEarned(newToday);

      const newUnlocked = [...(shardRewardsUnlocked || [])];
      let shardRewards = [];
      try {
        shardRewards = getShardRewardProgress(newTotal) || [];
      } catch (e) {
        console.error('获取碎片奖励进度失败:', e);
      }
      
      shardRewards.forEach(reward => {
        if (reward && reward.unlocked && !newUnlocked.includes(reward.id)) {
          newUnlocked.push(reward.id);
        }
      });
      setShardRewardsUnlocked(newUnlocked);

      saveDailyChallenge({
        collectedShards: newCollected,
        totalShardsCollected: newTotal,
        todayShardsEarned: newToday,
        shardRewardsUnlocked: newUnlocked
      });

      const newlyUnlocked = shardRewards.filter(r => 
        r && r.unlocked && !shardRewardsUnlocked.includes(r.id)
      );

      console.log(`[每日挑战] 获得限定碎片: ${shardInfo.name} x${amount}, 累计: ${newTotal}枚`);
      if (newlyUnlocked.length > 0) {
        console.log('[每日挑战] 解锁新的碎片奖励:', newlyUnlocked.map(r => r.name));
      }

      return {
        shard: shardInfo,
        amount,
        newTotal,
        newlyUnlockedRewards: newlyUnlocked
      };
    } catch (error) {
      console.error('collectLimitedShard 错误:', error);
      return null;
    }
  }, [collectedShards, totalShardsCollected, todayShardsEarned, shardRewardsUnlocked, saveDailyChallenge]);

  const calculateShardReward = useCallback((result) => {
    if (!result) return 0;
    const baseAmount = result.isWin ? 1 : 0;
    let bonusAmount = 0;
    
    if (result.stars === 3) bonusAmount += 1;
    if ((result.maxCombo || 0) >= 10) bonusAmount += 1;
    if ((result.score || 0) >= 8000) bonusAmount += 1;
    
    return baseAmount + bonusAmount;
  }, []);

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
    try {
      console.log('[每日挑战] 开始结算，结果:', result);
      
      if (!result) {
        console.error('recordChallengeResult: result 为空');
        return null;
      }

      const completeTime = (result.timeLimit || 0) - (result.timeLeft || 0);
      
      let newlyCompletedTasks = [];
      try {
        newlyCompletedTasks = checkTaskCompletion({ ...result, timeLimit: result.timeLimit || 90 }) || [];
      } catch (e) {
        console.error('检查任务完成情况失败:', e);
      }
      
      const record = {
        id: Date.now(),
        date: getTodayDateString(),
        score: result.score || 0,
        maxCombo: result.maxCombo || 0,
        timeLeft: result.timeLeft || 0,
        completeTime,
        moves: result.moves || 0,
        stars: result.stars || 1,
        tasksCompleted: newlyCompletedTasks,
        isWin: !!result.isWin
      };
      
      const newRecords = [record, ...(challengeRecords || [])].slice(0, 20);
      setChallengeRecords(newRecords);
      
      let shardResult = null;
      try {
        const shardAmount = calculateShardReward(result);
        if (shardAmount > 0 && currentTheme) {
          shardResult = collectLimitedShard(currentTheme, shardAmount);
        }
      } catch (e) {
        console.error('计算/发放碎片奖励失败:', e);
      }
      
      let newEntryStatus = challengeEntryStatus;
      try {
        if (challengeEntryStatus === DAILY_CHALLENGE_ENTRY_STATUS.NOT_STARTED) {
          newEntryStatus = DAILY_CHALLENGE_ENTRY_STATUS.IN_PROGRESS;
        }
        if (result.isWin && newEntryStatus === DAILY_CHALLENGE_ENTRY_STATUS.IN_PROGRESS) {
          newEntryStatus = DAILY_CHALLENGE_ENTRY_STATUS.COMPLETED;
        }
        
        const newCompletedTasks = [...(completedTasks || []), ...newlyCompletedTasks];
        const allTasksDone = dailyTasks && dailyTasks.length > 0 && 
          dailyTasks.every(t => newCompletedTasks.includes(t));
        if (allTasksDone && newEntryStatus !== DAILY_CHALLENGE_ENTRY_STATUS.REWARD_CLAIMED) {
          newEntryStatus = DAILY_CHALLENGE_ENTRY_STATUS.ALL_TASKS_DONE;
        }
      } catch (e) {
        console.error('更新挑战状态失败:', e);
      }
      
      setChallengeEntryStatus(newEntryStatus);
      
      try {
        if (result.score > todayBestScore) {
          setTodayBestScore(result.score);
          saveDailyChallenge({
            challengeRecords: newRecords,
            todayBestScore: result.score,
            challengeEntryStatus: newEntryStatus
          });
        } else {
          saveDailyChallenge({
            challengeRecords: newRecords,
            challengeEntryStatus: newEntryStatus
          });
        }
      } catch (e) {
        console.error('保存挑战记录失败:', e);
      }
      
      console.log('[每日挑战] 结算完成', {
        score: result.score,
        stars: result.stars,
        isWin: result.isWin,
        shardAmount: shardResult?.amount || 0,
        tasksCompleted: newlyCompletedTasks.length
      });
      
      return {
        record,
        shardResult,
        newlyCompletedTasks
      };
    } catch (error) {
      console.error('recordChallengeResult 结算错误:', error);
      return null;
    }
  }, [
    challengeRecords, 
    todayBestScore, 
    checkTaskCompletion, 
    saveDailyChallenge, 
    calculateShardReward, 
    currentTheme, 
    collectLimitedShard,
    challengeEntryStatus,
    completedTasks,
    dailyTasks
  ]);

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
    
    setChallengeEntryStatus(DAILY_CHALLENGE_ENTRY_STATUS.REWARD_CLAIMED);
    
    saveDailyChallenge({
      rankRewardClaimed: true,
      starShards: newShards,
      totalBonusPoints: newPoints,
      challengeEntryStatus: DAILY_CHALLENGE_ENTRY_STATUS.REWARD_CLAIMED
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

  const getResetReminderLevel = useCallback(() => {
    if (timeUntilReset < 300000) return 'urgent';
    if (timeUntilReset < 3600000) return 'warning';
    if (timeUntilReset < 7200000) return 'info';
    return 'normal';
  }, [timeUntilReset]);

  const getEntryStatusInfo = useCallback(() => {
    const statusMap = {
      [DAILY_CHALLENGE_ENTRY_STATUS.NOT_STARTED]: {
        label: '未开始',
        badge: 'NEW',
        badgeColor: '#ec4899',
        showPulse: true,
        description: '点击开始今日挑战'
      },
      [DAILY_CHALLENGE_ENTRY_STATUS.IN_PROGRESS]: {
        label: '进行中',
        badge: '进行中',
        badgeColor: '#fbbf24',
        showPulse: false,
        description: '继续挑战提升分数'
      },
      [DAILY_CHALLENGE_ENTRY_STATUS.COMPLETED]: {
        label: '已完成',
        badge: '已完成',
        badgeColor: '#10b981',
        showPulse: false,
        description: '完成任务获取更多奖励'
      },
      [DAILY_CHALLENGE_ENTRY_STATUS.ALL_TASKS_DONE]: {
        label: '领取奖励',
        badge: '🎁',
        badgeColor: '#f97316',
        showPulse: true,
        description: '任务全部完成，领取排行奖励！'
      },
      [DAILY_CHALLENGE_ENTRY_STATUS.REWARD_CLAIMED]: {
        label: '今日已结束',
        badge: '✓',
        badgeColor: '#6b7280',
        showPulse: false,
        description: '明天再来挑战吧'
      }
    };
    return statusMap[challengeEntryStatus] || statusMap[DAILY_CHALLENGE_ENTRY_STATUS.NOT_STARTED];
  }, [challengeEntryStatus]);

  const getShardCollectionStats = useCallback(() => {
    return {
      collectedShards,
      totalShardsCollected,
      todayShardsEarned,
      shardRewards: getShardRewardProgress(totalShardsCollected),
      shardRewardsUnlocked
    };
  }, [collectedShards, totalShardsCollected, todayShardsEarned, shardRewardsUnlocked]);

  const getCurrentThemeShard = useCallback(() => {
    if (!currentTheme) return null;
    return getDailyShardByThemeId(currentTheme);
  }, [currentTheme]);

  const dismissNewThemeNotice = useCallback(() => {
    setIsNewTheme(false);
  }, []);

  const getLeaderboardPosition = useCallback(() => {
    const playerEntry = leaderboard.find(e => e.isCurrentPlayer);
    if (!playerEntry) return null;
    return {
      rank: playerEntry.rank,
      total: leaderboard.length,
      percentile: Math.round((playerEntry.rank / leaderboard.length) * 100)
    };
  }, [leaderboard]);

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
    collectedShards,
    totalShardsCollected,
    todayShardsEarned,
    shardRewardsUnlocked,
    challengeEntryStatus,
    isNewTheme,
    leaderboardHistory,
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
    resetDailyChallenge,
    generateThemeDeck,
    collectLimitedShard,
    calculateShardReward,
    getResetReminderLevel,
    getEntryStatusInfo,
    getShardCollectionStats,
    getCurrentThemeShard,
    dismissNewThemeNotice,
    getLeaderboardPosition
  };
};
