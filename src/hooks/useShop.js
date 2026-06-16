import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SHOP_ITEMS,
  CURRENCY_TYPES,
  SHOP_CATEGORIES,
  getShopItemById,
  getShopItemsByCategory,
  generateDailyShopItems,
  getStardustReward,
  STARDUST_REWARDS,
  ITEM_EFFECT_TYPES
} from '../data/gameData';

const STORAGE_KEY = 'starTowerShop';

export const useShop = () => {
  const [stardust, setStardust] = useState(0);
  const [starShards, setStarShards] = useState(0);
  const [inventory, setInventory] = useState({});
  const [dailyItems, setDailyItems] = useState([]);
  const [dailyPurchaseCount, setDailyPurchaseCount] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeEffects, setActiveEffects] = useState({});
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [lastResetDate, setLastResetDate] = useState(null);
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('all');

  const stateRef = useRef({});

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const getTomorrowResetTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  };

  const saveShop = useCallback((data) => {
    const s = stateRef.current;
    const saveData = {
      stardust: data.stardust !== undefined ? data.stardust : s.stardust,
      starShards: data.starShards !== undefined ? data.starShards : s.starShards,
      inventory: data.inventory !== undefined ? data.inventory : s.inventory,
      dailyItems: data.dailyItems !== undefined ? data.dailyItems : s.dailyItems,
      dailyPurchaseCount: data.dailyPurchaseCount !== undefined ? data.dailyPurchaseCount : s.dailyPurchaseCount,
      selectedItems: data.selectedItems !== undefined ? data.selectedItems : s.selectedItems,
      purchaseHistory: data.purchaseHistory !== undefined ? data.purchaseHistory : s.purchaseHistory,
      lastResetDate: data.lastResetDate !== undefined ? data.lastResetDate : s.lastResetDate
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, []);

  const resetDailyShop = useCallback(() => {
    const todayStr = getTodayDateString();
    const daily = generateDailyShopItems(todayStr);
    
    setDailyItems(daily);
    setDailyPurchaseCount({});
    setLastResetDate(todayStr);
    
    saveShop({
      dailyItems: daily,
      dailyPurchaseCount: {},
      lastResetDate: todayStr
    });
  }, [saveShop]);

  const checkAndResetDaily = useCallback(() => {
    const todayStr = getTodayDateString();
    if (lastResetDate !== todayStr) {
      resetDailyShop();
      return true;
    }
    return false;
  }, [lastResetDate, resetDailyShop]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStardust(data.stardust || 0);
        setStarShards(data.starShards || 0);
        setInventory(data.inventory || {});
        setDailyItems(data.dailyItems || []);
        setDailyPurchaseCount(data.dailyPurchaseCount || {});
        setSelectedItems(data.selectedItems || []);
        setPurchaseHistory(data.purchaseHistory || []);
        setLastResetDate(data.lastResetDate);
      } catch (e) {
        console.error('Failed to load shop:', e);
      }
    }
  }, []);

  useEffect(() => {
    stateRef.current = {
      stardust,
      starShards,
      inventory,
      dailyItems,
      dailyPurchaseCount,
      selectedItems,
      activeEffects,
      purchaseHistory,
      lastResetDate
    };
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAndResetDaily();
    }, 100);
    return () => clearTimeout(timer);
  }, [checkAndResetDaily]);

  const addStardust = useCallback((amount, reason = '') => {
    const newAmount = Math.max(0, stardust + amount);
    setStardust(newAmount);
    saveShop({ stardust: newAmount });
    
    if (amount > 0) {
      setPurchaseHistory(prev => [{
        id: Date.now(),
        type: 'earn',
        currency: CURRENCY_TYPES.STARDUST,
        amount,
        reason,
        date: getTodayDateString()
      }, ...prev].slice(0, 50));
    }
    
    return newAmount;
  }, [stardust, saveShop]);

  const addStarShards = useCallback((amount, reason = '') => {
    const newAmount = Math.max(0, starShards + amount);
    setStarShards(newAmount);
    saveShop({ starShards: newAmount });
    
    if (amount > 0) {
      setPurchaseHistory(prev => [{
        id: Date.now(),
        type: 'earn',
        currency: CURRENCY_TYPES.STAR_SHARD,
        amount,
        reason,
        date: getTodayDateString()
      }, ...prev].slice(0, 50));
    }
    
    return newAmount;
  }, [starShards, saveShop]);

  const canAfford = useCallback((item, quantity = 1, discount = 0) => {
    if (!item) return false;
    const totalPrice = item.price * quantity;
    const finalPrice = Math.floor(totalPrice * (1 - discount));
    
    if (item.currency === CURRENCY_TYPES.STARDUST) {
      return stardust >= finalPrice;
    } else if (item.currency === CURRENCY_TYPES.STAR_SHARD) {
      return starShards >= finalPrice;
    }
    return false;
  }, [stardust, starShards]);

  const getDailyLimitRemaining = useCallback((itemId) => {
    const item = getShopItemById(itemId);
    if (!item || !item.dailyLimit) return null;
    const purchased = dailyPurchaseCount[itemId] || 0;
    return Math.max(0, item.dailyLimit - purchased);
  }, [dailyPurchaseCount]);

  const purchaseItem = useCallback((itemId, quantity = 1) => {
    const item = getShopItemById(itemId);
    if (!item) {
      return { success: false, message: '商品不存在' };
    }

    if (!item.stackable && quantity > 1) {
      return { success: false, message: '该商品不可叠加购买' };
    }

    const dailyLimit = getDailyLimitRemaining(itemId);
    if (dailyLimit !== null && dailyLimit < quantity) {
      return { success: false, message: `今日限购${item.dailyLimit}个，已购${dailyPurchaseCount[itemId] || 0}个` };
    }

    const discount = dailyItems.find(d => d.id === itemId)?.discount || 0;
    const totalPrice = item.price * quantity;
    const finalPrice = Math.floor(totalPrice * (1 - discount));
    
    if (!canAfford(item, quantity, discount)) {
      const currencyInfo = item.currency === CURRENCY_TYPES.STARDUST ? '星尘' : '星光碎片';
      return { success: false, message: `${currencyInfo}不足` };
    }

    if (item.currency === CURRENCY_TYPES.STARDUST) {
      const newStardust = stardust - finalPrice;
      setStardust(newStardust);
      saveShop({ stardust: newStardust });
    } else {
      const newShards = starShards - finalPrice;
      setStarShards(newShards);
      saveShop({ starShards: newShards });
    }

    const newInventory = { ...inventory };
    const currentQuantity = newInventory[itemId] || 0;
    newInventory[itemId] = Math.min(item.maxStack || 99, currentQuantity + item.effectValue * quantity);
    setInventory(newInventory);

    if (dailyLimit !== null) {
      const newPurchaseCount = { ...dailyPurchaseCount };
      newPurchaseCount[itemId] = (newPurchaseCount[itemId] || 0) + quantity;
      setDailyPurchaseCount(newPurchaseCount);
      saveShop({ 
        inventory: newInventory, 
        dailyPurchaseCount: newPurchaseCount 
      });
    } else {
      saveShop({ inventory: newInventory });
    }

    setPurchaseHistory(prev => [{
      id: Date.now(),
      type: 'purchase',
      itemId,
      itemName: item.name,
      quantity,
      currency: item.currency,
      price: finalPrice,
      date: getTodayDateString()
    }, ...prev].slice(0, 50));

    setShowPurchaseAnimation({
      item,
      quantity,
      price: finalPrice
    });
    setTimeout(() => setShowPurchaseAnimation(null), 2000);

    return {
      success: true,
      message: `成功购买 ${item.name} ×${quantity}`,
      item,
      quantity,
      price: finalPrice
    };
  }, [stardust, starShards, inventory, dailyItems, dailyPurchaseCount, canAfford, getDailyLimitRemaining, saveShop]);

  const getItemQuantity = useCallback((itemId) => {
    return inventory[itemId] || 0;
  }, [inventory]);

  const selectItem = useCallback((itemId) => {
    const quantity = getItemQuantity(itemId);
    if (quantity <= 0) {
      return { success: false, message: '道具数量不足' };
    }

    const item = getShopItemById(itemId);
    if (!item) {
      return { success: false, message: '道具不存在' };
    }

    if (selectedItems.includes(itemId)) {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
      return { success: true, selected: false };
    }

    if (selectedItems.length >= 3) {
      return { success: false, message: '最多只能选择3个道具' };
    }

    setSelectedItems(prev => [...prev, itemId]);
    return { success: true, selected: true };
  }, [getItemQuantity, selectedItems]);

  const isItemSelected = useCallback((itemId) => {
    return selectedItems.includes(itemId);
  }, [selectedItems]);

  const clearSelectedItems = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const applyItemEffects = useCallback((gameConfig) => {
    const effects = {};
    let modifiedConfig = { ...gameConfig };
    const newInventory = { ...inventory };

    selectedItems.forEach(itemId => {
      const item = getShopItemById(itemId);
      if (!item) return;

      if (newInventory[itemId] > 0) {
        newInventory[itemId] -= 1;
        if (newInventory[itemId] <= 0) {
          delete newInventory[itemId];
        }
      }

      switch (item.effectType) {
        case ITEM_EFFECT_TYPES.TIME_EXTEND:
          modifiedConfig.timeLimit = (modifiedConfig.timeLimit || 0) + item.effectValue;
          effects[item.effectType] = (effects[item.effectType] || 0) + item.effectValue;
          break;
        case ITEM_EFFECT_TYPES.SCORE_BOOST:
          effects[item.effectType] = (effects[item.effectType] || 0) + item.effectValue;
          break;
        case ITEM_EFFECT_TYPES.HINT:
          effects[item.effectType] = (effects[item.effectType] || 0) + item.effectValue;
          break;
        case ITEM_EFFECT_TYPES.MISTAKE_PROTECT:
          effects[item.effectType] = (effects[item.effectType] || 0) + item.effectValue;
          break;
        case ITEM_EFFECT_TYPES.COMBO_BOOST:
          effects[item.effectType] = Math.max(effects[item.effectType] || 1, item.effectValue);
          break;
        case ITEM_EFFECT_TYPES.PERFECT_START:
          effects[item.effectType] = true;
          break;
        case ITEM_EFFECT_TYPES.DOUBLE_REWARD:
          effects[item.effectType] = true;
          break;
        default:
          break;
      }
    });

    setInventory(newInventory);
    setActiveEffects(effects);
    saveShop({ inventory: newInventory, selectedItems: [] });
    setSelectedItems([]);

    return { modifiedConfig, effects };
  }, [selectedItems, inventory, saveShop]);

  const useHintItem = useCallback(() => {
    const hintCount = activeEffects[ITEM_EFFECT_TYPES.HINT] || 0;
    if (hintCount <= 0) {
      return { success: false, message: '提示次数已用完' };
    }

    const newEffects = { ...activeEffects };
    newEffects[ITEM_EFFECT_TYPES.HINT] = hintCount - 1;
    setActiveEffects(newEffects);

    return { success: true, remaining: newEffects[ITEM_EFFECT_TYPES.HINT] };
  }, [activeEffects]);

  const useMistakeProtect = useCallback(() => {
    const protectCount = activeEffects[ITEM_EFFECT_TYPES.MISTAKE_PROTECT] || 0;
    if (protectCount <= 0) {
      return { success: false };
    }

    const newEffects = { ...activeEffects };
    newEffects[ITEM_EFFECT_TYPES.MISTAKE_PROTECT] = protectCount - 1;
    setActiveEffects(newEffects);

    return { success: true, remaining: newEffects[ITEM_EFFECT_TYPES.MISTAKE_PROTECT] };
  }, [activeEffects]);

  const calculateFinalScore = useCallback((baseScore) => {
    const boost = activeEffects[ITEM_EFFECT_TYPES.SCORE_BOOST] || 0;
    return Math.floor(baseScore * (1 + boost));
  }, [activeEffects]);

  const calculateComboBonus = useCallback((baseBonus) => {
    const multiplier = activeEffects[ITEM_EFFECT_TYPES.COMBO_BOOST] || 1;
    return baseBonus * multiplier;
  }, [activeEffects]);

  const hasPerfectStart = useCallback(() => {
    return activeEffects[ITEM_EFFECT_TYPES.PERFECT_START] || false;
  }, [activeEffects]);

  const hasDoubleReward = useCallback(() => {
    return activeEffects[ITEM_EFFECT_TYPES.DOUBLE_REWARD] || false;
  }, [activeEffects]);

  const rewardLevelCompletion = useCallback((levelId, stars) => {
    const baseReward = getStardustReward(levelId, stars);
    const multiplier = hasDoubleReward() ? 2 : 1;
    const finalReward = baseReward * multiplier;
    
    addStardust(finalReward, `通关第${levelId}关${stars}星`);
    
    return {
      base: baseReward,
      multiplier,
      total: finalReward
    };
  }, [addStardust, hasDoubleReward]);

  const rewardDailyChallenge = useCallback((score) => {
    const baseReward = STARDUST_REWARDS.dailyChallenge;
    const multiplier = hasDoubleReward() ? 2 : 1;
    const finalReward = baseReward * multiplier;
    
    addStardust(finalReward, '完成每日挑战');
    
    return {
      base: baseReward,
      multiplier,
      total: finalReward
    };
  }, [addStardust, hasDoubleReward]);

  const getInventoryItems = useCallback(() => {
    return Object.entries(inventory)
      .map(([itemId, quantity]) => {
        const item = getShopItemById(itemId);
        return item ? { ...item, quantity } : null;
      })
      .filter(Boolean);
  }, [inventory]);

  const getDisplayItems = useCallback(() => {
    if (currentCategory === 'limited') {
      return dailyItems.map(dailyItem => {
        const baseItem = getShopItemById(dailyItem.id);
        return baseItem ? { ...baseItem, ...dailyItem } : null;
      }).filter(Boolean);
    }
    
    const regularItems = getShopItemsByCategory(currentCategory);
    return regularItems.map(item => {
      const dailyItem = dailyItems.find(d => d.id === item.id);
      return dailyItem ? { ...item, ...dailyItem } : item;
    });
  }, [currentCategory, dailyItems]);

  const resetActiveEffects = useCallback(() => {
    setActiveEffects({});
  }, []);

  const resetShop = () => {
    setStardust(0);
    setStarShards(0);
    setInventory({});
    setDailyItems([]);
    setDailyPurchaseCount({});
    setSelectedItems([]);
    setActiveEffects({});
    setPurchaseHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    stardust,
    starShards,
    inventory,
    dailyItems,
    selectedItems,
    activeEffects,
    purchaseHistory,
    showPurchaseAnimation,
    currentCategory,
    lastResetDate,
    addStardust,
    addStarShards,
    canAfford,
    purchaseItem,
    getItemQuantity,
    selectItem,
    isItemSelected,
    clearSelectedItems,
    applyItemEffects,
    useHintItem,
    useMistakeProtect,
    calculateFinalScore,
    calculateComboBonus,
    hasPerfectStart,
    hasDoubleReward,
    rewardLevelCompletion,
    rewardDailyChallenge,
    getInventoryItems,
    getDisplayItems,
    getDailyLimitRemaining,
    setCurrentCategory,
    resetActiveEffects,
    checkAndResetDaily,
    resetShop
  };
};
