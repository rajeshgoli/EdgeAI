export interface SpinResponse {
  past_data: Candle[];
  future_data: Candle[];
}

export interface Candle {
  time: string; // YYYY-MM-DD format for Lightweight Charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export type GameState = 'IDLE' | 'READY' | 'ANALYZING' | 'ANALYZED' | 'REVEALED';

export interface Signal {
  type: string;
  detected: boolean;
  details: string;
}

export interface AnalysisResult {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  pattern?: string;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning?: string; // narrative from backend
  confidence?: number;

  // Goldbach Specific
  narrative?: string;
  goldbach_levels?: { price: number; label: string; color: string }[];
  dealing_range?: { po3_size: number; low: number; high: number };
  current_status?: { price: number; zone: string; nearest_level: string };
  signals?: Signal[];
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

export interface GoldbachLevelsResponse {
  levels: { price: number; label: string; color: string; ratio: number }[];
  dealing_range: { po3_size: number; low: number; high: number };
}
