import { useState, useEffect, useMemo } from 'react';

const Card = ({ card, onClick, disabled, skinTheme, starRailLevel = null }) => {
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

  const railEffect = useMemo(() => {
    if (!starRailLevel || !isMatched) return null;
    
    const level = starRailLevel;
    return {
      glowIntensity: level.glowIntensity || 0,
      color: level.color || '#ffd700',
      effect: level.cardEffect || 'glow',
      particleCount: level.particleCount || 0
    };
  }, [starRailLevel, isMatched]);

  const getRailGlowStyle = () => {
    if (!railEffect) return {};
    
    const { glowIntensity, color, effect } = railEffect;
    const glowSize = 10 + glowIntensity * 20;
    const opacity = 0.3 + glowIntensity * 0.5;
    
    let boxShadow = `0 0 ${glowSize}px ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
    
    if (effect === 'pulse' || effect === 'supernova') {
      boxShadow += `, 0 0 ${glowSize * 1.5}px ${color}40`;
    }
    if (effect === 'cosmic') {
      boxShadow += `, 0 0 ${glowSize * 2}px ${color}30, inset 0 0 ${glowSize / 2}px ${color}30`;
    }
    
    return { boxShadow };
  };

  const getEffectClass = () => {
    if (!railEffect) return '';
    
    switch (railEffect.effect) {
      case 'glow':
        return 'star-rail-glow';
      case 'pulse':
        return 'star-rail-pulse';
      case 'rainbow':
        return 'star-rail-rainbow';
      case 'supernova':
        return 'star-rail-supernova';
      case 'cosmic':
        return 'star-rail-cosmic';
      default:
        return '';
    }
  };

  const renderParticles = () => {
    if (!railEffect || railEffect.particleCount <= 0) return null;
    
    const particles = [];
    for (let i = 0; i < railEffect.particleCount; i++) {
      const size = 2 + Math.random() * 4;
      const posX = 10 + Math.random() * 80;
      const posY = 10 + Math.random() * 80;
      const delay = Math.random() * 2;
      const duration = 1.5 + Math.random() * 2;
      
      particles.push(
        <div
          key={i}
          className="star-particle absolute rounded-full pointer-events-none"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: railEffect.color,
            left: `${posX}%`,
            top: `${posY}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            boxShadow: `0 0 ${size * 2}px ${railEffect.color}`
          }}
        />
      );
    }
    return particles;
  };

  return (
    <button
      className={`card-container w-full aspect-[3/4] cursor-pointer select-none
        focus:outline-none focus:ring-2 focus:ring-star-gold/50
        ${isFlipped ? 'card-flipped' : ''}
        ${isMatched ? 'card-matched' : ''}
        ${railEffect ? getEffectClass() : ''}
        ${disabled ? 'pointer-events-none opacity-50' : ''}
      `}
      onClick={handleClick}
      disabled={disabled || isFlipped || isMatched}
      aria-label={isFlipped || isMatched ? card.star.name : '未翻开的星纹卡牌'}
    >
      <div className="card-inner w-full h-full relative">
        {railEffect && (
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none z-0"
            style={getRailGlowStyle()}
          />
        )}
        
        {renderParticles()}

        <div className="card-back shadow-lg w-full h-full relative z-10"
          style={{
            background: `linear-gradient(145deg, ${cardColor} 0%, ${adjustColor(cardColor, -30)} 100%)`,
            border: `2px solid ${railEffect ? railEffect.color : cardBorderColor}`
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
          className="card-front shadow-lg w-full h-full relative z-10"
          style={{
            background: `linear-gradient(145deg, ${cardColor}ee 0%, ${adjustColor(cardColor, -20)}ee 100%)`,
            border: `2px solid ${railEffect && isMatched ? railEffect.color : card.star.color}`
          }}
        >
          <div className="text-center">
            <div
              className="text-5xl mb-2 transition-all duration-300"
              style={{
                filter: `drop-shadow(0 0 10px ${railEffect && isMatched ? railEffect.color : card.star.color})`,
                transform: railEffect && isMatched ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {card.star.symbol}
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: railEffect && isMatched ? railEffect.color : card.star.color }}
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
