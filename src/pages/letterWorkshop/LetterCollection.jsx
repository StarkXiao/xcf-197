import { useState } from 'react';
import { RARITY_INFO } from '../../data/gameData';
import Modal from '../../components/Modal';

const LetterCollection = ({ workshop }) => {
  const [viewMode, setViewMode] = useState('letters');
  const [selectedItem, setSelectedItem] = useState(null);

  const favoriteLetters = workshop.getFavoriteLettersData();
  const favoriteSentences = workshop.getFavoriteSentencesData();
  const stats = workshop.getWorkshopStats();

  const items = viewMode === 'letters' ? favoriteLetters : favoriteSentences;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">💎</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          收藏展示
        </h2>
        <p className="text-white/60 text-sm mb-4">
          你珍藏的情书与句段，每一份都是星空中最美的记忆
        </p>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-star-purple/30 rounded-full border border-star-gold/30">
          <span className="text-star-gold font-bold text-lg">{stats.favoriteCount}</span>
          <span className="text-white/60 text-sm">项收藏</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => setViewMode('letters')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all
            ${viewMode === 'letters'
              ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }
          `}
        >
          <span>💌</span>
          <span>情书 ({favoriteLetters.length})</span>
        </button>
        <button
          onClick={() => setViewMode('sentences')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all
            ${viewMode === 'sentences'
              ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }
          `}
        >
          <span>💬</span>
          <span>句段 ({favoriteSentences.length})</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 opacity-30">{viewMode === 'letters' ? '💌' : '💬'}</div>
          <p className="text-white/40 text-lg mb-2">
            {viewMode === 'letters' ? '还没有收藏的情书' : '还没有收藏的句段'}
          </p>
          <p className="text-white/30 text-sm">
            在碎片拼接和特殊句段中点击❤️即可收藏
          </p>
        </div>
      ) : (
        <div className={viewMode === 'letters' ? 'space-y-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
          {viewMode === 'letters' ? (
            favoriteLetters.map(letter => {
              const rarity = RARITY_INFO[letter.rarity];
              return (
                <div
                  key={letter.id}
                  onClick={() => setSelectedItem({ ...letter, type: 'letter' })}
                  className="p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: `${rarity.color}40`,
                    background: `linear-gradient(135deg, ${rarity.color}10 0%, ${rarity.color}05 100%)`
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{letter.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold" style={{ color: rarity.color }}>{letter.name}</span>
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
                          <span className="text-xs text-green-400">✓ 完整</span>
                        )}
                      </div>
                      <p className="text-white/50 text-sm line-clamp-2">{letter.completeText}</p>
                    </div>
                    <span className="text-pink-400">❤️</span>
                  </div>
                </div>
              );
            })
          ) : (
            favoriteSentences.map(sentence => {
              if (!sentence.isUnlocked) return null;
              const rarity = RARITY_INFO[sentence.rarity];
              return (
                <div
                  key={sentence.id}
                  onClick={() => setSelectedItem({ ...sentence, type: 'sentence' })}
                  className="p-5 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: `${rarity.color}40`,
                    background: `linear-gradient(135deg, ${rarity.color}10 0%, ${rarity.color}05 100%)`
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{sentence.icon}</span>
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
                    <span className="text-pink-400 text-xs ml-auto">❤️</span>
                  </div>
                  <p className="text-white/90 text-sm italic leading-relaxed mb-2">
                    "{sentence.text}"
                  </p>
                  <p className="text-white/40 text-xs">—— {sentence.author}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.type === 'letter' ? `${selectedItem.icon} ${selectedItem.name}` : `${selectedItem.icon} ${selectedItem.author}`}
      >
        {selectedItem && (
          <div className="max-w-md mx-auto text-center">
            <div className="mb-4">
              <span
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${RARITY_INFO[selectedItem.rarity].color}20`,
                  color: RARITY_INFO[selectedItem.rarity].color,
                  border: `1px solid ${RARITY_INFO[selectedItem.rarity].color}40`
                }}
              >
                {RARITY_INFO[selectedItem.rarity].name}
              </span>
            </div>

            <div className="letter-fragment p-8 mb-6">
              {selectedItem.type === 'letter' ? (
                <>
                  <div className="text-center text-xs text-amber-700/60 mb-4">
                    ✨ {selectedItem.name} ✨
                  </div>
                  <p className="text-center text-amber-900 italic leading-relaxed">
                    "{selectedItem.completeText}"
                  </p>
                </>
              ) : (
                <>
                  <p className="text-amber-900 italic leading-loose text-lg">
                    "{selectedItem.text}"
                  </p>
                  <p className="text-amber-700/60 text-sm mt-4">
                    —— {selectedItem.author}
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => {
                if (selectedItem.type === 'letter') {
                  workshop.toggleFavoriteLetter(selectedItem.id);
                } else {
                  workshop.toggleFavoriteSentence(selectedItem.id);
                }
                setSelectedItem(null);
              }}
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-pink-500/20 text-pink-400 border border-pink-500/40 hover:bg-pink-500/30 transition-all"
            >
              💔 取消收藏
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LetterCollection;
