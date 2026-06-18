import { useEffect, useState } from 'react';

export const BossHealthBar = ({ bossConfig, bossHp, bossHpPercent, currentPhase, currentPhaseConfig, phaseTransition, bossAttacked, damagePopup }) => {
  if (!bossConfig) return null;

  const phaseColor = currentPhaseConfig?.bossColor || '#6366f1';

  return (
    <div className={`w-full mb-3 p-3 rounded-xl border-2 transition-all duration-500 ${bossAttacked ? 'boss-hurt-shake' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${phaseColor}15 0%, ${phaseColor}08 100%)`,
        borderColor: `${phaseColor}40`
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${bossAttacked ? 'animate-bounce' : ''}`}>{bossConfig.icon}</span>
          <div>
            <div className="font-bold text-white text-sm">{bossConfig.name}</div>
            <div className="text-xs opacity-60">{bossConfig.title}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-60">阶段 {currentPhase}/3</div>
          <div className="text-sm font-bold" style={{ color: phaseColor }}>
            {currentPhaseConfig?.name || '觉醒之阵'}
          </div>
        </div>
      </div>

      <div className="relative h-4 bg-black/40 rounded-full overflow-hidden border" style={{ borderColor: `${phaseColor}30` }}>
        <div
          className="h-full transition-all duration-500 rounded-full boss-hp-bar"
          style={{
            width: `${bossHpPercent}%`,
            background: `linear-gradient(90deg, ${phaseColor} 0%, ${adjustColor(phaseColor, 30)} 50%, ${phaseColor} 100%)`,
            boxShadow: `0 0 10px ${phaseColor}80`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {bossHp} / {bossConfig.maxHp}
          </span>
        </div>
      </div>

      <div className="flex justify-between mt-2 text-xs opacity-60">
        {bossConfig.phases.map((phase, idx) => (
          <div 
            key={phase.id}
            className="flex items-center gap-1"
            style={{ color: currentPhase >= phase.id ? phase.bossColor : '#666' }}
          >
            <span>{idx < currentPhase - 1 ? '✓' : currentPhase === phase.id ? '⚔️' : '○'}</span>
            <span>{phase.name}</span>
          </div>
        ))}
      </div>

      {damagePopup && (
        <div className="absolute -top-2 right-4 pointer-events-none z-50 animate-bounce">
          <span className="text-xl font-bold text-yellow-400 drop-shadow-lg">
            -{damagePopup.value}
          </span>
        </div>
      )}

      {phaseTransition && currentPhaseConfig && (
        <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
          <div 
            className="px-8 py-4 rounded-2xl animate-bounce-in boss-phase-transition"
            style={{
              backgroundColor: `${currentPhaseConfig.bossColor}30`,
              border: `3px solid ${currentPhaseConfig.bossColor}`,
              boxShadow: `0 0 40px ${currentPhaseConfig.bossColor}60`
            }}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-xl font-bold" style={{ color: currentPhaseConfig.bossColor }}>
                阶段 {currentPhase} · {currentPhaseConfig.name}
              </div>
              <div className="text-sm text-white/80 mt-1">
                {currentPhaseConfig.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BossSkillCast = ({ castingSkill, castProgress, interruptReady, onInterrupt }) => {
  if (!castingSkill) return null;

  return (
    <div className="w-full mb-3 p-3 rounded-xl border-2 animate-pulse"
      style={{
        background: `linear-gradient(135deg, ${castingSkill.color}20 0%, ${castingSkill.color}08 100%)`,
        borderColor: `${castingSkill.color}60`
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-bounce">{castingSkill.icon}</span>
          <div>
            <div className="font-bold text-sm" style={{ color: castingSkill.color }}>
              {castingSkill.name}
            </div>
            <div className="text-xs opacity-70 text-white">{castingSkill.description}</div>
          </div>
        </div>
        {interruptReady && castingSkill.interruptible && (
          <button
            onClick={onInterrupt}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95 hover:scale-105 boss-interrupt-btn"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
            }}
          >
            ⚡ 打断！
          </button>
        )}
      </div>

      <div className="relative h-3 bg-black/40 rounded-full overflow-hidden">
        <div
          className="h-full transition-all rounded-full"
          style={{
            width: `${castProgress}%`,
            background: `linear-gradient(90deg, ${castingSkill.color} 0%, ${adjustColor(castingSkill.color, -40)} 100%)`,
            boxShadow: `0 0 8px ${castingSkill.color}`
          }}
        />
        <div
          className="absolute top-0 h-full w-1 bg-white/50 rounded-full"
          style={{ left: `${Math.max(0, castProgress - 1)}%` }}
        />
      </div>

      <div className="text-center text-xs mt-1 opacity-60">
        {castProgress < 100 ? '施法中...' : '技能释放！'}
      </div>
    </div>
  );
};

export const BossFinaleAnimation = ({ bossConfig, finaleScene, showFinale }) => {
  const [displayScene, setDisplayScene] = useState(0);

  useEffect(() => {
    setDisplayScene(finaleScene);
  }, [finaleScene]);

  if (!showFinale || !bossConfig?.finaleAnimation) return null;

  const scenes = bossConfig.finaleAnimation.scenes;
  const currentScene = scenes[displayScene] || scenes[scenes.length - 1];

  const getEffectClass = () => {
    switch (currentScene.effect) {
      case 'gather': return 'finale-gather';
      case 'bow': return 'finale-bow';
      case 'reveal': return 'finale-reveal';
      case 'ascend': return 'finale-ascend';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center boss-finale-overlay">
      <div className="absolute inset-0 bg-black/80" />
      
      <div className={`relative z-10 text-center px-8 ${getEffectClass()}`}>
        <div className="text-6xl mb-4 animate-star-float">
          {bossConfig.icon}
        </div>
        
        <div className="mb-2">
          <span className="text-2xl font-bold gold-gradient-text">
            {bossConfig.finaleAnimation.title}
          </span>
        </div>
        
        <div className="text-sm text-white/70 mb-8">
          {bossConfig.finaleAnimation.subtitle}
        </div>

        <div 
          className="px-8 py-6 rounded-2xl animate-scale-in"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)',
            border: '2px solid rgba(251, 191, 36, 0.5)',
            boxShadow: '0 0 50px rgba(251, 191, 36, 0.3)'
          }}
        >
          <div className="text-2xl font-bold text-white mb-2">
            {currentScene.text}
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            {scenes.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${idx <= displayScene ? 'bg-yellow-400' : 'bg-white/20'}`}
                style={{
                  boxShadow: idx <= displayScene ? '0 0 8px rgba(251, 191, 36, 0.8)' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <span className="text-4xl animate-star-float" style={{ animationDelay: '0.1s' }}>⭐</span>
          <span className="text-5xl animate-star-float" style={{ animationDelay: '0.2s' }}>🌟</span>
          <span className="text-4xl animate-star-float" style={{ animationDelay: '0.3s' }}>⭐</span>
        </div>
      </div>

      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute boss-finale-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

export const InterruptRewardPopup = ({ reward }) => {
  if (!reward) return null;

  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-bounce-in">
      <div 
        className="text-center px-6 py-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.6)',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
        }}
      >
        <div className="text-3xl mb-2">⚡</div>
        <div className="text-lg font-bold text-green-400 mb-2">技能打断成功！</div>
        <div className="flex gap-4 justify-center text-sm">
          {reward.score > 0 && (
            <span className="text-yellow-400 font-bold">+{reward.score} 分</span>
          )}
          {reward.combo > 0 && (
            <span className="text-pink-400 font-bold">连击 +{reward.combo}</span>
          )}
          {reward.time > 0 && (
            <span className="text-green-400 font-bold">+{reward.time}s</span>
          )}
        </div>
      </div>
    </div>
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
