import { useState, useRef, useCallback } from 'react';
import { POSTER_THEMES, RARITY_INFO, SPECIAL_SENTENCES, WORKSHOP_LETTERS } from '../../data/gameData';
import Modal from '../../components/Modal';

const SharePoster = ({ workshop }) => {
  const [posterContent, setPosterContent] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(workshop.selectedPosterTheme);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const posterRef = useRef(null);

  const theme = POSTER_THEMES.find(t => t.id === selectedTheme) || POSTER_THEMES[0];

  const createLetterPoster = (letterId) => {
    const letter = WORKSHOP_LETTERS.find(l => l.id === letterId);
    if (!letter || !workshop.completedLetters.includes(letterId)) return;
    setPosterContent({
      type: 'letter',
      id: letter.id,
      name: letter.name,
      icon: letter.icon,
      text: letter.completeText,
      rarity: letter.rarity
    });
  };

  const createSentencePoster = (sentenceId) => {
    const sentence = SPECIAL_SENTENCES.find(s => s.id === sentenceId);
    if (!sentence || !workshop.unlockedSentences.includes(sentenceId)) return;
    setPosterContent({
      type: 'sentence',
      id: sentence.id,
      author: sentence.author,
      icon: sentence.icon,
      text: sentence.text,
      rarity: sentence.rarity
    });
  };

  const handleShare = useCallback(() => {
    if (!posterContent) return;

    workshop.createPoster({
      contentId: posterContent.id,
      contentType: posterContent.type,
      themeId: selectedTheme,
      text: posterContent.text
    });

    workshop.setPosterTheme(selectedTheme);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `✨ 星塔占卜 · 信笺工坊 ✨\n\n"${posterContent.text}"\n\n${posterContent.type === 'letter' ? `—— ${posterContent.name}` : `—— ${posterContent.author}`}\n\n🌟 来自星塔占卜`
      ).catch(() => {});
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, [posterContent, selectedTheme, workshop]);

  const completedLetters = WORKSHOP_LETTERS.filter(l => workshop.completedLetters.includes(l.id));
  const unlockedSentenceList = SPECIAL_SENTENCES.filter(s => workshop.unlockedSentences.includes(s.id));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">🎨</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          分享海报
        </h2>
        <p className="text-white/60 text-sm">
          选择内容生成精美分享海报，将星光传递给更多人
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-star-gold font-bold mb-3 flex items-center gap-2">
            <span>💌</span> 完成的情书
          </h3>
          {completedLetters.length === 0 ? (
            <div className="text-center py-8 bg-star-purple/20 rounded-xl border border-star-gold/10">
              <p className="text-white/40 text-sm">还没有完成的情书</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedLetters.map(letter => {
                const rarity = RARITY_INFO[letter.rarity];
                return (
                  <button
                    key={letter.id}
                    onClick={() => createLetterPoster(letter.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02]
                      ${posterContent?.id === letter.id && posterContent?.type === 'letter'
                        ? 'border-star-gold bg-star-gold/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{letter.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm" style={{ color: rarity.color }}>{letter.name}</span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${rarity.color}20`,
                              color: rarity.color,
                              border: `1px solid ${rarity.color}40`
                            }}
                          >
                            {rarity.name}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs truncate">{letter.completeText}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-star-gold font-bold mb-3 flex items-center gap-2">
            <span>💬</span> 解锁的句段
          </h3>
          {unlockedSentenceList.length === 0 ? (
            <div className="text-center py-8 bg-star-purple/20 rounded-xl border border-star-gold/10">
              <p className="text-white/40 text-sm">还没有解锁的句段</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
              {unlockedSentenceList.map(sentence => {
                const rarity = RARITY_INFO[sentence.rarity];
                return (
                  <button
                    key={sentence.id}
                    onClick={() => createSentencePoster(sentence.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02]
                      ${posterContent?.id === sentence.id && posterContent?.type === 'sentence'
                        ? 'border-star-gold bg-star-gold/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{sentence.icon}</span>
                      <span className="text-white/80 text-xs font-medium">{sentence.author}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
                        style={{
                          backgroundColor: `${rarity.color}20`,
                          color: rarity.color,
                          border: `1px solid ${rarity.color}40`
                        }}
                      >
                        {rarity.name}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs italic line-clamp-1">"{sentence.text}"</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {posterContent && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-star-gold font-bold flex items-center gap-2">
              <span>🖼️</span> 海报预览
            </h3>
            <button
              onClick={() => setShowThemePicker(true)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 transition-all"
            >
              🎨 更换主题
            </button>
          </div>

          <div
            ref={posterRef}
            className="relative max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: theme.bgColor }}
          >
            <div className="p-8 text-center">
              <div className="text-4xl mb-4 opacity-80">{posterContent.icon}</div>

              {posterContent.type === 'letter' ? (
                <>
                  <div
                    className="text-xs tracking-widest mb-3 opacity-60"
                    style={{ color: theme.accentColor }}
                  >
                    ✨ 信笺工坊 · {posterContent.name} ✨
                  </div>
                  <p
                    className="text-base italic leading-relaxed mb-6"
                    style={{ color: theme.textColor }}
                  >
                    "{posterContent.text}"
                  </p>
                  <div
                    className="text-xs opacity-50"
                    style={{ color: theme.textColor }}
                  >
                    —— 星塔占卜师
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="text-xs tracking-widest mb-3 opacity-60"
                    style={{ color: theme.accentColor }}
                  >
                    ✨ 信笺工坊 · 守护者之声 ✨
                  </div>
                  <p
                    className="text-base italic leading-loose mb-6"
                    style={{ color: theme.textColor }}
                  >
                    "{posterContent.text}"
                  </p>
                  <div
                    className="text-xs opacity-50"
                    style={{ color: theme.textColor }}
                  >
                    —— {posterContent.author}
                  </div>
                </>
              )}

              <div className="mt-6 pt-4 border-t border-white/10">
                <div
                  className="text-xs opacity-40"
                  style={{ color: theme.textColor }}
                >
                  🌟 星塔占卜 · 信笺工坊
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handleShare}
              className="btn-star px-8 py-3 flex items-center gap-2"
            >
              <span>📤</span>
              <span>分享海报</span>
            </button>
          </div>

          {showSuccess && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl text-center animate-slide-in">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-bold">分享成功！</div>
              <div className="text-sm opacity-80">内容已复制到剪贴板</div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-star-purple/20 rounded-xl border border-star-gold/20">
        <h3 className="text-star-gold font-bold mb-2">💡 海报小贴士</h3>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• 完成情书拼接或解锁特殊句段后可生成分享海报</li>
          <li>• 选择不同主题让海报呈现独特的星空风格</li>
          <li>• 分享后内容将自动复制到剪贴板，可粘贴发送</li>
          <li>• 最多保存最近20张海报记录</li>
        </ul>
      </div>

      <Modal
        isOpen={showThemePicker}
        onClose={() => setShowThemePicker(false)}
        title="🎨 选择海报主题"
      >
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {POSTER_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTheme(t.id);
                setShowThemePicker(false);
              }}
              className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-105
                ${selectedTheme === t.id ? 'border-star-gold shadow-lg shadow-star-gold/30' : 'border-white/10'}
              `}
              style={{ background: t.bgColor }}
            >
              <div className="p-4 text-center">
                <div className="text-sm font-bold mb-1" style={{ color: t.textColor }}>{t.name}</div>
                <div className="text-xs" style={{ color: t.accentColor }}>{t.accentColor}</div>
              </div>
              {selectedTheme === t.id && (
                <div className="absolute top-2 right-2 bg-star-gold text-star-dark text-xs px-2 py-0.5 rounded-full font-bold">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default SharePoster;
