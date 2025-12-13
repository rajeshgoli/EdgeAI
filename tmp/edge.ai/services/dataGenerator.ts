import { Candle } from '../types';

export const generateMarketData = (count: number = 5000): Candle[] => {
  const data: Candle[] = [];
  let currentPrice = 4150.0;
  // Start 100 days ago
  let currentTime = Math.floor(Date.now() / 1000) - (count * 5 * 60);

  for (let i = 0; i < count; i++) {
    // Random walk with mean reversion
    const volatility = 2.5; 
    const trend = (Math.random() - 0.5) * 0.5;
    
    const delta = (Math.random() - 0.5) * volatility + trend;
    const open = currentPrice;
    const close = currentPrice + delta;
    
    // Generate high/low wicks
    const high = Math.max(open, close) + Math.random() * volatility * 0.8;
    const low = Math.min(open, close) - Math.random() * volatility * 0.8;

    data.push({
      time: currentTime,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    currentPrice = close;
    currentTime += 300; // 5 minutes
  }

  return data;
};

// Helper to check if a trade won based on future data
export const checkTradeOutcome = (
  entryPrice: number,
  targetPrice: number,
  stopLossPrice: number,
  isBullish: boolean,
  futureCandles: Candle[]
): { won: boolean; pnlPercentage: number, finalPrice: number } => {
  
  for (const candle of futureCandles) {
    if (isBullish) {
      if (candle.low <= stopLossPrice) return { won: false, pnlPercentage: -1.0, finalPrice: stopLossPrice };
      if (candle.high >= targetPrice) return { won: true, pnlPercentage: 2.0, finalPrice: targetPrice };
    } else {
      if (candle.high >= stopLossPrice) return { won: false, pnlPercentage: -1.0, finalPrice: stopLossPrice };
      if (candle.low <= targetPrice) return { won: true, pnlPercentage: 2.0, finalPrice: targetPrice };
    }
  }

  // If neither hit in the timeframe, compare final close
  const finalClose = futureCandles[futureCandles.length - 1].close;
  const pnl = isBullish 
    ? ((finalClose - entryPrice) / entryPrice) * 100
    : ((entryPrice - finalClose) / entryPrice) * 100;

  return { won: pnl > 0, pnlPercentage: pnl, finalPrice: finalClose };
};