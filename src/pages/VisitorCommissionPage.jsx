import { useState, useEffect } from 'react';
import CommissionGamePage from './visitorCommission/CommissionGamePage';
import Modal from '../components/Modal';
import { getRarityColor, getVisitorById, COMMISSION_EVALUATION_CRITERIA, CURRENCY_INFO, CURRENCY_TYPES, getAffectionLevel } from '../data/gameData';

const PAGE_VIEWS = {
  VISITOR_LIST: 'visitor-list',
  VISITOR_DETAIL: 'visitor-detail',
  COMMISSION_GAME: 'commission-game',
  STORY_VIEW: 'story-view'
};

const DETAIL_TABS = {
  COMMISSIONS: 'commissions',
  STORY: 'story',
  INFO: 'info'
};

const VisitorCommissionPage = ({ visitorCommission, onBack, skinTheme }) => {
  const [currentView, setCurrentView] = useState(PAGE_VIEWS.VISITOR_LIST);
  const [selectedVisitorId, setSelectedVisitorId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState(DETAIL_TABS.COMMISSIONS);
  const [activeCommission, setActiveCommission] = useState(null);
  const [activeCommissionConfig, setActiveCommissionConfig] = useState(null);
  const [viewingStory, setViewingStory] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastCommissionResult, setLastCommissionResult] = useState(null);
  const [greetingDialogue, setGreetingDialogue] = useState(null);
  const [showNewVisitorModal, setShowNewVisitorModal] = useState(false);

  const stats = visitorCommission.getOverallStats();
  const metVisitors = visitorCommission.getMetVisitorsWithStatus();
  const selectedVisitor = selectedVisitorId ? getVisitorById(selectedVisitorId) : null;
  const visitorCommissions = selectedVisitorId ? visitorCommission.getVisitorCommissionsWithStatus(selectedVisitorId) : [];
  const visitorStories = selectedVisitorId ? visitorCommission.getVisitorStoriesWithStatus(selectedVisitorId) : [];
  const selectedVisitorStatus = metVisitors.find(v => v.id === selectedVisitorId);

  useEffect(() => {
    if (visitorCommission.newVisitorNotification && !showNewVisitorModal) {
      setShowNewVisitorModal(true);
    }
  }, [visitorCommission.newVisitorNotification]);

  useEffect(() => {
    if (visitorCommission.activeCommissionResult && !showResultModal) {
      setLastCommissionResult(visitorCommission.activeCommissionResult);
      setShowResultModal(true);
    }
  }, [visitorCommission.activeCommissionResult]);

  const handleSelectVisitor = (visitorId) => {
    setSelectedVisitorId(visitorId);
    setActiveDetailTab(DETAIL_TABS.COMMISSIONS);
    setCurrentView(PAGE_VIEWS.VISITOR_DETAIL);
    const dialogue = visitorCommission.getGreetingDialogue(visitorId);
    setGreetingDialogue(dialogue);
    visitorCommission.selectVisitor(visitorId);
  };

  const handleBackToVisitorList = () => {
    setCurrentView(PAGE_VIEWS.VISITOR_LIST);
    setSelectedVisitorId(null);
    setGreetingDialogue(null);
  };

  const handleStartCommission = (commission) => {
    const config = visitorCommission.startCommission(commission.id);
    if (config) {
      setActiveCommission(commission);
      setActiveCommissionConfig(config);
      setCurrentView(PAGE_VIEWS.COMMISSION_GAME);
    }
  };

  const handleCommissionComplete = (result) => {
    visitorCommission.completeCommission(activeCommission.id, result);
    setActiveCommission(null);
    setActiveCommissionConfig(null);
  };

  const handleCommissionBack = () => {
    setActiveCommission(null);
    setActiveCommissionConfig(null);
    setCurrentView(PAGE_VIEWS.VISITOR_DETAIL);
  };

  const handleViewStory = (story) => {
    if (!story.isUnlocked) {
      if (story.canUnlock) {
        visitorCommission.unlockStoryChapter(selectedVisitorId, story.chapter);
      }
      return;
    }
    setViewingStory(story);
    setCurrentView(PAGE_VIEWS.STORY_VIEW);
  };

  const handleCloseStoryView = () => {
    setViewingStory(null);
    setCurrentView(PAGE_VIEWS.VISITOR_DETAIL);
  };

  const handleCloseResultModal = () => {
    const hasNewStory = lastCommissionResult?.unlockedStories?.length > 0;
    setShowResultModal(false);
    setLastCommissionResult(null);
    visitorCommission.clearActiveCommissionResult();
    setActiveCommission(null);
    setActiveCommissionConfig(null);
    setCurrentView(PAGE_VIEWS.VISITOR_DETAIL);
    setActiveDetailTab(hasNewStory ? DETAIL_TABS.STORY : DETAIL_TABS.INFO);
  };

  const handleCloseNewVisitorModal = () => {
    setShowNewVisitorModal(false);
    visitorCommission.clearNewVisitorNotification();
  };

  const renderVisitorList = () => (
    <div className="relative z-10 min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-star-gold/20 bg-star-dark/50 backdrop-blur-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <span className="text-xl">←</span>
          <span>返回</span>
        </button>
        <h1 className="text-xl font-bold text-star-gold glow-text">
          🏛️ 访客委托
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">
            {stats.metCount}/{stats.totalVisitors}人
          </span>
        </div>
      </div>

      <div className="px-4 py-4 bg-gradient-to-b from-star-purple/20 to-transparent">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard label="已相遇访客" value={`${stats.metCount}/${stats.totalVisitors}`} progress={stats.visitorProgress} color="#8b5cf6" icon="👥" />
          <StatCard label="完成委托" value={`${stats.completedCount}/${stats.totalCommissions}`} progress={stats.commissionProgress} color="#f59e0b" icon="📋" />
          <StatCard label="解锁剧情" value={`${stats.unlockedStoriesCount}/${stats.totalStories}`} progress={stats.storyProgress} color="#ec4899" icon="📖" />
          <StatCard label="累计星数" value={`${stats.totalStarsEarned}/${stats.maxPossibleStars}`} progress={stats.starProgress} color="#10b981" icon="⭐" />
        </div>

        {stats.maxAffectionVisitor && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{stats.maxAffectionVisitor.visitor.avatar}</span>
              <div className="flex-1">
                <div className="text-xs text-white/60">最亲密访客</div>
                <div className="font-bold" style={{ color: stats.maxAffectionVisitor.visitor.color }}>
                  {stats.maxAffectionVisitor.visitor.name} · {getAffectionLevel(stats.maxAffectionVisitor.points).name}
                </div>
                <div className="text-xs text-pink-300">
                  好感度: {stats.maxAffectionVisitor.points}点
                </div>
              </div>
              <span className="text-2xl">💕</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>🌟</span> 已相遇的访客
        </h3>

        {metVisitors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-50">🔮</div>
            <p className="text-white/50 mb-2">暂无访客</p>
            <p className="text-sm text-white/30">继续游戏，解锁更多关卡后会有访客来访哦~</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metVisitors.map(visitor => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                onClick={() => handleSelectVisitor(visitor.id)}
              />
            ))}
          </div>
        )}

        {stats.metCount < stats.totalVisitors && (
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold text-white/70 mb-2">🔒 未解锁访客 ({stats.totalVisitors - stats.metCount}人)</h4>
            <p className="text-xs text-white/40">
              完成更多关卡、收集星星碎片、提升游戏成就来解锁更多神秘访客吧！
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderVisitorDetail = () => {
    if (!selectedVisitor || !selectedVisitorStatus) return null;

    return (
      <div className="relative z-10 min-h-screen flex flex-col" style={{ background: `linear-gradient(180deg, ${selectedVisitor.bgColor}30 0%, transparent 30%)` }}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-star-dark/50 backdrop-blur-sm">
          <button
            onClick={handleBackToVisitorList}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span>
            <span>访客列表</span>
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: selectedVisitor.color }}>
            <span>{selectedVisitor.avatar}</span>
            <span>{selectedVisitor.name}</span>
          </h1>
          <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${getRarityColor(selectedVisitor.rarity)}30`, color: getRarityColor(selectedVisitor.rarity) }}>
            {selectedVisitor.rarity === 'common' ? '普通' : selectedVisitor.rarity === 'rare' ? '稀有' : selectedVisitor.rarity === 'epic' ? '史诗' : '传说'}
          </div>
        </div>

        <div className="px-4 py-4">
          <div
            className="p-4 rounded-xl mb-4"
            style={{
              background: `linear-gradient(135deg, ${selectedVisitor.bgColor}40 0%, ${selectedVisitor.bgColor}20 100%)`,
              border: `1px solid ${selectedVisitor.color}30`
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="text-6xl w-20 h-20 flex items-center justify-center rounded-2xl flex-shrink-0"
                style={{
                  background: `radial-gradient(circle, ${selectedVisitor.color}30 0%, transparent 70%)`,
                  filter: `drop-shadow(0 0 15px ${selectedVisitor.color}50)`
                }}
              >
                {selectedVisitor.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <span className="font-bold text-lg" style={{ color: selectedVisitor.color }}>{selectedVisitor.name}</span>
                  <span className="text-sm text-white/60 ml-2">· {selectedVisitor.title}</span>
                </div>
                <div className="text-xs text-white/50 mb-3">「{selectedVisitor.personality}」</div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{selectedVisitorStatus.affectionLevel.icon}</span>
                  <span className="font-bold text-sm" style={{ color: selectedVisitor.color }}>
                    Lv.{selectedVisitorStatus.affectionLevel.level} {selectedVisitorStatus.affectionLevel.name}
                  </span>
                  <span className="text-xs text-white/40">
                    {selectedVisitorStatus.affectionPoints}{selectedVisitorStatus.nextLevel ? `/${selectedVisitorStatus.nextLevel.minPoints}` : ''}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedVisitorStatus.affectionProgress}%`,
                      background: `linear-gradient(90deg, ${selectedVisitor.color}, ${selectedVisitor.color}80)`
                    }}
                  />
                </div>

                {greetingDialogue && (
                  <div
                    className="p-3 rounded-lg text-sm italic"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderLeft: `3px solid ${selectedVisitor.color}`
                    }}
                  >
                    {greetingDialogue}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <MiniStat label="委托" value={`${selectedVisitorStatus.completedCommissions}/${selectedVisitorStatus.totalCommissions}`} icon="📋" />
            <MiniStat label="剧情" value={`${selectedVisitorStatus.unlockedStories}/${selectedVisitorStatus.totalStories}`} icon="📖" />
            <MiniStat label="元素" value={selectedVisitor.element} icon="✨" />
          </div>
        </div>

        <div className="flex gap-1 px-4 py-2 bg-star-purple/20 overflow-x-auto">
          {[
            { id: DETAIL_TABS.COMMISSIONS, name: '委托任务', icon: '📋' },
            { id: DETAIL_TABS.STORY, name: '故事线', icon: '📖' },
            { id: DETAIL_TABS.INFO, name: '个人档案', icon: '📄' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDetailTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${activeDetailTab === tab.id
                  ? 'text-star-dark shadow-lg'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }
              `}
              style={activeDetailTab === tab.id ? { backgroundColor: selectedVisitor.color, boxShadow: `0 0 15px ${selectedVisitor.color}50` } : {}}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {activeDetailTab === DETAIL_TABS.COMMISSIONS && (
            <div className="space-y-3">
              {visitorCommissions.length === 0 ? (
                <div className="text-center py-8 text-white/40">暂无委托</div>
              ) : (
                visitorCommissions.map(commission => (
                  <CommissionCard
                    key={commission.id}
                    commission={commission}
                    visitorColor={selectedVisitor.color}
                    onStart={() => handleStartCommission(commission)}
                  />
                ))
              )}
            </div>
          )}

          {activeDetailTab === DETAIL_TABS.STORY && (
            <div className="space-y-3">
              {visitorStories.length === 0 ? (
                <div className="text-center py-8 text-white/40">暂无故事章节</div>
              ) : (
                visitorStories.map(story => (
                  <StoryCard
                    key={story.chapter}
                    story={story}
                    visitorColor={selectedVisitor.color}
                    onView={() => handleViewStory(story)}
                  />
                ))
              )}
            </div>
          )}

          {activeDetailTab === DETAIL_TABS.INFO && (
            <div className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${selectedVisitor.bgColor}20`, border: `1px solid ${selectedVisitor.color}20` }}
              >
                <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: selectedVisitor.color }}>
                  <span>📜</span> 背景故事
                </h4>
                <p className="text-sm text-white/80 leading-relaxed">{selectedVisitor.backstory}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoCard title="喜欢的事物" items={selectedVisitor.likes} icon="💕" color="#ec4899" />
                <InfoCard title="讨厌的事物" items={selectedVisitor.dislikes} icon="💔" color="#ef4444" />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="font-bold mb-3 text-white/80 flex items-center gap-2">
                  <span>🎁</span> 好感度奖励
                </h4>
                <div className="space-y-2">
                  {(() => {
                    const currentLevel = selectedVisitorStatus.affectionLevel.level;
                    return [
                      { level: 1, name: '认识', icon: '🤝', reward: '解锁基础对话' },
                      { level: 2, name: '熟人', icon: '😊', reward: '解锁个人背景故事' },
                      { level: 3, name: '朋友', icon: '👫', reward: '解锁更多委托' },
                      { level: 4, name: '好友', icon: '💝', reward: '解锁特殊支线剧情' },
                      { level: 5, name: '挚友', icon: '💎', reward: '解锁专属纪念品' },
                      { level: 6, name: '羁绊', icon: '🌟', reward: '解锁隐藏结局' },
                      { level: 7, name: '命中注定', icon: '💫', reward: '解锁完美结局' }
                    ].map(item => (
                      <div
                        key={item.level}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                          currentLevel >= item.level
                            ? 'bg-gradient-to-r from-green-500/20 to-transparent border border-green-500/30'
                            : 'bg-white/5 opacity-60'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white/90">Lv.{item.level} {item.name}</div>
                          <div className="text-xs text-white/50">{item.reward}</div>
                        </div>
                        {currentLevel >= item.level && <span className="text-green-400 text-sm">✓</span>}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCommissionGame = () => {
    if (!activeCommissionConfig || !selectedVisitor) return null;
    return (
      <CommissionGamePage
        commission={activeCommissionConfig}
        visitor={selectedVisitor}
        skinTheme={skinTheme}
        onBack={handleCommissionBack}
        onComplete={handleCommissionComplete}
      />
    );
  };

  const renderStoryView = () => {
    if (!viewingStory || !selectedVisitor) return null;
    return (
      <div className="relative z-10 min-h-screen flex flex-col" style={{ background: `linear-gradient(180deg, ${selectedVisitor.bgColor}40 0%, transparent 40%)` }}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-star-dark/50 backdrop-blur-sm">
          <button
            onClick={handleCloseStoryView}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xl">←</span>
            <span>返回</span>
          </button>
          <h1 className="text-lg font-bold" style={{ color: selectedVisitor.color }}>
            第{viewingStory.chapter}章 · {viewingStory.title}
          </h1>
          <div className="w-16" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div
            className="max-w-2xl mx-auto p-6 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${selectedVisitor.bgColor}40 0%, ${selectedVisitor.bgColor}20 100%)`,
              border: `1px solid ${selectedVisitor.color}30`
            }}
          >
            <div className="text-6xl text-center mb-6">{selectedVisitor.avatar}</div>
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: selectedVisitor.color }}>
              {viewingStory.title}
            </h2>
            <div className="space-y-4">
              {viewingStory.content.split('\\n').map((paragraph, idx) => (
                <p key={idx} className="text-white/90 leading-relaxed text-center">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 text-center">
              <span className="text-xs text-white/40">—— 访客故事线 · 第{viewingStory.chapter}章 ——</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResultModal = () => {
    if (!lastCommissionResult) return null;
    const resultVisitor = getVisitorById(lastCommissionResult.visitorId);
    if (!resultVisitor) return null;

    return (
      <Modal
        isOpen={showResultModal}
        onClose={handleCloseResultModal}
        title="✨ 委托完成 ✨"
        showCloseButton={false}
      >
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: `linear-gradient(135deg, ${resultVisitor.bgColor}40 0%, ${resultVisitor.bgColor}20 100%)`,
              border: `1px solid ${resultVisitor.color}30`
            }}
          >
            <div className="text-5xl mb-2">{resultVisitor.avatar}</div>
            <div className="font-bold text-lg" style={{ color: resultVisitor.color }}>{resultVisitor.name}</div>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < lastCommissionResult.stars ? 'opacity-100' : 'opacity-20'}>
                  ⭐
                </span>
              ))}
            </div>
            <div className="text-sm text-white/60">
              {COMMISSION_EVALUATION_CRITERIA.stars[lastCommissionResult.stars].label}评价
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultItem label="最终得分" value={lastCommissionResult.score.toLocaleString()} color="#fbbf24" />
            <ResultItem label="剩余时间" value={`${lastCommissionResult.timeLeft}s`} color="#06b6d4" />
            <ResultItem label="使用步数" value={`${lastCommissionResult.moves}步`} color="#8b5cf6" />
            <ResultItem label="最高连击" value={`${lastCommissionResult.maxCombo}x`} color="#ec4899" />
          </div>

          {lastCommissionResult.hasBonus && (
            <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-center">
              <span className="text-purple-300 text-sm font-bold">🎁 额外奖励条件达成！</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-bold text-white/80 mb-3">📦 获得奖励</h4>
            <div className="space-y-2">
              {lastCommissionResult.earnedAffection > 0 && (
                <RewardItem
                  icon="💕"
                  label={`好感度 +${lastCommissionResult.earnedAffection}`}
                  color="#ec4899"
                />
              )}
              {lastCommissionResult.earnedStardust > 0 && (
                <RewardItem
                  icon={CURRENCY_INFO[CURRENCY_TYPES.STARDUST]?.icon || '✨'}
                  label={`星尘 +${lastCommissionResult.earnedStardust}`}
                  color={CURRENCY_INFO[CURRENCY_TYPES.STARDUST]?.color || '#60a5fa'}
                />
              )}
              {lastCommissionResult.earnedStarShards > 0 && (
                <RewardItem
                  icon={CURRENCY_INFO[CURRENCY_TYPES.STAR_SHARD]?.icon || '💎'}
                  label={`星光碎片 +${lastCommissionResult.earnedStarShards}`}
                  color={CURRENCY_INFO[CURRENCY_TYPES.STAR_SHARD]?.color || '#a78bfa'}
                />
              )}
              {lastCommissionResult.affectionResult?.leveledUp && (
                <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-500/50 text-center">
                  <span className="text-pink-200 text-sm font-bold">
                    🎉 好感度提升！Lv.{lastCommissionResult.affectionResult.oldLevel} → Lv.{lastCommissionResult.affectionResult.newLevel}
                  </span>
                </div>
              )}
              {lastCommissionResult.unlockedStories.length > 0 && (
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-500/50 text-center">
                  <span className="text-amber-200 text-sm font-bold">
                    📖 解锁新故事章节！
                  </span>
                </div>
              )}
            </div>
          </div>

          {lastCommissionResult.dialogue && (
            <div
              className="p-3 rounded-lg italic"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderLeft: `3px solid ${resultVisitor.color}`
              }}
            >
              <div className="text-xs text-white/40 mb-1">{resultVisitor.name}说：</div>
              <p className="text-sm text-white/80">{lastCommissionResult.dialogue}</p>
            </div>
          )}

          {lastCommissionResult.newRecord && (
            <div className="text-center text-sm text-yellow-400">
              🏆 新纪录！
            </div>
          )}

          <button
            onClick={handleCloseResultModal}
            className="w-full btn-star"
          >
            太好了！
          </button>
        </div>
      </Modal>
    );
  };

  const renderNewVisitorModal = () => {
    if (!visitorCommission.newVisitorNotification) return null;
    const visitor = visitorCommission.newVisitorNotification;

    return (
      <Modal
        isOpen={showNewVisitorModal}
        onClose={handleCloseNewVisitorModal}
        title="🌟 新访客到访 🌟"
        showCloseButton={false}
      >
        <div className="space-y-4 text-center">
          <div
            className="text-7xl py-4 animate-bounce"
            style={{ filter: `drop-shadow(0 0 20px ${visitor.color}60)` }}
          >
            {visitor.avatar}
          </div>

          <div>
            <div className="text-2xl font-bold mb-1" style={{ color: visitor.color }}>{visitor.name}</div>
            <div className="text-sm text-white/60">{visitor.title}</div>
          </div>

          <div
            className="p-4 rounded-xl text-left"
            style={{
              backgroundColor: `${visitor.bgColor}20`,
              border: `1px solid ${visitor.color}30`
            }}
          >
            <p className="text-sm text-white/80 leading-relaxed italic">
              {visitor.backstory}
            </p>
          </div>

          <div className="text-xs text-white/40">
            稀有度: <span style={{ color: getRarityColor(visitor.rarity) }}>
              {visitor.rarity === 'common' ? '普通' : visitor.rarity === 'rare' ? '稀有' : visitor.rarity === 'epic' ? '史诗' : '传说'}
            </span>
          </div>

          <button
            onClick={handleCloseNewVisitorModal}
            className="w-full btn-star"
          >
            欢迎来访！
          </button>
        </div>
      </Modal>
    );
  };

  return (
    <>
      {currentView === PAGE_VIEWS.VISITOR_LIST && renderVisitorList()}
      {currentView === PAGE_VIEWS.VISITOR_DETAIL && renderVisitorDetail()}
      {currentView === PAGE_VIEWS.COMMISSION_GAME && renderCommissionGame()}
      {currentView === PAGE_VIEWS.STORY_VIEW && renderStoryView()}
      {renderResultModal()}
      {renderNewVisitorModal()}
    </>
  );
};

