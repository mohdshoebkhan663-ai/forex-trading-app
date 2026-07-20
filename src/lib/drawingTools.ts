/**
 * Drawing Tools for Technical Analysis
 */

export interface DrawingTool {
  id: string;
  type: 'trendline' | 'horizontal' | 'fibonacci' | 'rectangle' | 'text';
  startPrice: number;
  startTime: number;
  endPrice?: number;
  endTime?: number;
  color: string;
  width: number;
  style?: 'solid' | 'dashed' | 'dotted';
  label?: string;
  visible: boolean;
}

export interface FibonacciLevel {
  level: number;
  price: number;
  label: string;
}

export const FIBONACCI_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];

export const calculateFibonacciLevels = (
  highPrice: number,
  lowPrice: number
): FibonacciLevel[] => {
  const diff = highPrice - lowPrice;
  
  return FIBONACCI_RATIOS.map((ratio) => ({
    level: ratio,
    price: highPrice - diff * ratio,
    label: `${(ratio * 100).toFixed(1)}%`,
  }));
};

export const calculateFibonacciProjection = (
  point1Price: number,
  point2Price: number,
  point3Price: number
): FibonacciLevel[] => {
  const diff = Math.abs(point2Price - point1Price);
  
  return [
    { level: 0, price: point3Price, label: '0%' },
    { level: 0.618, price: point3Price + diff * 0.618, label: '61.8%' },
    { level: 1, price: point3Price + diff, label: '100%' },
    { level: 1.618, price: point3Price + diff * 1.618, label: '161.8%' },
    { level: 2.618, price: point3Price + diff * 2.618, label: '261.8%' },
  ];
};

export const calculateSupportResistance = (
  candles: any[],
  lookbackPeriod: number = 50
) => {
  const recentCandles = candles.slice(-lookbackPeriod);
  
  const highs = recentCandles.map((c) => c.high);
  const lows = recentCandles.map((c) => c.low);
  
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);
  const currentPrice = recentCandles[recentCandles.length - 1].close;
  
  const localHighs: number[] = [];
  const localLows: number[] = [];
  
  for (let i = 1; i < recentCandles.length - 1; i++) {
    if (
      recentCandles[i].high > recentCandles[i - 1].high &&
      recentCandles[i].high > recentCandles[i + 1].high
    ) {
      localHighs.push(recentCandles[i].high);
    }
    if (
      recentCandles[i].low < recentCandles[i - 1].low &&
      recentCandles[i].low < recentCandles[i + 1].low
    ) {
      localLows.push(recentCandles[i].low);
    }
  }
  
  return {
    highestResistance: maxHigh,
    lowestSupport: minLow,
    localResistances: localHighs.sort((a, b) => b - a).slice(0, 3),
    localSupports: localLows.sort((a, b) => a - b).slice(0, 3),
    currentPrice,
  };
};

export const generateToolId = (): string => {
  return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateTrendlineAngle = (
  startPrice: number,
  startTime: number,
  endPrice: number,
  endTime: number
): number => {
  const priceDiff = endPrice - startPrice;
  const timeDiff = endTime - startTime;
  
  if (timeDiff === 0) return 0;
  
  return Math.atan2(priceDiff, timeDiff) * (180 / Math.PI);
};
