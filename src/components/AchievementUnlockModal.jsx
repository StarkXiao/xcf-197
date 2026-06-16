import { getRarityInfo, getAchievementById, getTitleById } from '../data/gameData';

const AchievementUnlockModal = ({ achievements, onClose }) => {
  if (!achievements.showModal || achievements.newAchievements.length === 0) {
    return null;
  }

  const newAchievementList = achievements.newAchievements.map(id => getAchievementById(id)).filter(Boolean);

  const newTitles = new Set();
  newAchievementList.forEach(achv => {
    if (achv.titleReward) {
      newTitles.add(achv.titleReward);
    }
  });
  const newTitleList = Array.from(newTitles).map(id => getTitleById(id)).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      <div className="relative z-10 max-w-sm w-full mx-4 pointer-events-auto">
        <div className="text-center mb-6 animate-slide-in">
          <div className="text-5xl mb-3 animate-float">🎉</div>
          <h2 className="text-2xl font-bold text-star-gold glow-text mb-2">
            成就解锁！
          </h2>
          <p className="text-white/60 text-sm">
            恭喜你获得了新的成就
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {newAchievementList.map((achievement, index) => {
            const rarityInfo = getRarityInfo(achievement.rarity);
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 rarity-${achievement.rarity} bg-star-purple/50 animate-slide-in`}
                style={{
                  animationDelay: `${index * 0.15}s`,
                  opacity: 0,
                  animationFillMode: 'forwards'
                }}
              >
                <div
                  className="text-4xl flex-shrink-0"
                  style={{
                    filter: `drop-shadow(0 0 10px ${rarityInfo.color})`
                  }}
                >
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold text-base"
                    style={{ color: rarityInfo.color }}
                  >
                    {achievement.name}
                  </div>
                  <div className="text-sm text-white/60 truncate">
                    {achievement.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${rarityInfo.color}20`,
                        color: rarityInfo.color
                      }}
                    >
                      {rarityInfo.name}
                    </span>
                    <span className="text-xs text-star-gold">
                      +{achievement.points} 点
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {newTitleList.length > 0 && (
          <div className="mb-6 animate-slide-in" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="text-center text-sm text-star-cyan mb-3">
              🎖️ 解锁新称号
            </div>
            <div className="flex gap-3 justify-center">
              {newTitleList.map((title, index) => {
                const rarityInfo = getRarityInfo(title.rarity);
                return (
                  <div
                    key={title.id}
                    className={`text-center p-3 rounded-xl border-2 rarity-${title.rarity} bg-star-purple/40`}
                  >
                    <div
                      className="text-3xl mb-1"
                      style={{
                        filter: `drop-shadow(0 0 8px ${rarityInfo.color})`
                      }}
                    >
                      {title.icon}
                    </div>
                    <div
                      className="text-xs font-bold"
                      style={{ color: rarityInfo.color }}
                    >
                      {title.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full btn-star py-3 animate-slide-in"
          style={{ animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}
        >
          太棒了！
        </button>
      </div>
    </div>
  );
};

export default AchievementUnlockModal;
