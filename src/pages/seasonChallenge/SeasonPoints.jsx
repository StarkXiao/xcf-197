import { getCurrentSeason, getRarityInfo, SEASON_STAGE_REWARDS } from '../../data/gameData';

const SeasonPoints = ({ seasonChallenge }) => {
  const season = getCurrentSeason();
  const { seasonLevel, seasonPoints, currentLevelProgress, seasonStats } = seasonChallenge;
  
  const nextReward = SEASON_STAGE_REWARDS.find(r => r.level > seasonLevel);
  const currentPointsInLevel = seasonPoints % season.pointsPerLevel;
  const pointsToNextLevel = season.pointsPerLevel - currentPointsInLevel;
  
  const stats = [
    { label: '总游戏局数', value: seasonStats.playCount, icon: '🎮' },
    { label: '胜利局数', value: seasonStats.winCount, icon: '🏆' },
    { label: '最高连击', value: seasonStats.maxCombo, icon: '⚡' },
    { label: '三星通关', value: seasonStats.threeStarCount, icon: '⭐' },
    { label: '完美通关', value: seasonStats.perfectCount, icon: '💯' },
    { label: '商店消费', value: `${seasonStats.shopSpend.toLocaleString()}`, icon: '💰' }
  ];
  
  const winRate = seasonStats.playCount > 0 
    ? Math.round((seasonStats.winCount / seasonStats.playCount) * 100) 
    : 0;

  return (
    <div className="w-full">
      <div className="relative mb-8 p-6 rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${season.primaryColor}33 0%, ${season.secondaryColor}33 50%, ${season.accentColor}33 100%)`,
          border: `2px solid ${season.primaryColor}50`
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 opacity-20 text-9xl">
          {season.icon}
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
              style={{
                background: `linear-gradient(135deg, ${season.primaryColor} 0%, ${season.accentColor} 100%)`,
                boxShadow: `0 0 30px ${season.primaryColor}66`
              }}
            >
              {season.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{season.name}</h2>
              <p className="text-white/60">{season.subtitle}</p>
              <p className="text-sm text-white/40 mt-1">
                {season.startDate} ~ {season.endDate}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">当前等级</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: season.accentColor }}>
                  {seasonLevel}
                </span>
                <span className="text-white/40">/ {season.maxLevel}</span>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">累计积分</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-indigo-300">
                  ✨
                </span>
                <span className="text-3xl font-bold text-white">
                  {seasonPoints.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-sm text-white/60 mb-1">赛季结束倒计时</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-orange-400">
                  ⏰
                </span>
                <span className="text-xl font-bold text-orange-300">
                  {seasonChallenge.formatTimeUntil(seasonChallenge.timeUntilSeasonEnd)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white text-lg">等级进度</h3>
          <div className="text-sm text-white/60">
            {currentPointsInLevel} / {season.pointsPerLevel} 积分
          </div>
        </div>
        
        <div className="relative h-6 bg-white/10 rounded-full overflow-hidden mb-3">
          <div 
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ 
              width: `${currentLevelProgress}%`,
              background: `linear-gradient(90deg, ${season.primaryColor} 0%, ${season.accentColor} 100%)`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white drop-shadow-lg">
              {Math.round(currentLevelProgress)}%
            </span>
          </div>
        </div>
        
        {nextReward && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/40">下一奖励：</span>
            <span className="text-2xl">{nextReward.icon}</span>
            <span className="text-white/80 font-bold">{nextReward.name}</span>
            <span className="text-indigo-400">
              (还需 {pointsToNextLevel} 积分)
            </span>
          </div>
        )}
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="font-bold text-white text-lg mb-4">📊 赛季数据统计</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat, index) => {
            const rarityInfo = index < 2 ? getRarityInfo('rare') : 
                              index < 4 ? getRarityInfo('epic') : getRarityInfo('legendary');
            return (
              <div 
                key={index}
                className="p-4 rounded-xl text-center transition-all hover:scale-105"
                style={{
                  backgroundColor: rarityInfo.bgColor,
                  border: `1px solid ${rarityInfo.borderColor}`
                }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">胜率</span>
              <span className="text-xl font-bold text-indigo-300">{winRate}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60">积分加成倍率</span>
              <span className="text-xl font-bold text-pink-300">x{season.bonusMultiplier}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                style={{ width: `${season.bonusMultiplier * 50}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-white mb-1">积分获取指南</h4>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• 完成游戏关卡：根据关卡难度获得 5~25 基础积分</li>
              <li>• 星级奖励：2星+3分，3星+8分</li>
              <li>• 连击加成：每次连击额外+1分</li>
              <li>• 完美通关：零失误额外+10分</li>
              <li>• 赛季加成：所有积分享受 x{season.bonusMultiplier} 倍率加成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonPoints;