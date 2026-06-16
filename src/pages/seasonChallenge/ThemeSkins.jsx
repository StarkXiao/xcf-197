import { useState } from 'react';
import { getRarityInfo, SEASON_STAGE_REWARDS } from '../../data/gameData';

const ThemeSkins = ({ seasonChallenge }) => {
  const [activeTab, setActiveTab] = useState('skins');
  const [previewSkin, setPreviewSkin] = useState(null);
  
  const skins = seasonChallenge.getSkinsWithStatus();
  const titles = seasonChallenge.getTitlesWithStatus();
  
  const handleSelectSkin = (skinId) => {
    const result = seasonChallenge.setSkin(skinId);
    if (result.success) {
      console.log(result.message);
      setPreviewSkin(null);
    }
  };
  
  const handleSelectTitle = (titleId) => {
    const result = seasonChallenge.setTitle(titleId);
    if (result.success) {
      console.log(result.message);
    }
  };
  
  const getUnlockLevel = (skinId) => {
    const reward = SEASON_STAGE_REWARDS.find(r => r.reward.type === 'skin' && r.reward.value === skinId);
    return reward ? reward.level : null;
  };

  const getUnlockLevelForTitle = (titleId) => {
    const reward = SEASON_STAGE_REWARDS.find(r => r.reward.type === 'title' && r.reward.value === titleId);
    return reward ? reward.level : null;
  };

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('skins')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2
            ${activeTab === 'skins'
              ? 'bg-indigo-500/30 border-2 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-500/30'
              : 'bg-white/5 border-2 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            }
          `}
        >
          <span>🎨</span>
          <span>主题皮肤</span>
        </button>
        <button
          onClick={() => setActiveTab('titles')}
          className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2
            ${activeTab === 'titles'
              ? 'bg-amber-500/30 border-2 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30'
              : 'bg-white/5 border-2 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
            }
          `}
        >
          <span>👑</span>
          <span>专属称号</span>
        </button>
      </div>

      {previewSkin && (
        <div className="mb-6 p-6 rounded-2xl border-2 border-white/20 overflow-hidden"
          style={{ background: previewSkin.theme.background }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 20% 30%, ${previewSkin.theme.glow} 0%, transparent 50%),
                          radial-gradient(circle at 80% 70%, ${previewSkin.theme.glow} 0%, transparent 50%)`
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{previewSkin.icon}</span>
                <div>
                  <h4 className="font-bold text-xl" style={{ color: previewSkin.theme.textPrimary }}>
                    {previewSkin.name}
                  </h4>
                  <p className="text-sm" style={{ color: previewSkin.theme.textSecondary }}>
                    预览效果
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewSkin(null)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all"
              >
                关闭预览
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className="p-4 rounded-xl text-center"
                style={{ 
                  backgroundColor: previewSkin.theme.cardColor,
                  border: `2px solid ${previewSkin.theme.cardBorder}`
                }}
              >
                <div className="text-3xl mb-2">🎴</div>
                <div className="font-bold" style={{ color: previewSkin.theme.textPrimary }}>卡牌样式</div>
                <div className="text-xs" style={{ color: previewSkin.theme.textSecondary }}>预览</div>
              </div>
              <div 
                className="p-4 rounded-xl text-center"
                style={{ 
                  backgroundColor: previewSkin.theme.cardColor,
                  border: `2px solid ${previewSkin.theme.cardBorder}`
                }}
              >
                <div className="text-3xl mb-2">⭐</div>
                <div className="font-bold" style={{ color: previewSkin.theme.textPrimary }}>星级显示</div>
                <div className="text-xs" style={{ color: previewSkin.theme.textSecondary }}>预览</div>
              </div>
              <div 
                className="p-4 rounded-xl text-center"
                style={{ 
                  backgroundColor: previewSkin.theme.cardColor,
                  border: `2px solid ${previewSkin.theme.cardBorder}`
                }}
              >
                <div className="text-3xl mb-2">⏱️</div>
                <div className="font-bold" style={{ color: previewSkin.theme.textPrimary }}>计时器</div>
                <div className="text-xs" style={{ color: previewSkin.theme.textSecondary }}>预览</div>
              </div>
              <div 
                className="p-4 rounded-xl text-center"
                style={{ 
                  backgroundColor: previewSkin.theme.cardColor,
                  border: `2px solid ${previewSkin.theme.cardBorder}`
                }}
              >
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-bold" style={{ color: previewSkin.theme.textPrimary }}>分数面板</div>
                <div className="text-xs" style={{ color: previewSkin.theme.textSecondary }}>预览</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skins' && (
        <div>
          <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-white/60">
                主题皮肤将改变游戏界面的整体配色风格。通过提升赛季等级解锁更多精美皮肤！
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skins.map((skin, index) => {
              const rarityInfo = getRarityInfo(skin.rarity);
              const unlockLevel = getUnlockLevel(skin.id);
              const isUnlocked = skin.unlocked;
              const isSelected = skin.selected;
              
              return (
                <div
                  key={skin.id}
                  className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden
                    ${isSelected 
                      ? 'border-indigo-400 shadow-lg shadow-indigo-500/30' 
                      : isUnlocked 
                        ? 'border-white/20 hover:border-white/40' 
                        : 'border-white/5 opacity-70'
                    }
                  `}
                  style={{ 
                    background: isSelected 
                      ? `linear-gradient(135deg, ${skin.theme.background})` 
                      : 'rgba(255,255,255,0.03)'
                  }}
                >
                  {!skin.isDefault && unlockLevel && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/50 text-xs font-bold text-white/80">
                      Lv.{unlockLevel} 解锁
                    </div>
                  )}
                  
                  <div 
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 30% 20%, ${skin.theme.glow} 0%, transparent 50%),
                                  radial-gradient(circle at 70% 80%, ${skin.theme.glow} 0%, transparent 50%)`
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0"
                        style={{ 
                          backgroundColor: skin.theme.cardColor,
                          border: `2px solid ${skin.theme.cardBorder}`,
                          boxShadow: `0 0 20px ${skin.theme.glow}`
                        }}
                      >
                        {skin.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white text-lg">{skin.name}</h4>
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
                        <p className="text-sm text-white/60">{skin.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {isUnlocked && !isSelected && (
                        <>
                          <button
                            onClick={() => setPreviewSkin(skin)}
                            className="flex-1 py-2 rounded-xl font-bold bg-white/10 text-white/80 hover:bg-white/20 transition-all"
                          >
                            预览
                          </button>
                          <button
                            onClick={() => handleSelectSkin(skin.id)}
                            className="flex-1 py-2 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                          >
                            使用
                          </button>
                        </>
                      )}
                      {isSelected && (
                        <div className="flex-1 py-2 rounded-xl font-bold bg-green-500/20 text-green-400 text-center border border-green-500/30">
                          ✓ 正在使用
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="flex-1 py-2 rounded-xl font-bold bg-gray-800/50 text-gray-500 text-center border border-gray-700/50 flex items-center justify-center gap-2">
                          <span>🔒</span>
                          <span>未解锁</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'titles' && (
        <div>
          <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-white/60">
                专属称号将展示在您的个人信息中。通过提升赛季等级解锁更多尊贵称号！
              </div>
            </div>
          </div>
          
          {seasonChallenge.currentTitle && (
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl p-5 mb-6 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{titles.find(t => t.id === seasonChallenge.currentTitle)?.icon}</span>
                  <div>
                    <p className="text-sm text-amber-300 mb-1">当前称号</p>
                    <h3 className="font-bold text-2xl text-amber-200">
                      {titles.find(t => t.id === seasonChallenge.currentTitle)?.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectTitle(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 transition-all"
                >
                  卸下称号
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {titles.map((title, index) => {
              const rarityInfo = getRarityInfo(title.rarity);
              const unlockLevel = getUnlockLevelForTitle(title.id);
              const isUnlocked = title.unlocked;
              const isSelected = title.selected;
              
              return (
                <div
                  key={title.id}
                  className={`p-5 rounded-2xl border-2 transition-all
                    ${isSelected 
                      ? 'bg-amber-500/10 border-amber-400 shadow-lg shadow-amber-500/20' 
                      : isUnlocked 
                        ? 'bg-white/5 border-white/10 hover:border-white/20' 
                        : 'bg-white/5 border-white/5 opacity-60'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                        style={{
                          backgroundColor: rarityInfo.bgColor,
                          border: `2px solid ${rarityInfo.borderColor}`,
                          boxShadow: isUnlocked ? `0 0 20px ${rarityInfo.color}33` : 'none'
                        }}
                      >
                        {isUnlocked ? title.icon : '🔒'}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-white text-lg">{title.name}</h4>
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
                        <p className="text-sm text-white/60">{title.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {isUnlocked && !isSelected && (
                        <button
                          onClick={() => handleSelectTitle(title.id)}
                          className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all"
                        >
                          装备
                        </button>
                      )}
                      {isSelected && (
                        <div className="px-6 py-2 rounded-xl font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                          ✓ 已装备
                        </div>
                      )}
                      {!isUnlocked && unlockLevel && (
                        <div className="px-6 py-2 rounded-xl font-bold bg-gray-800/50 text-gray-500 border border-gray-700/50">
                          Lv.{unlockLevel} 解锁
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎨</div>
          <div>
            <h4 className="font-bold text-white text-lg mb-2">外观系统说明</h4>
            <ul className="text-sm text-white/60 space-y-1">
              <li>• 主题皮肤会改变游戏界面的背景、卡牌、文字等配色</li>
              <li>• 专属称号会展示在您的个人信息和排行榜中</li>
              <li>• 通过提升赛季等级解锁更多外观奖励</li>
              <li>• 赛季限定皮肤和称号，错过将无法再次获取</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSkins;