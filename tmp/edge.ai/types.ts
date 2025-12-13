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
  pattern: string;
  confidence: number;
  entry: number;
  target: number;
  stopLoss: number;
  reasoning: string;
}

export interface TradeOutcome {
  won: boolean;
  pnlPercentage: number;
  finalPrice: number;
}