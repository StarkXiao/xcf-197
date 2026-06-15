export const STAR_PATTERNS = [
  {
    id: 'star-1',
    name: '北极星',
    symbol: '⭐',
    color: '#ffd700',
    description: '永恒指引的北极之星'
  },
  {
    id: 'star-2',
    name: '猎户座',
    symbol: '🌟',
    color: '#00d4ff',
    description: '勇敢猎人的星座'
  },
  {
    id: 'star-3',
    name: '北斗七星',
    symbol: '✨',
    color: '#ff6b9d',
    description: '指向幸福的七星'
  },
  {
    id: 'star-4',
    name: '织女星',
    symbol: '💫',
    color: '#c084fc',
    description: '传说中的织女星'
  },
  {
    id: 'star-5',
    name: '天狼星',
    symbol: '🔆',
    color: '#60a5fa',
    description: '最亮的恒星'
  },
  {
    id: 'star-6',
    name: '仙女座',
    symbol: '💠',
    color: '#f472b6',
    description: '美丽的仙女星座'
  },
  {
    id: 'star-7',
    name: '天琴座',
    symbol: '🎇',
    color: '#34d399',
    description: '音乐之神的竖琴'
  },
  {
    id: 'star-8',
    name: '天蝎座',
    symbol: '🦂',
    color: '#fb923c',
    description: '神秘的天蝎星座'
  },
  {
    id: 'star-9',
    name: '狮子座',
    symbol: '🦁',
    color: '#fbbf24',
    description: '王者之狮星座'
  },
  {
    id: 'star-10',
    name: '双子座',
    symbol: '👯',
    color: '#a78bfa',
    description: '双子星座的传说'
  },
  {
    id: 'star-11',
    name: '双鱼座',
    symbol: '🐟',
    color: '#38bdf8',
    description: '浪漫的双鱼星座'
  },
  {
    id: 'star-12',
    name: '处女座',
    symbol: '👰',
    color: '#f0abfc',
    description: '纯洁的处女星座'
  }
];

export const LEVELS = [
  {
    id: 1,
    name: '星之序章',
    description: '初识星纹，开启占卜之旅',
    pairs: 4,
    timeLimit: 60,
    baseScore: 1000,
    letterFragment: '亲爱的，当你读到这封信的时候...',
    stars: ['star-1', 'star-2', 'star-3', 'star-4']
  },
  {
    id: 2,
    name: '月光私语',
    description: '月光下的秘密告白',
    pairs: 6,
    timeLimit: 90,
    baseScore: 2000,
    letterFragment: '我一直在星空中寻找你的身影...',
    stars: ['star-1', 'star-2', 'star-3', 'star-4', 'star-5', 'star-6']
  },
  {
    id: 3,
    name: '银河情书',
    description: '跨越银河的爱恋',
    pairs: 8,
    timeLimit: 120,
    baseScore: 3000,
    letterFragment: '每一颗星星都是我对你的思念...',
    stars: ['star-1', 'star-2', 'star-3', 'star-4', 'star-5', 'star-6', 'star-7', 'star-8']
  },
  {
    id: 4,
    name: '星座誓言',
    description: '十二星座见证的誓言',
    pairs: 10,
    timeLimit: 150,
    baseScore: 4000,
    letterFragment: '愿我们的爱情如星辰般永恒闪耀...',
    stars: ['star-1', 'star-2', 'star-3', 'star-4', 'star-5', 'star-6', 'star-7', 'star-8', 'star-9', 'star-10']
  },
  {
    id: 5,
    name: '星塔终章',
    description: '修复完整的情书',
    pairs: 12,
    timeLimit: 180,
    baseScore: 5000,
    letterFragment: '我爱你，穿越时空，至死不渝。',
    stars: ['star-1', 'star-2', 'star-3', 'star-4', 'star-5', 'star-6', 'star-7', 'star-8', 'star-9', 'star-10', 'star-11', 'star-12']
  }
];

export const FULL_LETTER = `亲爱的，当你读到这封信的时候，
我已经在星塔之巅等你很久了。

我一直在星空中寻找你的身影，
每一颗星星都是我对你的思念。
从北极星到猎户座，
从北斗七星到织女星，
所有的星光都指引着我走向你。

愿我们的爱情如星辰般永恒闪耀，
跨越银河，穿越时空，
在每一个有星星的夜晚，
你都能感受到我的存在。

我爱你，穿越时空，至死不渝。

—— 星塔占卜师`;

export const getStarById = (id) => {
  return STAR_PATTERNS.find(star => star.id === id);
};

export const getLevelById = (id) => {
  return LEVELS.find(level => level.id === id);
};

