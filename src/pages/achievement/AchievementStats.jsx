import { RARITY_INFO } from '../../data/gameData';

const AchievementStats = ({ stats }) => {
  return (
    <div className="bg-star-purple/30 rounded-2xl p-5 border border-star-gold/20 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-star-gold glow-text">
            🏆 {stats.unlocked}/{stats.total}
          </div>
          <div className="text-sm text-white/60">
            已解锁成就 ({stats.percentage}%)
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-star-pink">
            ✨ {stats.totalPoints}
          </div>
          <div className="text-sm text-white/60">
            成就点数
          </div>
        </div>
      </div>

      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full progress-glow transition-all duration-500"
          style={{
            width: `${stats.percentage}%`,
            background: 'linear-gradient(90deg, #ffd700, #ff6b9d)'
          }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Object.entries(RARITY_INFO).map(([rarity, info]) => {
          const rarityStats = stats.byRarity[rarity] || { total: 0, unlocked: 0 };
          return (
            <div key={rarity} className="text-center">
              <div className="text-lg mb-1">{info.icon}</div>
              <div
                className="text-sm font-bold"
                style={{ color: info.color }}
              >
                {rarityStats.unlocked}/{rarityStats.total}
              </div>
              <div className="text-xs text-white/40">
                {info.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementStats;
