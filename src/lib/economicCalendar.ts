/**
 * Economic Calendar Events and Integration
 */

export interface EconomicEvent {
  id: string;
  country: string;
  currency: string;
  event: string;
  importance: 'high' | 'medium' | 'low';
  datetime: number;
  forecast?: string;
  previous?: string;
  actual?: string;
  impact?: string;
  source?: string;
}

export const ECONOMIC_INDICATORS = [
  'Non-Farm Payroll',
  'Unemployment Rate',
  'CPI',
  'Retail Sales',
  'GDP',
  'Inflation Rate',
  'Producer Price Index',
  'Housing Starts',
  'Industrial Production',
  'Consumer Confidence',
  'PMI Manufacturing',
  'PMI Services',
];

export const HIGH_IMPACT_EVENTS = [
  'Non-Farm Payroll',
  'ECB Interest Rate',
  'Fed Interest Rate',
  'GDP',
  'Unemployment Rate',
  'CPI',
];

export const fetchEconomicCalendar = async (
  startDate: Date,
  endDate: Date
): Promise<EconomicEvent[]> => {
  try {
    const response = await fetch('/api/economic-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });

    if (!response.ok) throw new Error('Failed to fetch calendar');

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching economic calendar:', error);
    return [];
  }
};

export const filterEventsByImportance = (
  events: EconomicEvent[],
  importance: 'high' | 'medium' | 'low'
): EconomicEvent[] => {
  return events.filter((e) => e.importance === importance);
};

export const getUpcomingEvents = (
  events: EconomicEvent[],
  hoursAhead: number = 24
): EconomicEvent[] => {
  const now = Date.now();
  const futureThreshold = now + hoursAhead * 60 * 60 * 1000;

  return events.filter(
    (e) => e.datetime > now && e.datetime < futureThreshold
  );
};

export const checkEventImpactOnPair = (
  event: EconomicEvent,
  pair: string
): boolean => {
  const [base, quote] = pair.split('/');
  return (
    event.currency === base ||
    event.currency === quote ||
    event.country === base.substring(0, 2) ||
    event.country === quote.substring(0, 2)
  );
};
