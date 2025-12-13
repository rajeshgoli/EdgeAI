import React from 'react';
import { GameState } from '../types';
import { Dices, BrainCircuit, Eye } from 'lucide-react';

interface ControlBarProps {
  gameState: GameState;
  onSpin: () => void;
  onAnalyze: () => void;
  onReveal: () => void;
  onReset: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ gameState, onSpin, onAnalyze, onReveal }) => {

  const isSpinDisabled = gameState === 'ANALYZING';
  const isAnalyzeDisabled = gameState !== 'READY';
  const isRevealDisabled = gameState !== 'ANALYZED';

  return (
    <div className="h-24 bg-[#0f172a] border-t border-slate-800/50 flex items-center justify-center gap-6">

      {/* SPIN Button */}
      <button
        onClick={onSpin}
        disabled={isSpinDisabled}
        className={`
          flex items-center justify-center gap-2.5 h-12 px-8 rounded-full font-medium text-sm transition-all
          ${isSpinDisabled
            ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
            : 'bg-slate-700 hover:bg-slate-600 text-white'}
        `}
      >
        <Dices className="w-4 h-4" />
        SPIN
      </button>

      {/* ANALYZE Button */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzeDisabled}
        className={`
          flex items-center justify-center gap-2.5 h-12 px-10 rounded-full font-medium text-sm transition-all
          ${isAnalyzeDisabled
            ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'}
        `}
      >
        {gameState === 'ANALYZING' ? (
          <span className="animate-pulse">ANALYZING...</span>
        ) : (
          <>
            <BrainCircuit className="w-4 h-4" />
            ANALYZE
          </>
        )}
      </button>

      {/* REVEAL Button */}
      <button
        onClick={onReveal}
        disabled={isRevealDisabled}
        className={`
          flex items-center justify-center gap-2.5 h-12 px-8 rounded-full font-medium text-sm transition-all
          ${isRevealDisabled
            ? 'bg-transparent text-slate-600 cursor-not-allowed border border-slate-700/50'
            : 'bg-slate-700 hover:bg-slate-600 text-white'}
        `}
      >
        <Eye className="w-4 h-4" />
        REVEAL
      </button>

    </div>
  );
};

export default ControlBar;
