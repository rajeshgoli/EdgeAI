import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChartContainer } from './components/ChartContainer';
import { ControlBar } from './components/ControlBar';
import { AnalysisOverlay } from './components/AnalysisOverlay';
import { generateMarketData, checkTradeOutcome } from './services/dataGenerator';
import { Candle, GameState, AnalysisResult, TradeOutcome } from './types';

function App() {
  const [fullData, setFullData] = useState<Candle[]>([]);
  const [visibleData, setVisibleData] = useState<Candle[]>([]);
  const [futureData, setFutureData] = useState<Candle[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [outcome, setOutcome] = useState<TradeOutcome | null>(null);

  // Initialize data
  useEffect(() => {
    const data = generateMarketData(5000);
    setFullData(data);
    // Initial random spin
    spin(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spin = (dataSrc: Candle[] = fullData) => {
    if (dataSrc.length === 0) return;

    // Pick a random index. Must have at least 100 history and 50 future.
    // Index represents the "current time".
    const minIdx = 100;
    const maxIdx = dataSrc.length - 60;
    const randomIdx = Math.floor(Math.random() * (maxIdx - minIdx + 1)) + minIdx;

    const visible = dataSrc.slice(randomIdx - 100, randomIdx);
    const future = dataSrc.slice(randomIdx, randomIdx + 50);

    setVisibleData(visible);
    setFutureData(future);
    setGameState(GameState.READY);
    setAnalysis(null);
    setOutcome(null);
  };

  const handleSpin = () => spin();

  const handleAnalyze = useCallback(() => {
    setGameState(GameState.ANALYZING);

    // Simulate AI thinking time
    setTimeout(() => {
      const currentPrice = visibleData[visibleData.length - 1].close;
      
      // Look at immediate future to "cheat" slightly for the simulation to be interesting,
      // OR just do a random strategy. Let's do random but semi-realistic targets.
      // 50/50 chance of being right in this gamified version (or slight edge).
      
      // Determine if next 20 candles are mostly up or down for a "smart" analysis hint
      // But let's keep it random to simulate real trading uncertainty.
      const isBullish = Math.random() > 0.5;
      
      // Simple RR 1:2
      const atrMock = currentPrice * 0.005; // 0.5% volatility
      const target = isBullish ? currentPrice + (atrMock * 2) : currentPrice - (atrMock * 2);
      const stopLoss = isBullish ? currentPrice - atrMock : currentPrice + atrMock;

      const patterns = [
        "Bullish Order Block", "Fair Value Gap Fill", "Liquidity Sweep", "RSI Divergence", "Golden Cross"
      ];
      const bearPatterns = [
        "Bearish Breaker", "Distribution Block", "Premium Array", "MACD Bearish Cross", "Supply Zone Rejection"
      ];

      const result: AnalysisResult = {
        type: isBullish ? 'BULLISH' : 'BEARISH',
        pattern: isBullish ? patterns[Math.floor(Math.random() * patterns.length)] : bearPatterns[Math.floor(Math.random() * bearPatterns.length)],
        confidence: 0.75 + (Math.random() * 0.2),
        entry: currentPrice,
        target: Number(target.toFixed(2)),
        stopLoss: Number(stopLoss.toFixed(2)),
        reasoning: isBullish 
          ? "Price has tapped into a H4 demand zone while forming a bullish market structure shift on the m5. Expecting expansion to the upside."
          : "Market structure shift observed after sweeping buy-side liquidity. Price is heavy and targeting internal range liquidity below."
      };

      setAnalysis(result);
      setGameState(GameState.ANALYZED);
    }, 1500);
  }, [visibleData]);

  const handleReveal = useCallback(() => {
    if (!analysis) return;

    // Combine data
    const combined = [...visibleData, ...futureData];
    setVisibleData(combined);

    // Calculate outcome
    const result = checkTradeOutcome(
      analysis.entry,
      analysis.target,
      analysis.stopLoss,
      analysis.type === 'BULLISH',
      futureData
    );

    setOutcome(result);
    setGameState(GameState.REVEALED);
  }, [analysis, futureData, visibleData]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative">
        {/* Header/Top Bar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500 tracking-widest">ASSET: <span className="text-white">BTC/USD (PERP)</span></span>
            <span className="text-xs font-bold text-slate-500 tracking-widest">SESSION: <span className="text-emerald-400">NY OPEN</span></span>
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
              <ChartContainer 
                data={visibleData} 
                gameState={gameState}
                analysis={analysis}
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