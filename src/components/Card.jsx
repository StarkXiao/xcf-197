import { useState, useEffect, useMemo } from 'react';

const Card = ({ 
  card, 
  onClick, 
  disabled, 
  skinTheme, 
  starRailLevel = null, 
  isFogged = false, 
  isRevealed = false,
  isFakeCard = false,
  fakeCardInfo = null,
  onFakeCardRevealed = null
}) => {
  const [isFlipped, setIsFlipped] = useState(card.isFlipped);
  const [isMatched, setIsMatched] = useState(card.isMatched);
  const [fakeRevealed, setFakeRevealed] = useState(false);

  useEffect(() => {
    setIsFlipped(card.isFlipped);
  }, [card.isFlipped]);

  useEffect(() => {
    setIsMatched(card.isMatched);
  }, [card.isMatched]);

  useEffect(() => {
    if (card.isFlipped && isFakeCard && !fakeRevealed) {
      setFakeRevealed(true);
      if (onFakeCardRevealed) {
        setTimeout(() => onFakeCardRevealed(card.id), 800);
      }
    }
  }, [card.isFlipped, isFakeCard, fakeRevealed, card.id, onFakeCardRevealed]);

  const handleClick = () => {
    if (!disabled && !isFlipped && !isMatched) {
      onClick(card.id);
    }
  };

  const cardColor = skinTheme?.cardColor || '#2d1b69';
  const cardBorderColor = skinTheme?.cardBorder || 'rgba(255, 215, 0, 0.3)';
  const accentColor = skinTheme?.accent || '#ffd700';
  const glowColor = skinTheme?.glow || 'rgba(139, 92, 246, 0.5)';

  const displayInfo = (isFlipped || isRevealed) && isFakeCard && fakeCardInfo
    ? fakeCardInfo
    : card.star;

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
      className={`card-container w-full aspect-[3/4] cursor-pointer select-none relative
        focus:outline-none focus:ring-2 focus:ring-star-gold/50
        ${isFlipped || isRevealed ? 'card-flipped' : ''}
        ${isMatched ? 'card-matched' : ''}
        ${railEffect ? getEffectClass() : ''}
        ${disabled ? 'pointer-events-none opacity-50' : ''}
        ${isFakeCard && (isFlipped || isRevealed) ? 'fake-card-revealed' : ''}
      `}
      onClick={handleClick}
      disabled={disabled || isFlipped || isMatched || isFogged}
      aria-label={isFlipped || isMatched || isRevealed ? displayInfo.name : '未翻开的星纹卡牌'}
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
          className={`card-front shadow-lg w-full h-full relative z-10 ${isFakeCard && (isFlipped || isRevealed) ? 'fake-card-front' : ''}`}
          style={{
            background: isFakeCard && (isFlipped || isRevealed)
              ? 'linear-gradient(145deg, rgba(30, 30, 50, 0.95) 0%, rgba(15, 15, 30, 0.98) 100%)'
              : `linear-gradient(145deg, ${cardColor}ee 0%, ${adjustColor(cardColor, -20)}ee 100%)`,
            border: `2px solid ${isFakeCard && (isFlipped || isRevealed) ? '#ef4444' : (railEffect && isMatched ? railEffect.color : card.star.color)}`
          }}
        >
          <div className="text-center">
            <div
              className="text-5xl mb-2 transition-all duration-300"
              style={{
                filter: `drop-shadow(0 0 10px ${isFakeCard && (isFlipped || isRevealed) ? '#ef4444' : (railEffect && isMatched ? railEffect.color : card.star.color)})`,
                transform: railEffect && isMatched ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {displayInfo.symbol}
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: isFakeCard && (isFlipped || isRevealed) ? '#ef4444' : (railEffect && isMatched ? railEffect.color : card.star.color) }}
            >
              {displayInfo.name}
            </div>
            {isFakeCard && (isFlipped || isRevealed) && (
              <div className="text-xs mt-1 text-red-400 animate-pulse font-bold">
                ⚠ 幻影
              </div>
            )}
          </div>
        </div>

        {isFogged && (
          <div 
            className="absolute inset-0 rounded-xl z-30 pointer-events-none star-fog-overlay"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(200, 200, 220, 0.9) 0%, rgba(120, 120, 160, 0.95) 50%, rgba(80, 80, 120, 0.98) 100%)',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl opacity-80 animate-pulse">🌫️</span>
            </div>
            <div className="absolute inset-0 rounded-xl border-2 border-gray-400/30" />
          </div>
        )}

        {isRevealed && !isFlipped && !isMatched && (
          <div 
            className="absolute inset-0 rounded-xl z-30 pointer-events-none dream-mirror-glow animate-pulse"
            style={{
              boxShadow: isFakeCard
                ? '0 0 25px 8px rgba(239, 68, 68, 0.7), inset 0 0 20px rgba(239, 68, 68, 0.3)'
                : '0 0 25px 8px rgba(139, 92, 246, 0.7), inset 0 0 20px rgba(139, 92, 246, 0.3)',
              border: `3px solid ${isFakeCard ? 'rgba(239, 68, 68, 0.8)' : 'rgba(167, 139, 250, 0.8)'}`
            }}
          >
            <div className="absolute top-1 right-1 text-lg">{isFakeCard ? '💀' : '🔮'}</div>
          </div>
        )}
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
