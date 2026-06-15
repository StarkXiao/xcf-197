import { useState } from 'react';
import Modal from '../../components/Modal';

const FragmentGallery = ({ archive }) => {
  const [selectedFragment, setSelectedFragment] = useState(null);
  const fragments = archive.getFragmentCollection();
  const collectedCount = fragments.filter(f => f.collected).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-star-purple/30 rounded-full border border-star-gold/30 mb-4">
          <span className="text-2xl">✨</span>
          <span className="text-star-gold font-bold text-lg">
            {collectedCount} / {fragments.length}
          </span>
          <span className="text-white/60 text-sm">碎片已收集</span>
        </div>
        <p className="text-white/60 text-sm">
          点击碎片查看详细信息，收集所有碎片解锁隐藏结局
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {fragments.map((fragment, index) => (
          <div
            key={fragment.id}
            onClick={() => fragment.collected && setSelectedFragment(fragment)}
            className={`relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
              ${fragment.collected
                ? 'bg-gradient-to-br from-star-purple/40 to-star-blue/40 border-2 border-star-gold/50 hover:border-star-gold hover:scale-105 hover:shadow-lg hover:shadow-star-gold/20'
                : 'bg-gray-800/30 border-2 border-gray-700/30 opacity-50 cursor-not-allowed'
              }
            `}
            style={{
              animationDelay: `${index * 0.05}s`
            }}
          >
            {fragment.collected ? (
              <>
                <div
                  className="text-4xl mb-2 animate-float"
                  style={{
                    filter: `drop-shadow(0 0 8px ${fragment.color})`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {fragment.symbol}
                </div>
                <div
                  className="text-xs font-medium text-center"
                  style={{ color: fragment.color }}
                >
                  {fragment.name}
                </div>
                <div className="absolute top-2 right-2 text-star-gold text-xs">
                  ✓
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2 text-gray-600">❓</div>
                <div className="text-xs text-gray-500 text-center">未解锁</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-star-purple/20 rounded-xl border border-star-gold/20">
        <h3 className="text-star-gold font-bold mb-2">💡 收集提示</h3>
        <ul className="text-sm text-white/60 space-y-1">
          <li>• 通关对应关卡可收集该关卡出现的星座碎片</li>
          <li>• 每个关卡包含4-12个不同的星座碎片</li>
          <li>• 收集全部12个碎片可解锁「星河守护者」结局</li>
        </ul>
      </div>

      <Modal
        isOpen={!!selectedFragment}
        onClose={() => setSelectedFragment(null)}
        title={selectedFragment?.name}
      >
        {selectedFragment && (
          <div className="text-center">
            <div
              className="text-8xl mb-6 animate-float"
              style={{
                filter: `drop-shadow(0 0 20px ${selectedFragment.color})`
              }}
            >
              {selectedFragment.symbol}
            </div>
            <div
              className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4"
              style={{
                backgroundColor: `${selectedFragment.color}20`,
                color: selectedFragment.color,
                border: `1px solid ${selectedFragment.color}50`
              }}
            >
              {selectedFragment.id}
            </div>
            <p className="text-white/80 text-lg leading-relaxed">
              {selectedFragment.description}
            </p>
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                已收集 · 可用于解锁隐藏结局
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FragmentGallery;
