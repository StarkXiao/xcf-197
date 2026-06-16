import { useState, useEffect } from 'react';
import ShopItem from '../components/ShopItem';
import Modal from '../components/Modal';
import { SHOP_CATEGORIES, SHOP_TIPS, CURRENCY_INFO, getItemEffectInfo, getRarityInfo } from '../data/gameData';

const DivinationShopPage = ({ shop, onBack, onStartGame }) => {
  const [activeTab, setActiveTab] = useState('shop');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [timeUntilReset, setTimeUntilReset] = useState(0);

  useEffect(() => {
    const updateTimeUntilReset = () => {
      const now = Date.now();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now;
      setTimeUntilReset(Math.max(0, diff));
    };

    updateTimeUntilReset();
    const interval = setInterval(updateTimeUntilReset, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 2500);
  };

  const handlePurchase = (itemId, quantity = 1) => {
    const result = shop.purchaseItem(itemId, quantity);
    showMessage(result.message, result.success ? 'success' : 'error');
  };

  const handleSelect = (itemId) => {
    const result = shop.selectItem(itemId);
    if (!result.success) {
      showMessage(result.message, 'error');
    }
  };

  const handleShowDetail = (item) => {
    setSelectedItem(item);
    setPurchaseQuantity(1);
    setShowDetailModal(true);
  };

  const handleBulkPurchase = () => {
    if (!selectedItem) return;
    handlePurchase(selectedItem.id, purchaseQuantity);
    setShowDetailModal(false);
  };

  const handleStartWithItems = () => {
    if (onStartGame) {
      onStartGame();
    }
  };

  const displayItems = shop.getDisplayItems();
  const inventoryItems = shop.getInventoryItems();
  const selectedItemDetails = shop.selectedItems.map(id => {
    const item = displayItems.find(i => i.id === id) || inventoryItems.find(i => i.id === id);
    return item;
  }).filter(Boolean);

  return (
    <div className="relative z-10 min-h-screen flex flex-col px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-white/70 hover:text-white transition-colors text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-star-gold glow-text">
          🔮 占卜商店
        </h1>
        <button
          onClick={() => setShowTipsModal(true)}
          className="text-white/70 hover:text-white transition-colors text-xl"
        >
          ❓
        </button>
      </div>

      <div className="flex justify-around items-center mb-6 bg-star-purple/30 rounded-xl p-4">
        <div className="text-center">
          <div className="text-2xl mb-1">✨</div>
          <div className="text-xs text-white/50">星尘</div>
          <div className="text-xl font-bold text-blue-400">
            {shop.stardust.toLocaleString()}
          </div>
        </div>
        <div className="w-px h-12 bg-white/20" />
        <div className="text-center">
          <div className="text-2xl mb-1">💎</div>
          <div className="text-xs text-white/50">星光碎片</div>
          <div className="text-xl font-bold text-purple-400">
            {shop.starShards.toLocaleString()}
          </div>
        </div>
        <div className="w-px h-12 bg-white/20" />
        <div className="text-center">
          <div className="text-2xl mb-1">🎒</div>
          <div className="text-xs text-white/50">背包道具</div>
          <div className="text-xl font-bold text-cyan-400">
            {inventoryItems.length}
          </div>
        </div>
      </div>

      {activeTab === 'shop' && shop.dailyItems.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-star-pink/20 to-star-purple/20 rounded-xl border border-star-pink/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-star-pink font-bold text-sm">⏰ 限时商品</span>
            <span className="text-xs text-white/60">
              刷新倒计时: {formatTime(timeUntilReset)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {shop.dailyItems.map(dailyItem => {
              const item = displayItems.find(i => i.id === dailyItem.id);
              if (!item) return null;
              return (
                <ShopItem
                  key={item.id}
                  item={{ ...item, ...dailyItem }}
                  onPurchase={handlePurchase}
                  onShowDetail={handleShowDetail}
                  shop={shop}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {activeTab === 'shop' ? (
          SHOP_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => shop.setCurrentCategory(cat.id)}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all
                ${shop.currentCategory === cat.id
                  ? 'bg-star-gold text-star-dark'
                  : 'bg-star-purple/30 text-white/70 hover:bg-star-purple/50 border border-white/20'
                }
              `}
            >
              {cat.icon} {cat.name}
            </button>
          ))
        ) : (
          <>
            <div className="flex-1 py-2 px-3 rounded-lg font-bold text-sm bg-star-gold text-star-dark text-center">
              🎒 我的背包
            </div>
            {shop.selectedItems.length > 0 && (
              <button
                onClick={() => shop.clearSelectedItems()}
                className="py-2 px-4 rounded-lg font-bold text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              >
                清除选择
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all
            ${activeTab === 'shop'
              ? 'bg-star-gold text-star-dark'
              : 'bg-star-purple/30 text-white/70 hover:bg-star-purple/50 border border-white/20'
            }
          `}
        >
          🏪 商品列表
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all relative
            ${activeTab === 'inventory'
              ? 'bg-star-gold text-star-dark'
              : 'bg-star-purple/30 text-white/70 hover:bg-star-purple/50 border border-white/20'
            }
          `}
        >
          🎒 我的背包
          {inventoryItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-star-cyan text-star-dark text-xs px-2 py-0.5 rounded-full font-bold">
              {inventoryItems.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'inventory' && shop.selectedItems.length > 0 && (
        <div className="mb-4 p-4 bg-star-gold/10 rounded-xl border-2 border-star-gold/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-star-gold font-bold">
              ✨ 已选择道具 ({shop.selectedItems.length}/3)
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedItemDetails.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-star-gold/20 rounded-lg border border-star-gold/50"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-white">{item.name}</span>
                <button
                  onClick={() => handleSelect(item.id)}
                  className="text-white/60 hover:text-red-400 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {onStartGame && (
            <button
              onClick={handleStartWithItems}
              className="w-full py-3 rounded-lg bg-star-gold text-star-dark font-bold hover:bg-star-gold/80 transition-all animate-pulse-slow"
            >
              🎮 带着道具开始游戏
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'shop' ? (
          <div className="grid grid-cols-1 gap-4">
            {displayItems.map(item => (
              <ShopItem
                key={item.id}
                item={item}
                onPurchase={handlePurchase}
                onShowDetail={handleShowDetail}
                shop={shop}
              />
            ))}
            {displayItems.length === 0 && (
              <div className="text-center py-12 text-white/50">
                <div className="text-4xl mb-4">🔮</div>
                <p>暂无商品</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {inventoryItems.map(item => (
              <ShopItem
                key={item.id}
                item={item}
                onSelect={handleSelect}
                onShowDetail={handleShowDetail}
                shop={shop}
                isInventory={true}
              />
            ))}
            {inventoryItems.length === 0 && (
              <div className="text-center py-12 text-white/50">
                <div className="text-4xl mb-4">🎒</div>
                <p>背包空空如也</p>
                <p className="text-sm mt-2">去商店购买一些道具吧！</p>
              </div>
            )}
          </div>
        )}
      </div>

      {shop.showPurchaseAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 bg-black/50">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-4">{shop.showPurchaseAnimation.item.icon}</div>
            <div className="text-star-gold text-2xl font-bold glow-text mb-2">
              购买成功！
            </div>
            <div className="text-white text-lg">
              {shop.showPurchaseAnimation.item.name} ×{shop.showPurchaseAnimation.quantity}
            </div>
            <div className="text-sm text-white/60 mt-2">
              消耗: {CURRENCY_INFO[shop.showPurchaseAnimation.item.currency]?.icon} {shop.showPurchaseAnimation.price}
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl font-bold z-50 animate-bounce
          ${message.type === 'success' ? 'bg-green-500/90 text-white' : ''}
          ${message.type === 'error' ? 'bg-red-500/90 text-white' : ''}
          ${message.type === 'info' ? 'bg-blue-500/90 text-white' : ''}
        `}>
          {message.text}
        </div>
      )}

      <Modal
        isOpen={showDetailModal && selectedItem}
        onClose={() => setShowDetailModal(false)}
        title="商品详情"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div 
                className="text-6xl"
                style={{ filter: `drop-shadow(0 0 15px ${getRarityInfo(selectedItem.rarity)?.color})` }}
              >
                {selectedItem.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{selectedItem.name}</h3>
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: getRarityInfo(selectedItem.rarity)?.bgColor, 
                      color: getRarityInfo(selectedItem.rarity)?.color 
                    }}
                  >
                    {getRarityInfo(selectedItem.rarity)?.icon} {getRarityInfo(selectedItem.rarity)?.name}
                  </span>
                </div>
                <p className="text-white/70">{selectedItem.description}</p>
              </div>
            </div>

            {getItemEffectInfo(selectedItem.effectType) && (
              <div className="p-3 bg-star-purple/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xl"
                    style={{ color: getItemEffectInfo(selectedItem.effectType)?.color }}
                  >
                    {getItemEffectInfo(selectedItem.effectType)?.icon}
                  </span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: getItemEffectInfo(selectedItem.effectType)?.color }}>
                      {getItemEffectInfo(selectedItem.effectType)?.name}
                    </div>
                    <div className="text-xs text-white/60">
                      {getItemEffectInfo(selectedItem.effectType)?.description}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-star-purple/20 rounded-lg">
                <div className="text-white/50 text-xs">当前持有</div>
                <div className="text-lg font-bold text-star-cyan">
                  {shop.getItemQuantity(selectedItem.id)}
                </div>
              </div>
              <div className="p-3 bg-star-purple/20 rounded-lg">
                <div className="text-white/50 text-xs">售价</div>
                <div className="text-lg font-bold flex items-center gap-1">
                  <span style={{ color: CURRENCY_INFO[selectedItem.currency]?.color }}>
                    {CURRENCY_INFO[selectedItem.currency]?.icon}
                  </span>
                  <span style={{ color: CURRENCY_INFO[selectedItem.currency]?.color }}>
                    {selectedItem.discount ? Math.floor(selectedItem.price * (1 - selectedItem.discount)) : selectedItem.price}
                  </span>
                  {selectedItem.discount && (
                    <span className="text-xs text-white/40 line-through ml-1">
                      {selectedItem.price}
                    </span>
                  )}
                </div>
              </div>
              {selectedItem.dailyLimit && (
                <div className="p-3 bg-star-purple/20 rounded-lg">
                  <div className="text-white/50 text-xs">今日限购</div>
                  <div className="text-lg font-bold text-star-pink">
                    {selectedItem.dailyLimit} 个
                  </div>
                </div>
              )}
              {selectedItem.maxStack && (
                <div className="p-3 bg-star-purple/20 rounded-lg">
                  <div className="text-white/50 text-xs">堆叠上限</div>
                  <div className="text-lg font-bold text-star-gold">
                    {selectedItem.maxStack} 个
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                  className="w-10 h-10 rounded-lg bg-star-purple/50 text-white hover:bg-star-purple font-bold"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-white text-lg">
                  {purchaseQuantity}
                </span>
                <button
                  onClick={() => setPurchaseQuantity(Math.min(99, purchaseQuantity + 1))}
                  className="w-10 h-10 rounded-lg bg-star-purple/50 text-white hover:bg-star-purple font-bold"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleBulkPurchase}
                disabled={!shop.canAfford(selectedItem, purchaseQuantity)}
                className={`flex-1 py-3 rounded-lg font-bold transition-all
                  ${shop.canAfford(selectedItem, purchaseQuantity)
                    ? 'bg-star-gold text-star-dark hover:bg-star-gold/80 active:scale-95'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                购买 ×{purchaseQuantity}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showTipsModal}
        onClose={() => setShowTipsModal(false)}
        title="🔮 使用说明"
      >
        <div className="space-y-4">
          <div className="p-4 bg-star-purple/20 rounded-lg">
            <h4 className="font-bold text-star-gold mb-2">💰 货币说明</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-xl">✨</span>
                <div>
                  <span className="font-bold text-blue-400">星尘</span>
                  <p className="text-white/60">通过完成关卡和每日挑战获得，可购买普通道具</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">💎</span>
                <div>
                  <span className="font-bold text-purple-400">星光碎片</span>
                  <p className="text-white/60">稀有的高级货币，通过排行榜和特殊成就获得</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-star-purple/20 rounded-lg">
            <h4 className="font-bold text-star-gold mb-2">🎮 道具使用</h4>
            <ol className="space-y-2 text-sm text-white/80 list-decimal list-inside">
              <li>在「我的背包」中选择要使用的道具（最多3个）</li>
              <li>点击「带着道具开始游戏」</li>
              <li>道具效果将在本局游戏中生效</li>
              <li>部分道具（如提示、防错护符）可在游戏中主动使用</li>
            </ol>
          </div>

          <div className="p-4 bg-star-purple/20 rounded-lg">
            <h4 className="font-bold text-star-gold mb-2">⏰ 限时商品</h4>
            <p className="text-sm text-white/80">
              每日0点自动刷新限量商品，部分商品享有折扣优惠，不要错过哦！
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-star-gold text-sm">💡 小贴士</h4>
            {SHOP_TIPS.map((tip, idx) => (
              <p key={idx} className="text-sm text-white/70">{tip}</p>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DivinationShopPage;
