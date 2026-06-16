import { useState } from 'react';
import { getDifficultyColor, getRarityInfo } from '../../data/gameData';

const CycleTasks = ({ seasonChallenge }) => {
  const [activeTab, setActiveTab] = useState('daily');
  
  const tabs = [
    { id: 'daily', name: '每日任务', icon: '📅', resetTime: seasonChallenge.timeUntilDailyReset },
    { id: 'weekly', name: '每周任务', icon: '📆', resetTime: seasonChallenge.timeUntilWeeklyReset },
    { id: 'challenge', name: '赛季挑战', icon: '🏆', resetTime: seasonChallenge.timeUntilSeasonEnd }
  ];
  
  const tasks = seasonChallenge.getTasksWithStatus(activeTab);
  
  const handleClaimReward = (taskId) => {
    const result = seasonChallenge.claimTaskReward(taskId);
    if (result.success) {
      console.log('领取成功:', result.message, `获得 ${result.points} 赛季积分`);
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2
              ${activeTab === tab.id
                ? 'bg-indigo-500/30 border-2 border-indigo-400 text-indigo-300 shadow-lg shadow-indigo-500/30'
                : 'bg-white/5 border-2 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 px-4 py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-indigo-300">
            ⏰ 距离{tabs.find(t => t.id === activeTab)?.name}重置：
          </span>
          <span className="font-mono font-bold text-indigo-200">
            {seasonChallenge.formatTimeUntil(tabs.find(t => t.id === activeTab)?.resetTime || 0)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const rarityInfo = getRarityInfo(task.difficulty === 'legendary' ? 'legendary' : 
                                          task.difficulty === 'hard' ? 'epic' : 
                                          task.difficulty === 'medium' ? 'rare' : 'common');
          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border-2 transition-all
                ${task.completed
                  ? task.claimed
                    ? 'bg-gray-800/30 border-gray-600/30 opacity-60'
                    : 'bg-green-500/10 border-green-500/50 animate-pulse-slow'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ 
                    backgroundColor: rarityInfo.bgColor,
                    border: `2px solid ${rarityInfo.borderColor}`
                  }}
                >
                  {task.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white">{task.name}</h4>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ 
                        backgroundColor: `rgba(${parseInt(getDifficultyColor(task.difficulty).slice(1), 16).toString(16).match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')}, 0.2)`,
                        color: getDifficultyColor(task.difficulty)
                      }}
                    >
                      {task.difficulty === 'easy' ? '简单' : 
                       task.difficulty === 'medium' ? '中等' : 
                       task.difficulty === 'hard' ? '困难' : '传说'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/60 mb-3">{task.description}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${task.progress}%`,
                            backgroundColor: task.completed ? '#10b981' : '#6366f1'
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-white/40">进度</span>
                        <span className="text-white/60 font-bold">{Math.round(task.progress)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-indigo-500/20 px-3 py-1 rounded-full">
                      <span className="text-indigo-300">✨</span>
                      <span className="font-bold text-indigo-200">+{task.reward.value}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {task.completed && !task.claimed && (
                    <button
                      onClick={() => handleClaimReward(task.id)}
                      className="px-4 py-2 rounded-xl font-bold bg-green-500 hover:bg-green-400 text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/30"
                    >
                      领取
                    </button>
                  )}
                  {task.claimed && (
                    <div className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-400 font-bold">
                      已领取
                    </div>
                  )}
                  {!task.completed && (
                    <div className="w-10 h-10 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
                      <span className="text-white/30">🔒</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">📋</div>
          <p className="text-white/40">暂无任务</p>
        </div>
      )}
    </div>
  );
};

export default CycleTasks;