import { useState } from 'react';
import { LEVELS, FULL_LETTER } from '../../data/gameData';
import Modal from '../../components/Modal';

const LetterProgress = ({ archive }) => {
  const [showFullLetter, setShowFullLetter] = useState(false);
  const [selectedFragment, setSelectedFragment] = useState(null);
  const progressPercent = archive.getLetterProgressPercent();
  const letterProgress = archive.letterProgress;
  const chapters = archive.getChaptersWithStatus();

  const renderLetterFragment = (level, index) => {
    const isUnlocked = letterProgress >= level.id;
    const chapter = chapters.find(c => c.id === level.id);

    return (
      <div
        key={level.id}
        onClick={() => isUnlocked && setSelectedFragment({ level, chapter })}
        className={`relative p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer
          ${isUnlocked
            ? 'bg-gradient-to-r from-amber-50/90 to-amber-100/90 border-amber-300 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02]'
            : 'bg-gray-800/30 border-gray-700/30 opacity-50 cursor-not-allowed'
          }
        `}
        style={{
          animationDelay: `${index * 0.1}s`
        }}
      >
        <div className="flex items-start gap-4">
          <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
            {isUnlocked ? '📜' : '🔒'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-bold ${isUnlocked ? 'text-amber-800' : 'text-gray-500'}`}>
                第 {level.id} 章 · {level.name}
              </span>
              {chapter && chapter.stars > 0 && (
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      className={`text-xs ${i <= chapter.stars ? 'text-amber-500' : 'text-gray-400'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}
            </div>
            {isUnlocked ? (
              <p className="text-amber-900 italic leading-relaxed">
                "{level.letterFragment}"
              </p>
            ) : (
              <p className="text-gray-500 italic">
                通关第 {level.id} 章解锁此片段...
              </p>
            )}
          </div>
          {isUnlocked && (
            <div className="text-amber-500 text-lg">✓</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">💌</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          情书修复进度
        </h2>
        <p className="text-white/60 text-sm mb-6">
          通关各章节收集情书碎片，逐步修复完整的情书
        </p>

        <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden mb-2">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-amber-400 font-bold text-xl">{progressPercent}%</span>
          <span className="text-white/60 text-sm">
            ({letterProgress} / {LEVELS.length} 片段)
          </span>
        </div>

        {progressPercent === 100 && (
          <button
            onClick={() => setShowFullLetter(true)}
            className="btn-star px-8 py-3 animate-pulse-slow"
          >
            💌 查看完整情书
          </button>
        )}
      </div>

      <div className="space-y-4">
        {LEVELS.map((level, index) => renderLetterFragment(level, index))}
      </div>

      <div className="mt-8 p-4 bg-star-purple/20 rounded-xl border border-star-gold/20">
        <h3 className="text-star-gold font-bold mb-2">💡 修复提示</h3>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• 每通关一个章节，将解锁该章节对应的情书片段</li>
          <li>• 收集所有5个片段即可解锁完整情书</li>
          <li>• 全章节3星通关可解锁「情书收藏家」隐藏结局</li>
        </ul>
      </div>

      <Modal
        isOpen={showFullLetter}
        onClose={() => setShowFullLetter(false)}
        title="💌 完整情书"
      >
        <div className="letter-fragment p-6 max-w-md mx-auto">
          <div className="text-center text-xs text-amber-700/60 mb-4">
            ✨ 跨越时空的爱恋 ✨
          </div>
          <div className="text-center text-sm text-amber-900/80 whitespace-pre-line leading-relaxed italic">
            {FULL_LETTER}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedFragment}
        onClose={() => setSelectedFragment(null)}
        title={selectedFragment?.level?.name}
      >
        {selectedFragment && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-4">
              <span className="text-amber-600 text-sm">
                第 {selectedFragment.level.id} 章碎片
              </span>
              {selectedFragment.chapter && (
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      className={`text-lg ${i <= selectedFragment.chapter.stars ? 'text-amber-500' : 'text-gray-400'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="letter-fragment p-6">
              <p className="text-center text-amber-900 italic leading-relaxed text-lg">
                "{selectedFragment.level.letterFragment}"
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LetterProgress;
