import { getRarityInfo, CURRENCY_INFO, CURRENCY_TYPES, getSeasonTitleById, getSeasonSkinById } from '../../data/gameData';

const StageRewards = ({ seasonChallenge }) => {
  const rewards = seasonChallenge.getStageRewardsWithStatus();
  const { seasonLevel } = seasonChallenge;
  
  const handleClaimReward = (level) => {
    const result = seasonChallenge.claimStageReward(level);
    if (result.success) {
      console.log('领取成功:', result.message);
      if (result.stardust) {
        console.log(`获得 ${result.stardust} 星尘`);
      }
      if (result.starShards) {
        console.log(`获得 ${result.starShards} 星光碎片`);
      }
      if (result.title) {
        console.log(`解锁称号: ${result.title.name}`);
      }
      if (result.skin) {
        console.log(`解锁皮肤: ${result.skin.name}`);
      }
    }
  };

  const getRewardDisplay = (reward) => {
    switch (reward.reward.type) {
      case 'stardust':
        const stardustInfo = CURRENCY_INFO[CURRENCY_TYPES.STARDUST];
        return (
          <div className="flex items-center gap-2">
            <span style={{ color: stardustInfo.color }}>{stardustInfo.icon}</span>
            <span className="font-bold">{reward.reward.value.toLocaleString()}</span>
            <span className="text-white/60">星尘</span>
          </div>
        );
      case 'starShards':
        const shardInfo = CURRENCY_INFO[CURRENCY_TYPES.STAR_SHARD];
        return (
          <div className="flex items-center gap-2">
            <span style={{ color: shardInfo.color }}>{shardInfo.icon}</span>
            <span className="font-bold">{reward.reward.value}</span>
            <span className="text-white/60">星光碎片</span>
          </div>
        );
      case 'title':
        const title = getSeasonTitleById(reward.reward.value);
        return (
          <div className="flex items-center gap-2">
            <span>{title?.icon}</span>
            <span className="font-bold">{title?.name}</span>
            <span className="text-white/60">称号</span>
          </div>
        );
      case 'skin':
        const skin = getSeasonSkinById(reward.reward.value);
        return (
          <div className="flex items-center gap-2">
            <span>{skin?.icon}</span>
            <span className="font-bold">{skin?.name}</span>
            <span className="text-white/60">主题皮肤</span>
          </div>
        );
      default:
        return null;
    }
  };

  const unlockedCount = rewards.filter(r => r.unlocked).length;
  const claimedCount = rewards.filter(r => r.claimed).length;

  return (
    <div className="w-full">
      <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">🎁 阶段奖励进度</h3>
          <div className="text-sm text-white/60">
            已解锁 {unlockedCount} / {rewards.length}，已领取 {claimedCount}
          </div>
        </div>
        
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 transition-all duration-700"
            style={{ width: `${(unlockedCount / rewards.length) * 100}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {Math.round((unlockedCount / rewards.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30" />
        
        <div className="space-y-4">
          {rewards.map((reward, index) => {
            const rarityInfo = getRarityInfo(reward.rarity);
            const isUnlocked = reward.unlocked;
            const isClaimed = reward.claimed;
            const isCurrent = isUnlocked && !isClaimed;
            
            return (
              <div key={reward.level} className="relative pl-20">
                <div 
                  className={`absolute left-4 w-9 h-9 rounded-full flex items-center justify-center transition-all
                    ${isUnlocked 
                      ? isClaimed 
                        ? 'bg-gray-600 text-gray-400' 
                        : 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/50 animate-pulse-slow'
                      : 'bg-gray-800 text-gray-600 border-2 border-gray-700'
                    }
                  `}
                >
                  {isClaimed ? '✓' : isUnlocked ? reward.icon : '🔒'}
                </div>
                
                <div
                  className={`p-5 rounded-2xl border-2 transition-all
                    ${isClaimed 
                      ? 'bg-gray-800/30 border-gray-600/30 opacity-60' 
                      : isUnlocked 
                        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: rarityInfo.bgColor,
                            color: rarityInfo.color,
                            border: `1px solid ${rarityInfo.borderColor}`
                          }}
                        >
                          Lv.{reward.level}
                        </span>
                        <h4 className="font-bold text-white text-lg">{reward.name}</h4>
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: rarityInfo.bgColor,
                            color: rarityInfo.color
                          }}
                        >
                          {rarityInfo.name}
                        </span>
                      </div>
                      
                      <p className="text-sm text-white/60 mb-3">{reward.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <div 
                          className={`p-3 rounded-xl ${isUnlocked ? '' : 'opacity-50 grayscale'}`}
                          style={{
                            backgroundColor: rarityInfo.bgColor,
                            border: `1px solid ${rarityInfo.borderColor}`
                          }}
                        >
                          {getRewardDisplay(reward)}
                        </div>
                        
                        {seasonLevel < reward.level && (
                          <div className="text-sm text-white/40">
                            还需达到 Lv.{reward.level}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isUnlocked && !isClaimed && (
                        <button
                          onClick={() => handleClaimReward(reward.level)}
                          className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30"
                        >
                          领取奖励
                        </button>
                      )}
                      {isClaimed && (
                        <div className="px-6 py-3 rounded-xl bg-gray-700/50 text-gray-400 font-bold">
                          已领取
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/30 font-bold">
                          未解锁
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < rewards.length - 1 && (
                  <div className="absolute left-8 w-1 h-8 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
        <div className="flex items-start gap-4">
          <div className="text-4xl">✨</div>
          <div>
            <h4 className="font-bold text-white text-lg mb-2">奖励说明</h4>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• 随着赛季等级提升，将解锁更多阶段奖励</li>
              <li>• 阶段奖励包含星尘、星光碎片、专属称号和主题皮肤</li>
              <li>• 奖励解锁后请及时领取，赛季结束后将无法领取</li>
              <li>• 达到最高等级 50 级可获得传说级「宇宙至尊」主题皮肤</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageRewards;