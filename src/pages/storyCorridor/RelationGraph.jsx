import { STAR_PATTERNS, RELATION_LEVELS } from '../../data/gameData';
import Modal from '../../components/Modal';

const RelationGraph = ({ archive, onClose }) => {
  const characters = archive.getCharacterRelationsWithStatus();

  const getStarColor = (starId) => {
    const star = STAR_PATTERNS.find(s => s.id === starId);
    return star?.color || '#ffd700';
  };

  const getStarIcon = (starId) => {
    const star = STAR_PATTERNS.find(s => s.id === starId);
    return star?.symbol || '⭐';
  };

  const centerX = 200;
  const centerY = 200;
  const radius = 150;

  const charPositions = characters.map((char, index) => {
    const angle = (index / characters.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...char,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle
    };
  });

  const getLineOpacity = (affection) => {
    if (affection <= 0) return 0.1;
    if (affection < 10) return 0.3;
    if (affection < 25) return 0.5;
    if (affection < 40) return 0.7;
    return 0.9;
  };

  const getLineWidth = (affection) => {
    if (affection <= 0) return 1;
    if (affection < 10) return 1.5;
    if (affection < 25) return 2.5;
    if (affection < 40) return 3.5;
    return 5;
  };

  const getLineColor = (affection) => {
    const level = RELATION_LEVELS.filter(rl => affection >= rl.minAffection);
    return level.length > 0 ? level[level.length - 1].color : '#9ca3af';
  };

  const totalAffection = characters.reduce((sum, c) => sum + c.affection, 0);
  const maxLevelChar = characters.reduce((max, c) =>
    c.relationLevel.level > max.relationLevel.level ? c : max, characters[0]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="🌟 星座守护关系图谱"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex justify-center mb-4">
          <div className="relative" style={{ width: 400, height: 400 }}>
            <svg width="400" height="400" className="absolute top-0 left-0">
              <defs>
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffd700" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffd700" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx={centerX} cy={centerY} r={radius + 20} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <circle cx={centerX} cy={centerY} r={radius - 30} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="2 6" />

              <circle cx={centerX} cy={centerY} r={50} fill="url(#centerGlow)" />

              {charPositions.map(char => (
                <line
                  key={`line-${char.starId}`}
                  x1={centerX}
                  y1={centerY}
                  x2={char.x}
                  y2={char.y}
                  stroke={getLineColor(char.affection)}
                  strokeWidth={getLineWidth(char.affection)}
                  opacity={getLineOpacity(char.affection)}
                  strokeLinecap="round"
                />
              ))}

              {charPositions.filter(c1 => c1.affection > 0).map((c1, i) =>
                charPositions.filter(c2 => c2.affection > 0 && c2.starId > c1.starId).map(c2 => {
                  const sharedLevel = Math.min(c1.relationLevel.level, c2.relationLevel.level);
                  if (sharedLevel < 2) return null;
                  return (
                    <line
                      key={`cross-${c1.starId}-${c2.starId}`}
                      x1={c1.x}
                      y1={c1.y}
                      x2={c2.x}
                      y2={c2.y}
                      stroke="rgba(255,215,0,0.15)"
                      strokeWidth={sharedLevel * 0.5}
                      strokeDasharray="4 4"
                    />
                  );
                })
              )}
            </svg>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-3xl mb-1">🌟</div>
                <div className="text-xs text-star-gold font-bold">你</div>
                <div className="text-[10px] text-white/40">
                  好感度总计 {totalAffection}
                </div>
              </div>
            </div>

            {charPositions.map(char => (
              <div
                key={char.starId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 text-center"
                style={{
                  left: char.x,
                  top: char.y,
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg mx-auto"
                  style={{
                    backgroundColor: char.affection > 0 ? `${getStarColor(char.starId)}30` : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${char.affection > 0 ? getStarColor(char.starId) : 'rgba(255,255,255,0.1)'}`,
                    boxShadow: char.affection > 0 ? `0 0 10px ${getStarColor(char.starId)}40` : 'none'
                  }}
                >
                  {getStarIcon(char.starId)}
                </div>
                <div className="text-[9px] text-white/50 mt-1 whitespace-nowrap">
                  {char.name.replace('守护者', '')}
                </div>
                <div
                  className="text-[8px] font-medium"
                  style={{ color: char.relationLevel.color }}
                >
                  {char.relationLevel.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-white/50 mb-2">关系等级图例</div>
          <div className="flex flex-wrap gap-2">
            {RELATION_LEVELS.map(rl => (
              <div key={rl.level} className="flex items-center gap-1">
                <span className="text-xs" style={{ color: rl.color }}>
                  {rl.icon} {rl.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-star-purple/20 rounded-lg border border-star-gold/20 text-center">
            <div className="text-star-gold font-bold">{totalAffection}</div>
            <div className="text-[10px] text-white/40">总好感度</div>
          </div>
          <div className="p-3 bg-star-purple/20 rounded-lg border border-star-cyan/20 text-center">
            <div className="text-star-cyan font-bold">
              {maxLevelChar?.name?.replace('守护者', '') || '-'}
            </div>
            <div className="text-[10px] text-white/40">最深羁绊</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RelationGraph;
