import { useState } from 'react';
import { RARITY_INFO } from '../../data/gameData';
import Modal from '../../components/Modal';

const BG_STYLE_MAP = {
  'common': 'from-gray-800/40 to-gray-900/40',
  'rare': 'from-blue-900/40 to-indigo-900/40',
  'epic': 'from-purple-900/40 to-pink-900/40',
  'legendary': 'from-amber-900/40 to-orange-900/40'
};

const HiddenSentences = ({ repairRoom }) => {
  const [selectedSentence, setSelectedSentence] = useState(null);
  const sentences = repairRoom.getHiddenSentencesWithStatus();
  const stats = repairRoom.getStats();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">💝</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          隐藏情话
        </h2>
        <p className="text-white/60 text-sm mb-6">
          修复完整情书后，解锁藏在字里行间的深情话语
        </p>

        <div className="inline-flex items-center gap-4 px-6 py-3 bg-star-purple/30 rounded-full border border-star-gold/30">
          <div className="text-center">
            <div className="text-star-pink font-bold text-lg">
              {stats.unlockedSentences}/{stats.totalSentences}
            </div>
            <div className="text-xs text-white/60">已解锁</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-star-gold font-bold text-lg">
              {stats.sentenceProgress}%
            </div>
            <div className="text-xs text-white/60">收集进度</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sentences.map((sentence, index) => {
          const rarity = RARITY_INFO[sentence.rarity];
          const bgClass = BG_STYLE_MAP[sentence.rarity] || BG_STYLE_MAP.common;

          return (
            <div
              key={sentence.id}
              onClick={() => sentence.isUnlocked && setSelectedSentence(sentence)}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300 overflow-hidden
                ${sentence.isUnlocked
                  ? `bg-gradient-to-br ${bgClass} cursor-pointer hover:scale-[1.02] hover:shadow-lg`
                  : 'bg-gray-800/30 border-gray-700/30 opacity-60 cursor-not-allowed'
                }
              `}
              style={{
                borderColor: sentence.isUnlocked ? `${rarity.color}40` : 'rgba(75, 85, 99, 0.3)',
                boxShadow: sentence.isUnlocked ? `0 0 20px ${rarity.color}15` : 'none',
                animationDelay: `${index * 0.05}s`
              }}
            >
              {sentence.isUnlocked ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{sentence.icon}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: `${rarity.color}20`,
                        color: rarity.color,
                        border: `1px solid ${rarity.color}40`
                      }}
                    >
                      {rarity.name}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm italic leading-relaxed mb-3">
                    "{sentence.text}"
                  </p>
                  <p className="text-white/40 text-xs">
                    —— {sentence.author}
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-gray-400 text-sm mb-2">未解锁</p>
                  <p className="text-gray-500 text-xs">{sentence.unlockHint}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20">
        <h3 className="text-star-pink font-bold mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>解锁提示</span>
        </h3>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• 每修复完一章情书，自动解锁一句隐藏情话</li>
          <li>• 集齐全部5句基础隐藏句后，解锁最终神秘情话</li>
          <li>• 隐藏情话来自星塔占卜师的内心独白</li>
        </ul>
      </div>

      <Modal
        isOpen={!!selectedSentence}
        onClose={() => setSelectedSentence(null)}
        title={`${selectedSentence?.icon || ''} ${selectedSentence?.author || ''}`}
      >
        {selectedSentence && (
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${RARITY_INFO[selectedSentence.rarity].color}20`,
                  color: RARITY_INFO[selectedSentence.rarity].color,
                  border: `1px solid ${RARITY_INFO[selectedSentence.rarity].color}40`
                }}
              >
                {RARITY_INFO[selectedSentence.rarity].name}
              </span>
            </div>

            <div className="letter-fragment p-8 mb-6">
              <p className="text-amber-900 italic leading-loose text-lg">
                "{selectedSentence.text}"
              </p>
              <p className="text-amber-700/60 text-sm mt-4">
                —— {selectedSentence.author}
              </p>
            </div>

            <p className="text-white/40 text-xs">
              {selectedSentence.unlockHint}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HiddenSentences;
