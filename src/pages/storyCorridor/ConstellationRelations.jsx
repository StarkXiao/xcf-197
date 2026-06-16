import { useState } from 'react';
import { STAR_PATTERNS, CHARACTER_RELATIONS, RELATION_LEVELS } from '../../data/gameData';
import Modal from '../../components/Modal';

const ConstellationRelations = ({ archive, onOpenRelationGraph }) => {
  const [selectedChar, setSelectedChar] = useState(null);
  const [filterLevel, setFilterLevel] = useState(null);
  const characters = archive.getCharacterRelationsWithStatus();

  const getStarIcon = (starId) => {
    const star = STAR_PATTERNS.find(s => s.id === starId);
    return star?.symbol || '⭐';
  };

  const getStarColor = (starId) => {
    const star = STAR_PATTERNS.find(s => s.id === starId);
    return star?.color || '#ffd700';
  };

  const filteredChars = filterLevel !== null
    ? characters.filter(c => c.relationLevel.level === filterLevel)
    : characters;

  const levelStats = RELATION_LEVELS.map(rl => ({
    ...rl,
    count: characters.filter(c => c.relationLevel.level === rl.level).length
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">💫</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          星座守护关系
        </h2>
        <p className="text-white/60 text-sm mb-4">
          与星塔守护者们建立羁绊，解锁他们的故事
        </p>

        <div className="inline-flex items-center gap-4 px-6 py-3 bg-star-purple/30 rounded-full border border-star-gold/30">
          <div className="text-center">
            <div className="text-star-gold font-bold text-lg">
              {characters.filter(c => c.affection > 0).length} / {characters.length}
            </div>
            <div className="text-xs text-white/60">已结识</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-star-cyan font-bold text-lg">
              {characters.filter(c => c.relationLevel.level >= 3).length}
            </div>
            <div className="text-xs text-white/60">深度羁绊</div>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-star-pink font-bold text-lg">
              {characters.filter(c => c.relationLevel.level >= 4).length}
            </div>
            <div className="text-xs text-white/60">永恒之约</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterLevel(null)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
            ${filterLevel === null
              ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
        >
          全部 ({characters.length})
        </button>
        {levelStats.map(rl => (
          <button
            key={rl.level}
            onClick={() => setFilterLevel(rl.level === filterLevel ? null : rl.level)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
              ${filterLevel === rl.level
                ? 'bg-star-gold text-star-dark shadow-lg shadow-star-gold/30'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
          >
            <span>{rl.icon}</span>
            <span>{rl.name}</span>
            <span className="opacity-60">({rl.count})</span>
          </button>
        ))}
      </div>

      {onOpenRelationGraph && (
        <button
          onClick={onOpenRelationGraph}
          className="w-full mb-6 p-3 rounded-xl border-2 border-star-cyan/30 bg-star-cyan/10 text-star-cyan text-sm font-medium hover:bg-star-cyan/20 transition-all"
        >
          🔮 查看关系图谱
        </button>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredChars.map(char => (
          <div
            key={char.starId}
            onClick={() => char.affection > 0 && setSelectedChar(char)}
            className={`relative p-4 rounded-xl border-2 transition-all
              ${char.affection > 0
                ? 'bg-gradient-to-br from-star-purple/30 to-star-blue/20 border-white/10 hover:border-star-gold/50 hover:shadow-lg hover:shadow-star-gold/10 cursor-pointer hover:scale-[1.03]'
                : 'bg-gray-800/20 border-gray-700/30 opacity-50'
              }`}
          >
            <div className="text-center">
              <div
                className="text-3xl mb-2"
                style={{
                  filter: char.affection > 0
                    ? `drop-shadow(0 0 8px ${getStarColor(char.starId)})`
                    : 'grayscale'
                }}
              >
                {getStarIcon(char.starId)}
              </div>

              <div className="font-bold text-sm text-white mb-0.5">
                {char.name}
              </div>
              <div className="text-xs text-white/40 mb-2">
                {char.title}
              </div>

              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${char.relationLevel.color}20`,
                  color: char.relationLevel.color,
                  border: `1px solid ${char.relationLevel.color}40`
                }}
              >
                <span>{char.relationLevel.icon}</span>
                <span>{char.relationLevel.name}</span>
              </div>

              {char.affection > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (char.affection / 50) * 100)}%`,
                        backgroundColor: char.relationLevel.color
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-white/30 mt-1">
                    好感度 {char.affection}
                  </div>
                </div>
              )}

              {char.affection === 0 && (
                <div className="text-xs text-gray-500 mt-2">尚未结识</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedChar}
        onClose={() => setSelectedChar(null)}
        title={selectedChar ? `${selectedChar.name} · ${selectedChar.title}` : ''}
      >
        {selectedChar && (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <div
                className="text-5xl mb-3 animate-float"
                style={{ filter: `drop-shadow(0 0 12px ${getStarColor(selectedChar.starId)})` }}
              >
                {getStarIcon(selectedChar.starId)}
              </div>
              <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-2"
                style={{
                  backgroundColor: `${selectedChar.relationLevel.color}20`,
                  color: selectedChar.relationLevel.color,
                  border: `1px solid ${selectedChar.relationLevel.color}40`
                }}
              >
                <span>{selectedChar.relationLevel.icon}</span>
                <span>{selectedChar.relationLevel.name}</span>
              </div>
              <div className="text-xs text-white/40">
                性格：{selectedChar.personality}
              </div>
            </div>

            <div className="p-4 mb-4 bg-star-purple/20 rounded-xl border border-white/10">
              <p className="text-sm text-white/70 leading-relaxed italic">
                {selectedChar.backstory}
              </p>
            </div>

            <div className="mb-4">
              <div className="text-xs text-white/50 mb-2">好感度进度</div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (selectedChar.affection / 50) * 100)}%`,
                    background: `linear-gradient(90deg, ${selectedChar.relationLevel.color}, ${getStarColor(selectedChar.starId)})`
                  }}
                />
                {RELATION_LEVELS.map(rl => (
                  <div
                    key={rl.level}
                    className="absolute top-0 h-full w-0.5 bg-white/20"
                    style={{ left: `${(rl.minAffection / 50) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {RELATION_LEVELS.map(rl => (
                  <span
                    key={rl.level}
                    className="text-[9px]"
                    style={{
                      color: selectedChar.relationLevel.level >= rl.level ? rl.color : 'rgba(255,255,255,0.2)'
                    }}
                  >
                    {rl.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="text-xs text-white/50 mb-1">角色故事</div>
              {selectedChar.stories.map((story, idx) => {
                const isUnlocked = selectedChar.affection >= story.affection;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border transition-all
                      ${isUnlocked
                        ? 'bg-star-gold/10 border-star-gold/20'
                        : 'bg-white/5 border-white/10 opacity-40'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: isUnlocked ? '#ffd700' : '#666' }}>
                        {isUnlocked ? story.title : '???'}
                      </span>
                      <span className="text-[10px] text-white/30">
                        好感度 {story.affection}
                      </span>
                    </div>
                    {isUnlocked ? (
                      <p className="text-xs text-white/60 leading-relaxed">
                        {story.content}
                      </p>
                    ) : (
                      <p className="text-xs text-white/20">继续提升好感度以解锁</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConstellationRelations;
