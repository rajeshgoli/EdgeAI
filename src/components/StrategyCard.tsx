import React from 'react';
import { AnalysisResult } from '../services/api';
import { TrendingUp, TrendingDown, Minus, Cpu } from 'lucide-react';

interface StrategyCardProps {
  analysis: AnalysisResult | null;
  loading: boolean;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="absolute top-4 right-4 w-80 bg-black/80 backdrop-blur-md border border-edge-neon/30 rounded-xl p-6 shadow-2xl z-10 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <Cpu className="text-edge-neon animate-spin-slow" size={24} />
          <span className="text-edge-neon font-mono text-sm tracking-widest">NEURAL NET ACTIVE</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-edge-700 rounded w-3/4"></div>
          <div className="h-2 bg-edge-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const isBullish = analysis.sentiment === 'BULLISH';
  const isBearish = analysis.sentiment === 'BEARISH';

  return (
    <div className="absolute top-4 right-4 w-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl z-10 transition-all duration-500 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div className="flex items-center space-x-2">
          <div className={`
            p-2 rounded-lg 
            ${isBullish ? 'bg-green-500/20 text-green-400' : isBearish ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}
          `}>
            {isBullish ? <TrendingUp size={20} /> : isBearish ? <TrendingDown size={20} /> : <Minus size={20} />}
          </div>
          <span className={`font-bold tracking-tight ${isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-slate-400'}`}>
            {analysis.sentiment}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500">CONFIDENCE: HIGH</span>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-4 font-medium">
        "{analysis.narrative}"
      </p>

      {analysis.key_level && (
        <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
          <span className="text-xs text-slate-500 uppercase font-mono">Key Level</span>
          <span className="text-edge-neon font-mono font-bold">{analysis.key_level.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
};

export default StrategyCard;
