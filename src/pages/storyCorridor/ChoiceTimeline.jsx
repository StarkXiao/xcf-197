import { CHARACTER_RELATIONS } from '../../data/gameData';

const ChoiceTimeline = ({ archive }) => {
  const storyChoicesList = archive.getStoryChoicesList();
  const playerType = archive.getPlayerTypeInfo();
  const choiceCount = archive.getChoiceCount();
  const chosenBranches = storyChoicesList.filter(b => b.isChosen);

  const moodCount = {};
  chosenBranches.forEach(branch => {
    if (branch.chosenOption?.mood) {
      moodCount[branch.chosenOption.mood] = (moodCount[branch.chosenOption.mood] || 0) + 1;
    }
  });

  const dominantMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];

  const totalAffectionGiven = {};
  chosenBranches.forEach(branch => {
    if (branch.chosenOption?.affectionChanges) {
      Object.entries(branch.chosenOption.affectionChanges).forEach(([starId, value]) => {
        totalAffectionGiven[starId] = (totalAffectionGiven[starId] || 0) + value;
      });
    }
  });

  const mostAffectedChar = Object.entries(totalAffectionGiven).sort((a, b) => b[1] - a[1])[0];
  const mostAffectedCharInfo = mostAffectedChar
    ? CHARACTER_RELATIONS.find(c => c.starId === mostAffectedChar[0])
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">⏳</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          关键选择记录
        </h2>
        <p className="text-white/60 text-sm mb-4">
          每一个选择都塑造了你的命运轨迹
        </p>
      </div>

      {choiceCount > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-4 bg-star-purple/30 rounded-xl border border-star-gold/20 text-center">
              <div className="text-2xl font-bold text-star-gold">{choiceCount}</div>
              <div className="text-xs text-white/50 mt-1">总选择数</div>
            </div>
            <div className="p-4 bg-star-purple/30 rounded-xl border border-star-cyan/20 text-center">
              <div className="text-2xl font-bold text-star-cyan">{playerType.icon}</div>
              <div className="text-xs text-white/50 mt-1">{playerType.name}</div>
            </div>
            <div className="p-4 bg-star-purple/30 rounded-xl border border-star-pink/20 text-center">
              <div className="text-2xl font-bold text-star-pink">
                {dominantMood ? dominantMood[0] : '-'}
              </div>
              <div className="text-xs text-white/50 mt-1">主导倾向</div>
            </div>
            <div className="p-4 bg-star-purple/30 rounded-xl border border-orange-500/20 text-center">
              <div className="text-2xl font-bold text-orange-400">
                {mostAffectedCharInfo?.name?.replace('守护者', '') || '-'}
              </div>
              <div className="text-xs text-white/50 mt-1">最深羁绊</div>
            </div>
          </div>

          <div className="p-4 mb-8 rounded-xl border-2 transition-all"
            style={{
              borderColor: `${playerType.color}50`,
              backgroundColor: `${playerType.color}15`
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{playerType.icon}</span>
              <div>
                <div className="font-bold" style={{ color: playerType.color }}>
                  {playerType.name}
                </div>
                <div className="text-xs text-white/50">
                  {playerType.description}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {chosenBranches.map((branch, index) => (
              <div
                key={branch.id}
                className="relative rounded-2xl p-5 border-2 bg-gradient-to-r from-star-purple/30 to-star-blue/20 border-star-gold/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-star-gold/20 flex items-center justify-center">
                    <span className="text-star-gold font-bold text-sm">{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">
                        第 {branch.chapterId} 章 · {branch.title}
                      </span>
                      {branch.chosenOption?.mood && (
                        <span className="text-xs px-2 py-0.5 bg-star-gold/20 text-star-gold rounded-full">
                          {branch.chosenOption.mood}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/40 mb-3">
                      {branch.choicePoint.question}
                    </p>

                    <div className="p-3 bg-star-gold/10 rounded-lg border border-star-gold/20 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-star-gold text-xs">✓ 你的选择：</span>
                        <span className="text-sm text-star-gold font-medium">
                          {branch.chosenOption?.text}
                        </span>
                      </div>
                    </div>

                    {branch.unchosenOption && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-white/30 text-xs">✗ 未选择：</span>
                          <span className="text-sm text-white/40">
                            {branch.unchosenOption.text}
                          </span>
                        </div>
                      </div>
                    )}

                    {branch.chosenOption?.affectionChanges && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(branch.chosenOption.affectionChanges).map(([starId, value]) => {
                          const char = CHARACTER_RELATIONS.find(c => c.starId === starId);
                          return (
                            <span key={starId} className="text-xs px-1.5 py-0.5 bg-star-gold/10 text-star-gold/70 rounded">
                              {char?.name?.replace('守护者', '') || starId} +{value}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-star-purple/20 rounded-xl border border-star-cyan/20">
            <h3 className="text-star-cyan font-bold mb-2">📊 选择倾向分析</h3>
            <div className="space-y-2">
              {Object.entries(moodCount).sort((a, b) => b[1] - a[1]).map(([mood, count]) => (
                <div key={mood} className="flex items-center gap-3">
                  <span className="text-sm text-white/70 w-12">{mood}</span>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-star-gold to-star-cyan rounded-full transition-all duration-500"
                      style={{ width: `${(count / choiceCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/50">{count}次</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">⏳</div>
          <p className="text-white/40 mb-2">尚未做出任何剧情选择</p>
          <p className="text-xs text-white/30">通关章节后，剧情选择将记录在此</p>
        </div>
      )}
    </div>
  );
};

export default ChoiceTimeline;