export const HIDDEN_ENDINGS = [
  {
    id: 'ending-1',
    name: '星河守护者',
    description: '集齐所有星星碎片，成为星塔的永恒守护者',
    requirement: '收集全部12个星座碎片',
    reward: '专属头像框 · 星河守护者',
    rewardType: 'frame',
    icon: '🌌',
    unlocked: false
  },
  {
    id: 'ending-2',
    name: '情书收藏家',
    description: '修复完整的情书，解锁真结局',
    requirement: '通关全部5个章节并获得3星评价',
    reward: '隐藏剧情 · 跨越时空的告白',
    rewardType: 'story',
    icon: '💌',
    unlocked: false
  },
  {
    id: 'ending-3',
    name: '命运占卜师',
    description: '在限定时间内完成所有挑战',
    requirement: '所有关卡用时少于时间限制的50%',
    reward: '特殊称号 · 命运占卜师',
    rewardType: 'title',
    icon: '🔮',
    unlocked: false
  }
];

export const REWARDS = [
  {
    id: 'reward-1',
    name: '新手徽章',
    description: '完成第一章获得',
    icon: '🎖️',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'reward-2',
    name: '星光闪耀',
    description: '单局连击达到5次',
    icon: '✨',
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'reward-3',
    name: '完美通关',
    description: '任意关卡获得3星评价',
    icon: '🏆',
    rarity: 'epic',
    unlocked: false
  },
  {
    id: 'reward-4',
    name: '银河旅人',
    description: '累计游戏时长超过1小时',
    icon: '🚀',
    rarity: 'epic',
    unlocked: false
  },
  {
    id: 'reward-5',
    name: '星塔之巅',
    description: '通关全部章节',
    icon: '👑',
    rarity: 'legendary',
    unlocked: false
  },
  {
    id: 'reward-6',
    name: '情书大师',
    description: '解锁所有隐藏结局',
    icon: '📜',
    rarity: 'legendary',
    unlocked: false
  }
];

export const CHAPTER_STORIES = [
  {
    id: 1,
    title: '星之序章',
    subtitle: '初识星纹',
    content: `在星塔的最底层，你第一次接触到了神秘的星纹卡牌。
星光流转间，你感受到了一股古老的力量在召唤着你。
"翻开卡牌吧，"一个悠远的声音说道，"命运的齿轮已经开始转动..."`,
    image: '🌅'
  },
  {
    id: 2,
    title: '月光私语',
    subtitle: '月下告白',
    content: `皎洁的月光洒落在星塔上，你翻开了第二张卡牌。
卡片上的星座图案仿佛在月光下活了过来，
向你诉说着一个关于勇气与告白的故事...`,
    image: '🌙'
  },
  {
    id: 3,
    title: '银河情书',
    subtitle: '跨越星河',
    content: `银河在你眼前展开，每一颗星星都是一封情书。
你开始理解，这些星纹背后承载着怎样的深情。
"跨越银河的爱恋，终将在星塔之巅重逢..."`,
    image: '🌌'
  },
  {
    id: 4,
    title: '星座誓言',
    subtitle: '十二见证',
    content: `十二星座齐聚，它们将作为你们爱情的见证。
每一个星座都代表着一种品质：
勇敢、温柔、忠诚、浪漫、智慧、坚持...`,
    image: '⭐'
  },
  {
    id: 5,
    title: '星塔终章',
    subtitle: '情书修复',
    content: `你终于登上了星塔之巅，所有的碎片汇聚在一起。
那封被星光撕碎的情书，在你手中缓缓复原。
信中的每个字，都闪烁着星辰的光芒...`,
    image: '🏰'
  }
];

export const getRarityColor = (rarity) => {
  const colors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
  };
  return colors[rarity] || colors.common;
};

export const getHiddenEndingById = (id) => {
  return HIDDEN_ENDINGS.find(ending => ending.id === id);
};

export const getRewardById = (id) => {
  return REWARDS.find(reward => reward.id === id);
};

export const getChapterStoryById = (id) => {
  return CHAPTER_STORIES.find(story => story.id === id);
};

export const DAILY_CHALLENGE_THEMES = [
  {
    id: 'theme-love',
    name: '恋爱运势',
    icon: '💕',
    description: '今日的爱情运势如何？',
    color: '#ff6b9d',
    bonusType: 'score',
    bonusValue: 1.5
  },
  {
    id: 'theme-career',
    name: '事业运势',
    icon: '💼',
    description: '工作上将有什么机遇？',
    color: '#3b82f6',
    bonusType: 'combo',
    bonusValue: 2
  },
  {
    id: 'theme-wealth',
    name: '财运亨通',
    icon: '💰',
    description: '财富之门是否为你敞开？',
    color: '#fbbf24',
    bonusType: 'score',
    bonusValue: 1.3
  },
  {
    id: 'theme-health',
    name: '健康运势',
    icon: '🏃',
    description: '身体状态今日如何？',
    color: '#10b981',
    bonusType: 'time',
    bonusValue: 30
  },
  {
    id: 'theme-friendship',
    name: '人际运势',
    icon: '🤝',
    description: '人际关系会有什么变化？',
    color: '#8b5cf6',
    bonusType: 'combo',
    bonusValue: 1.5
  },
  {
    id: 'theme-luck',
    name: '幸运之星',
    icon: '🍀',
    description: '今日的幸运指数如何？',
    color: '#14b8a6',
    bonusType: 'score',
    bonusValue: 2
  },
  {
    id: 'theme-dream',
    name: '梦境解析',
    icon: '🌙',
    description: '昨夜的梦境预示着什么？',
    color: '#6366f1',
    bonusType: 'time',
    bonusValue: 60
  },
  {
    id: 'theme-destiny',
    name: '命运之轮',
    icon: '🎡',
    description: '命运的齿轮开始转动...',
    color: '#ec4899',
    bonusType: 'score',
    bonusValue: 1.8
  }
];

