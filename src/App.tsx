import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ControlBar from './components/ControlBar';
import Chart, { ChartHandle } from './components/Chart';
import ErrorBoundary from './components/ErrorBoundary';
import StrategyCard from './components/StrategyCard';
import { spinWheel, analyzeMarket, getGoldbachLevels } from './services/api';
import { Candle, GameState, AnalysisResult, TradeResult, PriceLevel } from './types';
import { Cpu } from 'lucide-react';

const App: React.FC = () => {
  // --- Data State ---
  const [allData, setAllData] = useState<Candle[]>([]); // Kept for compatibility if needed
  const [currentVisibleData, setCurrentVisibleData] = useState<Candle[]>([]);
  const [futureData, setFutureData] = useState<Candle[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [priceLines, setPriceLines] = useState<PriceLevel[]>([]);
  const [strategyPersona, setStrategyPersona] = useState<string | undefined>(undefined);
  const [isGoldbachMode, setIsGoldbachMode] = useState(false);

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

    try {
      // Capture screenshot for Gemini analysis
      let screenshot: string | undefined;
      try {
        screenshot = chartRef.current?.getScreenshot() || undefined;
        console.log("Screenshot captured:", screenshot ? `yes (${screenshot.length} chars)` : "no");
      } catch (screenshotError) {
        console.warn("Screenshot capture failed:", screenshotError);
        screenshot = undefined;
      }

      // Call Real API with screenshot
      console.log("Calling analyzeMarket API...");
      const result = await analyzeMarket(currentVisibleData, strategyPersona, screenshot);
      console.log("Analysis result:", result);

      // Map Goldbach levels to PriceLines if available
      if (result.goldbach_levels) {
        const lines: PriceLevel[] = result.goldbach_levels.map(l => ({
          price: l.price,
          color: l.color,
          title: l.label
        }));
        setPriceLines(lines);
      }

      setAnalysis(result);
      setGameState('ANALYZED');
    } catch (error) {
      console.error("Analysis failed", error);
      // Reset state so user can try again
      setGameState('READY');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentVisibleData, strategyPersona]);

  // Handle visible range changes - update Goldbach levels dynamically
  const handleVisibleRangeChange = useCallback(async (high: number, low: number, currentPrice: number) => {
    if (!isGoldbachMode) return;

    try {
      const result = await getGoldbachLevels(high, low, currentPrice);
      const lines: PriceLevel[] = result.levels.map(l => ({
        price: l.price,
        color: l.color,
        title: l.label
      }));
      setPriceLines(lines);
    } catch (error) {
      console.error("Failed to update Goldbach levels", error);
    }
  }, [isGoldbachMode]);

  const handleReveal = useCallback(() => {
    if (futureData.length === 0) return;

    // Stream the future candles one by one for effect (or chunks)
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
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 animate-pulse mb-4">
          <Cpu className="text-white w-6 h-6" />
        </div>
        <h2 className="text-xl font-mono tracking-widest text-slate-400 animate-pulse">LOADING MARKET DATA...</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a1628] text-slate-200">

      {/* Left Sidebar */}
      <Sidebar onStrategyCompiled={(persona) => {
        console.log("Strategy Compiled:", persona);
        setStrategyPersona(persona);
        // Activate Goldbach mode if the persona indicates it
        if (persona === 'GOLDBACH_MODE') {
          setIsGoldbachMode(true);
          // Trigger initial Goldbach level calculation
          const range = chartRef.current?.getVisibleRange();
          if (range) {
            handleVisibleRangeChange(range.high, range.low, range.currentPrice);
          }
        } else {
          setIsGoldbachMode(false);
        }
      }} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative border-l border-slate-800/30">

        {/* Header/Top Bar */}
        <div className="h-12 flex items-center justify-between px-6 border-b border-slate-800/30">
          <div className="flex items-center gap-6">
            <span className="text-sm text-slate-400">ASSET: <span className="font-semibold text-white">S&P 500 (ES)</span></span>
            <span className="text-sm text-slate-400">SESSION: <span className="font-semibold text-emerald-400">4H</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-xs text-emerald-400">CONNECTED</span>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 relative overflow-hidden">
          <div className="w-full h-full">
            {gameState === 'IDLE' && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-2">Ready to Backtest?</h2>
                  <p className="text-slate-400">Click "Spin" to load a random historical scenario.</p>
                </div>
              </div>
            )}

            <ErrorBoundary>
              <Chart
                ref={chartRef}
                data={currentVisibleData}
                lines={priceLines}
                onVisibleRangeChange={isGoldbachMode ? handleVisibleRangeChange : undefined}
              />
            </ErrorBoundary>
          </div>

          {/* Analysis Overlay */}
          <StrategyCard analysis={analysis} loading={isAnalyzing} outcome={tradeResult} gameState={gameState} />
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
