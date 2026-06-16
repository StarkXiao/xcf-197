import { getRarityInfo } from '../../data/gameData';

const TitlePanel = ({ achievements }) => {
  const titles = achievements.getTitlesWithStatus();
  const equippedTitle = achievements.getEquippedTitleInfo();

  const handleEquipTitle = (titleId) => {
    if (achievements.equippedTitle === titleId) {
      achievements.equipTitle(null);
    } else {
      achievements.equipTitle(titleId);
    }
  };

  return (
    <div className="space-y-6">
      {equippedTitle && (
        <div className={`bg-star-purple/40 rounded-2xl p-6 border-2 rarity-${equippedTitle.rarity} text-center`}>
          <div className="text-sm text-white/60 mb-2">当前佩戴</div>
          <div
            className="text-5xl mb-3"
            style={{
              filter: `drop-shadow(0 0 15px ${getRarityInfo(equippedTitle.rarity).color})`
            }}
          >
            {equippedTitle.icon}
          </div>
          <div
            className="text-xl font-bold mb-1"
            style={{ color: getRarityInfo(equippedTitle.rarity).color }}
          >
            {equippedTitle.name}
          </div>
          <div className="text-sm text-white/60">
            {equippedTitle.description}
          </div>
          <button
            onClick={() => achievements.equipTitle(null)}
            className="mt-4 px-4 py-2 text-sm rounded-full border border-white/30 text-white/70 hover:bg-white/10 transition-colors"
          >
            卸下称号
          </button>
        </div>
      )}

      {!equippedTitle && (
        <div className="bg-star-purple/30 rounded-2xl p-6 border border-star-gold/20 text-center">
          <div className="text-4xl mb-3 opacity-50">👤</div>
          <div className="text-lg font-bold text-white/60 mb-1">
            暂无佩戴称号
          </div>
          <div className="text-sm text-white/40">
            解锁成就获得称号，选择一个佩戴展示吧
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-star-gold mb-4">
          🎖️ 称号收藏 ({titles.filter(t => t.unlocked).length}/{titles.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {titles.map((title) => {
            const rarityInfo = getRarityInfo(title.rarity);
            
            return (
              <div
                key={title.id}
                onClick={() => title.unlocked && handleEquipTitle(title.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
                  ${title.unlocked
                    ? `rarity-${title.rarity} bg-star-purple/40 hover:scale-105`
                    : 'border-gray-600/30 bg-gray-800/30 opacity-50 cursor-not-allowed'
                  }
                  ${title.equipped ? 'ring-2 ring-star-gold ring-offset-2 ring-offset-star-dark' : ''}
                `}
              >
                {title.equipped && (
                  <div className="absolute -top-2 -right-2 bg-star-gold text-star-dark text-xs px-2 py-0.5 rounded-full font-bold">
                    佩戴中
                  </div>
                )}

                <div className="text-center">
                  <div
                    className={`text-3xl mb-2 ${
                    title.unlocked ? '' : 'grayscale opacity-50'
                  }`}
                    style={{
                      filter: title.unlocked ? `drop-shadow(0 0 6px ${rarityInfo.color})` : 'none'
                    }}
                  >
                    {title.unlocked ? title.icon : '🔒'}
                  </div>

                  <div
                    className={`text-sm font-bold mb-1 ${
                    title.unlocked ? '' : 'text-gray-500'
                  }`}
                    style={{ color: title.unlocked ? rarityInfo.color : undefined }}
                  >
                    {title.name}
                  </div>

                  <div className="text-xs text-white/40 line-clamp-2">
                    {title.description}
                  </div>

                  <div
                    className="mt-2 text-xs px-2 py-0.5 rounded-full inline-block"
                    style={{
                      backgroundColor: title.unlocked ? `${rarityInfo.color}20` : 'rgba(100,100,100,0.2)',
                      color: title.unlocked ? rarityInfo.color : '#666'
                    }}
                  >
                    {rarityInfo.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TitlePanel;
