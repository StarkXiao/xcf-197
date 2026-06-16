import { useState } from 'react';
import { getCurrentSeason, getRarityInfo } from '../data/gameData';
import CycleTasks from './seasonChallenge/CycleTasks';
import SeasonPoints from './seasonChallenge/SeasonPoints';
import StageRewards from './seasonChallenge/StageRewards';
import ThemeSkins from './seasonChallenge/ThemeSkins';

const SeasonChallengePage = ({ seasonChallenge, onBack, onOpenSettlement }) => {
  const [activeSection, setActiveSection] = useState('tasks');
  const season = getCurrentSeason();
  
  const sections = [
    { id: 'tasks', name: '周期任务', icon: '📋', component: CycleTasks },
    { id: 'points', name: '赛季积分', icon: '✨', component: SeasonPoints },
    { id: 'rewards', name: '阶段奖励', icon: '🎁', component: StageRewards },
    { id: 'skins', name: '主题外观', icon: '🎨', component: ThemeSkins }
  ];
  
  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || CycleTasks;
  
  const getUnreadCount = () => {
    let count = 0;
    const dailyTasks = seasonChallenge.getTasksWithStatus('daily');
    const weeklyTasks = seasonChallenge.getTasksWithStatus('weekly');
    const challengeTasks = seasonChallenge.getTasksWithStatus('challenge');
    const stageRewards = seasonChallenge.getStageRewardsWithStatus();
    
    [...dailyTasks, ...weeklyTasks, ...challengeTasks].forEach(task => {
      if (task.completed && !task.claimed) count++;
    });
    
    stageRewards.forEach(reward => {
      if (reward.unlocked && !reward.claimed) count++;
    });
    
    return count;
  };

  const unreadCount = getUnreadCount();

  return (
    <div className="relative z-10 min-h-screen w-full">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          
          <div className="flex items-center gap-3">
            {seasonChallenge.seasonEnded && (
              <button
                onClick={onOpenSettlement}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all animate-pulse-slow"
              >
                🏆 赛季结算
              </button>
            )}
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <span className="text-2xl">{season.icon}</span>
              <div>
                <div className="font-bold text-indigo-300 text-sm">Lv.{seasonChallenge.seasonLevel}</div>
                <div className="text-xs text-indigo-400">✨ {seasonChallenge.seasonPoints.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="text-5xl mb-3">{season.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {season.name}
            </h1>
            <p className="text-indigo-300 text-lg">{season.subtitle}</p>
            <p className="text-white/50 text-sm mt-2">{season.description}</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-300">{seasonChallenge.seasonLevel}</div>
              <div className="text-xs text-white/50">赛季等级</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">{seasonChallenge.seasonPoints.toLocaleString()}</div>
              <div className="text-xs text-white/50">累计积分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-300">
                {seasonChallenge.formatTimeUntil(seasonChallenge.timeUntilSeasonEnd)}
              </div>
              <div className="text-xs text-white/50">赛季结束</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-300">
                {unreadCount > 0 && <span className="animate-bounce inline-block">{unreadCount}</span>}
                {unreadCount === 0 && <span>0</span>}
              </div>
              <div className="text-xs text-white/50">待领取奖励</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map(section => {
            const sectionUnread = section.id === 'tasks' ? unreadCount : 0;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all relative
                  ${activeSection === section.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
                {sectionUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
                    {sectionUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white/3 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
          <ActiveComponent seasonChallenge={seasonChallenge} />
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <span className="text-2xl">💫</span>
            <div className="text-left">
              <p className="text-sm font-bold text-indigo-300">
                赛季积分加成：x{season.bonusMultiplier}
              </p>
              <p className="text-xs text-white/50">
                本赛季所有积分获得享受 {season.bonusMultiplier} 倍加成
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonChallengePage;