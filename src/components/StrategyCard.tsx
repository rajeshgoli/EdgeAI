import React from 'react';
import { AnalysisResult, TradeResult, GameState } from '../types';
import { CheckCircle2, XCircle, Target, ShieldAlert, ArrowRight, Layers } from 'lucide-react';

interface StrategyCardProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  outcome: TradeResult | null;
  gameState: GameState;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ analysis, loading, outcome, gameState }) => {
  console.log("StrategyCard render:", { loading, gameState, hasAnalysis: !!analysis });

  // Don't show if not in analyzed or revealed state (unless loading)
  if (!loading && gameState !== 'ANALYZED' && gameState !== 'REVEALED') {
    console.log("StrategyCard: returning null (not in right state)");
    return null;
  }

  if (loading) {
    return (
      <div className="absolute top-6 right-6 w-96 z-50 transition-all duration-500">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/50">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-5 h-5 bg-cyan-500 rounded-full animate-ping"></div>
            <h3 className="text-cyan-400 font-mono text-sm tracking-widest">GOLDBACH PROCESSING</h3>
          </div>
          <div className="space-y-3">
            <div className="h-2 bg-slate-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-2 bg-slate-700 rounded w-1/2 animate-pulse"></div>
            <div className="h-2 bg-slate-700 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    console.log("StrategyCard: returning null (no analysis data)");
    return null;
  }
  console.log("StrategyCard: RENDERING CARD", analysis);

  const isBullish = analysis.sentiment === 'BULLISH';
  const isNeutral = analysis.sentiment === 'NEUTRAL';
  const isRevealed = gameState === 'REVEALED';
  const isGoldbachAnalysis = !!analysis.dealing_range;

  return (
    <div className="absolute top-6 right-6 w-96 z-50 transition-all duration-500 transform opacity-100 translate-y-0">

      {/* Strategy Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-black/50 overflow-hidden relative">
        {/* Glow effect */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isBullish ? 'bg-emerald-500' : isNeutral ? 'bg-yellow-500' : 'bg-rose-500'}`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              {isBullish ? (
                <span className="text-emerald-400">BULLISH DETECTED</span>
              ) : isNeutral ? (
                <span className="text-yellow-400">NEUTRAL</span>
              ) : (
                <span className="text-rose-400">BEARISH DETECTED</span>
              )}
            </h2>
            {isGoldbachAnalysis && (
              <p className="text-slate-400 text-xs mt-1 font-mono flex items-center gap-1">
                <Layers size={10} className="text-cyan-400" /> GOLDBACH PO3={analysis.dealing_range?.po3_size}
              </p>
            )}
          </div>
          <div className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-cyan-400 border border-cyan-900">
            {analysis.confidence ?? 50}% CONF
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          {/* Narrative */}
          {analysis.narrative && (
            <p className="text-white text-sm italic leading-relaxed mb-4">
              "{analysis.narrative}"
            </p>
          )}

          {/* Goldbach-specific info */}
          {isGoldbachAnalysis && analysis.current_status && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Zone</span>
                <span className={`font-mono ${analysis.current_status.zone?.includes('Discount') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {analysis.current_status.zone}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Nearest Level</span>
                <span className="text-cyan-400 font-mono text-xs">
                  {analysis.current_status.nearest_level?.split(' at ')[0]}
                </span>
              </div>
            </div>
          )}

          {/* Target/Stop for non-Goldbach */}
          {!isGoldbachAnalysis && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><ArrowRight className="w-3 h-3"/> ENTRY</span>
                <span className="text-white font-mono">{analysis.targetPrice?.toFixed(2) ?? '---'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Target className="w-3 h-3 text-emerald-500"/> TARGET</span>
                <span className="text-emerald-400 font-mono">{analysis.targetPrice?.toFixed(2) ?? '---'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><ShieldAlert className="w-3 h-3 text-rose-500"/> STOP</span>
                <span className="text-rose-400 font-mono">{analysis.stopLoss?.toFixed(2) ?? '---'}</span>
              </div>
            </>
          )}
        </div>

        {/* Signals for Goldbach */}
        {isGoldbachAnalysis && analysis.signals && analysis.signals.some(s => s.detected) && (
          <div className="mt-4 pt-4 border-t border-slate-800 relative z-10">
            <div className="text-xs text-slate-400 mb-2 uppercase">Detected Patterns</div>
            <div className="space-y-1">
              {analysis.signals.filter(s => s.detected).map((signal, idx) => (
                <div key={idx} className="bg-cyan-500/10 border border-cyan-500/30 rounded px-2 py-1 text-xs text-cyan-400">
                  <span className="font-bold">{signal.type}:</span> {signal.details}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning */}
        {analysis.reasoning && (
          <div className="mt-4 pt-4 border-t border-slate-800 relative z-10">
            <p className="text-xs text-slate-400 italic leading-relaxed">
              "{analysis.reasoning}"
            </p>
          </div>
        )}

        {/* Outcome Overlay (Only when Revealed) */}
        {isRevealed && outcome && (
          <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 rounded-2xl">
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
              {outcome.pnlPercent > 0 ? '+' : ''}{outcome.pnlPercent.toFixed(2)}%
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default StrategyCard;
