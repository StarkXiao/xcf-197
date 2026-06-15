import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import StarryBackground from './components/StarryBackground';
import { LEVELS } from './data/gameData';

const PAGES = {
  HOME: 'home',
  GAME: 'game',
  RESULT: 'result'
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameResult, setGameResult] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [highScores, setHighScores] = useState({});

  useEffect(() => {
    const savedProgress = localStorage.getItem('starTowerProgress');
    if (savedProgress) {
      try {
        const data = JSON.parse(savedProgress);
        setUnlockedLevel(data.unlockedLevel || 1);
        setHighScores(data.highScores || {});
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  const saveProgress = (level, score) => {
    const newHighScores = { ...highScores };
    if (!newHighScores[level] || score > newHighScores[level]) {
      newHighScores[level] = score;
    }

    const newUnlocked = Math.max(unlockedLevel, level + 1);
    const maxLevel = LEVELS.length;
    const finalUnlocked = Math.min(newUnlocked, maxLevel);

    setHighScores(newHighScores);
    setUnlockedLevel(finalUnlocked);

    localStorage.setItem('starTowerProgress', JSON.stringify({
      unlockedLevel: finalUnlocked,
      highScores: newHighScores
    }));
  };

  const handleStartGame = (levelId) => {
    setCurrentLevel(levelId);
    setCurrentPage(PAGES.GAME);
  };

  const handleSelectLevel = (levelId) => {
    if (levelId <= unlockedLevel) {
      setCurrentLevel(levelId);
      setCurrentPage(PAGES.GAME);
    }
  };

  const handleWin = (result) => {
    setIsWin(true);
    setGameResult(result);
    setCurrentPage(PAGES.RESULT);
    saveProgress(result.levelId, result.score);
  };

  const handleLose = (result) => {
    setIsWin(false);
    setGameResult(result);
    setCurrentPage(PAGES.RESULT);
  };

  const handleRestart = () => {
    setCurrentPage(PAGES.GAME);
  };

  const handleNextLevel = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel <= LEVELS.length) {
      setCurrentLevel(nextLevel);
      setCurrentPage(PAGES.GAME);
    }
  };

  const handleHome = () => {
    setCurrentPage(PAGES.HOME);
    setGameResult(null);
  };

  const handleBack = () => {
    setCurrentPage(PAGES.HOME);
  };

  const hasNextLevel = currentLevel < LEVELS.length;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <StarryBackground />

      {currentPage === PAGES.HOME && (
        <HomePage
          onStartGame={handleStartGame}
          onSelectLevel={handleSelectLevel}
          unlockedLevel={unlockedLevel}
          highScores={highScores}
        />
      )}

      {currentPage === PAGES.GAME && (
        <GamePage
          key={currentLevel}
          levelId={currentLevel}
          onBack={handleBack}
          onWin={handleWin}
          onLose={handleLose}
        />
      )}

      {currentPage === PAGES.RESULT && gameResult && (
        <ResultPage
          isWin={isWin}
          result={gameResult}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
          onHome={handleHome}
          hasNextLevel={hasNextLevel}
        />
      )}
    </div>
  );
}

export default App;
