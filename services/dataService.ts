import { Candle } from '../types';

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate a random walk series of candles
export const generateMarketData = (count: number = 5000): Candle[] => {
  const data: Candle[] = [];
  let currentPrice = 4150.0; // Starting essentially like SPX or ETH
  let date = new Date('2023-01-01');

  for (let i = 0; i < count; i++) {
    // Volatility changes occasionally to simulate market phases
    const volatility = 0.002 + Math.random() * 0.008; 
    const change = (Math.random() - 0.5) * currentPrice * volatility;
    
    const open = currentPrice;
    const close = open + change;
    
    // Generate High/Low based on Open/Close with some wicks
    const wickHigh = Math.random() * (currentPrice * 0.005);
    const wickLow = Math.random() * (currentPrice * 0.005);
    
    const high = Math.max(open, close) + wickHigh;
    const low = Math.min(open, close) - wickLow;

    data.push({
      time: formatDate(date),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    currentPrice = close;
    // Increment date by 1 day for simplicity with Lightweight Charts 
    // (using Day format avoids complex time handling for this demo)
    date.setDate(date.getDate() + 1);
  }

  return data;
};

export const getRandomStartIndex = (totalCandles: number, windowSize: number, futureSize: number): number => {
  // Ensure we have enough buffer at start and end
  const min = windowSize + 1;
  const max = totalCandles - futureSize - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
