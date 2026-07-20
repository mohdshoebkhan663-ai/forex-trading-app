/**
 * Technical Indicator Calculations
 */

export const calculateSMA = (candles: any[], period: number): (number | null)[] => {
  const closes = candles.map((c) => c.close);
  const sma: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }

  return sma;
};

export const calculateEMA = (candles: any[], period: number): (number | null)[] => {
  const closes = candles.map((c) => c.close);
  const ema: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  let smaSum = 0;
  for (let i = 0; i < period; i++) {
    smaSum += closes[i];
  }

  ema[period - 1] = smaSum / period;

  for (let i = period; i < closes.length; i++) {
    const newEMA = closes[i] * multiplier + ema[i - 1]! * (1 - multiplier);
    ema[i] = newEMA;
  }

  for (let i = 0; i < period - 1; i++) {
    ema[i] = null;
  }

  return ema;
};

export const calculateRSI = (
  candles: any[],
  period: number = 14
): (number | null)[] => {
  const closes = candles.map((c) => c.close);
  const rsi: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period) {
      rsi.push(null);
      continue;
    }

    let gainSum = 0;
    let lossSum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      const change = closes[j] - closes[j - 1];
      if (change > 0) {
        gainSum += change;
      } else {
        lossSum += Math.abs(change);
      }
    }

    const avgGain = gainSum / period;
    const avgLoss = lossSum / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
};

export const calculateBollinger = (
  candles: any[],
  period: number = 20,
  stdDev: number = 2
) => {
  const closes = candles.map((c) => c.close);
  const sma = calculateSMA(candles, period);
  const upper: (number | null)[] = [];
  const middle: (number | null)[] = sma;
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(Math.max(0, i - period + 1), i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const variance =
        slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
      const std = Math.sqrt(variance);

      upper.push(sma[i]! + std * stdDev);
      lower.push(sma[i]! - std * stdDev);
    }
  }

  return { upper, middle, lower };
};

export const calculateMACD = (candles: any[], fast = 12, slow = 26, signal = 9) => {
  const ema12 = calculateEMA(candles, fast);
  const ema26 = calculateEMA(candles, slow);
  const macdLine: (number | null)[] = [];

  for (let i = 0; i < ema12.length; i++) {
    if (ema12[i] !== null && ema26[i] !== null) {
      macdLine.push(ema12[i]! - ema26[i]!);
    } else {
      macdLine.push(null);
    }
  }

  const signalLine = calculateEMA(
    macdLine.map((v) => ({ close: v })),
    signal
  );

  const histogram: (number | null)[] = [];
  for (let i = 0; i < macdLine.length; i++) {
    if (macdLine[i] !== null && signalLine[i] !== null) {
      histogram.push(macdLine[i]! - signalLine[i]!);
    } else {
      histogram.push(null);
    }
  }

  return { macdLine, signalLine, histogram };
};
