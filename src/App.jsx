import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import ArchivePage from './pages/ArchivePage';
import StarryBackground from './components/StarryBackground';
import { LEVELS, getLevelById } from './data/gameData';
import { useArchive } from './hooks/useArchive';

const PAGES = {
  HOME: 'home',
  GAME: 'game',
  RESULT: 'result',
  ARCHIVE: 'archive'
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameResult, setGameResult] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [highScores, setHighScores] = useState({});
  const archive = useArchive();

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

  const getStarsRating = (levelId, timeLeft, moves) => {
    const level = getLevelById(levelId);
    if (!level) return 1;
    const timeRatio = timeLeft / level.timeLimit;
    const moveRatio = (level.pairs * 2) / moves;
    if (timeRatio > 0.5 && moveRatio > 0.8) return 3;
    if (timeRatio > 0.3 && moveRatio > 0.5) return 2;
    return 1;
  };

  const handleWin = (result) => {
    setIsWin(true);
    setGameResult(result);
    setCurrentPage(PAGES.RESULT);
    saveProgress(result.levelId, result.score);

    const level = getLevelById(result.levelId);
    if (level) {
      archive.collectFragmentsFromLevel(level.stars);
      archive.unlockChapter(result.levelId);
      archive.updateLetterProgress(result.levelId);

      const stars = getStarsRating(result.levelId, result.timeLeft, result.moves);
      archive.setChapterStarRating(result.levelId, stars);

      if (result.maxCombo) {
        archive.updateMaxCombo(result.maxCombo);
      }

      const timeUsed = level.timeLimit - result.timeLeft;
      archive.addPlayTime(timeUsed);
    }
  };

  const handleOpenArchive = () => {
    setCurrentPage(PAGES.ARCHIVE);
  };

  const handleBackFromArchive = () => {
    setCurrentPage(PAGES.HOME);
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
          onOpenArchive={handleOpenArchive}
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

      {currentPage === PAGES.ARCHIVE && (
        <ArchivePage
          archive={archive}
          onBack={handleBackFromArchive}
        />
      )}
    </div>
  );
}

export default App;
