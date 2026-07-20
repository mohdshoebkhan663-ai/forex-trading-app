import { create } from 'zustand';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PriceData {
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
}

export interface TradingState {
  selectedPair: string;
  selectedTimeframe: number;
  candles: Candle[];
  latestPrice: PriceData | null;
  enabledIndicators: Set<string>;
  indicatorSettings: Record<string, any>;
  watchlist: string[];
  watchlistPrices: Record<string, PriceData>;
  isDarkMode: boolean;
  isLoadingCandles: boolean;
  isConnected: boolean;
  
  setPair: (pair: string) => void;
  setTimeframe: (minutes: number) => void;
  setCandles: (candles: Candle[]) => void;
  updateLatestCandle: (candle: Candle) => void;
  setLatestPrice: (price: PriceData) => void;
  toggleIndicator: (indicator: string) => void;
  setIndicatorSetting: (indicator: string, key: string, value: any) => void;
  addToWatchlist: (pair: string) => void;
  removeFromWatchlist: (pair: string) => void;
  setWatchlistPrice: (pair: string, price: PriceData) => void;
  toggleTheme: () => void;
  setLoadingCandles: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
}

export const useTradingStore = create<TradingState>((set) => ({
  selectedPair: 'EUR/USD',
  selectedTimeframe: 15,
  candles: [],
  latestPrice: null,
  enabledIndicators: new Set(),
  indicatorSettings: {
    sma20: { period: 20, visible: true },
    ema50: { period: 50, visible: true },
    rsi: { period: 14, overbought: 70, oversold: 30, visible: false },
    macd: { fast: 12, slow: 26, signal: 9, visible: false },
    bollinger: { period: 20, stdDev: 2, visible: false },
  },
  watchlist: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
  watchlistPrices: {},
  isDarkMode: true,
  isLoadingCandles: false,
  isConnected: false,
  
  setPair: (pair) => set({ selectedPair: pair }),
  setTimeframe: (minutes) => set({ selectedTimeframe: minutes }),
  setCandles: (candles) => set({ candles }),
  updateLatestCandle: (candle) =>
    set((state) => {
      const newCandles = [...state.candles];
      if (newCandles.length > 0) {
        newCandles[newCandles.length - 1] = candle;
      } else {
        newCandles.push(candle);
      }
      return { candles: newCandles };
    }),
  setLatestPrice: (price) => set({ latestPrice: price }),
  toggleIndicator: (indicator) =>
    set((state) => {
      const newSet = new Set(state.enabledIndicators);
      if (newSet.has(indicator)) {
        newSet.delete(indicator);
      } else {
        newSet.add(indicator);
      }
      return { enabledIndicators: newSet };
    }),
  setIndicatorSetting: (indicator, key, value) =>
    set((state) => ({
      indicatorSettings: {
        ...state.indicatorSettings,
        [indicator]: {
          ...state.indicatorSettings[indicator],
          [key]: value,
        },
      },
    })),
  addToWatchlist: (pair) =>
    set((state) => {
      if (!state.watchlist.includes(pair)) {
        return { watchlist: [...state.watchlist, pair] };
      }
      return state;
    }),
  removeFromWatchlist: (pair) =>
    set((state) => ({
      watchlist: state.watchlist.filter((p) => p !== pair),
    })),
  setWatchlistPrice: (pair, price) =>
    set((state) => ({
      watchlistPrices: {
        ...state.watchlistPrices,
        [pair]: price,
      },
    })),
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setLoadingCandles: (loading) => set({ isLoadingCandles: loading }),
  setConnected: (connected) => set({ isConnected: connected }),
}));
