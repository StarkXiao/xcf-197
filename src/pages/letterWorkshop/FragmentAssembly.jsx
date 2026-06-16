import { useState } from 'react';
import { RARITY_INFO, getStarById } from '../../data/gameData';
import Modal from '../../components/Modal';

const FragmentAssembly = ({ workshop, archive }) => {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const lettersStatus = workshop.getAllLettersStatus();
  const stats = workshop.getWorkshopStats();

  const handleAssemble = (letterId, fragmentId) => {
    workshop.assembleFragment(letterId, fragmentId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">📝</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          碎片拼接
        </h2>
        <p className="text-white/60 text-sm mb-6">
          将已得碎片拼接成完整情书，解锁隐藏篇章
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
          <div className="bg-star-purple/30 rounded-xl p-3 border border-star-gold/20">
            <div className="text-star-gold text-xl font-bold">{stats.completedLetters}/{stats.totalLetters}</div>
            <div className="text-white/50 text-xs">完成情书</div>
          </div>
          <div className="bg-star-purple/30 rounded-xl p-3 border border-star-gold/20">
            <div className="text-star-gold text-xl font-bold">{stats.assembledFragments}/{stats.totalFragments}</div>
            <div className="text-white/50 text-xs">已拼碎片</div>
          </div>
          <div className="bg-star-purple/30 rounded-xl p-3 border border-star-gold/20">
            <div className="text-star-gold text-xl font-bold">{stats.letterProgress}%</div>
            <div className="text-white/50 text-xs">总进度</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {lettersStatus.map((letter) => {
          const rarity = RARITY_INFO[letter.rarity];
          const isAvailable = workshop.isLetterAvailable(letter);

          return (
            <div
              key={letter.id}
              onClick={() => isAvailable && setSelectedLetter(letter)}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300
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
              <div className="flex items-start gap-4">
                <div className="text-3xl">{letter.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-bold"
                      style={{ color: isAvailable ? rarity.color : '#6b7280' }}
                    >
                      {letter.name}
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
                    {letter.isComplete && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40">
                        已完成
                      </span>
                    )}
                  </div>
                  <p className="text-white/50 text-sm mb-3">{letter.description}</p>

                  <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden mb-1">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${letter.progress}%`,
                        background: `linear-gradient(90deg, ${rarity.color}, ${rarity.color}cc)`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">
                      {letter.assembledCount}/{letter.totalFragments} 碎片
                    </span>
                    <span style={{ color: rarity.color }}>
                      {letter.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {!isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🔒</div>
                    <div className="text-white/50 text-xs">{letter.unlockCondition}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!selectedLetter}
        onClose={() => setSelectedLetter(null)}
        title={`${selectedLetter?.icon || ''} ${selectedLetter?.name || ''}`}
      >
        {selectedLetter && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${RARITY_INFO[selectedLetter.rarity].color}20`,
                  color: RARITY_INFO[selectedLetter.rarity].color,
                  border: `1px solid ${RARITY_INFO[selectedLetter.rarity].color}40`
                }}
              >
                {RARITY_INFO[selectedLetter.rarity].name}
              </span>
            </div>

            {selectedLetter.isComplete ? (
              <div className="letter-fragment p-6 mb-6">
                <div className="text-center text-xs text-amber-700/60 mb-4">
                  ✨ 情书已完整 ✨
                </div>
                <p className="text-center text-amber-900 italic leading-relaxed">
                  "{selectedLetter.completeText}"
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {selectedLetter.fragments.map((fragment, index) => (
                  <div
                    key={fragment.id}
                    className={`p-4 rounded-xl border-2 transition-all
                      ${fragment.isAssembled
                        ? 'border-green-500/50 bg-green-500/10'
                        : fragment.isUnlocked
                          ? 'border-star-gold/30 bg-star-purple/30 cursor-pointer hover:border-star-gold hover:bg-star-purple/50'
                          : 'border-gray-700/30 bg-gray-800/30 opacity-50'
                      }
                    `}
                    onClick={() => fragment.isUnlocked && !fragment.isAssembled && handleAssemble(selectedLetter.id, fragment.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${fragment.isAssembled
                          ? 'bg-green-500 text-white'
                          : fragment.isUnlocked
                            ? 'bg-star-gold/30 text-star-gold'
                            : 'bg-gray-700 text-gray-500'
                        }
                      `}>
                        {fragment.isAssembled ? '✓' : fragment.isUnlocked ? (index + 1) : '?'}
                      </div>
                      <div className="flex-1">
                        {fragment.isAssembled || fragment.isUnlocked ? (
                          <>
                            <p className={`text-sm italic ${fragment.isAssembled ? 'text-green-300' : 'text-white/80'}`}>
                              "{fragment.text}"
                            </p>
                            {!fragment.isAssembled && (
                              <p className="text-xs text-white/40 mt-1">
                              <span className="mr-1">🔗</span>
                              来自「{getStarById(fragment.starId)?.name || '未知星座'}」碎片
                            </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            收集「{getStarById(fragment.starId)?.name || '未知星座'}」碎片解锁...
                          </p>
                        )}
                      </div>
                      {fragment.isUnlocked && !fragment.isAssembled && (
                        <span className="text-star-gold text-xs font-bold">拼接</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-white/40 text-sm">
                进度 {selectedLetter.assembledCount}/{selectedLetter.totalFragments}
              </div>
              <button
                onClick={() => workshop.toggleFavoriteLetter(selectedLetter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${workshop.favoriteLetters.includes(selectedLetter.id)
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                    : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                  }
                `}
              >
                {workshop.favoriteLetters.includes(selectedLetter.id) ? '❤️ 已收藏' : '🤍 收藏'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FragmentAssembly;
