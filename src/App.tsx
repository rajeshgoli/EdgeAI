import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import Chart, { ChartHandle } from './components/Chart';
import { ControlBar } from './components/ControlBar';
import { AnalysisOverlay } from './components/AnalysisOverlay';
import { spinWheel, analyzeMarket, getGoldbachLevels } from './services/api';
import { Candle, GameState, AnalysisResult, TradeOutcome, PriceLevel, TradeStats } from './types';

function App() {
  const [visibleData, setVisibleData] = useState<Candle[]>([]);
  const [futureData, setFutureData] = useState<Candle[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outcome, setOutcome] = useState<TradeOutcome | null>(null);
  const [strategyPersona, setStrategyPersona] = useState<string | null>(null);
  const [priceLines, setPriceLines] = useState<PriceLevel[]>([]);
  const [isGoldbachMode, setIsGoldbachMode] = useState<boolean>(false);
  const [tradeStats, setTradeStats] = useState<TradeStats>({ wins: 0, losses: 0, cumulativePnl: 0 });

  const chartRef = useRef<ChartHandle>(null);

  // Initialize data from backend
  useEffect(() => {
    handleSpin();
  }, []);

  const handleSpin = async () => {
    try {
      const response = await spinWheel();
      setVisibleData(response.past_data);
      setFutureData(response.future_data);
      setGameState(GameState.READY);
      setAnalysis(null);
      setOutcome(null);
      setPriceLines([]); // Clear price lines on new spin
    } catch (error) {
      console.error('Failed to spin:', error);
    }
  };

  const handleAnalyze = useCallback(async () => {
    setGameState(GameState.ANALYZING);

    try {
      // Capture screenshot before analysis (for AI enhancement)
      const screenshot = chartRef.current?.getScreenshot() || undefined;

      const result = await analyzeMarket(visibleData, strategyPersona || undefined, screenshot);

      // Map backend response to AnalysisResult format
      const currentPrice = visibleData[visibleData.length - 1]?.close || 0;
      const mappedResult: AnalysisResult = {
        type: result.sentiment === 'BULLISH' ? 'BULLISH' : 'BEARISH',
        pattern: result.narrative || 'Goldbach Analysis',
        confidence: (result.confidence || 75) / 100,
        entry: currentPrice,
        target: result.targetPrice || currentPrice * 1.01,
        stopLoss: result.stopLoss || currentPrice * 0.99,
        reasoning: result.reasoning || result.narrative || 'Analysis based on Goldbach methodology',
        goldbach_levels: result.goldbach_levels,
        dealing_range: result.dealing_range,
      };

      setAnalysis(mappedResult);

      // Map goldbach_levels to PriceLevel[] for chart drawing
      if (result.goldbach_levels && result.goldbach_levels.length > 0) {
        const levels: PriceLevel[] = result.goldbach_levels.map((level: any) => ({
          price: level.price,
          color: level.color || '#ffffff',
          title: level.label || '',
        }));
        setPriceLines(levels);
      }

      setGameState(GameState.ANALYZED);
    } catch (error) {
      console.error('Analysis failed:', error);
      setGameState(GameState.READY);
    }
  }, [visibleData, strategyPersona]);

  const handleReveal = useCallback(() => {
    if (!analysis || futureData.length === 0) return;

    // Combine data
    const combined = [...visibleData, ...futureData];
    setVisibleData(combined);

    // Calculate outcome
    const startPrice = futureData[0].open;
    const endPrice = futureData[futureData.length - 1].close;
    const isBullish = analysis.type === 'BULLISH';
    const marketWentUp = endPrice > startPrice;
    const won = (isBullish && marketWentUp) || (!isBullish && !marketWentUp);
    const pnl = ((endPrice - startPrice) / startPrice) * 100;

    const actualPnl = isBullish ? pnl : -pnl;

    setOutcome({
      won,
      pnlPercentage: actualPnl,
      finalPrice: endPrice,
    });

    // Update trade stats
    setTradeStats(prev => ({
      wins: prev.wins + (won ? 1 : 0),
      losses: prev.losses + (won ? 0 : 1),
      cumulativePnl: prev.cumulativePnl + actualPnl,
    }));

    setGameState(GameState.REVEALED);
  }, [analysis, futureData, visibleData]);

  const handleStrategyCompiled = (persona: string) => {
    console.log('Strategy compiled:', persona);
    setStrategyPersona(persona);
    // Enable Goldbach mode when persona is GOLDBACH_MODE
    setIsGoldbachMode(persona === 'GOLDBACH_MODE');
  };

  // Dynamic zoom handler - recalculates Goldbach levels when user zooms
  const handleVisibleRangeChange = useCallback(async (high: number, low: number, currentPrice: number) => {
    // Only recalculate in Goldbach mode (explicit or default when no persona) and after initial analysis
    const isGoldbachActive = isGoldbachMode || !strategyPersona || strategyPersona === 'GOLDBACH_MODE';
    if (!isGoldbachActive || gameState !== GameState.ANALYZED) return;

    try {
      const result = await getGoldbachLevels(high, low, currentPrice);

      // Map the new levels to PriceLevel[] format
      if (result.levels && result.levels.length > 0) {
        const levels: PriceLevel[] = result.levels.map((level: any) => ({
          price: level.price,
          color: level.color || '#ffffff',
          title: level.label || '',
        }));
        setPriceLines(levels);
      }
    } catch (error) {
      console.error('Failed to update Goldbach levels:', error);
    }
  }, [isGoldbachMode, strategyPersona, gameState]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      <Sidebar onStrategyCompiled={handleStrategyCompiled} tradeStats={tradeStats} />

      <div className="flex-1 flex flex-col relative">
        {/* Header/Top Bar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 tracking-widest">ASSET: <span className="text-white">S&P 500 (ES)</span></span>
            <span className="text-xs font-bold text-slate-500 tracking-widest">SESSION: <span className="text-emerald-400">4H</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-500 font-mono">CONNECTED</span>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-900 via-slate-950 to-black">
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

           <div className="absolute inset-0 p-4">
              <Chart
                ref={chartRef}
                data={visibleData}
                lines={priceLines}
                onVisibleRangeChange={handleVisibleRangeChange}
              />
           </div>

           {/* Analysis Overlay */}
           <AnalysisOverlay
             gameState={gameState}
             analysis={analysis}
             outcome={outcome}
           />
        </div>

        {/* Bottom Control Bar */}
        <ControlBar
          gameState={gameState}
          onSpin={handleSpin}
          onAnalyze={handleAnalyze}
          onReveal={handleReveal}
        />
      </div>
    </div>
  );
}

export default App;
