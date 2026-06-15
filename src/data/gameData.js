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
