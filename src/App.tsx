import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import Sidebar from './components/Sidebar';
import ControlBar from './components/ControlBar';
import Chart, { ChartHandle } from './components/Chart';
import StrategyCard from './components/StrategyCard';
import { spinWheel } from './services/api';
import { useAnalyze } from './hooks/useAPI';
import { Candle, GameState, AnalysisResult, TradeResult, PriceLevel } from './types';
import { Coins } from 'lucide-react';

const App: React.FC = () => {
  // --- Data State ---
  const [allData, setAllData] = useState<Candle[]>([]);
  const [currentVisibleData, setCurrentVisibleData] = useState<Candle[]>([]);
  const [futureData, setFutureData] = useState<Candle[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [priceLines, setPriceLines] = useState<PriceLevel[]>([]);

  // --- Game State ---
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);

  // --- Refs ---
  const chartRef = useRef<ChartHandle>(null);

  // --- Initialization ---
  useEffect(() => {
    // Load data from API
    const loadData = async () => {
      try {
        const response = await spinWheel();
        setCurrentVisibleData(response.past_data);
        setFutureData(response.future_data);
        setDataLoaded(true);
        setGameState('READY');
      } catch (error) {
        console.error("Failed to load data", error);
        // Fallback or error state?
      }
    };
    loadData();
  }, []);

  // --- Handlers ---

  const handleSpin = useCallback(async () => {
    // Reset States
    setAnalysis(null);
    setTradeResult(null);
    setPriceLines([]);
    chartRef.current?.reset();

    try {
      const response = await spinWheel();
      setCurrentVisibleData(response.past_data);
      setFutureData(response.future_data);
      setGameState('READY');
    } catch (error) {
      console.error("Failed to spin", error);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    setGameState('ANALYZING');
    setIsAnalyzing(true);

    // Call Mock API
    const lines = await useAnalyze();

    setPriceLines(lines);

    // Create a dummy analysis result for the UI (since we removed the real service call)
    // In a real app, we might want to fetch this too or derive it.
    setAnalysis({
      sentiment: 'BULLISH', // Mock
      pattern: 'Goldbach Level Rejection',
      entryPrice: lines[0].price,
      targetPrice: lines[0].price + 50,
      stopLoss: lines[0].price - 20,
      reasoning: 'Price rejected off the Order Block with high volume.',
      confidence: 0.85
    });

    setIsAnalyzing(false);
    setGameState('ANALYZED');
  }, [currentVisibleData]);

  const handleReveal = useCallback(() => {
    if (futureData.length === 0) return;

    // Stream the future candles one by one for effect (or chunks)
    // For now, let's just dump them or do a small animation in a real app.
    // Here we append directly.
    chartRef.current?.appendData(futureData);

    // Calculate Result
    const startPrice = futureData[0].open;
    const endPrice = futureData[futureData.length - 1].close;

    // Simple logic: Did it go in the direction of the sentiment?
    const isBullish = analysis?.sentiment === 'BULLISH';
    const marketWentUp = endPrice > startPrice;
    const won = (isBullish && marketWentUp) || (!isBullish && !marketWentUp);

    const pnl = ((endPrice - startPrice) / startPrice) * 100;

    setTradeResult({
      won,
      pnlPercent: isBullish ? pnl : -pnl,
      finalPrice: endPrice
    });

    setGameState('REVEALED');
  }, [futureData, analysis]);

  // --- Render ---

  if (!dataLoaded) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-edge-neon">
        <Coins className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-mono tracking-widest animate-pulse">GENERATING MARKET SIMULATION...</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-edge-900 text-slate-200 overflow-hidden font-sans selection:bg-edge-neon selection:text-black">

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">

        {/* Background Grid/Effect (Optional) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-edge-800 via-edge-900 to-black opacity-50 pointer-events-none"></div>

        {/* Chart Container */}
        <div className="flex-1 relative p-4">
          {/* Chart Wrapper */}
          <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-black/40 backdrop-blur-sm relative">

            {gameState === 'IDLE' && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">Ready to Backtest?</h2>
                  <p className="text-slate-400">Click "Spin Market" to load a random historical scenario.</p>
                </div>
              </div>
            )}

            <Chart ref={chartRef} data={currentVisibleData} lines={priceLines} />

            {/* Analysis Overlay */}
            <StrategyCard analysis={analysis} loading={isAnalyzing} />

            {/* Win/Loss Badge (Post Reveal) */}
            {gameState === 'REVEALED' && tradeResult && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className={`
                    px-8 py-4 rounded-xl font-black text-4xl shadow-2xl border-2 backdrop-blur-md
                    ${tradeResult.won
                    ? 'bg-green-500/20 border-green-500 text-green-400 shadow-green-500/20'
                    : 'bg-red-500/20 border-red-500 text-red-400 shadow-red-500/20'}
                  `}>
                  {tradeResult.won ? 'WIN' : 'LOSS'}
                  <span className="text-lg ml-3 font-mono opacity-80">
                    {tradeResult.pnlPercent > 0 ? '+' : ''}{tradeResult.pnlPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom Control Bar */}
        <ControlBar
          gameState={gameState}
          onSpin={handleSpin}
          onAnalyze={handleAnalyze}
          onReveal={handleReveal}
          onReset={handleSpin}
        />
      </div>
    </div>
  );
};

export default App;
