import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  SEASON_DAILY_TASKS,
  SEASON_WEEKLY_TASKS,
  SEASON_CHALLENGE_TASKS,
  SEASON_STAGE_REWARDS,
  SEASON_THEME_SKINS,
  SEASON_TITLES,
  getCurrentSeason,
  getSeasonTaskById,
  getSeasonStageRewardByLevel,
  getSeasonLevelProgress,
  SEASON_POINT_RULES,
  LEVELS
} from '../data/gameData';

const STORAGE_KEY = 'starTowerSeasonChallenge';

export const useSeasonChallenge = (archive, achievements, shop) => {
  const [currentSeason, setCurrentSeason] = useState(null);
  const [seasonPoints, setSeasonPoints] = useState(0);
  const [seasonLevel, setSeasonLevel] = useState(1);
  const [currentLevelProgress, setCurrentLevelProgress] = useState(0);
  
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [challengeTasks, setChallengeTasks] = useState([]);
  
  const [completedTasks, setCompletedTasks] = useState({});
  const [claimedTasks, setClaimedTasks] = useState({});
  const [claimedStageRewards, setClaimedStageRewards] = useState([]);
  
  const [unlockedSkins, setUnlockedSkins] = useState(['skin-default']);
  const [currentSkin, setCurrentSkin] = useState('skin-default');
  const [unlockedTitles, setUnlockedTitles] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  
  const [seasonStats, setSeasonStats] = useState({
    playCount: 0,
    winCount: 0,
    maxCombo: 0,
    threeStarCount: 0,
    levelsCompleted: [],
    perfectCount: 0,
    shopSpend: 0,
    dailyTaskCompleteDays: 0
  });
  
  const [lastDailyReset, setLastDailyReset] = useState(null);
  const [lastWeeklyReset, setLastWeeklyReset] = useState(null);
  const [timeUntilDailyReset, setTimeUntilDailyReset] = useState(0);
  const [timeUntilWeeklyReset, setTimeUntilWeeklyReset] = useState(0);
  const [timeUntilSeasonEnd, setTimeUntilSeasonEnd] = useState(0);
  
  const [settlementShown, setSettlementShown] = useState(false);
  const [seasonEnded, setSeasonEnded] = useState(false);
  
  const stateRef = useRef({});

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const getWeekKey = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${today.getFullYear()}-W${weekNumber}`;
  };

  const getTomorrowResetTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  };

  const getNextMondayResetTime = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? 7 : 7 - day + 1;
    nextMonday.setDate(now.getDate() + diff);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday.getTime();
  };

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const generateDailyTasks = useCallback((dateStr) => {
    const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const taskIndices = [];
    let currentSeed = seed;
    
    while (taskIndices.length < 4) {
      currentSeed += 1;
      const idx = Math.floor(seededRandom(currentSeed) * SEASON_DAILY_TASKS.length);
      if (!taskIndices.includes(idx)) {
        taskIndices.push(idx);
      }
    }
    
    return taskIndices.map(idx => SEASON_DAILY_TASKS[idx].id);
  }, []);

  const generateWeeklyTasks = useCallback((weekKey) => {
    const seed = weekKey.split('-W').reduce((acc, val) => acc + parseInt(val), 0);
    const taskIndices = [];
    let currentSeed = seed;
    
    while (taskIndices.length < 4) {
      currentSeed += 1;
      const idx = Math.floor(seededRandom(currentSeed) * SEASON_WEEKLY_TASKS.length);
      if (!taskIndices.includes(idx)) {
        taskIndices.push(idx);
      }
    }
    
    return taskIndices.map(idx => SEASON_WEEKLY_TASKS[idx].id);
  }, []);

  const saveSeasonChallenge = useCallback((data) => {
    const s = stateRef.current;
    const saveData = {
      currentSeason: data.currentSeason !== undefined ? data.currentSeason : s.currentSeason,
      seasonPoints: data.seasonPoints !== undefined ? data.seasonPoints : s.seasonPoints,
      completedTasks: data.completedTasks !== undefined ? data.completedTasks : s.completedTasks,
      claimedTasks: data.claimedTasks !== undefined ? data.claimedTasks : s.claimedTasks,
      claimedStageRewards: data.claimedStageRewards !== undefined ? data.claimedStageRewards : s.claimedStageRewards,
      unlockedSkins: data.unlockedSkins !== undefined ? data.unlockedSkins : s.unlockedSkins,
      currentSkin: data.currentSkin !== undefined ? data.currentSkin : s.currentSkin,
      unlockedTitles: data.unlockedTitles !== undefined ? data.unlockedTitles : s.unlockedTitles,
      currentTitle: data.currentTitle !== undefined ? data.currentTitle : s.currentTitle,
      seasonStats: data.seasonStats !== undefined ? data.seasonStats : s.seasonStats,
      lastDailyReset: data.lastDailyReset !== undefined ? data.lastDailyReset : s.lastDailyReset,
      lastWeeklyReset: data.lastWeeklyReset !== undefined ? data.lastWeeklyReset : s.lastWeeklyReset,
      dailyTasks: data.dailyTasks !== undefined ? data.dailyTasks : s.dailyTasks,
      weeklyTasks: data.weeklyTasks !== undefined ? data.weeklyTasks : s.weeklyTasks,
      challengeTasks: data.challengeTasks !== undefined ? data.challengeTasks : s.challengeTasks,
      settlementShown: data.settlementShown !== undefined ? data.settlementShown : s.settlementShown
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, []);

  const resetDailyTasks = useCallback(() => {
    const todayStr = getTodayDateString();
    const newDailyTasks = generateDailyTasks(todayStr);
    setDailyTasks(newDailyTasks);
    setLastDailyReset(todayStr);
    saveSeasonChallenge({
      dailyTasks: newDailyTasks,
      lastDailyReset: todayStr
    });
  }, [generateDailyTasks, saveSeasonChallenge]);

  const resetWeeklyTasks = useCallback(() => {
    const weekKey = getWeekKey();
    const newWeeklyTasks = generateWeeklyTasks(weekKey);
    setWeeklyTasks(newWeeklyTasks);
    setLastWeeklyReset(weekKey);
    saveSeasonChallenge({
      weeklyTasks: newWeeklyTasks,
      lastWeeklyReset: weekKey
    });
  }, [generateWeeklyTasks, saveSeasonChallenge]);

  const initSeasonChallenge = useCallback(() => {
    const season = getCurrentSeason();
    setCurrentSeason(season);
    setChallengeTasks(SEASON_CHALLENGE_TASKS.map(t => t.id));
    
    const todayStr = getTodayDateString();
    const weekKey = getWeekKey();
    
    const newDailyTasks = generateDailyTasks(todayStr);
    const newWeeklyTasks = generateWeeklyTasks(weekKey);
    
    setDailyTasks(newDailyTasks);
    setWeeklyTasks(newWeeklyTasks);
    setLastDailyReset(todayStr);
    setLastWeeklyReset(weekKey);
    
    saveSeasonChallenge({
      currentSeason: season.id,
      dailyTasks: newDailyTasks,
      weeklyTasks: newWeeklyTasks,
      challengeTasks: SEASON_CHALLENGE_TASKS.map(t => t.id),
      lastDailyReset: todayStr,
      lastWeeklyReset: weekKey
    });
  }, [generateDailyTasks, generateWeeklyTasks, saveSeasonChallenge]);

  const checkAndResetDaily = useCallback(() => {
    const todayStr = getTodayDateString();
    if (lastDailyReset !== todayStr) {
      resetDailyTasks();
      const newStats = { ...seasonStats };
      newStats.dailyTaskCompleteDays += 1;
      setSeasonStats(newStats);
      saveSeasonChallenge({ seasonStats: newStats });
      return true;
    }
    return false;
  }, [lastDailyReset, resetDailyTasks, seasonStats, saveSeasonChallenge]);

  const checkAndResetWeekly = useCallback(() => {
    const weekKey = getWeekKey();
    if (lastWeeklyReset !== weekKey) {
      resetWeeklyTasks();
      return true;
    }
    return false;
  }, [lastWeeklyReset, resetWeeklyTasks]);

  const addSeasonPoints = useCallback((points) => {
    if (!currentSeason) return;
    
    const season = getCurrentSeason();
    const multiplier = season.bonusMultiplier || 1;
    const finalPoints = Math.floor(points * multiplier);
    
    const newPoints = seasonPoints + finalPoints;
    const maxPoints = season.maxLevel * season.pointsPerLevel;
    const cappedPoints = Math.min(newPoints, maxPoints);
    
    setSeasonPoints(cappedPoints);
    
    const progress = getSeasonLevelProgress(cappedPoints, season.pointsPerLevel);
    setSeasonLevel(progress.level);
    setCurrentLevelProgress(progress.progress);
    
    saveSeasonChallenge({ seasonPoints: cappedPoints });
    
    return finalPoints;
  }, [seasonPoints, currentSeason, saveSeasonChallenge]);

  const calculateGamePoints = useCallback((result) => {
    if (!result.isWin) return 0;
    
    let points = 0;
    const levelId = result.levelId;
    
    points += SEASON_POINT_RULES.levelComplete[levelId] || 5;
    points += SEASON_POINT_RULES.starBonus[result.stars] || 0;
    
    if (result.maxCombo > 0) {
      points += result.maxCombo * SEASON_POINT_RULES.comboBonus;
    }
    
    const pairs = LEVELS[levelId - 1]?.pairs || 4;
    if (result.moves === pairs * 2) {
      points += SEASON_POINT_RULES.perfectBonus;
    }
    
    return points;
  }, []);

  const updateSeasonStats = useCallback((result, isWin) => {
    const newStats = { ...seasonStats };
    
    newStats.playCount += 1;
    
    if (isWin) {
      newStats.winCount += 1;
      
      if (!newStats.levelsCompleted.includes(result.levelId)) {
        newStats.levelsCompleted.push(result.levelId);
      }
      
      if (result.maxCombo > newStats.maxCombo) {
        newStats.maxCombo = result.maxCombo;
      }
      
      if (result.stars === 3) {
        newStats.threeStarCount += 1;
      }
      
      const pairs = LEVELS[result.levelId - 1]?.pairs || 4;
      if (result.moves === pairs * 2) {
        newStats.perfectCount += 1;
      }
    }
    
    setSeasonStats(newStats);
    saveSeasonChallenge({ seasonStats: newStats });
  }, [seasonStats, saveSeasonChallenge]);

  const checkTaskCompletion = useCallback((result, isWin) => {
    if (!currentSeason) return [];
    
    const newlyCompleted = [];
    const newCompleted = { ...completedTasks };
    const newStats = { ...seasonStats };
    
    const allTaskIds = [...dailyTasks, ...weeklyTasks, ...challengeTasks];
    
    allTaskIds.forEach(taskId => {
      if (newCompleted[taskId]) return;
      
      const task = getSeasonTaskById(taskId);
      if (!task) return;
      
      const req = task.requirement;
      let completed = false;
      
      switch (req.type) {
        case 'login':
          completed = true;
          break;
        case 'playCount':
          completed = newStats.playCount >= req.value;
          break;
        case 'winCount':
          completed = newStats.winCount >= req.value;
          break;
        case 'maxCombo':
          completed = newStats.maxCombo >= req.value;
          break;
        case 'stars':
          if (isWin && result) {
            completed = result.stars >= req.value;
          }
          break;
        case 'threeStarCount':
          completed = newStats.threeStarCount >= req.value;
          break;
        case 'levelComplete':
          completed = newStats.levelsCompleted.includes(req.value) || 
                     Math.max(...newStats.levelsCompleted, 0) >= req.value;
          break;
        case 'perfect':
          completed = newStats.perfectCount >= req.value;
          break;
        case 'shopSpend':
          completed = newStats.shopSpend >= req.value;
          break;
        case 'dailyTaskComplete':
          completed = newStats.dailyTaskCompleteDays >= req.value;
          break;
        case 'allLevelsComplete':
          completed = newStats.levelsCompleted.length >= LEVELS.length;
          break;
        case 'allThreeStars':
          completed = newStats.threeStarCount >= LEVELS.length;
          break;
        case 'collectedFragments':
          if (archive) {
            completed = archive.collectedFragments.length >= req.value;
          }
          break;
        case 'achievementCount':
          if (achievements) {
            completed = achievements.unlockedAchievements.length >= req.value;
          }
          break;
        case 'allEndings':
          if (archive) {
            completed = archive.unlockedEndings.length >= 3;
          }
          break;
        case 'visitShop':
        case 'visitAchievement':
          completed = false;
          break;
        default:
          break;
      }
      
      if (completed) {
        newCompleted[taskId] = true;
        newlyCompleted.push(taskId);
      }
    });
    
    if (newlyCompleted.length > 0) {
      setCompletedTasks(newCompleted);
      saveSeasonChallenge({ completedTasks: newCompleted });
    }
    
    return newlyCompleted;
  }, [currentSeason, completedTasks, dailyTasks, weeklyTasks, challengeTasks, seasonStats, archive, achievements, saveSeasonChallenge]);

  const recordPageVisit = useCallback((pageType) => {
    if (!currentSeason) return [];
    
    const newlyCompleted = [];
    const newCompleted = { ...completedTasks };
    
    const allTaskIds = [...dailyTasks, ...weeklyTasks, ...challengeTasks];
    
    allTaskIds.forEach(taskId => {
      if (newCompleted[taskId]) return;
      
      const task = getSeasonTaskById(taskId);
      if (!task) return;
      
      const req = task.requirement;
      let completed = false;
      
      if (req.type === 'visitShop' && pageType === 'shop') {
        completed = true;
      } else if (req.type === 'visitAchievement' && pageType === 'achievement') {
        completed = true;
      }
      
      if (completed) {
        newCompleted[taskId] = true;
        newlyCompleted.push(taskId);
      }
    });
    
    if (newlyCompleted.length > 0) {
      setCompletedTasks(newCompleted);
      saveSeasonChallenge({ completedTasks: newCompleted });
    }
    
    return newlyCompleted;
  }, [currentSeason, completedTasks, dailyTasks, weeklyTasks, challengeTasks, saveSeasonChallenge]);

  const recordShopSpend = useCallback((amount) => {
    const newStats = { ...seasonStats };
    newStats.shopSpend += amount;
    setSeasonStats(newStats);
    saveSeasonChallenge({ seasonStats: newStats });
  }, [seasonStats, saveSeasonChallenge]);

  const claimTaskReward = useCallback((taskId) => {
    if (claimedTasks[taskId] || !completedTasks[taskId]) {
      return { success: false, message: '无法领取该任务奖励' };
    }
    
    const task = getSeasonTaskById(taskId);
    if (!task) return { success: false, message: '任务不存在' };
    
    const newClaimed = { ...claimedTasks, [taskId]: true };
    setClaimedTasks(newClaimed);
    saveSeasonChallenge({ claimedTasks: newClaimed });
    
    const earnedPoints = addSeasonPoints(task.reward.value);
    
    return {
      success: true,
      message: '奖励领取成功！',
      points: earnedPoints || task.reward.value,
      task
    };
  }, [claimedTasks, completedTasks, addSeasonPoints, saveSeasonChallenge]);

  const claimStageReward = useCallback((level) => {
    if (claimedStageRewards.includes(level)) {
      return { success: false, message: '该阶段奖励已领取' };
    }
    
    if (seasonLevel < level) {
      return { success: false, message: '等级不足，无法领取' };
    }
    
    const reward = getSeasonStageRewardByLevel(level);
    if (!reward) return { success: false, message: '奖励不存在' };
    
    const newClaimed = [...claimedStageRewards, level];
    setClaimedStageRewards(newClaimed);
    saveSeasonChallenge({ claimedStageRewards: newClaimed });
    
    let result = { success: true, message: '奖励领取成功！', reward };
    
    switch (reward.reward.type) {
      case 'stardust':
        if (shop) {
          shop.addStardust(reward.reward.value);
        }
        result.stardust = reward.reward.value;
        break;
      case 'starShards':
        if (shop) {
          shop.addStarShards(reward.reward.value);
        }
        result.starShards = reward.reward.value;
        break;
      case 'title':
        const title = SEASON_TITLES.find(t => t.id === reward.reward.value);
        if (title && !unlockedTitles.includes(title.id)) {
          const newTitles = [...unlockedTitles, title.id];
          setUnlockedTitles(newTitles);
          saveSeasonChallenge({ unlockedTitles: newTitles });
          result.title = title;
        }
        break;
      case 'skin':
        const skin = SEASON_THEME_SKINS.find(s => s.id === reward.reward.value);
        if (skin && !unlockedSkins.includes(skin.id)) {
          const newSkins = [...unlockedSkins, skin.id];
          setUnlockedSkins(newSkins);
          saveSeasonChallenge({ unlockedSkins: newSkins });
          result.skin = skin;
        }
        break;
      default:
        break;
    }
    
    return result;
  }, [claimedStageRewards, seasonLevel, shop, unlockedTitles, unlockedSkins, saveSeasonChallenge]);

  const setSkin = useCallback((skinId) => {
    if (!unlockedSkins.includes(skinId)) {
      return { success: false, message: '该皮肤尚未解锁' };
    }
    
    setCurrentSkin(skinId);
    saveSeasonChallenge({ currentSkin: skinId });
    
    return { success: true, message: '皮肤切换成功！', skinId };
  }, [unlockedSkins, saveSeasonChallenge]);

  const setTitle = useCallback((titleId) => {
    if (titleId && !unlockedTitles.includes(titleId)) {
      return { success: false, message: '该称号尚未解锁' };
    }
    
    setCurrentTitle(titleId || null);
    saveSeasonChallenge({ currentTitle: titleId || null });
    
    return { success: true, message: '称号设置成功！', titleId };
  }, [unlockedTitles, saveSeasonChallenge]);

  const getTasksWithStatus = useCallback((type) => {
    let taskIds = [];
    if (type === 'daily') taskIds = dailyTasks;
    else if (type === 'weekly') taskIds = weeklyTasks;
    else if (type === 'challenge') taskIds = challengeTasks;
    
    return taskIds.map(taskId => {
      const task = getSeasonTaskById(taskId);
      return {
        ...task,
        completed: completedTasks[taskId] || false,
        claimed: claimedTasks[taskId] || false,
        progress: getTaskProgress(task)
      };
    });
  }, [dailyTasks, weeklyTasks, challengeTasks, completedTasks, claimedTasks]);

  const getTaskProgress = (task) => {
    if (!task) return 0;
    const req = task.requirement;
    
    switch (req.type) {
      case 'playCount':
        return Math.min(100, (seasonStats.playCount / req.value) * 100);
      case 'winCount':
        return Math.min(100, (seasonStats.winCount / req.value) * 100);
      case 'maxCombo':
        return Math.min(100, (seasonStats.maxCombo / req.value) * 100);
      case 'stars':
        return 0;
      case 'threeStarCount':
        return Math.min(100, (seasonStats.threeStarCount / req.value) * 100);
      case 'levelComplete':
        const maxLevel = Math.max(...seasonStats.levelsCompleted, 0);
        return Math.min(100, (maxLevel / req.value) * 100);
      case 'perfect':
        return Math.min(100, (seasonStats.perfectCount / req.value) * 100);
      case 'shopSpend':
        return Math.min(100, (seasonStats.shopSpend / req.value) * 100);
      case 'dailyTaskComplete':
        return Math.min(100, (seasonStats.dailyTaskCompleteDays / req.value) * 100);
      case 'allLevelsComplete':
        return Math.min(100, (seasonStats.levelsCompleted.length / LEVELS.length) * 100);
      case 'allThreeStars':
        return Math.min(100, (seasonStats.threeStarCount / LEVELS.length) * 100);
      case 'collectedFragments':
        const collected = archive?.collectedFragments?.length || 0;
        return Math.min(100, (collected / req.value) * 100);
      case 'achievementCount':
        const achvCount = achievements?.unlockedAchievements?.length || 0;
        return Math.min(100, (achvCount / req.value) * 100);
      case 'allEndings':
        const endings = archive?.unlockedEndings?.length || 0;
        return Math.min(100, (endings / 3) * 100);
      default:
        return completedTasks[task.id] ? 100 : 0;
    }
  };

  const getStageRewardsWithStatus = useCallback(() => {
    return SEASON_STAGE_REWARDS.map(reward => ({
      ...reward,
      unlocked: seasonLevel >= reward.level,
      claimed: claimedStageRewards.includes(reward.level)
    }));
  }, [seasonLevel, claimedStageRewards]);

  const getSkinsWithStatus = useCallback(() => {
    return SEASON_THEME_SKINS.map(skin => ({
      ...skin,
      unlocked: unlockedSkins.includes(skin.id),
      selected: currentSkin === skin.id
    }));
  }, [unlockedSkins, currentSkin]);

  const getTitlesWithStatus = useCallback(() => {
    return SEASON_TITLES.map(title => ({
      ...title,
      unlocked: unlockedTitles.includes(title.id),
      selected: currentTitle === title.id
    }));
  }, [unlockedTitles, currentTitle]);

  const getCurrentSkinTheme = useCallback(() => {
    return SEASON_THEME_SKINS.find(s => s.id === currentSkin)?.theme || SEASON_THEME_SKINS[0].theme;
  }, [currentSkin]);

  const updateStatsOnWin = useCallback(({ levelId, stars, maxCombo, timeLeft, moves, isPerfect }) => {
    const newStats = { ...seasonStats };
    
    newStats.playCount += 1;
    newStats.winCount += 1;
    
    if (!newStats.levelsCompleted.includes(levelId)) {
      newStats.levelsCompleted.push(levelId);
    }
    
    if (maxCombo > newStats.maxCombo) {
      newStats.maxCombo = maxCombo;
    }
    
    if (stars === 3) {
      newStats.threeStarCount += 1;
    }
    
    if (isPerfect) {
      newStats.perfectCount += 1;
    }
    
    setSeasonStats(newStats);
    saveSeasonChallenge({ seasonStats: newStats });
    
    setTimeout(() => {
      checkTaskCompletion();
    }, 100);
  }, [seasonStats, saveSeasonChallenge, checkTaskCompletion]);

  const unclaimedStageRewardsCount = SEASON_STAGE_REWARDS.filter(reward => 
    seasonLevel >= reward.level && !claimedStageRewards.includes(reward.level)
  ).length;

  const unclaimedTaskRewardsCount = useMemo(() => {
    const allTaskIds = [...dailyTasks, ...weeklyTasks, ...challengeTasks];
    return allTaskIds.filter(taskId => 
      completedTasks[taskId] && !claimedTasks[taskId]
    ).length;
  }, [dailyTasks, weeklyTasks, challengeTasks, completedTasks, claimedTasks]);

  const getSeasonSettlementData = useCallback(() => {
    const season = getCurrentSeason();
    const totalPoints = seasonLevel * 100 + currentLevelProgress;
    const rewardsUnlocked = SEASON_STAGE_REWARDS.filter(r => r.level <= seasonLevel);
    
    return {
      season,
      seasonLevel,
      seasonPoints,
      totalPoints,
      currentLevelProgress,
      seasonStats,
      unlockedSkins: unlockedSkins.filter(s => s !== 'skin-default'),
      unlockedTitles,
      rewardsUnlocked,
      totalRewards: SEASON_STAGE_REWARDS.length
    };
  }, [seasonLevel, seasonPoints, currentLevelProgress, seasonStats, unlockedSkins, unlockedTitles]);

  const formatTimeUntil = (ms) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    if (days > 0) {
      return `${days}天 ${hours}时 ${minutes}分`;
    } else if (hours > 0) {
      return `${hours}时 ${minutes}分 ${seconds}秒`;
    }
    return `${minutes}分 ${seconds}秒`;
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCurrentSeason(data.currentSeason);
        setSeasonPoints(data.seasonPoints || 0);
        setCompletedTasks(data.completedTasks || {});
        setClaimedTasks(data.claimedTasks || {});
        setClaimedStageRewards(data.claimedStageRewards || []);
        setUnlockedSkins(data.unlockedSkins || ['skin-default']);
        setCurrentSkin(data.currentSkin || 'skin-default');
        setUnlockedTitles(data.unlockedTitles || []);
        setCurrentTitle(data.currentTitle || null);
        setSeasonStats(data.seasonStats || {
          playCount: 0,
          winCount: 0,
          maxCombo: 0,
          threeStarCount: 0,
          levelsCompleted: [],
          perfectCount: 0,
          shopSpend: 0,
          dailyTaskCompleteDays: 0
        });
        setLastDailyReset(data.lastDailyReset);
        setLastWeeklyReset(data.lastWeeklyReset);
        setDailyTasks(data.dailyTasks || []);
        setWeeklyTasks(data.weeklyTasks || []);
        setChallengeTasks(data.challengeTasks || SEASON_CHALLENGE_TASKS.map(t => t.id));
        setSettlementShown(data.settlementShown || false);
        
        const season = getCurrentSeason();
        const progress = getSeasonLevelProgress(data.seasonPoints || 0, season.pointsPerLevel);
        setSeasonLevel(progress.level);
        setCurrentLevelProgress(progress.progress);
      } catch (e) {
        console.error('Failed to load season challenge:', e);
      }
    }
  }, []);

  useEffect(() => {
    stateRef.current = {
      currentSeason,
      seasonPoints,
      completedTasks,
      claimedTasks,
      claimedStageRewards,
      unlockedSkins,
      currentSkin,
      unlockedTitles,
      currentTitle,
      seasonStats,
      lastDailyReset,
      lastWeeklyReset,
      dailyTasks,
      weeklyTasks,
      challengeTasks,
      settlementShown
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!lastDailyReset) {
        initSeasonChallenge();
      } else {
        checkAndResetDaily();
        checkAndResetWeekly();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [lastDailyReset, initSeasonChallenge, checkAndResetDaily, checkAndResetWeekly]);

  useEffect(() => {
    const updateTimers = () => {
      const now = Date.now();
      setTimeUntilDailyReset(Math.max(0, getTomorrowResetTime() - now));
      setTimeUntilWeeklyReset(Math.max(0, getNextMondayResetTime() - now));
      
      const season = getCurrentSeason();
      if (season.endDate) {
        const endDate = new Date(season.endDate);
        endDate.setHours(23, 59, 59, 999);
        const timeLeft = endDate.getTime() - now;
        setTimeUntilSeasonEnd(Math.max(0, timeLeft));
        
        if (timeLeft <= 0 && !seasonEnded) {
          setSeasonEnded(true);
        }
      }
    };
    
    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [seasonEnded]);

  return {
    currentSeason,
    seasonPoints,
    seasonLevel,
    currentLevelProgress,
    seasonStats,
    
    dailyTasks,
    weeklyTasks,
    challengeTasks,
    completedTasks,
    claimedTasks,
    claimedStageRewards,
    
    unlockedSkins,
    currentSkin,
    unlockedTitles,
    currentTitle,
    
    timeUntilDailyReset,
    timeUntilWeeklyReset,
    timeUntilSeasonEnd,
    seasonEnded,
    settlementShown,
    
    addSeasonPoints,
    calculateGamePoints,
    updateSeasonStats,
    updateStatsOnWin,
    checkTaskCompletion,
    recordPageVisit,
    recordShopSpend,
    claimTaskReward,
    claimStageReward,
    setSkin,
    setTitle,
    
    unclaimedStageRewardsCount,
    unclaimedTaskRewardsCount,
    
    getTasksWithStatus,
    getStageRewardsWithStatus,
    getSkinsWithStatus,
    getTitlesWithStatus,
    getCurrentSkinTheme,
    getSeasonSettlementData,
    
    formatTimeUntil,
    
    initSeasonChallenge,
    resetDailyTasks,
    resetWeeklyTasks
  };
};