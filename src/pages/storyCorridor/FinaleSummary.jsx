import {
  LEVELS,
  STAR_PATTERNS,
  HIDDEN_ENDINGS,
  ACHIEVEMENTS,
  CHARACTER_RELATIONS,
  getFinaleTemplate,
  getRarityInfo,
  FULL_LETTER
} from '../../data/gameData';

const FinaleSummary = ({ archive }) => {
  const chapters = archive.getChaptersWithStatus();
  const playerType = archive.getPlayerTypeInfo();
  const storyChoicesList = archive.getStoryChoicesList();
  const characters = archive.getCharacterRelationsWithStatus();
  const choiceCount = archive.getChoiceCount();
  const lastChoice = archive.storyChoices['choice-5'] || null;

  const totalScore = Object.values(archive.chapterStars).reduce((sum, stars) => sum + stars * 1000, 0);
  const totalStars = Object.values(archive.chapterStars).reduce((sum, s) => sum + s, 0);
  const maxPossibleStars = LEVELS.length * 3;
  const completedChapters = chapters.filter(c => c.unlocked).length;
  const collectedStarCount = archive.collectedFragments.length;
  const unlockedEndingsCount = archive.unlockedEndings.length;
  const unlockedAchievementCount = archive.unlockedRewards?.length || 0;
  const totalAffection = characters.reduce((sum, c) => sum + c.affection, 0);
  const deepestRelation = characters.reduce((max, c) =>
    c.relationLevel.level > max.relationLevel.level ? c : max, characters[0]);
  const isAllCleared = completedChapters >= LEVELS.length;

  const finaleTemplate = choiceCount > 0
    ? getFinaleTemplate(playerType, lastChoice)
    : null;

  const formatPlayTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  };

  const storyTimeline = storyChoicesList
    .filter(b => b.isChosen)
    .map(branch => ({
      chapterId: branch.chapterId,
      title: branch.title,
      chosenText: branch.chosenOption?.text || '',
      mood: branch.chosenOption?.mood || '',
      branchTitle: branch.branchContent?.title || ''
    }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">🌟</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          终章汇总
        </h2>
        <p className="text-white/60 text-sm">
          你的星塔之旅 · 完整回顾
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-4 bg-gradient-to-br from-star-gold/20 to-star-gold/5 rounded-xl border border-star-gold/30 text-center">
          <div className="text-2xl font-bold text-star-gold">{completedChapters}/{LEVELS.length}</div>
          <div className="text-xs text-white/50 mt-1">通关章节</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-star-cyan/20 to-star-cyan/5 rounded-xl border border-star-cyan/30 text-center">
          <div className="text-2xl font-bold text-star-cyan">{totalStars}/{maxPossibleStars}</div>
          <div className="text-xs text-white/50 mt-1">星级评价</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-star-pink/20 to-star-pink/5 rounded-xl border border-star-pink/30 text-center">
          <div className="text-2xl font-bold text-star-pink">{formatPlayTime(archive.totalPlayTime)}</div>
          <div className="text-xs text-white/50 mt-1">总游戏时长</div>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl border border-orange-500/30 text-center">
          <div className="text-2xl font-bold text-orange-400">x{archive.maxCombo}</div>
          <div className="text-xs text-white/50 mt-1">最高连击</div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-2xl border-2 border-star-gold/30 bg-gradient-to-br from-star-purple/30 to-star-blue/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-bold text-star-gold">星途数据</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-white/40 mb-1">收集星星碎片</div>
              <div className="text-star-gold font-bold">{collectedStarCount}/{STAR_PATTERNS.length}</div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-star-gold rounded-full transition-all" style={{ width: `${(collectedStarCount / STAR_PATTERNS.length) * 100}%` }} />
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-white/40 mb-1">隐藏结局</div>
              <div className="text-star-cyan font-bold">{unlockedEndingsCount}/{HIDDEN_ENDINGS.length}</div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-star-cyan rounded-full transition-all" style={{ width: `${(unlockedEndingsCount / HIDDEN_ENDINGS.length) * 100}%` }} />
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-white/40 mb-1">成就达成</div>
              <div className="text-star-pink font-bold">{unlockedAchievementCount}/{ACHIEVEMENTS.length}</div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-star-pink rounded-full transition-all" style={{ width: `${(unlockedAchievementCount / ACHIEVEMENTS.length) * 100}%` }} />
              </div>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="text-xs text-white/40 mb-1">角色总好感度</div>
              <div className="text-orange-400 font-bold">{totalAffection}</div>
              <div className="text-xs text-white/30 mt-1">
                最深羁绊：{deepestRelation.name.replace('守护者', '')}
              </div>
            </div>
          </div>
        </div>

        {storyTimeline.length > 0 && (
          <div className="p-6 rounded-2xl border-2 border-star-cyan/30 bg-gradient-to-br from-star-purple/30 to-star-blue/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📖</span>
              <h3 className="text-lg font-bold text-star-cyan">故事回顾</h3>
            </div>

            <div className="space-y-3">
              {storyTimeline.map((entry, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-star-cyan/20 flex items-center justify-center">
                    <span className="text-star-cyan text-xs font-bold">{entry.chapterId}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{entry.title}</div>
                    <div className="text-xs text-star-gold">
                      {entry.chosenText}
                      {entry.mood && <span className="text-white/30 ml-2">[{entry.mood}]</span>}
                    </div>
                    {entry.branchTitle && (
                      <div className="text-xs text-white/40 mt-0.5">
                        → {entry.branchTitle}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isAllCleared && (
              <div className="mt-4 pt-4 border-t border-white/10 text-center">
                <div className="text-xs text-white/30 mb-2">你的旅途倾向</div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: `${playerType.color}20`, border: `1px solid ${playerType.color}40` }}
                >
                  <span className="text-lg">{playerType.icon}</span>
                  <span className="font-bold" style={{ color: playerType.color }}>{playerType.name}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-6 rounded-2xl border-2 border-star-pink/30 bg-gradient-to-br from-star-purple/30 to-star-blue/20">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏆</span>
            <h3 className="text-lg font-bold text-star-pink">收集总览</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {chapters.map(chapter => (
              <div key={chapter.id} className="p-3 bg-white/5 rounded-lg text-center">
                <div className="text-xs text-white/40 mb-1">第{chapter.id}章</div>
                <div className="flex justify-center gap-0.5">
                  {[1, 2, 3].map(i => (
                    <span key={i} className={`text-xs ${i <= chapter.stars ? 'text-star-gold' : 'text-gray-600'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-white/30 mt-1">
                  {chapter.unlocked ? chapter.name : '🔒'}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <div className="flex-1 p-3 bg-star-gold/10 rounded-lg text-center">
              <div className="text-xs text-white/40 mb-1">星星碎片</div>
              <div className="text-star-gold font-bold text-sm">{collectedStarCount}/{STAR_PATTERNS.length}</div>
            </div>
            <div className="flex-1 p-3 bg-star-cyan/10 rounded-lg text-center">
              <div className="text-xs text-white/40 mb-1">隐藏结局</div>
              <div className="text-star-cyan font-bold text-sm">{unlockedEndingsCount}/{HIDDEN_ENDINGS.length}</div>
            </div>
            <div className="flex-1 p-3 bg-star-pink/10 rounded-lg text-center">
              <div className="text-xs text-white/40 mb-1">情书进度</div>
              <div className="text-star-pink font-bold text-sm">{Math.round(archive.getLetterProgressPercent())}%</div>
            </div>
          </div>
        </div>

        {isAllCleared && finaleTemplate && (
          <div className="p-6 rounded-2xl border-2 bg-gradient-to-br from-star-purple/40 to-star-blue/30"
            style={{ borderColor: `${playerType.color}50` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🌟</span>
              <h3 className="text-lg font-bold" style={{ color: playerType.color }}>
                专属结语
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${getRarityInfo(finaleTemplate.rarity).bgColor}`,
                  color: getRarityInfo(finaleTemplate.rarity).color,
                  border: `1px solid ${getRarityInfo(finaleTemplate.rarity).borderColor}`
                }}
              >
                {getRarityInfo(finaleTemplate.rarity).name}
              </span>
            </div>

            <div className="text-center mb-4">
              <div className="text-3xl mb-2">{finaleTemplate.icon}</div>
              <div className="text-xl font-bold" style={{ color: playerType.color }}>
                {finaleTemplate.title}
              </div>
            </div>

            <div className="letter-fragment p-6 mb-4">
              <p className="text-amber-900 leading-relaxed whitespace-pre-line text-center italic">
                {finaleTemplate.content}
              </p>
            </div>

            {archive.getLetterProgressPercent() >= 100 && (
              <div className="p-4 bg-star-gold/10 rounded-xl border border-star-gold/20 text-center">
                <div className="text-xs text-star-gold/70 mb-2">💌 完整情书 💌</div>
                <div className="text-xs text-amber-900/80 whitespace-pre-line leading-relaxed italic">
                  {FULL_LETTER}
                </div>
              </div>
            )}
          </div>
        )}

        {!isAllCleared && (
          <div className="p-6 rounded-2xl border-2 border-white/10 bg-star-purple/20 text-center">
            <div className="text-4xl mb-3 opacity-30">🌟</div>
            <p className="text-white/40 text-sm">通关所有章节以解锁专属结语</p>
            <p className="text-white/20 text-xs mt-1">
              还需通关 {LEVELS.length - completedChapters} 个章节
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinaleSummary;
