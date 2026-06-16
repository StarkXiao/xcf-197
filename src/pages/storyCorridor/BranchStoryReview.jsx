import { useState } from 'react';
import { LEVELS, CHARACTER_RELATIONS } from '../../data/gameData';
import Modal from '../../components/Modal';

const BranchStoryReview = ({ archive }) => {
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [viewingAltBranch, setViewingAltBranch] = useState(null);
  const storyChoicesList = archive.getStoryChoicesList();
  const chapters = archive.getChaptersWithStatus();

  const getChapterForBranch = (chapterId) => {
    return chapters.find(c => c.id === chapterId);
  };

  const renderStarRating = (stars, size = 'text-base') => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map(i => (
          <span
            key={i}
            className={`${size} ${i <= stars ? 'text-star-gold' : 'text-gray-600'}`}
            style={{ filter: i <= stars ? 'drop-shadow(0 0 4px #ffd700)' : 'none' }}
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
        <div className="text-5xl mb-4 animate-float">📜</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          分支剧情回看
        </h2>
        <p className="text-white/60 text-sm mb-4">
          回顾你在星塔中的每一次抉择，重温不同的剧情走向
        </p>

        <div className="inline-flex items-center gap-4 px-6 py-3 bg-star-purple/30 rounded-full border border-star-gold/30">
          <div className="text-center">
            <div className="text-star-gold font-bold text-lg">
              {storyChoicesList.filter(b => b.isChosen).length} / {storyChoicesList.length}
            </div>
            <div className="text-xs text-white/60">已做出选择</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-star-cyan font-bold text-lg">
              {archive.unlockedStoryBranches.length}
            </div>
            <div className="text-xs text-white/60">已解锁分支</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-star-gold/50 via-star-purple/30 to-star-cyan/50" />

        <div className="space-y-6">
          {storyChoicesList.map((branch, index) => {
            const chapter = getChapterForBranch(branch.chapterId);
            const isUnlocked = chapter?.unlocked;
            const isChosen = branch.isChosen;

            return (
              <div key={branch.id} className="relative pl-16">
                <div
                  className={`absolute left-4 top-8 w-5 h-5 rounded-full border-4 transition-all
                    ${isChosen
                      ? 'bg-star-gold border-star-dark shadow-lg shadow-star-gold/50'
                      : isUnlocked
                        ? 'bg-star-cyan border-star-dark shadow-lg shadow-star-cyan/50 animate-pulse'
                        : 'bg-gray-700 border-gray-600'
                    }
                  `}
                />

                <div
                  onClick={() => isUnlocked && setSelectedBranch(branch)}
                  className={`relative rounded-2xl p-6 border-2 transition-all duration-300
                    ${isUnlocked
                      ? 'bg-gradient-to-br from-star-purple/40 to-star-blue/40 border-star-gold/30 hover:border-star-gold hover:shadow-lg hover:shadow-star-gold/20 hover:scale-[1.02] cursor-pointer'
                      : 'bg-gray-800/20 border-gray-700/30 opacity-50 cursor-not-allowed'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl ${isUnlocked ? 'animate-float' : 'grayscale'}`}
                        style={{ animationDelay: `${index * 0.15}s` }}
                      >
                        {isChosen ? '✨' : isUnlocked ? '❓' : '🔒'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-base font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                            第 {branch.chapterId} 章
                          </span>
                          <span className={`text-sm ${isUnlocked ? 'text-star-gold' : 'text-gray-500'}`}>
                            · {branch.title}
                          </span>
                        </div>
                        <div className={`text-xs ${isUnlocked ? 'text-white/60' : 'text-gray-600'}`}>
                          {branch.subtitle}
                        </div>
                      </div>
                    </div>

                    {isUnlocked && chapter && (
                      <div className="text-right">
                        {renderStarRating(chapter.stars, 'text-sm')}
                      </div>
                    )}
                  </div>

                  <p className={`text-sm mb-3 ${isUnlocked ? 'text-white/50' : 'text-gray-600'}`}>
                    {branch.description}
                  </p>

                  {isChosen && (
                    <div className="p-3 bg-star-gold/10 rounded-lg border border-star-gold/20">
                      <div className="text-xs text-star-gold/70 mb-1">你的选择</div>
                      <div className="text-sm text-star-gold font-medium">
                        {branch.chosenOption?.text}
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {branch.chosenOption?.mood && `倾向：${branch.chosenOption.mood}`}
                      </div>
                    </div>
                  )}

                  {!isChosen && isUnlocked && (
                    <div className="text-center">
                      <span className="text-xs text-star-cyan/70 animate-pulse">
                        尚未做出选择 →
                      </span>
                    </div>
                  )}

                  {isChosen && (
                    <div className="mt-3 text-center">
                      <span className="text-xs text-star-gold/70">
                        点击查看剧情详情 →
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
          <li>• 通关章节后可在此处回顾剧情选择</li>
          <li>• 点击已选择的章节可查看完整剧情</li>
          <li>• 你可以点击"另一种可能"查看未选择的分支</li>
          <li>• 每次选择都会影响与守护者的关系</li>
        </ul>
      </div>

      <Modal
        isOpen={!!selectedBranch}
        onClose={() => { setSelectedBranch(null); setViewingAltBranch(null); }}
        title={selectedBranch ? `第 ${selectedBranch.chapterId} 章 · ${selectedBranch.title}` : ''}
      >
        {selectedBranch && (
          <div className="max-w-md mx-auto">
            {viewingAltBranch ? (
              <div>
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2">🔄</div>
                  <div className="text-star-cyan font-bold text-lg">
                    另一种可能
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    如果你当时做了不同的选择...
                  </div>
                </div>

                <div className="p-4 mb-4 bg-star-cyan/10 rounded-xl border border-star-cyan/30">
                  <div className="text-xs text-star-cyan/70 mb-1">未选择的路径</div>
                  <div className="text-sm text-star-cyan font-medium">
                    {selectedBranch.unchosenOption?.text}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {selectedBranch.unchosenOption?.result}
                  </div>
                </div>

                {selectedBranch.unchosenOption && selectedBranch.branches[selectedBranch.unchosenOption.id] && (
                  <div className="letter-fragment p-6 mb-4">
                    <div className="text-center text-xs text-amber-700/60 mb-3">
                      📖 {selectedBranch.branches[selectedBranch.unchosenOption.id].title}
                    </div>
                    <p className="text-amber-900 leading-relaxed whitespace-pre-line text-center italic text-sm">
                      {selectedBranch.branches[selectedBranch.unchosenOption.id].content}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setViewingAltBranch(null)}
                  className="w-full py-2 rounded-full border-2 border-star-gold/50 text-star-gold text-sm hover:bg-star-gold/10 transition-colors"
                >
                  ← 返回我的选择
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3 animate-float">✨</div>
                  <div className="text-star-gold text-sm mb-2">
                    {selectedBranch.subtitle}
                  </div>
                </div>

                <div className="p-4 mb-4 bg-star-purple/30 rounded-xl border border-star-gold/30">
                  <div className="text-xs text-white/50 mb-2">命运之问</div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {selectedBranch.choicePoint.question}
                  </p>
                </div>

                <div className="p-4 mb-4 bg-star-gold/10 rounded-xl border border-star-gold/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-star-gold text-xs">你的选择</span>
                    {selectedBranch.chosenOption?.mood && (
                      <span className="text-xs px-2 py-0.5 bg-star-gold/20 text-star-gold rounded-full">
                        {selectedBranch.chosenOption.mood}
                      </span>
                    )}
                  </div>
                  <div className="text-star-gold font-medium text-sm mb-2">
                    {selectedBranch.chosenOption?.text}
                  </div>
                  <div className="text-xs text-white/50">
                    {selectedBranch.chosenOption?.result}
                  </div>
                </div>

                {selectedBranch.branchContent && (
                  <div className="letter-fragment p-6 mb-4">
                    <div className="text-center text-xs text-amber-700/60 mb-3">
                      📖 {selectedBranch.branchContent.title}
                    </div>
                    <p className="text-amber-900 leading-relaxed whitespace-pre-line text-center italic text-sm">
                      {selectedBranch.branchContent.content}
                    </p>
                  </div>
                )}

                {selectedBranch.chosenOption?.affectionChanges && (
                  <div className="mb-4 p-3 bg-star-purple/20 rounded-lg border border-white/10">
                    <div className="text-xs text-white/50 mb-2">关系变化</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedBranch.chosenOption.affectionChanges).map(([starId, value]) => {
                        const char = CHARACTER_RELATIONS?.find(c => c.starId === starId);
                        return (
                          <span key={starId} className="text-xs px-2 py-1 bg-star-gold/10 text-star-gold rounded-full">
                            {char?.name || starId} +{value}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedBranch.unchosenOption && (
                  <button
                    onClick={() => setViewingAltBranch(true)}
                    className="w-full py-3 rounded-full border-2 border-star-cyan/50 text-star-cyan text-sm hover:bg-star-cyan/10 transition-colors"
                  >
                    🔄 查看另一种可能
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BranchStoryReview;
