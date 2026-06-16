import { useState } from 'react';
import Modal from '../components/Modal';
import { getDailyThemeById, getDifficultyColor, getRarityColor, DAILY_CHALLENGE_TASKS } from '../data/gameData';

const DailyChallengePage = ({ dailyChallenge, onStartChallenge, onBack }) => {
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showClaimResultModal, setShowClaimResultModal] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  const {
    currentTheme,
    todayBestScore,
    totalBonusPoints,
    leaderboard,
    challengeRecords,
    rankRewardClaimed,
    starShards,
    getTasksWithStatus,
    getTimeUntilResetFormatted,
    shouldShowResetReminder,
    claimTaskReward,
    claimRankReward,
    getCurrentRank,
    getRankReward
  } = dailyChallenge;

  const theme = currentTheme ? getDailyThemeById(currentTheme) : null;
  const tasks = getTasksWithStatus();
  const currentRank = getCurrentRank();
  const rankReward = getRankReward();
  const timeUntilReset = getTimeUntilResetFormatted();
  const showReminder = shouldShowResetReminder();

  const handleClaimReward = (taskId) => {
    const reward = claimTaskReward(taskId);
    if (reward) {
      setClaimResult({
        type: 'task',
        points: reward
      });
      setShowClaimResultModal(true);
    }
  };

  const handleClaimRankReward = () => {
    const result = claimRankReward();
    if (result.success) {
      setClaimResult(result);
      setShowClaimResultModal(true);
      setShowRewardModal(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
  };

  const getBonusDescription = () => {
    if (!theme) return '';
    switch (theme.bonusType) {
      case 'score':
        return `得分 ×${theme.bonusValue}`;
      case 'combo':
        return `连击加成 ×${theme.bonusValue}`;
      case 'time':
        return `额外 +${theme.bonusValue}秒`;
      default:
        return '';
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-white/70 hover:text-white transition-colors text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-star-gold glow-text">
          🔮 每日占卜挑战
        </h1>
        <div className="w-8" />
      </div>

      {showReminder && (
        <div className="mb-4 p-3 rounded-xl bg-orange-500/20 border border-orange-500/50 animate-pulse">
          <div className="flex items-center gap-2 text-orange-300">
            <span className="text-xl">⚠️</span>
            <span className="text-sm">距离挑战重置还有不到1小时，抓紧时间！</span>
          </div>
        </div>
      )}

      {theme && (
        <div
          className="mb-6 p-4 rounded-2xl border-2"
          style={{
            borderColor: `${theme.color}50`,
            background: `linear-gradient(135deg, ${theme.color}15 0%, ${theme.color}05 100%)`
          }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div
              className="text-5xl"
              style={{ filter: `drop-shadow(0 0 10px ${theme.color})` }}
            >
              {theme.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold" style={{ color: theme.color }}>
                  {theme.name}
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${theme.color}30`, color: theme.color }}
                >
                  今日主题
                </span>
              </div>
              <p className="text-sm text-white/70 mt-1">{theme.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/20 rounded-lg p-2">
            <span className="text-xs text-white/60">主题加成</span>
            <span className="text-sm font-bold" style={{ color: theme.color }}>
              ✨ {getBonusDescription()}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 mb-6 bg-star-purple/30 rounded-xl p-4">
        <div className="text-center">
          <div className="text-xs text-white/50">今日最高分</div>
          <div className="text-xl font-bold text-star-gold">
            {todayBestScore || '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50">累计积分</div>
          <div className="text-xl font-bold text-star-cyan">
            {totalBonusPoints}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50">星光碎片</div>
          <div className="text-xl font-bold text-yellow-300">
            💎 {starShards}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50">当前排名</div>
          <div className="text-xl font-bold text-star-pink">
            {currentRank ? `#${currentRank}` : '-'}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📋</span> 今日任务
          </h3>
          <div className="text-xs text-white/50">
            {tasks.filter(t => t.completed).length} / {tasks.length} 已完成
          </div>
        </div>
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border-2 transition-all ${
                task.completed
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{task.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${task.completed ? 'text-green-400' : 'text-white'}`}>
                      {task.name}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: `${getDifficultyColor(task.difficulty)}30`,
                        color: getDifficultyColor(task.difficulty)
                      }}
                    >
                      {task.difficulty === 'easy' && '简单'}
                      {task.difficulty === 'medium' && '中等'}
                      {task.difficulty === 'hard' && '困难'}
                      {task.difficulty === 'legendary' && '传说'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">{task.description}</p>
                  <div className="text-xs text-star-gold mt-1">
                    奖励: +{task.reward.value} 积分
                  </div>
                </div>
                <div>
                  {task.completed && !task.claimed ? (
                    <button
                      onClick={() => handleClaimReward(task.id)}
                      className="px-3 py-1.5 rounded-full text-sm font-bold bg-star-gold text-star-purple hover:bg-star-gold/80 transition-colors"
                    >
                      领取
                    </button>
                  ) : task.claimed ? (
                    <span className="text-green-400 text-sm">✓ 已领取</span>
                  ) : (
                    <span className="text-white/30 text-sm">未完成</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🏆</span> 今日排行
          </h3>
          <button
            onClick={() => setShowRewardModal(true)}
            className="text-xs text-star-gold hover:underline"
          >
            查看奖励
          </button>
        </div>
        <div className="bg-star-purple/20 rounded-xl p-3">
          {leaderboard.slice(0, 5).map((entry) => (
            <div
              key={entry.name}
              className={`flex items-center gap-3 py-2 border-b border-white/10 last:border-0 ${
                entry.isCurrentPlayer ? 'bg-star-gold/10 -mx-3 px-3 rounded-lg' : ''
              }`}
            >
              <div className="w-8 text-center">
                {entry.rank === 1 && <span className="text-xl">👑</span>}
                {entry.rank === 2 && <span className="text-xl">🥈</span>}
                {entry.rank === 3 && <span className="text-xl">🥉</span>}
                {entry.rank > 3 && (
                  <span className="text-white/50 font-bold">#{entry.rank}</span>
                )}
              </div>
              <div className="text-xl">{entry.avatar}</div>
              <div className="flex-1">
                <span className={`font-medium ${entry.isCurrentPlayer ? 'text-star-gold' : 'text-white'}`}>
                  {entry.name}
                  {entry.isCurrentPlayer && <span className="text-xs ml-1">(你)</span>}
                </span>
              </div>
              <div className="font-bold text-star-gold">
                {entry.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        {currentRank && currentRank > 5 && (
          <div className="mt-2 text-center text-sm text-white/50">
            你的排名: #{currentRank} / {leaderboard.length}
          </div>
        )}
        
        {rankReward && (
          <div
            className="mt-3 p-3 rounded-xl border-2"
            style={{
              borderColor: rankRewardClaimed ? '#10b98150' : `${getRarityColor(rankReward.rarity)}50`,
              background: rankRewardClaimed ? '#10b98115' : `${getRarityColor(rankReward.rarity)}15`
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{rankReward.icon}</span>
              <div className="flex-1">
                <div
                  className="font-bold"
                  style={{ color: rankRewardClaimed ? '#10b981' : getRarityColor(rankReward.rarity) }}
                >
                  {rankReward.name}
                  {currentRank && rankReward.rank !== 'participation' && rankReward.rank !== 'top10' && (
                    <span className="text-xs ml-2 text-white/60">排名 #{currentRank}</span>
                  )}
                </div>
                <div className="text-xs text-white/60">
                  {rankReward.reward}
                </div>
              </div>
              <div className="text-right">
                <div className="text-star-gold font-bold text-sm">+{rankReward.bonusPoints}</div>
                <div className="text-xs text-yellow-300">
                  💎 {
                    currentRank === 1 ? 20 :
                    currentRank === 2 ? 10 :
                    currentRank === 3 ? 5 :
                    currentRank <= 10 ? 3 : 1
                  }
                </div>
              </div>
            </div>
            {rankRewardClaimed ? (
              <div className="text-center text-green-400 text-sm py-1">
                ✓ 今日奖励已领取
              </div>
            ) : currentRank ? (
              <button
                onClick={handleClaimRankReward}
                className="w-full py-2 rounded-full font-bold text-sm transition-all animate-pulse-slow"
                style={{
                  background: `linear-gradient(135deg, ${getRarityColor(rankReward.rarity)} 0%, ${getRarityColor(rankReward.rarity)}cc 100%)`,
                  color: '#1a1a2e'
                }}
              >
                🎁 领取排行奖励
              </button>
            ) : (
              <div className="text-center text-white/40 text-sm py-1">
                完成一次挑战后可领取
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📜</span> 挑战记录
          </h3>
          <button
            onClick={() => setShowRecordsModal(true)}
            className="text-xs text-star-cyan hover:underline"
          >
            查看全部
          </button>
        </div>
        <div className="bg-star-purple/20 rounded-xl p-3">
          {challengeRecords.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {challengeRecords.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleViewRecord(record)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(star => (
                      <span
                        key={star}
                        className={`text-sm ${star <= record.stars ? 'text-star-gold' : 'text-white/20'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 text-sm text-white/70">
                    得分: <span className="text-star-gold font-bold">{record.score}</span>
                  </div>
                  <div className="text-xs text-white/40">
                    {new Date(record.id).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-white/40">
              <div className="text-3xl mb-2">🎯</div>
              <p>暂无挑战记录</p>
              <p className="text-xs mt-1">开始挑战创造你的记录吧！</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between bg-black/30 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-white/60">
            <span className="text-lg">⏰</span>
            <span className="text-sm">距离重置</span>
          </div>
          <div className="font-mono text-lg font-bold text-star-cyan">
            {timeUntilReset}
          </div>
        </div>

        <button
          onClick={onStartChallenge}
          className="w-full btn-star text-lg py-4 animate-pulse-slow"
        >
          ✨ 开始今日挑战 ✨
        </button>
      </div>

      <Modal
        isOpen={showRecordsModal}
        onClose={() => setShowRecordsModal(false)}
        title="📜 挑战记录"
      >
        <div className="max-h-96 overflow-y-auto">
          {challengeRecords.length > 0 ? (
            <div className="space-y-2">
              {challengeRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-3 rounded-xl bg-star-purple/20 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(star => (
                        <span
                          key={star}
                          className={`text-base ${star <= record.stars ? 'text-star-gold' : 'text-white/20'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(record.id).toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-white/60">
                      得分: <span className="text-star-gold font-bold">{record.score}</span>
                    </div>
                    <div className="text-white/60">
                      最高连击: <span className="text-star-pink font-bold">x{record.maxCombo}</span>
                    </div>
                    <div className="text-white/60">
                      用时: <span className="text-star-cyan font-bold">{record.completeTime}秒</span>
                    </div>
                    <div className="text-white/60">
                      步数: <span className="text-white font-bold">{record.moves}</span>
                    </div>
                  </div>
                  {record.tasksCompleted && record.tasksCompleted.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <div className="text-xs text-white/50">完成任务:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {record.tasksCompleted.map((taskId, idx) => {
                          const task = DAILY_CHALLENGE_TASKS.find(t => t.id === taskId);
                          return task ? (
                            <span key={idx} className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                              {task.icon} {task.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <div className="text-4xl mb-2">📜</div>
              <p>暂无挑战记录</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        title="🏆 排行奖励"
      >
        <div className="space-y-3">
          {[
            { rank: 1, name: '每日冠军', icon: '👑', reward: '专属称号 · 每日占卜师', points: 3000, rarity: 'legendary' },
            { rank: 2, name: '每日亚军', icon: '🥈', reward: '星光碎片 ×10', points: 2000, rarity: 'epic' },
            { rank: 3, name: '每日季军', icon: '🥉', reward: '星光碎片 ×5', points: 1000, rarity: 'epic' },
            { rank: '4-10', name: '每日十强', icon: '🌟', reward: '星光碎片 ×3', points: 500, rarity: 'rare' },
            { rank: '参与', name: '参与奖励', icon: '🎁', reward: '星光碎片 ×1', points: 100, rarity: 'common' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{
                borderColor: `${getRarityColor(item.rarity)}30`,
                background: `${getRarityColor(item.rarity)}10`
              }}
            >
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-white">{item.name}</div>
                <div className="text-xs text-white/60">{item.reward}</div>
              </div>
              <div className="text-right">
                <div className="text-star-gold font-bold">+{item.points}</div>
                <div
                  className="text-xs"
                  style={{ color: getRarityColor(item.rarity) }}
                >
                  {item.rarity === 'legendary' && '传说'}
                  {item.rarity === 'epic' && '史诗'}
                  {item.rarity === 'rare' && '稀有'}
                  {item.rarity === 'common' && '普通'}
                </div>
              </div>
            </div>
          ))}
        </div>
        {rankReward && (
          <div className="mt-4 p-3 rounded-xl bg-star-gold/20 border border-star-gold/50">
            <div className="text-center mb-3">
              <div className="text-sm text-white/70">你当前可获得</div>
              <div className="text-lg font-bold text-star-gold mt-1">
                {rankReward.icon} {rankReward.name}
              </div>
              <div className="text-xs text-white/60 mt-1">
                {rankReward.reward} · +{rankReward.bonusPoints}积分 · 💎{
                  currentRank === 1 ? 20 :
                  currentRank === 2 ? 10 :
                  currentRank === 3 ? 5 :
                  currentRank <= 10 ? 3 : 1
                }
              </div>
            </div>
            {rankRewardClaimed ? (
              <div className="text-center text-green-400 py-2 font-bold">
                ✓ 今日奖励已领取
              </div>
            ) : currentRank ? (
              <button
                onClick={handleClaimRankReward}
                className="w-full py-3 rounded-full font-bold text-base transition-all animate-pulse-slow"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                  color: '#1a1a2e'
                }}
              >
                🎁 立即领取奖励
              </button>
            ) : (
              <div className="text-center text-white/50 py-2">
                完成一次挑战后可领取奖励
              </div>
            )}
          </div>
        )}
      </Modal>

      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="🎯 挑战详情"
        >
          <div className="text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3].map(star => (
                <span
                  key={star}
                  className={`text-3xl ${star <= selectedRecord.stars ? 'text-star-gold' : 'text-white/20'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            <div className="text-4xl font-bold text-star-gold mb-2">
              {selectedRecord.score.toLocaleString()}
            </div>
            <div className="text-sm text-white/50 mb-6">
              {new Date(selectedRecord.id).toLocaleString()}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-star-purple/20 rounded-xl p-4">
                <div className="text-2xl text-star-pink mb-1">⚡</div>
                <div className="text-2xl font-bold text-white">x{selectedRecord.maxCombo}</div>
                <div className="text-xs text-white/50">最高连击</div>
              </div>
              <div className="bg-star-purple/20 rounded-xl p-4">
                <div className="text-2xl text-star-cyan mb-1">⏱️</div>
                <div className="text-2xl font-bold text-white">{selectedRecord.completeTime}s</div>
                <div className="text-xs text-white/50">完成用时</div>
              </div>
              <div className="bg-star-purple/20 rounded-xl p-4">
                <div className="text-2xl text-white mb-1">👟</div>
                <div className="text-2xl font-bold text-white">{selectedRecord.moves}</div>
                <div className="text-xs text-white/50">总步数</div>
              </div>
              <div className="bg-star-purple/20 rounded-xl p-4">
                <div className="text-2xl text-green-400 mb-1">💚</div>
                <div className="text-2xl font-bold text-white">{selectedRecord.timeLeft}s</div>
                <div className="text-xs text-white/50">剩余时间</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full btn-star"
            >
              关闭
            </button>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={showClaimResultModal && claimResult}
        onClose={() => setShowClaimResultModal(false)}
        title="🎉 领取成功"
        showCloseButton={false}
      >
        {claimResult && (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">
              {claimResult.type === 'task' ? '📋' : claimResult.reward?.icon || '🎁'}
            </div>
            <h3 className="text-xl font-bold text-star-gold mb-4">
              {claimResult.type === 'task' ? '任务奖励领取成功！' : `${claimResult.reward?.name}领取成功！`}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between bg-star-gold/10 rounded-xl p-4">
                <span className="text-white/70 flex items-center gap-2">
                  <span className="text-xl">⭐</span> 积分奖励
                </span>
                <span className="text-star-gold font-bold text-xl">
                  +{claimResult.type === 'task' ? claimResult.points : claimResult.points}
                </span>
              </div>
              {claimResult.type !== 'task' && claimResult.shards > 0 && (
                <div className="flex items-center justify-between bg-yellow-500/10 rounded-xl p-4">
                  <span className="text-white/70 flex items-center gap-2">
                    <span className="text-xl">💎</span> 星光碎片
                  </span>
                  <span className="text-yellow-300 font-bold text-xl">
                    +{claimResult.shards}
                  </span>
                </div>
              )}
              {claimResult.reward?.reward && (
                <div className="text-sm text-white/60">
                  额外获得: {claimResult.reward.reward}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowClaimResultModal(false)}
              className="w-full btn-star text-lg py-4"
            >
              太棒了！
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DailyChallengePage;
