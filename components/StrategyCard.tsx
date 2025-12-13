import React from 'react';
import { AnalysisResult } from '../types';
import { AlertCircle, Target, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';

interface StrategyCardProps {
  analysis: AnalysisResult | null;
  loading: boolean;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ analysis, loading }) => {
  if (loading) {
    return (
      <div className="absolute top-4 right-4 w-80 glass-panel p-6 rounded-xl border-l-4 border-edge-neon transition-all animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-5 h-5 bg-edge-neon rounded-full animate-ping"></div>
          <h3 className="text-edge-neon font-mono text-sm tracking-widest">GOLDBACH PROCESSING</h3>
        </div>
        <div className="space-y-3">
          <div className="h-2 bg-slate-700 rounded w-3/4"></div>
          <div className="h-2 bg-slate-700 rounded w-1/2"></div>
          <div className="h-2 bg-slate-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const isBullish = analysis.sentiment === 'BULLISH';
  const sentimentColor = isBullish ? 'text-edge-bull' : 'text-edge-bear';
  const borderColor = isBullish ? 'border-edge-bull' : 'border-edge-bear';

  return (
    <div className={`absolute top-4 right-4 w-96 glass-panel p-6 rounded-xl border-l-4 ${borderColor} shadow-2xl transition-all duration-500 ease-out transform translate-y-0 opacity-100`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className={`text-2xl font-bold ${sentimentColor} tracking-tighter flex items-center gap-2`}>
            {isBullish ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            {analysis.sentiment}
          </h2>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">{analysis.pattern}</span>
        </div>
        <div className="text-right">
            <div className="text-3xl font-mono font-bold text-white">{analysis.confidence}%</div>
            <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-black/30 p-2 rounded border border-white/5">
          <div className="text-xs text-slate-400 flex items-center gap-1"><Target size={12}/> Target</div>
          <div className="font-mono text-edge-neon">{analysis.targetPrice.toFixed(2)}</div>
        </div>
        <div className="bg-black/30 p-2 rounded border border-white/5">
          <div className="text-xs text-slate-400 flex items-center gap-1"><ShieldAlert size={12}/> Stop Loss</div>
          <div className="font-mono text-pink-500">{analysis.stopLoss.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-black/20 p-3 rounded-lg border border-white/5 text-sm text-slate-300 leading-relaxed font-light">
        <AlertCircle size={16} className="inline mr-2 text-edge-neon mb-1"/>
        {analysis.reasoning}
      </div>
    </div>
  );
};

export default StrategyCard;