export const DAILY_CHALLENGE_TASKS = [
  {
    id: 'task-combo-5',
    name: '连击大师',
    description: '单局达成5次连击',
    icon: '⚡',
    requirement: { type: 'combo', value: 5 },
    reward: { type: 'points', value: 500 },
    difficulty: 'easy'
  },
  {
    id: 'task-combo-10',
    name: '连击传说',
    description: '单局达成10次连击',
    icon: '🔥',
    requirement: { type: 'combo', value: 10 },
    reward: { type: 'points', value: 1500 },
    difficulty: 'hard'
  },
  {
    id: 'task-time-60',
    name: '光速配对',
    description: '剩余时间超过60秒完成',
    icon: '⏱️',
    requirement: { type: 'timeLeft', value: 60 },
    reward: { type: 'points', value: 800 },
    difficulty: 'medium'
  },
  {
    id: 'task-moves-12',
    name: '精准无误',
    description: '用不超过12步完成配对',
    icon: '🎯',
    requirement: { type: 'moves', value: 12 },
    reward: { type: 'points', value: 1000 },
    difficulty: 'hard'
  },
  {
    id: 'task-stars-3',
    name: '完美三星',
    description: '获得3星评价',
    icon: '⭐',
    requirement: { type: 'stars', value: 3 },
    reward: { type: 'points', value: 1200 },
    difficulty: 'medium'
  },
  {
    id: 'task-no-mistake',
    name: '零失误',
    description: '全程没有配对错误',
    icon: '💯',
    requirement: { type: 'perfect', value: true },
    reward: { type: 'points', value: 2000 },
    difficulty: 'legendary'
  },
  {
    id: 'task-fast-complete',
    name: '极速通关',
    description: '在45秒内完成挑战',
    icon: '🚀',
    requirement: { type: 'completeTime', value: 45 },
    reward: { type: 'points', value: 1800 },
    difficulty: 'legendary'
  },
  {
    id: 'task-score-5000',
    name: '高分达人',
    description: '单局得分超过5000',
    icon: '🏆',
    requirement: { type: 'score', value: 5000 },
    reward: { type: 'points', value: 1000 },
    difficulty: 'easy'
  }
];

export const DAILY_CHALLENGE_REWARDS = [
  {
    id: 'daily-reward-1',
    rank: 1,
    name: '每日冠军',
    icon: '👑',
    reward: '专属称号 · 每日占卜师',
    bonusPoints: 3000,
    rarity: 'legendary'
  },
  {
    id: 'daily-reward-2',
    rank: 2,
    name: '每日亚军',
    icon: '🥈',
    reward: '星光碎片 ×10',
    bonusPoints: 2000,
    rarity: 'epic'
  },
  {
    id: 'daily-reward-3',
    rank: 3,
    name: '每日季军',
    icon: '🥉',
    reward: '星光碎片 ×5',
    bonusPoints: 1000,
    rarity: 'epic'
  },
  {
    id: 'daily-reward-4',
    rank: 'top10',
    name: '每日十强',
    icon: '🌟',
    reward: '星光碎片 ×3',
    bonusPoints: 500,
    rarity: 'rare'
  },
  {
    id: 'daily-reward-5',
    rank: 'participation',
    name: '参与奖励',
    icon: '🎁',
    reward: '星光碎片 ×1',
    bonusPoints: 100,
    rarity: 'common'
  }
];

export const getDailyThemeById = (id) => {
  return DAILY_CHALLENGE_THEMES.find(theme => theme.id === id);
};

export const getDailyTaskById = (id) => {
  return DAILY_CHALLENGE_TASKS.find(task => task.id === id);
};

export const getDailyRewardByRank = (rank) => {
  if (rank === 1) return DAILY_CHALLENGE_REWARDS[0];
  if (rank === 2) return DAILY_CHALLENGE_REWARDS[1];
  if (rank === 3) return DAILY_CHALLENGE_REWARDS[2];
  if (rank <= 10) return DAILY_CHALLENGE_REWARDS[3];
  return DAILY_CHALLENGE_REWARDS[4];
};

export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: '#10b981',
    medium: '#fbbf24',
    hard: '#f97316',
    legendary: '#ec4899'
  };
  return colors[difficulty] || colors.easy;
};
