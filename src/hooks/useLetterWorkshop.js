import { useState, useEffect, useCallback, useRef } from 'react';
import { WORKSHOP_LETTERS, SPECIAL_SENTENCES, POSTER_THEMES } from '../data/gameData';

const STORAGE_KEY = 'starTowerLetterWorkshop';

const loadWorkshopData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load workshop data:', e);
  }
  return null;
};

const saveWorkshopData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save workshop data:', e);
  }
};

export const useLetterWorkshop = (archive) => {
  const saved = loadWorkshopData();

  const [assembledFragments, setAssembledFragments] = useState(saved?.assembledFragments || {});
  const [completedLetters, setCompletedLetters] = useState(saved?.completedLetters || []);
  const [favoriteLetters, setFavoriteLetters] = useState(saved?.favoriteLetters || []);
  const [favoriteSentences, setFavoriteSentences] = useState(saved?.favoriteSentences || []);
  const [unlockedSentences, setUnlockedSentences] = useState(saved?.unlockedSentences || []);
  const [selectedPosterTheme, setSelectedPosterTheme] = useState(saved?.selectedPosterTheme || 'poster-stardust');
  const [sharedPosters, setSharedPosters] = useState(saved?.sharedPosters || []);

  const stateRef = useRef({});

  useEffect(() => {
    stateRef.current = {
      assembledFragments,
      completedLetters,
      favoriteLetters,
      favoriteSentences,
      unlockedSentences,
      selectedPosterTheme,
      sharedPosters
    };
  });

  const persist = useCallback((updates) => {
    const s = stateRef.current;
    const data = {
      assembledFragments: updates.assembledFragments !== undefined ? updates.assembledFragments : s.assembledFragments,
      completedLetters: updates.completedLetters !== undefined ? updates.completedLetters : s.completedLetters,
      favoriteLetters: updates.favoriteLetters !== undefined ? updates.favoriteLetters : s.favoriteLetters,
      favoriteSentences: updates.favoriteSentences !== undefined ? updates.favoriteSentences : s.favoriteSentences,
      unlockedSentences: updates.unlockedSentences !== undefined ? updates.unlockedSentences : s.unlockedSentences,
      selectedPosterTheme: updates.selectedPosterTheme !== undefined ? updates.selectedPosterTheme : s.selectedPosterTheme,
      sharedPosters: updates.sharedPosters !== undefined ? updates.sharedPosters : s.sharedPosters
    };
    saveWorkshopData(data);
  }, []);

  const checkSentenceUnlocks = useCallback(() => {
    if (!archive) return;
    const newUnlocked = [...stateRef.current.unlockedSentences];
    let changed = false;

    SPECIAL_SENTENCES.forEach(sentence => {
      if (newUnlocked.includes(sentence.id)) return;
      const cond = sentence.unlockCondition;
      let met = false;

      switch (cond.type) {
        case 'collectedFragments':
          met = archive.collectedFragments.length >= cond.value;
          break;
        case 'unlockedLevel':
          met = archive.unlockedChapters.length >= cond.value;
          break;
        case 'threeStarCount':
          met = Object.values(archive.chapterStars).filter(s => s >= 3).length >= cond.value;
          break;
        case 'maxCombo':
          met = archive.maxCombo >= cond.value;
          break;
        case 'letterProgress':
          met = archive.letterProgress >= cond.value;
          break;
        default:
          break;
      }

      if (met) {
        newUnlocked.push(sentence.id);
        changed = true;
      }
    });

    if (changed) {
      setUnlockedSentences(newUnlocked);
      persist({ unlockedSentences: newUnlocked });
    }
  }, [archive, persist]);

  useEffect(() => {
    checkSentenceUnlocks();
  }, [checkSentenceUnlocks, archive?.collectedFragments?.length, archive?.unlockedChapters?.length, archive?.letterProgress]);

  const assembleFragment = useCallback((letterId, fragmentId) => {
    const letter = WORKSHOP_LETTERS.find(l => l.id === letterId);
    if (!letter) return;

    const fragment = letter.fragments.find(f => f.id === fragmentId);
    if (!fragment) return;

    if (!archive?.unlockedChapters?.includes(fragment.levelRequired)) return;

    const current = stateRef.current.assembledFragments[letterId] || [];
    if (current.includes(fragmentId)) return;

    const updated = { ...stateRef.current.assembledFragments, [letterId]: [...current, fragmentId] };
    setAssembledFragments(updated);
    persist({ assembledFragments: updated });

    const allFragmentIds = letter.fragments.map(f => f.id);
    const newAssembled = updated[letterId];
    const isComplete = allFragmentIds.every(id => newAssembled.includes(id));

    if (isComplete && !stateRef.current.completedLetters.includes(letterId)) {
      const newCompleted = [...stateRef.current.completedLetters, letterId];
      setCompletedLetters(newCompleted);
      persist({ completedLetters: newCompleted, assembledFragments: updated });
    }
  }, [archive, persist]);

  const getLetterAssemblyStatus = useCallback((letterId) => {
    const letter = WORKSHOP_LETTERS.find(l => l.id === letterId);
    if (!letter) return null;

    const assembled = assembledFragments[letterId] || [];
    const fragments = letter.fragments.map(f => ({
      ...f,
      isUnlocked: archive?.unlockedChapters?.includes(f.levelRequired) || false,
      isAssembled: assembled.includes(f.id)
    }));

    const assembledCount = fragments.filter(f => f.isAssembled).length;
    const isComplete = completedLetters.includes(letterId);

    return {
      ...letter,
      fragments,
      assembledCount,
      totalFragments: letter.fragments.length,
      progress: Math.round((assembledCount / letter.fragments.length) * 100),
      isComplete
    };
  }, [assembledFragments, completedLetters, archive]);

  const getAllLettersStatus = useCallback(() => {
    return WORKSHOP_LETTERS.map(letter => getLetterAssemblyStatus(letter.id));
  }, [getLetterAssemblyStatus]);

  const isLetterAvailable = useCallback((letter) => {
    if (!archive) return false;
    const firstFragmentLevel = letter.fragments[0]?.levelRequired;
    return archive.unlockedChapters?.includes(firstFragmentLevel) || false;
  }, [archive]);

  const toggleFavoriteLetter = useCallback((letterId) => {
    const current = stateRef.current.favoriteLetters;
    const updated = current.includes(letterId)
      ? current.filter(id => id !== letterId)
      : [...current, letterId];
    setFavoriteLetters(updated);
    persist({ favoriteLetters: updated });
  }, [persist]);

  const toggleFavoriteSentence = useCallback((sentenceId) => {
    const current = stateRef.current.favoriteSentences;
    const updated = current.includes(sentenceId)
      ? current.filter(id => id !== sentenceId)
      : [...current, sentenceId];
    setFavoriteSentences(updated);
    persist({ favoriteSentences: updated });
  }, [persist]);

  const setPosterTheme = useCallback((themeId) => {
    setSelectedPosterTheme(themeId);
    persist({ selectedPosterTheme: themeId });
  }, [persist]);

  const createPoster = useCallback((posterData) => {
    const newPoster = {
      id: `poster-${Date.now()}`,
      ...posterData,
      createdAt: new Date().toISOString()
    };
    const updated = [newPoster, ...stateRef.current.sharedPosters].slice(0, 20);
    setSharedPosters(updated);
    persist({ sharedPosters: updated });
    return newPoster;
  }, [persist]);

  const getUnlockedSentencesWithStatus = useCallback(() => {
    return SPECIAL_SENTENCES.map(sentence => ({
      ...sentence,
      isUnlocked: unlockedSentences.includes(sentence.id),
      isFavorite: favoriteSentences.includes(sentence.id)
    }));
  }, [unlockedSentences, favoriteSentences]);

  const getFavoriteLettersData = useCallback(() => {
    return favoriteLetters
      .map(id => {
        const letter = WORKSHOP_LETTERS.find(l => l.id === id);
        if (!letter) return null;
        return {
          ...letter,
          isComplete: completedLetters.includes(id)
        };
      })
      .filter(Boolean);
  }, [favoriteLetters, completedLetters]);

  const getFavoriteSentencesData = useCallback(() => {
    return favoriteSentences
      .map(id => {
        const sentence = SPECIAL_SENTENCES.find(s => s.id === id);
        if (!sentence) return null;
        return {
          ...sentence,
          isUnlocked: unlockedSentences.includes(id)
        };
      })
      .filter(Boolean);
  }, [favoriteSentences, unlockedSentences]);

  const getWorkshopStats = useCallback(() => {
    const totalLetters = WORKSHOP_LETTERS.length;
    const completedCount = completedLetters.length;
    const totalSentences = SPECIAL_SENTENCES.length;
    const unlockedSentencesCount = unlockedSentences.length;
    const totalFragments = WORKSHOP_LETTERS.reduce((sum, l) => sum + l.fragments.length, 0);
    const assembledCount = Object.values(assembledFragments).reduce((sum, arr) => sum + arr.length, 0);

    return {
      totalLetters,
      completedLetters: completedCount,
      totalSentences,
      unlockedSentences: unlockedSentencesCount,
      totalFragments,
      assembledFragments: assembledCount,
      letterProgress: totalLetters > 0 ? Math.round((completedCount / totalLetters) * 100) : 0,
      sentenceProgress: totalSentences > 0 ? Math.round((unlockedSentencesCount / totalSentences) * 100) : 0,
      favoriteCount: favoriteLetters.length + favoriteSentences.length
    };
  }, [completedLetters, unlockedSentences, assembledFragments, favoriteLetters, favoriteSentences]);

  return {
    assembledFragments,
    completedLetters,
    favoriteLetters,
    favoriteSentences,
    unlockedSentences,
    selectedPosterTheme,
    sharedPosters,
    assembleFragment,
    getLetterAssemblyStatus,
    getAllLettersStatus,
    isLetterAvailable,
    toggleFavoriteLetter,
    toggleFavoriteSentence,
    setPosterTheme,
    createPoster,
    getUnlockedSentencesWithStatus,
    getFavoriteLettersData,
    getFavoriteSentencesData,
    getWorkshopStats
  };
};
