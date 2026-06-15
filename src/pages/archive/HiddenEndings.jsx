import { useState } from 'react';
import { getRarityColor } from '../../data/gameData';
import Modal from '../../components/Modal';

const RARITY_NAMES = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
};

const REWARD_TYPE_NAMES = {
  frame: '头像框',
  story: '剧情',
  title: '称号'
};

const HiddenEndings = ({ archive }) => {
  const [activeTab, setActiveTab] = useState('endings');
  const [selectedEnding, setSelectedEnding] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [claimedNotification, setClaimedNotification] = useState(null);

  const endings = archive.getEndingsWithStatus();
  const rewards = archive.getRewardsWithStatus();

  const unlockedEndingsCount = endings.filter(e => e.unlocked).length;
  const unlockedRewardsCount = rewards.filter(r => r.unlocked).length;
  const claimedRewardsCount = rewards.filter(r => r.claimed).length;

  const showRewardNotification = (reward) => {
    setClaimedNotification(reward);
    setTimeout(() => setClaimedNotification(null), 3000);
  };

  const handleClaimEndingReward = (ending) => {
    const success = archive.claimReward(ending.id);
    if (success) {
      showRewardNotification({ icon: ending.icon, name: ending.reward });
    }
    setSelectedEnding(null);
  };

  const handleClaimReward = (reward) => {
    const success = archive.claimReward(reward.id);
    if (success) {
      showRewardNotification(reward);
    }
    setSelectedReward(null);
  };

  const renderEndingCard = (ending, index) => {
    const isUnlocked = ending.unlocked;

    return (
      <div
        key={ending.id}
        onClick={() => isUnlocked && setSelectedEnding(ending)}
        className={`relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer
          ${isUnlocked
            ? 'bg-gradient-to-br from-star-gold/20 via-star-purple/30 to-star-cyan/20 border-star-gold/50 hover:border-star-gold hover:shadow-lg hover:shadow-star-gold/30 hover:scale-[1.02]'
            : 'bg-gray-800/30 border-gray-700/30 opacity-60 cursor-not-allowed'
          }
        `}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {isUnlocked && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-star-gold text-star-dark text-xs font-bold rounded-full">
              已解锁
            </span>
          </div>
        )}

        <div className={`text-6xl mb-4 text-center ${isUnlocked ? 'animate-float' : 'grayscale opacity-50'}`}
          style={{ animationDelay: `${index * 0.15}s` }}
        >
          {isUnlocked ? ending.icon : '🔒'}
        </div>

        <h3 className={`text-lg font-bold text-center mb-2 ${isUnlocked ? 'text-star-gold' : 'text-gray-500'}`}>
          {ending.name}
        </h3>

        <p className={`text-sm text-center mb-4 leading-relaxed ${isUnlocked ? 'text-white/70' : 'text-gray-600'}`}>
          {isUnlocked ? ending.description : '???'}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-star-cyan">📋</span>
            <span className={isUnlocked ? 'text-white/60' : 'text-gray-600'}>
              {isUnlocked ? ending.requirement : '完成特定条件解锁'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-star-pink">🎁</span>
            <span className={isUnlocked ? 'text-white/60' : 'text-gray-600'}>
              {isUnlocked ? `奖励：${ending.reward}` : '奖励：???'}
            </span>
          </div>
        </div>

        {isUnlocked && (
          <div className="mt-4 text-center">
            <span className="text-xs text-star-gold/70">
              点击查看详情 →
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderRewardCard = (reward, index) => {
    const isUnlocked = reward.unlocked;
    const isClaimed = reward.claimed;
    const rarityColor = getRarityColor(reward.rarity);

    return (
      <div
        key={reward.id}
        onClick={() => isUnlocked && !isClaimed && setSelectedReward(reward)}
        className={`relative rounded-2xl p-4 border-2 transition-all duration-300
          ${isClaimed
            ? 'bg-star-purple/10 border-star-gold/30 opacity-80 cursor-default'
            : isUnlocked
              ? 'bg-gradient-to-br from-star-purple/30 to-star-blue/30 cursor-pointer hover:scale-105 hover:shadow-lg'
              : 'bg-gray-800/30 border-gray-700/30 opacity-50 cursor-not-allowed'
          }
        `}
        style={{
          borderColor: isClaimed
            ? `${rarityColor}60`
            : isUnlocked
              ? `${rarityColor}50`
              : undefined,
          boxShadow: isClaimed
            ? `0 0 15px ${rarityColor}30`
            : isUnlocked
              ? `0 0 20px ${rarityColor}20`
              : undefined,
          animationDelay: `${index * 0.05}s`
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl ${isUnlocked ? '' : 'grayscale'} ${isClaimed ? '' : isUnlocked ? 'animate-float' : ''}`}
            style={{
              backgroundColor: isUnlocked ? `${rarityColor}20` : 'rgba(55, 65, 81, 0.3)',
              border: `2px solid ${isUnlocked ? `${rarityColor}50` : 'rgba(75, 85, 99, 0.3)'}`,
              animationDelay: `${index * 0.1}s`
            }}
          >
            {isUnlocked ? reward.icon : '❓'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold truncate ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                {isUnlocked ? reward.name : '???'}
              </span>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: isUnlocked ? `${rarityColor}30` : 'rgba(75, 85, 99, 0.3)',
                  color: isUnlocked ? rarityColor : '#6b7280'
                }}
              >
                {RARITY_NAMES[reward.rarity]}
              </span>
            </div>
            <p className={`text-sm truncate ${isUnlocked ? 'text-white/60' : 'text-gray-600'}`}>
              {isUnlocked ? reward.description : '完成条件解锁'}
            </p>
          </div>

          {isClaimed && (
            <div className="flex items-center gap-1 text-star-gold">
              <span className="text-sm">✓</span>
              <span className="text-xs font-medium">已领取</span>
            </div>
          )}
          {isUnlocked && !isClaimed && (
            <div className="px-3 py-1 bg-star-gold/20 border border-star-gold/50 rounded-full">
              <span className="text-xs text-star-gold font-bold">领取</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">🌟</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          隐藏结局 & 奖励
        </h2>
        <p className="text-white/60 text-sm mb-6">
          探索星塔的秘密，解锁隐藏结局，领取珍贵奖励
        </p>

        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('endings')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
              ${activeTab === 'endings'
                ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
              }
            `}
          >
            <span>🌌</span>
            <span>隐藏结局</span>
            <span className={`px-2 py-0.5 rounded-full text-xs
              ${activeTab === 'endings' ? 'bg-star-dark/20' : 'bg-white/10'}
            `}>
              {unlockedEndingsCount}/{endings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
              ${activeTab === 'rewards'
                ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
              }
            `}
          >
            <span>🏆</span>
            <span>成就奖励</span>
            <span className={`px-2 py-0.5 rounded-full text-xs
              ${activeTab === 'rewards' ? 'bg-star-dark/20' : 'bg-white/10'}
            `}>
              {claimedRewardsCount}/{rewards.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'endings' && (
        <div className="grid md:grid-cols-3 gap-6">
          {endings.map((ending, index) => renderEndingCard(ending, index))}
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-3">
          {rewards.map((reward, index) => renderRewardCard(reward, index))}
        </div>
      )}

      <div className="mt-8 p-4 bg-star-purple/20 rounded-xl border border-star-gold/20">
        <h3 className="text-star-gold font-bold mb-2">💡 解锁提示</h3>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• 收集全部12个星座碎片可解锁「星河守护者」结局</li>
          <li>• 通关全部章节并获得至少1次3星可解锁「情书收藏家」结局</li>
          <li>• 任意5关用时少于时间限制的50%可解锁「命运占卜师」结局</li>
          <li>• 达成各种成就可解锁不同稀有度的奖励，点击领取按钮领取</li>
        </ul>
      </div>

      {claimedNotification && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-star-gold to-amber-500 text-star-dark px-6 py-3 rounded-full shadow-lg shadow-star-gold/50 flex items-center gap-3 animate-bounce">
            <span className="text-2xl">{claimedNotification.icon}</span>
            <span className="font-bold">奖励已领取：{claimedNotification.name}！</span>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!selectedEnding}
        onClose={() => setSelectedEnding(null)}
        title={selectedEnding?.name}
      >
        {selectedEnding && (
          <div className="max-w-md mx-auto text-center">
            <div
              className="text-8xl mb-6 animate-float"
              style={{
                filter: 'drop-shadow(0 0 20px #ffd700)'
              }}
            >
              {selectedEnding.icon}
            </div>

            <div className="inline-block px-4 py-1 bg-star-gold/20 border border-star-gold/50 rounded-full text-star-gold text-sm font-medium mb-4">
              {REWARD_TYPE_NAMES[selectedEnding.rewardType] || '特殊奖励'}
            </div>

            <p className="text-white/80 text-lg mb-4 leading-relaxed">
              {selectedEnding.description}
            </p>

            <div className="bg-star-purple/30 rounded-xl p-4 mb-4 text-left">
              <div className="text-star-cyan text-sm font-medium mb-2">📋 解锁条件</div>
              <p className="text-white/70 text-sm">{selectedEnding.requirement}</p>
            </div>

            <div className="bg-gradient-to-r from-star-gold/20 to-amber-500/20 rounded-xl p-4 border border-star-gold/30">
              <div className="text-star-gold text-sm font-medium mb-2">🎁 结局奖励</div>
              <p className="text-white font-bold">{selectedEnding.reward}</p>
            </div>

            <button
              onClick={() => handleClaimEndingReward(selectedEnding)}
              className="mt-6 btn-star px-8 py-3"
            >
              🎁 领取奖励
            </button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedReward}
        onClose={() => setSelectedReward(null)}
        title={selectedReward?.name}
      >
        {selectedReward && (
          <div className="max-w-md mx-auto text-center">
            <div
              className="w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-7xl mb-6 animate-float"
              style={{
                backgroundColor: `${getRarityColor(selectedReward.rarity)}20`,
                border: `3px solid ${getRarityColor(selectedReward.rarity)}50`,
                boxShadow: `0 0 30px ${getRarityColor(selectedReward.rarity)}40`
              }}
            >
              {selectedReward.icon}
            </div>

            <div
              className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
              style={{
                backgroundColor: `${getRarityColor(selectedReward.rarity)}20`,
                color: getRarityColor(selectedReward.rarity),
                border: `1px solid ${getRarityColor(selectedReward.rarity)}50`
              }}
            >
              {RARITY_NAMES[selectedReward.rarity]}
            </div>

            <p className="text-white/80 text-lg mb-6">
              {selectedReward.description}
            </p>

            <div className="bg-star-purple/30 rounded-xl p-4 mb-6">
              <div className="text-star-cyan text-sm font-medium mb-2">📋 解锁条件</div>
              <p className="text-white/70 text-sm">{selectedReward.description}</p>
            </div>

            <button
              onClick={() => handleClaimReward(selectedReward)}
              className="btn-star px-8 py-3"
            >
              🎁 领取奖励
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HiddenEndings;
