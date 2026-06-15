import { useState, useEffect } from 'react';

const Card = ({ card, onClick, disabled }) => {
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
        <div className="card-back shadow-lg w-full h-full">
          <div className="text-4xl">🔮</div>
          <div className="absolute inset-0 rounded-xl border-2 border-star-gold/30" />
          <div className="absolute top-2 left-2 text-star-gold/50 text-xs">✦</div>
          <div className="absolute top-2 right-2 text-star-gold/50 text-xs">✦</div>
          <div className="absolute bottom-2 left-2 text-star-gold/50 text-xs">✦</div>
          <div className="absolute bottom-2 right-2 text-star-gold/50 text-xs">✦</div>
        </div>

        <div
          className="card-front shadow-lg w-full h-full"
          style={{
            background: `linear-gradient(145deg, rgba(45, 27, 105, 0.95) 0%, rgba(30, 58, 95, 0.95) 100%)`,
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

export default Card;
