export interface Candle {
  time: string; // YYYY-MM-DD format for Lightweight Charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type GameState = 'IDLE' | 'READY' | 'ANALYZING' | 'ANALYZED' | 'REVEALED';

export interface AnalysisResult {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  pattern: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
  confidence: number;
}

export interface TradeResult {
  won: boolean;
  pnlPercent: number;
  finalPrice: number;
}

export interface PriceLevel {
  price: number;
  color: string;
  title: string;
}
