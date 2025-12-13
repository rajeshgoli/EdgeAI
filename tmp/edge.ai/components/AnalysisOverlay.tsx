import React from 'react';
import { AnalysisResult, GameState, TradeOutcome } from '../types';
import { CheckCircle2, XCircle, Target, ShieldAlert, ArrowRight } from 'lucide-react';

interface AnalysisOverlayProps {
  gameState: GameState;
  analysis: AnalysisResult | null;
  outcome: TradeOutcome | null;
}

export const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ gameState, analysis, outcome }) => {
  if (gameState !== GameState.ANALYZED && gameState !== GameState.REVEALED) return null;
  if (!analysis) return null;

  const isRevealed = gameState === GameState.REVEALED;

  return (
    <div className="absolute top-6 right-6 w-96 transition-all duration-500 transform opacity-100 translate-y-0">
      
      {/* Strategy Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/50 overflow-hidden relative">
        {/* Glow effect */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${analysis.type === 'BULLISH' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              {analysis.type === 'BULLISH' ? (
                <span className="text-emerald-400">BULLISH DETECTED</span>
              ) : (
                <span className="text-rose-400">BEARISH DETECTED</span>
              )}
            </h2>
            <p className="text-slate-400 text-xs mt-1 font-mono">{analysis.pattern}</p>
          </div>
          <div className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-cyan-400 border border-cyan-900">
            {Math.floor(analysis.confidence * 100)}% CONF
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-2"><ArrowRight className="w-3 h-3"/> ENTRY</span>
            <span className="text-white font-mono">{analysis.entry.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-2"><Target className="w-3 h-3 text-emerald-500"/> TARGET</span>
            <span className="text-emerald-400 font-mono">{analysis.target.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-rose-500"/> STOP</span>
            <span className="text-rose-400 font-mono">{analysis.stopLoss.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 relative z-10">
            <p className="text-xs text-slate-400 italic leading-relaxed">
                "{analysis.reasoning}"
            </p>
        </div>

        {/* Outcome Overlay (Only when Revealed) */}
        {isRevealed && outcome && (
          <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
             <div className={`p-4 rounded-full mb-3 ${outcome.won ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                {outcome.won ? (
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                ) : (
                    <XCircle className="w-12 h-12 text-rose-400" />
                )}
             </div>
             <h3 className={`text-2xl font-bold ${outcome.won ? 'text-emerald-400' : 'text-rose-400'}`}>
                {outcome.won ? 'WIN' : 'LOSS'}
             </h3>
             <p className="text-white font-mono mt-1 text-lg">
                {outcome.pnlPercentage > 0 ? '+' : ''}{outcome.pnlPercentage.toFixed(2)}%
             </p>
          </div>
        )}

      </div>
    </div>
  );
};