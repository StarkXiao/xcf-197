import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import ArchivePage from './pages/ArchivePage';
import StarAlbumPage from './pages/StarAlbumPage';
import DailyChallengePage from './pages/DailyChallengePage';
import DailyChallengeGamePage from './pages/DailyChallengeGamePage';
import AchievementWallPage from './pages/AchievementWallPage';
import DivinationShopPage from './pages/DivinationShopPage';
import StoryCorridorPage from './pages/StoryCorridorPage';
import SeasonChallengePage from './pages/SeasonChallengePage';
import SeasonSettlementPage from './pages/SeasonSettlementPage';
import LetterWorkshopPage from './pages/LetterWorkshopPage';
import VisitorCommissionPage from './pages/VisitorCommissionPage';
import StarryBackground from './components/StarryBackground';
import AchievementUnlockModal from './components/AchievementUnlockModal';
import StoryChoiceModal from './components/StoryChoiceModal';
import { LEVELS, getLevelById, getStoryBranchByChapter } from './data/gameData';
import { useArchive } from './hooks/useArchive';
import { useDailyChallenge } from './hooks/useDailyChallenge';
import { useAchievements } from './hooks/useAchievements';
import { useShop } from './hooks/useShop';
import { useSeasonChallenge } from './hooks/useSeasonChallenge';
import { useLetterWorkshop } from './hooks/useLetterWorkshop';
import { useVisitorCommission } from './hooks/useVisitorCommission';

