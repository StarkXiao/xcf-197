import { getLevelById, FULL_LETTER } from '../data/gameData';

const ResultPage = ({ isWin, result, onRestart, onNextLevel, onHome, hasNextLevel }) => {
  const level = getLevelById(result?.levelId || 1);

  const getStarsRating = () => {
    if (!isWin) return 0;
    const { timeLeft, moves } = result;
    const timeRatio = timeLeft / (level?.timeLimit || 60);
    const moveRatio = (level?.pairs || 4) * 2 / (moves || 1);

    if (timeRatio > 0.5 && moveRatio > 0.8) return 3;
    if (timeRatio > 0.3 && moveRatio > 0.5) return 2;
    return 1;
  };

  const stars = getStarsRating();

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">
            {isWin ? '🎉' : '💔'}
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isWin ? 'text-star-gold glow-text' : 'text-star-pink'}`}>
            {isWin ? '恭喜通关！' : '时间到...'}
          </h1>
          <p className="text-white/70">
            {isWin
              ? `第 ${level?.id} 关 · ${level?.name}`
              : '别灰心，再试一次吧！'
            }
          </p>
        </div>

        {isWin && (
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className={`text-4xl transition-all duration-500 ${
                  i <= stars
                    ? 'text-star-gold animate-pulse'
                    : 'text-gray-600'
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  filter: i <= stars ? 'drop-shadow(0 0 10px #ffd700)' : 'none'
                }}
              >
                ⭐
              </span>
            ))}
          </div>
        )}

        <div className="bg-star-purple/30 rounded-2xl p-6 mb-8 border border-star-gold/20">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">最终得分</div>
              <div className="text-2xl font-bold text-star-gold">
                {result?.score || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">步数</div>
              <div className="text-2xl font-bold text-white">
                {result?.moves || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">
                {isWin ? '剩余时间' : '用时'}
              </div>
              <div className="text-2xl font-bold text-star-cyan">
                {isWin
                  ? `${Math.floor((result?.timeLeft || 0) / 60)}:${String((result?.timeLeft || 0) % 60).padStart(2, '0')}`
                  : `${level?.timeLimit || 0}s`
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-white/50 mb-1">最高连击</div>
              <div className="text-2xl font-bold text-star-pink">
                x{result?.maxCombo || 0}
              </div>
            </div>
          </div>
        </div>

        {isWin && level?.letterFragment && (
          <div className="letter-fragment p-6 mb-8 max-w-sm mx-auto">
            <div className="text-center text-xs text-amber-700/60 mb-3">
              ✨ 情书碎片 ✨
            </div>
            <p className="text-center italic leading-relaxed text-amber-900">
              "{level.letterFragment}"
            </p>
          </div>
        )}

        {isWin && !hasNextLevel && (
          <div className="letter-fragment p-6 mb-8 max-w-sm mx-auto">
            <div className="text-center text-xs text-amber-700/60 mb-3">
              💌 完整情书 💌
            </div>
            <div className="text-center text-xs text-amber-900/80 whitespace-pre-line leading-relaxed">
              {FULL_LETTER}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {isWin && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full btn-star text-lg py-4"
            >
              下一关 →
            </button>
          )}

          <button
            onClick={onRestart}
            className={`w-full py-3 rounded-full font-bold transition-all ${
              isWin
                ? 'border-2 border-star-gold/50 text-star-gold hover:bg-star-gold/10'
                : 'btn-star'
            }`}
          >
            {isWin ? '再玩一次' : '重新挑战'}
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 rounded-full border-2 border-white/30 text-white/70 hover:bg-white/10 transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
