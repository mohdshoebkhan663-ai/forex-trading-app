import { useEffect, useRef, useCallback } from 'react';
import { useTradingStore, Candle, PriceData } from '@/store/tradingStore';

const TICK_UPDATE_INTERVAL = 250;

export const useTwelveDataWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const {
    selectedPair,
    selectedTimeframe,
    setLatestPrice,
    updateLatestCandle,
    setConnected,
  } = useTradingStore();

  const formatTimeframe = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes === 60) return '1h';
    return `${Math.floor(minutes / 60)}h`;
  };

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(
        process.env.NEXT_PUBLIC_TWELVE_DATA_WS_URL || 'wss://ws.twelvedata.com/v1/quotes/price'
      );

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttemptsRef.current = 0;

        const subscribeMsg = {
          action: 'subscribe',
          params: {
            symbols: selectedPair,
          },
        };
        ws.send(JSON.stringify(subscribeMsg));
      };

      ws.onmessage = (event) => {
        const now = Date.now();
        
        if (now - lastUpdateRef.current < TICK_UPDATE_INTERVAL) {
          return;
        }
        lastUpdateRef.current = now;

        try {
          const data = JSON.parse(event.data);

          if (data.event === 'subscribe' || data.event === 'unsubscribe') {
            return;
          }

          if (data.symbol === selectedPair) {
            const bid = parseFloat(data.bid);
            const ask = parseFloat(data.ask);
            const mid = (bid + ask) / 2;

            const priceData: PriceData = {
              bid,
              ask,
              spread: ask - bid,
              timestamp: Date.now(),
            };

            setLatestPrice(priceData);

            const candle: Candle = {
              time: Math.floor(Date.now() / 1000),
              open: mid,
              high: mid,
              low: mid,
              close: mid,
            };

            updateLatestCandle(candle);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setConnected(false);
        attemptReconnect();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      attemptReconnect();
    }
  }, [selectedPair, setLatestPrice, updateLatestCandle, setConnected]);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);

    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, selectedPair]);

  return { isConnected: wsRef.current?.readyState === WebSocket.OPEN };
};
