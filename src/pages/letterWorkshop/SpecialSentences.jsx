import { useState } from 'react';
import { RARITY_INFO } from '../../data/gameData';
import Modal from '../../components/Modal';

const BG_STYLE_MAP = {
  stardust: 'from-indigo-900/40 to-blue-900/40',
  moonlight: 'from-indigo-800/40 to-purple-900/40',
  aurora: 'from-emerald-900/40 to-purple-900/40',
  galaxy: 'from-purple-900/40 to-pink-900/40',
  sunrise: 'from-amber-900/40 to-orange-900/40',
  nebula: 'from-pink-900/40 to-rose-900/40',
  eclipse: 'from-gray-900/40 to-stone-800/40'
};

const SpecialSentences = ({ workshop }) => {
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [filter, setFilter] = useState('all');

  const sentences = workshop.getUnlockedSentencesWithStatus();
  const stats = workshop.getWorkshopStats();

  const filteredSentences = filter === 'all'
    ? sentences
    : filter === 'unlocked'
      ? sentences.filter(s => s.isUnlocked)
      : filter === 'favorite'
        ? sentences.filter(s => s.isFavorite)
        : sentences;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">💬</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          特殊句段
        </h2>
        <p className="text-white/60 text-sm mb-4">
          解锁守护者们的深情独白，收集专属情话
        </p>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-star-purple/30 rounded-full border border-star-gold/30">
          <span className="text-star-gold font-bold text-lg">
            {stats.unlockedSentences}/{stats.totalSentences}
          </span>
          <span className="text-white/60 text-sm">句段已解锁</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', name: '全部', icon: '📋' },
          { id: 'unlocked', name: '已解锁', icon: '🔓' },
          { id: 'favorite', name: '已收藏', icon: '❤️' },
          { id: 'legendary', name: '传说', icon: '🌟' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${filter === tab.id
                ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredSentences.map((sentence) => {
          const rarity = RARITY_INFO[sentence.rarity];
          const bgClass = BG_STYLE_MAP[sentence.bgStyle] || BG_STYLE_MAP.stardust;

          return (
            <div
              key={sentence.id}
              onClick={() => sentence.isUnlocked && setSelectedSentence(sentence)}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300
                ${sentence.isUnlocked
                  ? `bg-gradient-to-br ${bgClass} cursor-pointer hover:scale-[1.02]`
                  : 'bg-gray-800/30 border-gray-700/30 opacity-50 cursor-not-allowed'
                }
              `}
              style={{
                borderColor: sentence.isUnlocked ? `${rarity.color}40` : 'rgba(75, 85, 99, 0.3)'
              }}
            >
              {sentence.isUnlocked ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{sentence.icon}</span>
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
                    {sentence.isFavorite && (
                      <span className="text-pink-400 text-xs">❤️</span>
                    )}
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
                  <p className="text-gray-500 text-sm">继续探索以解锁</p>
                </div>
              )}
            </div>
          );
        })}
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

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => workshop.toggleFavoriteSentence(selectedSentence.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all
                  ${selectedSentence.isFavorite
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                    : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
                  }
                `}
              >
                {selectedSentence.isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SpecialSentences;
