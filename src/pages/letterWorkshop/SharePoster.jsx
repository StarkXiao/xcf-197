import { useState, useRef, useCallback, useEffect } from 'react';
import { POSTER_THEMES, RARITY_INFO, SPECIAL_SENTENCES, WORKSHOP_LETTERS } from '../../data/gameData';
import Modal from '../../components/Modal';

const SharePoster = ({ workshop }) => {
  const [posterContent, setPosterContent] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(workshop.selectedPosterTheme);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const canvasRef = useRef(null);

  const theme = POSTER_THEMES.find(t => t.id === selectedTheme) || POSTER_THEMES[0];

  const parseGradient = (gradientStr) => {
    const match = gradientStr.match(/linear-gradient\((\d+)deg,\s*([^)]+)\)/);
    if (!match) return { angle: 135, colors: [] };
    const angle = parseInt(match[1]);
    const colorParts = match[2].split(',').map(s => s.trim());
    const colors = colorParts.map(part => {
      const parts = part.split(/\s+/);
      return { color: parts[0], position: parts[1] ? parseFloat(parts[1]) / 100 : undefined };
    });
    return { angle, colors };
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const generatePosterImage = useCallback(async () => {
    if (!posterContent || !canvasRef.current) return null;

    setIsGenerating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 750;
    const height = 1334;

    canvas.width = width;
    canvas.height = height;

    const gradientInfo = parseGradient(theme.bgColor);
    const angleRad = (gradientInfo.angle - 90) * Math.PI / 180;
    const centerX = width / 2;
    const centerY = height / 2;
    const length = Math.sqrt(width * width + height * height) / 2;
    const x1 = centerX - Math.cos(angleRad) * length;
    const y1 = centerY - Math.sin(angleRad) * length;
    const x2 = centerX + Math.cos(angleRad) * length;
    const y2 = centerY + Math.sin(angleRad) * length;

    const bgGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradientInfo.colors.forEach(c => {
      if (c.position !== undefined) {
        bgGradient.addColorStop(c.position, c.color);
      } else {
        bgGradient.addColorStop(0, c.color);
      }
    });

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const starCount = 40;
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 0.5;
      const opacity = Math.random() * 0.6 + 0.2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.7;
      const size = Math.random() * 15 + 10;
      const opacity = Math.random() * 0.3 + 0.1;
      drawStar(ctx, x, y, 5, size, size * 0.4);
      ctx.fillStyle = `${theme.accentColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    }

    const contentX = 60;
    const contentY = 120;
    const contentWidth = width - contentX * 2;
    const contentHeight = height - contentY * 2 - 100;

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = theme.accentColor;
    drawRoundedRect(ctx, contentX - 30, contentY - 30, contentWidth + 60, contentHeight + 60, 40);
    ctx.fill();
    ctx.restore();

    ctx.font = '80px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(posterContent.icon, width / 2, contentY + 80);

    ctx.font = 'bold 24px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.globalAlpha = 0.8;
    const headerText = posterContent.type === 'letter'
      ? `✦ 信笺工坊 · ${posterContent.name} ✦`
      : `✦ 信笺工坊 · 守护者之声 ✦`;
    ctx.fillText(headerText, width / 2, contentY + 180);
    ctx.globalAlpha = 1;

    const textY = contentY + 280;
    const maxTextWidth = contentWidth - 60;
    const lineHeight = 42;

    ctx.font = 'italic 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';

    const fullText = `"${posterContent.text}"`;
    const words = fullText.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const totalTextHeight = lines.length * lineHeight;
    let currentY = textY + (contentHeight - 400) / 2 - totalTextHeight / 2;

    lines.forEach(line => {
      ctx.fillText(line, width / 2, currentY);
      currentY += lineHeight;
    });

    currentY += 40;
    ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.6;
    const authorText = posterContent.type === 'letter'
      ? '—— 星塔占卜师'
      : `—— ${posterContent.author}`;
    ctx.fillText(authorText, width / 2, currentY);
    ctx.globalAlpha = 1;

    const dividerY = height - 200;
    ctx.beginPath();
    ctx.moveTo(contentX + 50, dividerY);
    ctx.lineTo(width - contentX - 50, dividerY);
    ctx.strokeStyle = theme.textColor;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.globalAlpha = 0.4;
    ctx.fillText('🌟 星塔占卜 · 信笺工坊', width / 2, dividerY + 40);

    const date = new Date();
    const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    ctx.font = '16px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(dateStr, width / 2, dividerY + 75);
    ctx.globalAlpha = 1;

    const qrSize = 80;
    const qrX = width - contentX - qrSize;
    const qrY = dividerY + 20;

    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 10);
    ctx.fill();

    ctx.fillStyle = '#000000';
    const cellSize = 4;
    const gridSize = Math.floor((qrSize - 16) / cellSize);
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const isCorner = (i < 6 && j < 6) || (i < 6 && j >= gridSize - 6) || (i >= gridSize - 6 && j < 6);
        const isCenter = i >= gridSize / 2 - 2 && i <= gridSize / 2 + 1 && j >= gridSize / 2 - 2 && j <= gridSize / 2 + 1;
        const isRandom = Math.random() > 0.5;
        if (isCorner || isCenter || isRandom) {
          ctx.fillRect(qrX + 8 + j * cellSize, qrY + 8 + i * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }

    const imageUrl = canvas.toDataURL('image/png', 1.0);
    setGeneratedImageUrl(imageUrl);
    setIsGenerating(false);

    return imageUrl;
  }, [posterContent, theme]);

  useEffect(() => {
    if (posterContent) {
      generatePosterImage();
    } else {
      setGeneratedImageUrl(null);
    }
  }, [posterContent, selectedTheme, generatePosterImage]);

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

  const downloadImage = useCallback(() => {
    if (!generatedImageUrl) return;

    const link = document.createElement('a');
    link.download = `星塔信笺_${posterContent.type === 'letter' ? posterContent.name : posterContent.author}_${Date.now()}.png`;
    link.href = generatedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImageUrl, posterContent]);

  const shareImage = useCallback(async () => {
    if (!generatedImageUrl) return;

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'star_tower_letter.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: '星塔占卜 · 信笺工坊',
          text: `"${posterContent.text}"\n\n—— ${posterContent.type === 'letter' ? '星塔占卜师' : posterContent.author}`,
          files: [file]
        });
        workshop.createPoster({
          contentId: posterContent.id,
          contentType: posterContent.type,
          themeId: selectedTheme,
          text: posterContent.text
        });
        workshop.setPosterTheme(selectedTheme);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        return;
      }
    } catch (e) {
      console.log('Share not available, falling back to clipboard');
    }

    downloadImage();

    if (navigator.clipboard) {
      try {
        const response = await fetch(generatedImageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } catch (e) {
        console.log('Image copy failed, copying text');
        navigator.clipboard.writeText(
          `✨ 星塔占卜 · 信笺工坊 ✨\n\n"${posterContent.text}"\n\n${posterContent.type === 'letter' ? `—— ${posterContent.name}` : `—— ${posterContent.author}`}\n\n🌟 来自星塔占卜`
        ).catch(() => {});
      }
    }

    workshop.createPoster({
      contentId: posterContent.id,
      contentType: posterContent.type,
      themeId: selectedTheme,
      text: posterContent.text
    });
    workshop.setPosterTheme(selectedTheme);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, [generatedImageUrl, posterContent, selectedTheme, workshop, downloadImage]);

  const completedLetters = WORKSHOP_LETTERS.filter(l => workshop.completedLetters.includes(l.id));
  const unlockedSentenceList = SPECIAL_SENTENCES.filter(s => workshop.unlockedSentences.includes(s.id));

  return (
    <div className="max-w-4xl mx-auto">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="text-center mb-8">
        <div className="text-5xl mb-4 animate-float">🎨</div>
        <h2 className="text-2xl font-bold text-star-gold mb-2 glow-text">
          分享海报
        </h2>
        <p className="text-white/60 text-sm">
          选择内容生成精美分享海报，可保存图片分享到社交媒体
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

          <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
            <div
              className="relative max-w-sm w-full mx-auto rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: theme.bgColor }}
            >
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-star-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-white/80 text-sm">生成中...</p>
                  </div>
                </div>
              )}
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

            {generatedImageUrl && (
              <div className="w-full md:w-auto">
                <div className="bg-star-purple/20 rounded-xl p-4 border border-star-gold/20">
                  <h4 className="text-white/80 font-bold mb-3 text-sm">📱 操作</h4>
                  <div className="space-y-2">
                    <button
                      onClick={downloadImage}
                      className="w-full btn-star px-6 py-2.5 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>💾</span>
                      <span>保存图片</span>
                    </button>
                    <button
                      onClick={shareImage}
                      className="w-full px-6 py-2.5 rounded-full flex items-center justify-center gap-2 text-sm font-medium
                        bg-gradient-to-r from-purple-600 to-pink-600 text-white
                        hover:from-purple-500 hover:to-pink-500 transition-all"
                    >
                      <span>📤</span>
                      <span>分享海报</span>
                    </button>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="text-white/40 text-xs">
                      💡 长按海报图片可直接保存到相册
                    </p>
                  </div>
                </div>

                {generatedImageUrl && (
                  <div className="mt-4">
                    <h4 className="text-white/60 text-xs mb-2 text-center">长按保存</h4>
                    <img
                      src={generatedImageUrl}
                      alt="海报预览"
                      className="w-32 mx-auto rounded-lg shadow-lg"
                      style={{ imageRendering: 'auto' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-star-purple/20 rounded-xl border border-star-gold/20">
        <h3 className="text-star-gold font-bold mb-2">💡 海报小贴士</h3>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• 完成情书拼接或解锁特殊句段后可生成分享海报</li>
          <li>• 选择不同主题让海报呈现独特的星空风格</li>
          <li>• 点击「保存图片」可下载高清海报到本地</li>
          <li>• 点击「分享海报」可直接分享到社交媒体或复制</li>
          <li>• 手机端长按生成的海报图片可保存到相册</li>
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

      {showSuccess && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl text-center animate-slide-in">
          <div className="text-2xl mb-2">✅</div>
          <div className="font-bold">分享成功！</div>
          <div className="text-sm opacity-80">海报已保存到相册</div>
        </div>
      )}
    </div>
  );
};

export default SharePoster;
