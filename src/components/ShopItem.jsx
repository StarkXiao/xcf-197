import { RARITY_INFO, getRarityInfo, getCurrencyInfo, getItemEffectInfo, CURRENCY_TYPES } from '../data/gameData';

const ShopItem = ({ item, onPurchase, onSelect, onShowDetail, shop, quantity = 1, isInventory = false }) => {
  const rarityInfo = getRarityInfo(item.rarity);
  const currencyInfo = getCurrencyInfo(item.currency);
  const effectInfo = getItemEffectInfo(item.effectType);
  
  const ownedQuantity = shop?.getItemQuantity?.(item.id) || 0;
  const dailyLimitRemaining = shop?.getDailyLimitRemaining?.(item.id);
  const isSelected = shop?.isItemSelected?.(item.id);
  const canAfford = shop?.canAfford?.(item, quantity);
  const hasDiscount = item.discount && item.discount > 0;
  const finalPrice = hasDiscount ? Math.floor(item.price * (1 - item.discount)) : item.price;

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(item.id, quantity);
    }
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(item.id);
    }
  };

  const handleShowDetail = () => {
    if (onShowDetail) {
      onShowDetail(item);
    }
  };

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all
        ${isSelected 
          ? 'border-star-gold bg-star-gold/20 shadow-lg shadow-star-gold/30' 
          : `${rarityInfo.borderColor} bg-star-purple/20 hover:bg-star-purple/40 hover:shadow-lg`
        }
        ${item.flashSale ? 'animate-pulse-slow' : ''}
      `}
      style={{ borderColor: isSelected ? '#ffd700' : rarityInfo.color }}
    >
      {item.isLimited && (
        <div className="absolute -top-2 -right-2 bg-star-pink text-white text-xs px-2 py-0.5 rounded-full font-bold z-10">
          限时
        </div>
      )}
      
      {hasDiscount && (
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold z-10">
          -{Math.floor(item.discount * 100)}%
        </div>
      )}

      {item.flashSale && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold z-10">
          闪购
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div 
          className="text-4xl flex-shrink-0"
          style={{ filter: `drop-shadow(0 0 8px ${rarityInfo.color})` }}
        >
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-sm ${isSelected ? 'text-star-gold' : 'text-white'}`}>
              {item.name}
            </span>
            <span 
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: rarityInfo.bgColor, color: rarityInfo.color }}
            >
              {rarityInfo.icon} {rarityInfo.name}
            </span>
          </div>
          <p className="text-xs text-white/60 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {effectInfo && (
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${effectInfo.color}20`, color: effectInfo.color }}
          >
            {effectInfo.icon} {effectInfo.name}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center gap-1">
          <span style={{ color: currencyInfo?.color }}>{currencyInfo?.icon}</span>
          {hasDiscount && (
            <span className="text-white/40 line-through">{item.price}</span>
          )}
          <span className="font-bold" style={{ color: currencyInfo?.color }}>
            {finalPrice}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {ownedQuantity > 0 && (
            <span className="text-star-cyan">
              持有: {ownedQuantity}
            </span>
          )}
          {dailyLimitRemaining !== null && (
            <span className={`${dailyLimitRemaining > 0 ? 'text-star-gold' : 'text-red-400'}`}>
              今日剩余: {dailyLimitRemaining}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {isInventory ? (
          <button
            onClick={handleSelect}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all
              ${isSelected
                ? 'bg-star-gold text-star-dark'
                : 'bg-star-purple/50 text-white hover:bg-star-purple border border-star-gold/30 hover:border-star-gold'
              }
              ${ownedQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={ownedQuantity <= 0}
          >
            {isSelected ? '已选择' : '选择使用'}
          </button>
        ) : (
          <button
            onClick={handlePurchase}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all
              ${canAfford && (dailyLimitRemaining === null || dailyLimitRemaining > 0)
                ? 'bg-star-gold text-star-dark hover:bg-star-gold/80 active:scale-95'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            disabled={!canAfford || (dailyLimitRemaining !== null && dailyLimitRemaining <= 0)}
          >
            {dailyLimitRemaining !== null && dailyLimitRemaining <= 0 
              ? '今日已售罄' 
              : canAfford ? '购买' : `${currencyInfo?.name}不足`
            }
          </button>
        )}
        <button
          onClick={handleShowDetail}
          className="px-3 py-2 rounded-lg border border-white/30 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
        >
          详情
        </button>
      </div>
    </div>
  );
};

export default ShopItem;
