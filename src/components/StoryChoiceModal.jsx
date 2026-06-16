import { useState } from 'react';
import Modal from './Modal';
import { getStoryBranchByChapter, CHARACTER_RELATIONS } from '../data/gameData';

const StoryChoiceModal = ({ isOpen, onClose, chapterId, archive, onChoiceMade }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const branch = getStoryBranchByChapter(chapterId);

  if (!branch) return null;

  const isAlreadyChosen = archive.storyChoices[branch.choicePoint.id];

  const handleSelectOption = (option) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const handleConfirmChoice = () => {
    if (!selectedOption || !branch) return;
    archive.makeStoryChoice(branch.choicePoint.id, selectedOption.id);
    setShowResult(true);
    onChoiceMade && onChoiceMade(branch.choicePoint.id, selectedOption.id);
  };

  const handleContinue = () => {
    setSelectedOption(null);
    setShowResult(false);
    onClose && onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isAlreadyChosen ? onClose : handleContinue}
      title={isAlreadyChosen ? branch.title : `第 ${chapterId} 章 · ${branch.title}`}
      showCloseButton={isAlreadyChosen}
    >
      <div className="max-w-md mx-auto">
        {isAlreadyChosen ? (
          <div>
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">✨</div>
              <div className="text-sm text-white/60">
                你已在本章做出过选择
              </div>
            </div>
            <div className="p-4 bg-star-gold/10 rounded-xl border border-star-gold/20">
              <div className="text-xs text-star-gold/70 mb-1">你的选择</div>
              <div className="text-star-gold font-medium">
                {branch.choicePoint.options.find(o => o.id === isAlreadyChosen)?.text}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 btn-star"
            >
              继续
            </button>
          </div>
        ) : !showResult ? (
          <div>
            <div className="text-center mb-4">
              <div className="text-5xl mb-3 animate-float">🔮</div>
              <div className="text-xs text-star-gold/70 mb-2">
                {branch.subtitle}
              </div>
            </div>

            <div className="p-4 mb-5 bg-star-purple/30 rounded-xl border border-star-gold/20">
              <p className="text-white/80 text-sm leading-relaxed text-center">
                {branch.description}
              </p>
            </div>

            <div className="p-3 mb-5 bg-star-cyan/10 rounded-xl border border-star-cyan/20">
              <div className="text-xs text-star-cyan/70 mb-1 text-center">命运之问</div>
              <p className="text-white/90 text-sm leading-relaxed text-center font-medium">
                {branch.choicePoint.question}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {branch.choicePoint.options.map(option => {
                const isSelected = selectedOption?.id === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2
                      ${isSelected
                        ? 'bg-star-gold/20 border-star-gold shadow-lg shadow-star-gold/20'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all
                        ${isSelected
                          ? 'border-star-gold bg-star-gold'
                          : 'border-white/30'
                        }`}
                      >
                        {isSelected && <span className="text-star-dark text-xs font-bold">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-star-gold' : 'text-white/80'}`}>
                          {option.text}
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                            倾向：{option.mood}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmChoice}
              disabled={!selectedOption}
              className={`w-full btn-star
                ${!selectedOption ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              确认选择
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <div className="text-5xl mb-3 animate-float">✨</div>
              <div className="text-lg font-bold text-star-gold">
                选择已记录
              </div>
            </div>

            <div className="p-4 mb-4 bg-star-gold/10 rounded-xl border border-star-gold/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-star-gold text-xs">你的选择</span>
                {selectedOption?.mood && (
                  <span className="text-xs px-2 py-0.5 bg-star-gold/20 text-star-gold rounded-full">
                    {selectedOption.mood}
                  </span>
                )}
              </div>
              <div className="text-star-gold font-medium mb-2">
                {selectedOption?.text}
              </div>
              <div className="text-xs text-white/60">
                {selectedOption?.result}
              </div>
            </div>

            {branch.branches[selectedOption.id] && (
              <div className="letter-fragment p-5 mb-4">
                <div className="text-center text-xs text-amber-700/60 mb-3">
                  📖 {branch.branches[selectedOption.id].title}
                </div>
                <p className="text-amber-900 leading-relaxed whitespace-pre-line text-center italic text-sm">
                  {branch.branches[selectedOption.id].content}
                </p>
              </div>
            )}

            {selectedOption?.affectionChanges && (
              <div className="p-3 bg-star-purple/20 rounded-lg border border-white/10 mb-4">
                <div className="text-xs text-white/50 mb-2 text-center">
                  💫 守护关系变化
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(selectedOption.affectionChanges).map(([starId, value]) => {
                    const char = CHARACTER_RELATIONS.find(c => c.starId === starId);
                    return (
                      <span
                        key={starId}
                        className="text-xs px-3 py-1 bg-star-gold/15 text-star-gold rounded-full border border-star-gold/30"
                      >
                        {char?.name || starId} +{value} ♥
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleContinue}
              className="w-full btn-star"
            >
              继续 →
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StoryChoiceModal;
