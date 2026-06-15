import { useState } from 'react';
import { CHAPTER_STORIES, getChapterStoryById } from '../../data/gameData';
import Modal from '../../components/Modal';

const ChapterReview = ({ archive }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const chapters = archive.getChaptersWithStatus();

  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  const renderStarRating = (stars, size = 'text-lg') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <span
            key={i}
            className={`${size} ${i <= stars ? 'text-star-gold' : 'text-gray-600'}`}
            style={{
              filter: i <= stars ? 'drop-shadow(0 0 4px #ffd700)' : 'none'
            }}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">📖</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          章节回看
        </h2>
        <p className="text-white/60 text-sm mb-4">
          回顾你走过的旅程，重温那些美好的瞬间
        </p>

        <div className="inline-flex items-center gap-4 px-6 py-3 bg-star-purple/30 rounded-full border border-star-gold/30">
          <div className="text-center">
            <div className="text-star-gold font-bold text-lg">
              {chapters.filter(c => c.unlocked).length} / {chapters.length}
            </div>
            <div className="text-xs text-white/60">章节解锁</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-star-cyan font-bold text-lg">
              {formatPlayTime(archive.totalPlayTime)}
            </div>
            <div className="text-xs text-white/60">总游戏时长</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-star-pink font-bold text-lg">
              x{archive.maxCombo}
            </div>
            <div className="text-xs text-white/60">最高连击</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-star-gold/50 via-star-purple/30 to-star-cyan/50" />

        <div className="space-y-6">
          {chapters.map((chapter, index) => {
            const story = getChapterStoryById(chapter.id);
            const isUnlocked = chapter.unlocked;

            return (
              <div
                key={chapter.id}
                className="relative pl-16"
              >
                <div className={`absolute left-4 top-8 w-5 h-5 rounded-full border-4 transition-all
                  ${isUnlocked
                    ? 'bg-star-gold border-star-dark shadow-lg shadow-star-gold/50'
                    : 'bg-gray-700 border-gray-600'
                  }
                `} />

                <div
                  onClick={() => isUnlocked && setSelectedChapter(chapter.id)}
                  className={`relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer
                    ${isUnlocked
                      ? 'bg-gradient-to-br from-star-purple/40 to-star-blue/40 border-star-gold/30 hover:border-star-gold hover:shadow-lg hover:shadow-star-gold/20 hover:scale-[1.02]'
                      : 'bg-gray-800/20 border-gray-700/30 opacity-50 cursor-not-allowed'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-5xl ${isUnlocked ? 'animate-float' : 'grayscale'}`}
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        {story?.image || '🌌'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-lg font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                            第 {chapter.id} 章
                          </span>
                          <span className={`text-sm ${isUnlocked ? 'text-star-gold' : 'text-gray-500'}`}>
                            · {chapter.name}
                          </span>
                        </div>
                        <div className={`text-sm ${isUnlocked ? 'text-white/60' : 'text-gray-600'}`}>
                          {story?.subtitle || chapter.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {isUnlocked ? (
                        <>
                          {renderStarRating(chapter.stars)}
                          {chapter.stars > 0 && (
                            <div className="text-xs text-white/40 mt-1">
                              最高评价
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-2xl">🔒</div>
                      )}
                    </div>
                  </div>

                  {isUnlocked && (
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <div className="text-star-gold font-bold">{chapter.pairs}</div>
                        <div className="text-xs text-white/50">配对数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-star-cyan font-bold">{chapter.timeLimit}s</div>
                        <div className="text-xs text-white/50">时间限制</div>
                      </div>
                      <div className="text-center">
                        <div className="text-star-pink font-bold">{chapter.baseScore}</div>
                        <div className="text-xs text-white/50">基础分</div>
                      </div>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="mt-4 text-center">
                      <span className="text-xs text-star-gold/70">
                        点击查看章节故事 →
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 p-4 bg-star-purple/20 rounded-xl border border-star-gold/20">
        <h3 className="text-star-gold font-bold mb-2">💡 回看提示</h3>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• 通关章节后可在此处回顾章节故事</li>
          <li>• 追求更高的星级评价可以解锁更多奖励</li>
          <li>• 所有章节3星通关可解锁特殊隐藏结局</li>
        </ul>
      </div>

      <Modal
        isOpen={!!selectedChapter}
        onClose={() => setSelectedChapter(null)}
        title={selectedChapter ? `第 ${selectedChapter} 章 · ${getChapterStoryById(selectedChapter)?.title}` : ''}
      >
        {selectedChapter && (() => {
          const story = getChapterStoryById(selectedChapter);
          const chapterInfo = chapters.find(c => c.id === selectedChapter);
          return (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="text-7xl mb-4 animate-float">
                  {story?.image}
                </div>
                <div className="text-star-gold text-sm mb-2">
                  {story?.subtitle}
                </div>
                {chapterInfo && (
                  <div className="flex justify-center mb-4">
                    {renderStarRating(chapterInfo.stars, 'text-2xl')}
                  </div>
                )}
              </div>

              <div className="letter-fragment p-6 mb-6">
                <p className="text-amber-900 leading-relaxed whitespace-pre-line text-center italic">
                  {story?.content}
                </p>
              </div>

              {chapterInfo && chapterInfo.letterFragment && (
                <div className="p-4 bg-star-purple/30 rounded-xl border border-star-gold/30">
                  <div className="text-xs text-star-gold/70 text-center mb-2">
                    ✨ 本章情书碎片 ✨
                  </div>
                  <p className="text-white/80 text-center italic">
                    "{chapterInfo.letterFragment}"
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ChapterReview;