const PAGES = {
  HOME: 'home',
  GAME: 'game',
  RESULT: 'result',
  ARCHIVE: 'archive',
  STAR_ALBUM: 'star-album',
  DAILY_CHALLENGE: 'daily-challenge',
  DAILY_CHALLENGE_GAME: 'daily-challenge-game',
  ACHIEVEMENT: 'achievement',
  SHOP: 'shop',
  STORY_CORRIDOR: 'story-corridor',
  SEASON_CHALLENGE: 'season-challenge',
  SEASON_SETTLEMENT: 'season-settlement',
  LETTER_WORKSHOP: 'letter-workshop',
  VISITOR_COMMISSION: 'visitor-commission'
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameResult, setGameResult] = useState(null);
  const [isWin, setIsWin] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [highScores, setHighScores] = useState({});
  const [showStoryChoiceModal, setShowStoryChoiceModal] = useState(false);
  const [pendingStoryChapterId, setPendingStoryChapterId] = useState(null);
  const archive = useArchive();
  const dailyChallenge = useDailyChallenge();
  const achievements = useAchievements(archive);
  const shop = useShop();
  const seasonChallenge = useSeasonChallenge(archive, achievements, shop);
  const letterWorkshop = useLetterWorkshop(archive);
  const visitorCommission = useVisitorCommission(archive, shop);

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

      if (result.timeLeft > level.timeLimit * 0.5) {
        archive.incrementFastLevel();
      }

      seasonChallenge.updateStatsOnWin({
        levelId: result.levelId,
        stars,
        maxCombo: result.maxCombo || 0,
        timeLeft: result.timeLeft,
        moves: result.moves,
        isPerfect: result.timeLeft === level.timeLimit
      });

      const basePoints = 10;
      const starBonus = stars * 5;
      const comboBonus = Math.floor((result.maxCombo || 0) / 3) * 2;
      const timeBonus = result.timeLeft > level.timeLimit * 0.5 ? 5 : 0;
      const totalPoints = basePoints + starBonus + comboBonus + timeBonus;
      seasonChallenge.addSeasonPoints(totalPoints, stars);
    }

    const branch = getStoryBranchByChapter(result.levelId);
    if (branch && !archive.storyChoices[branch.choicePoint.id]) {
      setPendingStoryChapterId(result.levelId);
      setTimeout(() => {
        setShowStoryChoiceModal(true);
      }, 500);
    }

    setCurrentPage(PAGES.RESULT);
  };

  const handleOpenArchive = () => {
    setCurrentPage(PAGES.ARCHIVE);
  };

  const handleBackFromArchive = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleOpenStarAlbum = () => {
    setCurrentPage(PAGES.STAR_ALBUM);
  };

  const handleBackFromStarAlbum = () => {
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

  const handleOpenDailyChallenge = () => {
    setCurrentPage(PAGES.DAILY_CHALLENGE);
  };

  const handleBackFromDailyChallenge = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleStartDailyChallenge = () => {
    setCurrentPage(PAGES.DAILY_CHALLENGE_GAME);
  };

  const handleDailyChallengeComplete = () => {
    setCurrentPage(PAGES.DAILY_CHALLENGE);
  };

  const handleOpenAchievements = () => {
    seasonChallenge.recordPageVisit('achievement');
    setCurrentPage(PAGES.ACHIEVEMENT);
  };

  const handleBackFromAchievements = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleOpenAchievementsFromResult = () => {
    setCurrentPage(PAGES.ACHIEVEMENT);
  };

  const handleCloseAchievementModal = () => {
    achievements.closeModal();
  };

  const handleOpenShop = () => {
    seasonChallenge.recordPageVisit('shop');
    setCurrentPage(PAGES.SHOP);
  };

  const handleBackFromShop = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleOpenStoryCorridor = () => {
    setCurrentPage(PAGES.STORY_CORRIDOR);
  };

  const handleBackFromStoryCorridor = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleStartGameFromShop = (levelId) => {
    if (levelId) {
      setCurrentLevel(levelId);
      setCurrentPage(PAGES.GAME);
    } else {
      setCurrentPage(PAGES.HOME);
    }
  };

  const handleOpenSeasonChallenge = () => {
    setCurrentPage(PAGES.SEASON_CHALLENGE);
  };

  const handleBackFromSeasonChallenge = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleOpenSeasonSettlement = () => {
    setCurrentPage(PAGES.SEASON_SETTLEMENT);
  };

  const handleBackFromSeasonSettlement = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleOpenLetterWorkshop = () => {
    setCurrentPage(PAGES.LETTER_WORKSHOP);
  };

  const handleBackFromLetterWorkshop = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleOpenVisitorCommission = () => {
    setCurrentPage(PAGES.VISITOR_COMMISSION);
  };

  const handleBackFromVisitorCommission = () => {
    setCurrentPage(PAGES.HOME);
  };

  const handleHomeFromResult = () => {
    achievements.clearNewAchievements();
    handleHome();
  };

  const handleNextLevelFromResult = () => {
    achievements.clearNewAchievements();
    handleNextLevel();
  };

  const handleRestartFromResult = () => {
    achievements.clearNewAchievements();
    handleRestart();
  };

  const hasNextLevel = currentLevel < LEVELS.length;

  const skinTheme = seasonChallenge?.getCurrentSkinTheme?.() || {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
    cardColor: '#2d1b69',
    cardBorder: '#4c1d95',
    textPrimary: '#ffffff',
    textSecondary: '#a5b4fc',
    accent: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.5)'
  };

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        '--skin-bg': skinTheme.background,
        '--skin-card': skinTheme.cardColor,
        '--skin-card-border': skinTheme.cardBorder,
        '--skin-text': skinTheme.textPrimary,
        '--skin-text-secondary': skinTheme.textSecondary,
        '--skin-accent': skinTheme.accent,
        '--skin-glow': skinTheme.glow
      }}
    >
      <StarryBackground skinTheme={skinTheme} />

      {currentPage === PAGES.HOME && (
        <HomePage
          onStartGame={handleStartGame}
          onSelectLevel={handleSelectLevel}
          onOpenArchive={handleOpenArchive}
          onOpenStarAlbum={handleOpenStarAlbum}
          onOpenDailyChallenge={handleOpenDailyChallenge}
          onOpenAchievements={handleOpenAchievements}
          onOpenShop={handleOpenShop}
          onOpenStoryCorridor={handleOpenStoryCorridor}
          onOpenSeasonChallenge={handleOpenSeasonChallenge}
          onOpenLetterWorkshop={handleOpenLetterWorkshop}
          onOpenVisitorCommission={handleOpenVisitorCommission}
          unlockedLevel={unlockedLevel}
          highScores={highScores}
          collectedStars={archive.collectedFragments.length}
          achievements={achievements}
          shop={shop}
          seasonChallenge={seasonChallenge}
          letterWorkshop={letterWorkshop}
          visitorCommission={visitorCommission}
        />
      )}

      {currentPage === PAGES.GAME && (
        <GamePage
          key={currentLevel}
          levelId={currentLevel}
          onBack={handleBack}
          onWin={handleWin}
          onLose={handleLose}
          shop={shop}
          skinTheme={skinTheme}
        />
      )}

      {currentPage === PAGES.RESULT && gameResult && (
        <ResultPage
          isWin={isWin}
          result={gameResult}
          onRestart={handleRestartFromResult}
          onNextLevel={handleNextLevelFromResult}
          onHome={handleHomeFromResult}
          hasNextLevel={hasNextLevel}
          achievements={achievements}
          onOpenAchievements={handleOpenAchievementsFromResult}
        />
      )}

      {currentPage === PAGES.ARCHIVE && (
        <ArchivePage
          archive={archive}
          onBack={handleBackFromArchive}
        />
      )}

      {currentPage === PAGES.STAR_ALBUM && (
        <StarAlbumPage
          archive={archive}
          onBack={handleBackFromStarAlbum}
        />
      )}

      {currentPage === PAGES.DAILY_CHALLENGE && (
        <DailyChallengePage
          dailyChallenge={dailyChallenge}
          onStartChallenge={handleStartDailyChallenge}
          onBack={handleBackFromDailyChallenge}
        />
      )}

      {currentPage === PAGES.DAILY_CHALLENGE_GAME && (
        <DailyChallengeGamePage
          key="daily-challenge-game"
          dailyChallenge={dailyChallenge}
          onBack={handleBackFromDailyChallenge}
          onComplete={handleDailyChallengeComplete}
          skinTheme={skinTheme}
        />
      )}

      {currentPage === PAGES.ACHIEVEMENT && (
        <AchievementWallPage
          achievements={achievements}
          onBack={handleBackFromAchievements}
        />
      )}

      {currentPage === PAGES.SHOP && (
        <DivinationShopPage
          shop={shop}
          onBack={handleBackFromShop}
          onStartGame={handleStartGameFromShop}
          unlockedLevel={unlockedLevel}
          seasonChallenge={seasonChallenge}
        />
      )}

      {currentPage === PAGES.STORY_CORRIDOR && (
        <StoryCorridorPage
          archive={archive}
          onBack={handleBackFromStoryCorridor}
        />
      )}

      {currentPage === PAGES.SEASON_CHALLENGE && (
        <SeasonChallengePage
          seasonChallenge={seasonChallenge}
          onBack={handleBackFromSeasonChallenge}
          onOpenSettlement={handleOpenSeasonSettlement}
        />
      )}

      {currentPage === PAGES.SEASON_SETTLEMENT && (
        <SeasonSettlementPage
          seasonChallenge={seasonChallenge}
          onBack={handleBackFromSeasonSettlement}
        />
      )}

      {currentPage === PAGES.LETTER_WORKSHOP && (
        <LetterWorkshopPage
          workshop={letterWorkshop}
          archive={archive}
          onBack={handleBackFromLetterWorkshop}
        />
      )}

      {currentPage === PAGES.VISITOR_COMMISSION && (
        <VisitorCommissionPage
          visitorCommission={visitorCommission}
          archive={archive}
          shop={shop}
          onBack={handleBackFromVisitorCommission}
          skinTheme={skinTheme}
        />
      )}

      <AchievementUnlockModal
        achievements={achievements}
        onClose={handleCloseAchievementModal}
      />

      <StoryChoiceModal
        isOpen={showStoryChoiceModal}
        onClose={() => setShowStoryChoiceModal(false)}
        chapterId={pendingStoryChapterId}
        archive={archive}
      />
    </div>
  );
}

export default App;
