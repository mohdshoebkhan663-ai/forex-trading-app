import { create } from 'zustand';
import { DrawingTool } from '@/lib/drawingTools';
import { PriceAlert } from '@/hooks/usePriceAlerts';
import { EconomicEvent } from '@/lib/economicCalendar';

export interface ExtendedTradingState {
  drawingTools: DrawingTool[];
  activeDrawingMode: 'trendline' | 'horizontal' | 'fibonacci' | 'rectangle' | null;
  selectedDrawingColor: string;
  priceAlerts: PriceAlert[];
  economicEvents: EconomicEvent[];
  showEconomicCalendar: boolean;
  chartLayout: 'single' | 'grid2' | 'grid4' | 'grid6';
  chartsInView: string[];
  simulatedOrders: SimulatedOrder[];
  simulatedPortfolio: SimulatedPortfolio;
  savedChartLayouts: ChartLayout[];
  preferences: UserPreferences;

  addDrawingTool: (tool: DrawingTool) => void;
  removeDrawingTool: (id: string) => void;
  setActiveDrawingMode: (mode: ExtendedTradingState['activeDrawingMode']) => void;
  setDrawingColor: (color: string) => void;
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (id: string) => void;
  setEconomicEvents: (events: EconomicEvent[]) => void;
  toggleEconomicCalendar: () => void;
  setChartLayout: (layout: ExtendedTradingState['chartLayout']) => void;
  addChartToView: (pair: string) => void;
  removeChartFromView: (pair: string) => void;
  addSimulatedOrder: (order: SimulatedOrder) => void;
  closeSimulatedOrder: (orderId: string) => void;
  updatePortfolio: (portfolio: SimulatedPortfolio) => void;
  saveChartLayout: (layout: ChartLayout) => void;
  loadChartLayout: (layoutId: string) => void;
}

export interface SimulatedOrder {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  openedAt: number;
  closedAt?: number;
  profitLoss?: number;
}

export interface SimulatedPortfolio {
  balance: number;
  equity: number;
  margin: number;
  marginLevel: number;
  usedMargin: number;
  freeMargin: number;
}

export interface ChartLayout {
  id: string;
  name: string;
  layout: ExtendedTradingState['chartLayout'];
  pairs: string[];
  indicators: string[];
  drawingTools: DrawingTool[];
  createdAt: number;
}

export interface UserPreferences {
  showGridLines: boolean;
  showVolume: boolean;
  candleStyle: 'hollow' | 'filled';
  autoScroll: boolean;
  showTimeLabels: boolean;
}

export const useExtendedTradingStore = create<ExtendedTradingState>((set) => ({
  drawingTools: [],
  activeDrawingMode: null,
  selectedDrawingColor: '#3b82f6',
  priceAlerts: [],
  economicEvents: [],
  showEconomicCalendar: false,
  chartLayout: 'single',
  chartsInView: ['EUR/USD'],
  simulatedOrders: [],
  simulatedPortfolio: {
    balance: 10000,
    equity: 10000,
    margin: 0,
    marginLevel: 0,
    usedMargin: 0,
    freeMargin: 10000,
  },
  savedChartLayouts: [],
  preferences: {
    showGridLines: true,
    showVolume: true,
    candleStyle: 'filled',
    autoScroll: true,
    showTimeLabels: true,
  },

  addDrawingTool: (tool) =>
    set((state) => ({
      drawingTools: [...state.drawingTools, tool],
    })),
  removeDrawingTool: (id) =>
    set((state) => ({
      drawingTools: state.drawingTools.filter((t) => t.id !== id),
    })),
  setActiveDrawingMode: (mode) => set({ activeDrawingMode: mode }),
  setDrawingColor: (color) => set({ selectedDrawingColor: color }),
  addPriceAlert: (alert) =>
    set((state) => ({
      priceAlerts: [...state.priceAlerts, alert],
    })),
  removePriceAlert: (id) =>
    set((state) => ({
      priceAlerts: state.priceAlerts.filter((a) => a.id !== id),
    })),
  setEconomicEvents: (events) => set({ economicEvents: events }),
  toggleEconomicCalendar: () =>
    set((state) => ({
      showEconomicCalendar: !state.showEconomicCalendar,
    })),
  setChartLayout: (layout) => set({ chartLayout: layout }),
  addChartToView: (pair) =>
    set((state) => {
      if (state.chartsInView.includes(pair)) return state;
      return { chartsInView: [...state.chartsInView, pair] };
    }),
  removeChartFromView: (pair) =>
    set((state) => ({
      chartsInView: state.chartsInView.filter((p) => p !== pair),
    })),
  addSimulatedOrder: (order) =>
    set((state) => ({
      simulatedOrders: [...state.simulatedOrders, order],
    })),
  closeSimulatedOrder: (orderId) =>
    set((state) => ({
      simulatedOrders: state.simulatedOrders.filter((o) => o.id !== orderId),
    })),
  updatePortfolio: (portfolio) => set({ simulatedPortfolio: portfolio }),
  saveChartLayout: (layout) =>
    set((state) => ({
      savedChartLayouts: [...state.savedChartLayouts, layout],
    })),
  loadChartLayout: (layoutId) =>
    set((state) => {
      const layout = state.savedChartLayouts.find((l) => l.id === layoutId);
      if (!layout) return state;
      return {
        chartLayout: layout.layout,
        chartsInView: layout.pairs,
      };
    }),
}));
