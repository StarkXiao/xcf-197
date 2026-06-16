import { useState, useEffect } from 'react';

const Card = ({ card, onClick, disabled, skinTheme }) => {
  const [isFlipped, setIsFlipped] = useState(card.isFlipped);
  const [isMatched, setIsMatched] = useState(card.isMatched);

  useEffect(() => {
    setIsFlipped(card.isFlipped);
  }, [card.isFlipped]);

  useEffect(() => {
    setIsMatched(card.isMatched);
  }, [card.isMatched]);

  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onClick(card.id);
    }
  };

  const cardColor = skinTheme?.cardColor || '#2d1b69';
  const cardBorderColor = skinTheme?.cardBorder || 'rgba(255, 215, 0, 0.3)';
  const accentColor = skinTheme?.accent || '#ffd700';
  const glowColor = skinTheme?.glow || 'rgba(139, 92, 246, 0.5)';

  return (
    <button
      className={`card-container w-full aspect-[3/4] cursor-pointer select-none
        focus:outline-none focus:ring-2 focus:ring-star-gold/50
        ${isFlipped ? 'card-flipped' : ''}
        ${isMatched ? 'card-matched' : ''}
        ${disabled ? 'pointer-events-none opacity-50' : ''}
      `}
      onClick={handleClick}
      disabled={disabled || isFlipped || isMatched}
      aria-label={isFlipped || isMatched ? card.star.name : '未翻开的星纹卡牌'}
    >
      <div className="card-inner w-full h-full">
        <div className="card-back shadow-lg w-full h-full"
          style={{
            background: `linear-gradient(145deg, ${cardColor} 0%, ${adjustColor(cardColor, -30)} 100%)`,
            border: `2px solid ${cardBorderColor}`
          }}
        >
          <div className="text-4xl" style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}>🔮</div>
          <div className="absolute inset-0 rounded-xl border-2" style={{ borderColor: `${accentColor}30` }} />
          <div className="absolute top-2 left-2 text-xs" style={{ color: `${accentColor}80` }}>✦</div>
          <div className="absolute top-2 right-2 text-xs" style={{ color: `${accentColor}80` }}>✦</div>
          <div className="absolute bottom-2 left-2 text-xs" style={{ color: `${accentColor}80` }}>✦</div>
          <div className="absolute bottom-2 right-2 text-xs" style={{ color: `${accentColor}80` }}>✦</div>
        </div>

        <div
          className="card-front shadow-lg w-full h-full"
          style={{
            background: `linear-gradient(145deg, ${cardColor}ee 0%, ${adjustColor(cardColor, -20)}ee 100%)`,
            border: `2px solid ${card.star.color}`
          }}
        >
          <div className="text-center">
            <div
              className="text-5xl mb-2"
              style={{
                filter: `drop-shadow(0 0 10px ${card.star.color})`
              }}
            >
              {card.star.symbol}
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: card.star.color }}
            >
              {card.star.name}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

function adjustColor(hex, amount) {
  if (!hex || !hex.startsWith('#')) return hex;
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default Card;
