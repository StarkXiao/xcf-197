import { useEffect, useState, useMemo } from 'react';

const StarryBackground = ({ skinTheme }) => {
  const [stars, setStars] = useState([]);

  const starColor = useMemo(() => {
    if (!skinTheme?.accent) return '#fff';
    return skinTheme.accent;
  }, [skinTheme]);

  const glowColor = useMemo(() => {
    if (!skinTheme?.glow) return 'rgba(139, 92, 246, 0.3)';
    return skinTheme.glow;
  }, [skinTheme]);

  useEffect(() => {
    const generateStars = () => {
      const starArray = [];
      for (let i = 0; i < 100; i++) {
        starArray.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: Math.random() * 3 + 1,
          delay: Math.random() * 3,
          duration: Math.random() * 2 + 1
        });
      }
      setStars(starArray);
    };
    generateStars();
  }, []);

  return (
    <div className="star-bg" style={{ background: skinTheme?.background || undefined }}>
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration + 1}s`,
            background: starColor,
            boxShadow: `0 0 ${star.size * 2}px ${glowColor}`
          }}
        />
      ))}
    </div>
  );
};

export default StarryBackground;
