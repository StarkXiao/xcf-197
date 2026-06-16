import { useState } from 'react';
import { RARITY_INFO, getStarById } from '../../data/gameData';
import Modal from '../../components/Modal';

const FragmentRepair = ({ repairRoom, archive }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const chapters = repairRoom.getAllChaptersStatus();
  const stats = repairRoom.getStats();

  const handleRepair = (chapterId, fragmentId) => {
    const success = repairRoom.repairFragment(chapterId, fragmentId);
    if (success) {
      const chapter = repairRoom.getChapterRepairStatus(chapterId);
      if (chapter?.isComplete) {
        setTimeout(() => setShowRewardModal(true), 300);
      }
    }
  };

  const renderStarRequirement = (requiredStars) => {
    return (
      <div className="flex gap-1 flex-wrap">
        {requiredStars.map((starId, idx) => {
          const star = getStarById(starId);
          const hasStar = archive?.collectedFragments?.includes(starId);
          return (
            <span
              key={idx}
              className={`text-sm ${hasStar ? '' : 'opacity-30 grayscale'}`}
              title={star?.name}
            >
              {star?.symbol || '⭐'}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">🔧</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          碎片修复
        </h2>
        <p className="text-white/60 text-sm mb-6">
          收集星星碎片，逐字逐句修复尘封的情书
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
          <div className="bg-star-purple/30 rounded-xl p-3 border border-star-gold/20">
            <div className="text-star-gold text-xl font-bold">
              {stats.repairedFragments}/{stats.totalFragments}
            </div>
            <div className="text-white/50 text-xs">碎片修复</div>
          </div>
          <div className="bg-star-purple/30 rounded-xl p-3 border border-star-gold/20">
            <div className="text-star-cyan text-xl font-bold">
              {stats.completedChapters}/{stats.totalChapters}
            </div>
            <div className="text-white/50 text-xs">章节完成</div>
          </div>
          <div className="bg-star-purple/30 rounded-xl p-3 border border-star-gold/20">
            <div className="text-star-pink text-xl font-bold">
              {stats.overallProgress}%
            </div>
            <div className="text-white/50 text-xs">总进度</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => {
          const rarity = RARITY_INFO[chapter.rarity];
          const isAvailable = repairRoom.isChapterAvailable(chapter);

          return (
            <div
              key={chapter.id}
              onClick={() => isAvailable && setSelectedChapter(chapter)}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden
                ${isAvailable
                  ? 'cursor-pointer hover:scale-[1.02]'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
              style={{
                borderColor: isAvailable ? `${rarity.color}50` : 'rgba(75, 85, 99, 0.3)',
                background: isAvailable
                  ? `linear-gradient(135deg, ${rarity.color}10 0%, ${rarity.color}05 100%)`
                  : 'rgba(31, 41, 55, 0.3)'
              }}
            >
              {isAvailable && (
                <div className={`absolute inset-0 bg-gradient-to-r ${chapter.background} opacity-30`} />
              )}
              
              <div className="relative flex items-start gap-4">
                <div className="text-4xl">{chapter.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="font-bold"
                      style={{ color: isAvailable ? rarity.color : '#6b7280' }}
                    >
                      {chapter.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${rarity.color}20`,
                        color: rarity.color,
                        border: `1px solid ${rarity.color}40`
                      }}
                    >
                      {rarity.name}
                    </span>
                    {chapter.isComplete && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                        ✓ 已修复
                      </span>
                    )}
                    {chapter.isSentenceUnlocked && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/40">
                        💝 隐藏句
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm mb-3">{chapter.description}</p>

                  <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-1">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${chapter.progress}%`,
                        background: `linear-gradient(90deg, ${rarity.color}, ${rarity.color}cc)`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">
                      {chapter.repairedCount}/{chapter.totalFragments} 碎片
                    </span>
                    <span style={{ color: rarity.color }}>
                      {chapter.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="text-white/50 text-xs">通关第 {chapter.chapter} 章解锁</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!selectedChapter}
        onClose={() => setSelectedChapter(null)}
        title={`${selectedChapter?.icon || ''} ${selectedChapter?.name || ''}`}
      >
        {selectedChapter && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${RARITY_INFO[selectedChapter.rarity].color}20`,
                  color: RARITY_INFO[selectedChapter.rarity].color,
                  border: `1px solid ${RARITY_INFO[selectedChapter.rarity].color}40`
                }}
              >
                {RARITY_INFO[selectedChapter.rarity].name}
              </span>
            </div>

            {selectedChapter.isComplete ? (
              <div className="space-y-4 mb-6">
                <div className="letter-fragment p-6">
                  <div className="text-center text-xs text-amber-700/60 mb-4">
                    ✨ 情书已修复完整 ✨
                  </div>
                  <div className="text-center text-amber-900 leading-relaxed whitespace-pre-line">
                    {selectedChapter.fragments
                      .sort((a, b) => a.position - b.position)
                      .map(f => f.text)
                      .join('')}
                  </div>
                </div>

                {selectedChapter.isSentenceUnlocked && selectedChapter.hiddenSentence && (
                  <div className="p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-500/40">
                    <div className="text-center text-xs text-pink-300 mb-2">
                      💝 解锁隐藏句 💝
                    </div>
                    <p className="text-center text-white/90 italic text-sm">
                      "{selectedChapter.hiddenSentence.text}"
                    </p>
                    <p className="text-center text-xs text-pink-300/70 mt-2">
                      —— {selectedChapter.hiddenSentence.author}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="text-white/50 text-sm text-center mb-4">
                  点击碎片进行修复，按顺序复原情书
                </p>
                {selectedChapter.fragments
                  .sort((a, b) => a.position - b.position)
                  .map((fragment, index) => (
                    <div
                      key={fragment.id}
                      className={`p-4 rounded-xl border-2 transition-all
                        ${fragment.isRepaired
                          ? 'border-green-500/50 bg-green-500/10'
                          : fragment.isUnlocked
                            ? 'border-star-gold/30 bg-star-purple/30 cursor-pointer hover:border-star-gold hover:bg-star-purple/50 hover:scale-[1.01]'
                            : 'border-gray-700/30 bg-gray-800/30 opacity-60'
                        }
                      `}
                      onClick={() => fragment.isUnlocked && !fragment.isRepaired && handleRepair(selectedChapter.id, fragment.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                          ${fragment.isRepaired
                            ? 'bg-green-500 text-white'
                            : fragment.isUnlocked
                              ? 'bg-star-gold/30 text-star-gold'
                              : 'bg-gray-700 text-gray-500'
                          }
                        `}>
                          {fragment.isRepaired ? '✓' : fragment.isUnlocked ? (index + 1) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          {fragment.isRepaired || fragment.isUnlocked ? (
                            <>
                              <p className={`text-sm italic ${fragment.isRepaired ? 'text-green-300' : 'text-white/80'}`}>
                                "{fragment.text}"
                              </p>
                              {!fragment.isRepaired && (
                                <div className="mt-2">
                                  <p className="text-xs text-white/40 mb-1">需要碎片:</p>
                                  {renderStarRequirement(fragment.requiredStars)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-500 italic mb-1">
                                ???
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/40">需要碎片:</span>
                                {renderStarRequirement(fragment.requiredStars)}
                              </div>
                              <p className="text-xs text-amber-400/60 mt-1">
                                💡 提示: {fragment.hint}
                              </p>
                            </div>
                          )}
                        </div>
                        {fragment.isUnlocked && !fragment.isRepaired && (
                          <span className="text-star-gold text-xs font-bold flex-shrink-0">
                            修复
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="text-white/40">
                进度 {selectedChapter.repairedCount}/{selectedChapter.totalFragments}
              </div>
              {selectedChapter.reward && (
                <div className="text-star-gold/70">
                  奖励: {selectedChapter.reward.type === 'stardust' && `✨ ${selectedChapter.reward.value} 星尘`}
                  {selectedChapter.reward.type === 'starShard' && `💎 ${selectedChapter.reward.value} 星光碎片`}
                  {selectedChapter.reward.type === 'title' && `🏆 专属称号`}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        title="🎉 章节修复完成！"
      >
        <div className="text-center py-6">
          <div className="text-6xl mb-4 animate-bounce">🎊</div>
          <h3 className="text-xl font-bold text-star-gold mb-2">恭喜修复完成！</h3>
          <p className="text-white/60 mb-4">隐藏情话已解锁</p>
          <button
            onClick={() => setShowRewardModal(false)}
            className="btn-star px-8 py-2"
          >
            太棒了！
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FragmentRepair;