const StatCard = ({ label, value, progress, color, icon }) => (
  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-2 mb-2">
      <span>{icon}</span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
    <div className="font-bold text-white text-sm mb-1">{value}</div>
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, progress)}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const MiniStat = ({ label, value, icon }) => (
  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
    <div className="text-lg mb-1">{icon}</div>
    <div className="text-xs text-white/60">{label}</div>
    <div className="text-sm font-bold text-white">{value}</div>
  </div>
);

const VisitorCard = ({ visitor, onClick }) => {
  const hasNewCommission = visitor.isAvailable;
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: `linear-gradient(135deg, ${visitor.bgColor}40 0%, ${visitor.bgColor}15 100%)`,
        border: `1px solid ${visitor.color}40`
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="text-4xl w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: `${visitor.color}20` }}
        >
          {visitor.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-bold" style={{ color: visitor.color }}>{visitor.name}</span>
              <span className="text-xs text-white/50 ml-2">· {visitor.title}</span>
            </div>
            {hasNewCommission && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white animate-pulse">
                NEW
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs">{visitor.affectionLevel.icon}</span>
            <span className="text-xs font-medium" style={{ color: visitor.color }}>
              Lv.{visitor.affectionLevel.level} {visitor.affectionLevel.name}
            </span>
          </div>

          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${visitor.affectionProgress}%`,
                backgroundColor: visitor.color
              }}
            />
          </div>

          <div className="flex gap-4 text-xs text-white/50">
            <span>📋 {visitor.completedCommissions}/{visitor.totalCommissions}</span>
            <span>📖 {visitor.unlockedStories}/{visitor.totalStories}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

const CommissionCard = ({ commission, visitorColor, onStart }) => (
  <div
    className={`p-4 rounded-xl border transition-all ${
      !commission.isAvailable
        ? 'bg-gray-800/30 border-gray-600/30 opacity-60'
        : commission.isCompleted
          ? 'bg-green-900/20 border-green-500/30'
          : 'bg-white/5 border-white/10 hover:border-white/30'
    }`}
  >
    <div className="flex items-start gap-3 mb-3">
      <div
        className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: `${visitorColor}20` }}
      >
        {commission.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-white">{commission.title}</h4>
          {commission.priority === 'legendary' && <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/30 text-yellow-300">传说</span>}
          {commission.priority === 'important' && <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">重要</span>}
          {commission.isNew && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white animate-pulse">NEW</span>}
          {commission.isCompleted && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/30 text-green-300">已完成</span>}
        </div>
        <p className="text-sm text-white/60 mb-2">{commission.description}</p>
        <div className="flex gap-3 text-xs text-white/40">
          <span>🃏 {commission.pairs}对</span>
          <span>⏱️ {commission.timeLimit}秒</span>
          {commission.stars > 0 && (
            <span className="text-star-gold">
              {Array.from({ length: commission.stars }).map((_, i) => '⭐').join('')}
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex gap-2 flex-wrap">
        {commission.rewards.slice(0, 2).map((reward, idx) => (
          <span
            key={idx}
            className="text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: reward.type === 'affection' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              color: reward.type === 'affection' ? '#f472b6' : '#60a5fa'
            }}
          >
            {reward.type === 'affection' ? '💕' : reward.type === 'stardust' ? '✨' : '💎'} +{reward.value}
            {reward.condition === 'bonus' && <span className="ml-1 text-white/50">(奖励)</span>}
          </span>
        ))}
      </div>

      {!commission.isAvailable ? (
        <div className="text-xs text-white/40 flex items-center gap-1">
          <span>🔒</span>
          <span>好感度不足</span>
        </div>
      ) : (
        <button
          onClick={onStart}
          className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: commission.isCompleted ? `${visitorColor}30` : visitorColor,
            color: commission.isCompleted ? visitorColor : '#1a1a2e'
          }}
        >
          {commission.isCompleted ? '再来一次' : '接受委托'}
        </button>
      )}
    </div>
  </div>
);

const StoryCard = ({ story, visitorColor, onView }) => (
  <button
    onClick={onView}
    disabled={!story.isUnlocked && !story.canUnlock}
    className={`w-full p-4 rounded-xl text-left transition-all ${
      story.isUnlocked
        ? 'bg-white/5 border border-white/10 hover:border-white/30'
        : story.canUnlock
          ? 'bg-amber-900/20 border border-amber-500/30 hover:bg-amber-900/30'
          : 'bg-gray-800/30 border-gray-600/20 opacity-60 cursor-not-allowed'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl text-lg font-bold"
          style={{
            backgroundColor: story.isUnlocked ? `${visitorColor}20` : 'rgba(255,255,255,0.05)',
            color: story.isUnlocked ? visitorColor : 'rgba(255,255,255,0.3)'
          }}
        >
          {story.chapter}
        </div>
        <div>
          <div className="font-bold text-white">第{story.chapter}章 · {story.title}</div>
          <div className="text-xs text-white/50 mt-0.5">
            {story.isUnlocked
              ? '已解锁，点击阅读'
              : story.canUnlock
                ? '🔓 点击解锁'
                : `🔒 完成前置委托解锁`
            }
          </div>
        </div>
      </div>
      <span className="text-2xl">
        {story.isUnlocked ? '📖' : story.canUnlock ? '🔓' : '🔒'}
      </span>
    </div>
  </button>
);

const InfoCard = ({ title, items, icon, color }) => (
  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
    <h5 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color }}>
      <span>{icon}</span>
      {title}
    </h5>
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color: `${color}cc` }}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const ResultItem = ({ label, value, color }) => (
  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
    <div className="text-xs text-white/50 mb-1">{label}</div>
    <div className="font-bold" style={{ color }}>{value}</div>
  </div>
);

const RewardItem = ({ icon, label, color }) => (
  <div className="flex items-center gap-3 p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-medium" style={{ color }}>{label}</span>
  </div>
);

export default VisitorCommissionPage;
