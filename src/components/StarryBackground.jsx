import { useEffect, useState } from 'react';

const StarryBackground = () => {
  const [stars, setStars] = useState([]);

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
    <div className="star-bg">
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
            animationDuration: `${star.duration + 1}s`
          }}
        />
      ))}
    </div>
  );
};

export default StarryBackground;
