import { useEffect } from 'react';
import { useTradingStore } from '@/store/tradingStore';

export const useHistoricalData = () => {
  const { selectedPair, selectedTimeframe, setCandles, setLoadingCandles } =
    useTradingStore();

  useEffect(() => {
    const fetchCandles = async () => {
      setLoadingCandles(true);
      try {
        const response = await fetch(
          `/api/historical?symbol=${selectedPair}&interval=${selectedTimeframe}`
        );
        const data = await response.json();

        if (data.success) {
          setCandles(data.candles);
        } else {
          console.error('Failed to fetch candles:', data.error);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setLoadingCandles(false);
      }
    };

    fetchCandles();
  }, [selectedPair, selectedTimeframe, setCandles, setLoadingCandles]);
};
