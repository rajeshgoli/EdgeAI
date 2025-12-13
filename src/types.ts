export interface Candle {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}

export enum GameState {
  IDLE = 'IDLE',
  READY = 'READY',
  ANALYZING = 'ANALYZING',
  ANALYZED = 'ANALYZED',
  REVEALED = 'REVEALED',
}

export interface AnalysisResult {
  type: 'BULLISH' | 'BEARISH';
  sentiment?: string; // Backend compatibility
  pattern: string;
  confidence: number;
  entry: number;
  target: number;
  targetPrice?: number; // Backend compatibility
  stopLoss: number;
  reasoning: string;
  narrative?: string; // Backend compatibility
  goldbach_levels?: GoldbachLevel[];
  dealing_range?: any;
  current_status?: any;
  signals?: any[];
}

export interface TradeOutcome {
  won: boolean;
  pnlPercentage: number;
  finalPrice: number;
}

export interface TradeStats {
  wins: number;
  losses: number;
  cumulativePnl: number;
}

// Backend types
export interface SpinResponse {
  past_data: Candle[];
  future_data: Candle[];
}

export interface GoldbachLevel {
  price: number;
  label: string;
  color: string;
}

export interface GoldbachLevelsResponse {
  levels: GoldbachLevel[];
  dealing_range: {
    low: number;
    high: number;
    po3_size: number;
  };
}

export interface PriceLevel {
  price: number;
  color: string;
  title: string;
}
