import React, { useEffect, useRef, useCallback } from 'react';
import { useTradingStore } from '@/store/tradingStore';

export interface PriceAlert {
  id: string;
  symbol: string;
  triggerPrice: number;
  condition: 'above' | 'below' | 'between';
  secondaryPrice?: number;
  isActive: boolean;
  createdAt: number;
  triggeredAt?: number;
}

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = React.useState<PriceAlert[]>([]);
  const triggeredRef = useRef<Set<string>>(new Set());
  const { latestPrice, selectedPair } = useTradingStore();

  const checkAlert = useCallback((alert: PriceAlert, currentPrice: number) => {
    if (!alert.isActive || triggeredRef.current.has(alert.id)) return false;

    let shouldTrigger = false;

    if (alert.condition === 'above' && currentPrice >= alert.triggerPrice) {
      shouldTrigger = true;
    } else if (alert.condition === 'below' && currentPrice <= alert.triggerPrice) {
      shouldTrigger = true;
    } else if (
      alert.condition === 'between' &&
      alert.secondaryPrice &&
      currentPrice >= Math.min(alert.triggerPrice, alert.secondaryPrice) &&
      currentPrice <= Math.max(alert.triggerPrice, alert.secondaryPrice)
    ) {
      shouldTrigger = true;
    }

    return shouldTrigger;
  }, []);

  useEffect(() => {
    if (!latestPrice || !selectedPair) return;

    const mid = (latestPrice.bid + latestPrice.ask) / 2;

    alerts.forEach((alert) => {
      if (alert.symbol === selectedPair && checkAlert(alert, mid)) {
        triggeredRef.current.add(alert.id);

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(`Price Alert: ${selectedPair}`, {
            body: `${selectedPair} has ${alert.condition} ${alert.triggerPrice.toFixed(5)}`,
            icon: '/chart-icon.png',
            tag: alert.id,
          });
        }

        playAlertSound();

        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id ? { ...a, triggeredAt: Date.now() } : a
          )
        );
      }
    });
  }, [latestPrice, selectedPair, alerts, checkAlert]);

  const addAlert = useCallback((alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };
    setAlerts((prev) => [...prev, newAlert]);
    return newAlert;
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    triggeredRef.current.delete(id);
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isActive: !a.isActive } : a
      )
    );
  }, []);

  const resetAlert = useCallback((id: string) => {
    triggeredRef.current.delete(id);
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, triggeredAt: undefined } : a
      )
    );
  }, []);

  return {
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    resetAlert,
  };
};

const playAlertSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.5
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};
