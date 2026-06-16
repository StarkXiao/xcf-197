import { getAchievementsByCategory, getRarityInfo } from '../../data/gameData';

const AchievementList = ({ categoryId, achievements }) => {
  const achievementList = getAchievementsByCategory(categoryId);
  const achievementsWithStatus = achievementList.map(achv => ({
    ...achv,
    unlocked: achievements.unlockedAchievements.includes(achv.id),
    isNew: achievements.newAchievements.includes(achv.id)
  }));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {achievementsWithStatus.map((achievement, index) => {
        const rarityInfo = getRarityInfo(achievement.rarity);
        
        return (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 card-hover
              ${achievement.unlocked
                ? `rarity-${achievement.rarity} bg-star-purple/40`
                : 'border-gray-600/30 bg-gray-800/30 opacity-60'
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
                achievement.unlocked ? 'text-white' : 'text-gray-500'
              }`}
              >
                {achievement.name}
              </div>

              <div className="text-xs text-white/50 mb-2 line-clamp-2">
                {achievement.description}
              </div>

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
