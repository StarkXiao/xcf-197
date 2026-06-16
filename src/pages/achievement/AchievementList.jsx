import { getAchievementsByCategory, getRarityInfo } from '../../data/gameData';

const formatProgressValue = (value, type) => {
  switch (type) {
    case 'totalPlayTime':
      if (value >= 3600) {
        return `${(value / 3600).toFixed(1)}小时`;
      }
      return `${Math.floor(value / 60)}分钟`;
    default:
      return value;
  }
};

const AchievementList = ({ categoryId, achievements }) => {
  const achievementList = getAchievementsByCategory(categoryId);
  
  const achievementsWithProgress = achievementList.map(achv => {
    const progress = achievements.getAchievementProgress(achv);
    return {
      ...achv,
      progress,
      unlocked: achievements.unlockedAchievements.includes(achv.id),
      isNew: achievements.newAchievements.includes(achv.id)
    };
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {achievementsWithProgress.map((achievement, index) => {
        const rarityInfo = getRarityInfo(achievement.rarity);
        const progress = achievement.progress;
        
        return (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 card-hover
              ${achievement.unlocked
                ? `rarity-${achievement.rarity} bg-star-purple/40`
                : 'border-gray-600/30 bg-gray-800/30 opacity-80'
              }
              ${achievement.isNew ? 'animate-pulse' : ''}
            `}
            style={{
              animationDelay: `${index * 0.05}s`
            }}
          >
            {achievement.isNew && (
              <div className="absolute -top-2 -right-2 bg-star-pink text-white text-xs px-2 py-0.5 rounded-full font-bold animate-bounce">
                NEW
              </div>
            )}

            <div className="text-center">
              <div
                className={`text-4xl mb-2 transition-all duration-300 ${
                achievement.unlocked ? '' : 'grayscale opacity-50'
              }`}
                style={{
                  filter: achievement.unlocked ? `drop-shadow(0 0 8px ${rarityInfo.color})` : 'none'
                }}
              >
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>

              <div
                className={`text-sm font-bold mb-1 ${
                achievement.unlocked ? 'text-white' : 'text-gray-400'
              }`}
              >
                {achievement.name}
              </div>

              <div className="text-xs text-white/50 mb-2 line-clamp-2 h-8">
                {achievement.description}
              </div>

              {!achievement.unlocked && (
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1">
                    <span>进度</span>
                    <span>
                      {formatProgressValue(progress.current, achievement.condition.type)} / 
                      {formatProgressValue(progress.total, achievement.condition.type)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress.percentage}%`,
                        backgroundColor: rarityInfo.color,
                        boxShadow: `0 0 6px ${rarityInfo.color}`
                      }}
                    />
                  </div>
                </div>
              )}

              <div
                className="text-xs font-medium px-2 py-0.5 rounded-full inline-block"
                style={{
                  backgroundColor: achievement.unlocked ? `${rarityInfo.color}20` : 'rgba(100,100,100,0.2)',
                  color: achievement.unlocked ? rarityInfo.color : '#666'
                }}
              >
                {rarityInfo.name} · {achievement.points}点
              </div>

              {achievement.titleReward && achievement.unlocked && (
                <div className="mt-2 text-xs text-star-cyan">
                  🎖️ 解锁称号
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AchievementList;
