import { getCurrentSeason, getRarityInfo, SEASON_STAGE_REWARDS, SEASON_THEME_SKINS, SEASON_TITLES } from '../data/gameData';

const SeasonSettlementPage = ({ seasonChallenge, onBack }) => {
  const season = getCurrentSeason();
  const settlementData = seasonChallenge.getSeasonSettlementData();
  const { seasonLevel, seasonPoints, seasonStats, unlockedSkins, unlockedTitles, rewardsUnlocked, totalRewards } = settlementData;
  
  const winRate = seasonStats.playCount > 0 
    ? Math.round((seasonStats.winCount / seasonStats.playCount) * 100) 
    : 0;
  
  const getRank = () => {
    if (seasonLevel >= 50) return { name: '星河至尊', icon: '👑', color: '#f59e0b', rarity: 'legendary' };
    if (seasonLevel >= 40) return { name: '星座守护者', icon: '⭐', color: '#a855f7', rarity: 'epic' };
    if (seasonLevel >= 30) return { name: '银河旅人', icon: '🌌', color: '#8b5cf6', rarity: 'epic' };
    if (seasonLevel >= 20) return { name: '星尘收集者', icon: '✨', color: '#3b82f6', rarity: 'rare' };
    if (seasonLevel >= 10) return { name: '星光学徒', icon: '🌟', color: '#60a5fa', rarity: 'rare' };
    return { name: '星塔新人', icon: '💫', color: '#9ca3af', rarity: 'common' };
  };
  
  const rank = getRank();
  const rankRarity = getRarityInfo(rank.rarity);

  return (
    <div className="relative z-10 min-h-screen w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          
          <div className="text-right">
            <p className="text-sm text-white/50">{season.startDate} ~ {season.endDate}</p>
            <p className="text-xs text-white/30">赛季已结束</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-block relative">
            <div className="text-8xl mb-4 animate-float">{season.icon}</div>
            <div className="absolute -top-2 -right-2 text-4xl animate-bounce">🏆</div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 mb-3">
            {season.name}
          </h1>
          <p className="text-xl text-indigo-300 mb-2">{season.subtitle}</p>
          <p className="text-white/50">赛季结算报告</p>
        </div>

        <div 
          className="relative rounded-3xl p-8 mb-8 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${rankRarity.bgColor} 0%, ${rank.color}22 100%)`,
            border: `2px solid ${rank.color}50`,
            boxShadow: `0 0 60px ${rank.color}33`
          }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 opacity-10 text-9xl">
            {rank.icon}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-6 mb-6">
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                style={{
                  background: `linear-gradient(135deg, ${rank.color} 0%, ${rank.color}cc 100%)`,
                  boxShadow: `0 0 30px ${rank.color}66`
                }}
              >
                {rank.icon}
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">本赛季段位</p>
                <h2 
                  className="text-4xl font-bold mb-2"
                  style={{ color: rank.color }}
                >
                  {rank.name}
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">Lv.{seasonLevel}</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white/60">{season.maxLevel}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-indigo-300 mb-1">
                  ✨ {seasonPoints.toLocaleString()}
                </div>
                <div className="text-xs text-white/50">累计积分</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {winRate}%
                </div>
                <div className="text-xs text-white/50">总胜率</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-1">
                  {rewardsUnlocked.length}
                </div>
                <div className="text-xs text-white/50">奖励解锁</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-pink-400 mb-1">
                  {unlockedSkins.length + unlockedTitles.length}
                </div>
                <div className="text-xs text-white/50">外观收集</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>赛季数据统计</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">总游戏局数</span>
                <span className="font-bold text-white text-xl">{seasonStats.playCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">胜利局数</span>
                <span className="font-bold text-green-400 text-xl">{seasonStats.winCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">最高连击</span>
                <span className="font-bold text-yellow-400 text-xl">{seasonStats.maxCombo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">三星通关</span>
                <span className="font-bold text-amber-400 text-xl">{seasonStats.threeStarCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">完美通关</span>
                <span className="font-bold text-pink-400 text-xl">{seasonStats.perfectCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">商店消费</span>
                <span className="font-bold text-blue-400 text-xl">{seasonStats.shopSpend.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <span>🎁</span>
              <span>赛季奖励汇总</span>
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-white/60">阶段奖励解锁</span>
                <span className="font-bold text-amber-400">{rewardsUnlocked.length} / {totalRewards}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-white/60">主题皮肤解锁</span>
                <span className="font-bold text-indigo-400">{unlockedSkins.length} / {SEASON_THEME_SKINS.filter(s => !s.isDefault).length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span className="text-white/60">专属称号解锁</span>
                <span className="font-bold text-purple-400">{unlockedTitles.length} / {SEASON_TITLES.length}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm text-white/50 mb-3">已解锁外观</p>
                <div className="flex flex-wrap gap-2">
                  {unlockedSkins.map(skinId => {
                    const skin = SEASON_THEME_SKINS.find(s => s.id === skinId);
                    const rarity = getRarityInfo(skin?.rarity || 'common');
                    return (
                      <div 
                        key={skinId}
                        className="px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                        style={{
                          backgroundColor: rarity.bgColor,
                          border: `1px solid ${rarity.borderColor}`,
                          color: rarity.color
                        }}
                      >
                        <span>{skin?.icon}</span>
                        <span className="font-bold">{skin?.name}</span>
                      </div>
                    );
                  })}
                  {unlockedTitles.map(titleId => {
                    const title = SEASON_TITLES.find(t => t.id === titleId);
                    const rarity = getRarityInfo(title?.rarity || 'common');
                    return (
                      <div 
                        key={titleId}
                        className="px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                        style={{
                          backgroundColor: rarity.bgColor,
                          border: `1px solid ${rarity.borderColor}`,
                          color: rarity.color
                        }}
                      >
                        <span>{title?.icon}</span>
                        <span className="font-bold">{title?.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl p-8 border border-indigo-500/30 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">🏅 里程碑成就</h3>
            <p className="text-white/60">本赛季达成的重要里程碑</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { condition: seasonLevel >= 10, icon: '🌟', name: '星光学徒', desc: '达到10级' },
              { condition: seasonLevel >= 20, icon: '🎨', name: '皮肤解锁', desc: '解锁首款皮肤' },
              { condition: seasonLevel >= 30, icon: '👑', name: '高级守护者', desc: '达到30级' },
              { condition: seasonLevel >= 50, icon: '✨', name: '星河至尊', desc: '达到满级50级' },
              { condition: seasonStats.winCount >= 10, icon: '🏆', name: '常胜将军', desc: '累计10胜' },
              { condition: seasonStats.maxCombo >= 8, icon: '⚡', name: '连击大师', desc: '最高连击8次' },
              { condition: seasonStats.threeStarCount >= 3, icon: '⭐', name: '三星达人', desc: '3次三星通关' },
              { condition: seasonStats.playCount >= 20, icon: '🎮', name: '狂热玩家', desc: '累计20局' }
            ].map((milestone, index) => {
              const rarity = milestone.condition ? getRarityInfo('epic') : getRarityInfo('common');
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl text-center transition-all ${milestone.condition ? '' : 'opacity-40 grayscale'}`}
                  style={{
                    backgroundColor: rarity.bgColor,
                    border: `1px solid ${rarity.borderColor}`
                  }}
                >
                  <div className="text-3xl mb-2">{milestone.icon}</div>
                  <div className="font-bold text-white text-sm mb-1">{milestone.name}</div>
                  <div className="text-xs text-white/60">{milestone.desc}</div>
                  {milestone.condition && (
                    <div className="mt-2 text-xs text-green-400 font-bold">✓ 已达成</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>奖励结算详情</span>
          </h3>
          
          <div className="space-y-3">
            {SEASON_STAGE_REWARDS.map((reward, index) => {
              const unlocked = seasonLevel >= reward.level;
              const claimed = seasonChallenge.claimedStageRewards.includes(reward.level);
              const rarity = getRarityInfo(reward.rarity);
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all
                    ${unlocked ? '' : 'opacity-50'}
                    ${claimed ? 'bg-green-500/10 border border-green-500/30' : unlocked ? 'bg-white/5 border border-white/10' : 'bg-white/3 border border-white/5'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        backgroundColor: rarity.bgColor,
                        border: `1px solid ${rarity.borderColor}`
                      }}
                    >
                      {unlocked ? reward.icon : '🔒'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">Lv.{reward.level}</span>
                        <span className="font-bold text-white">{reward.name}</span>
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{ backgroundColor: rarity.bgColor, color: rarity.color }}
                        >
                          {rarity.name}
                        </span>
                      </div>
                      <p className="text-sm text-white/60">{reward.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {claimed && (
                      <span className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm">
                        ✓ 已领取
                      </span>
                    )}
                    {unlocked && !claimed && (
                      <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-sm">
                        待领取
                      </span>
                    )}
                    {!unlocked && (
                      <span className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-500 font-bold text-sm">
                        未解锁
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <div className="text-6xl mb-4">🎊</div>
            <h3 className="text-2xl font-bold text-amber-300 mb-2">感谢您的参与！</h3>
            <p className="text-white/60 mb-4">
              恭喜您在 {season.name} 赛季中取得的所有成就
            </p>
            <p className="text-sm text-white/40">
              下个赛季即将开启，敬请期待更多精彩内容！
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onBack}
            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeasonSettlementPage;