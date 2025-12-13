import React from 'react';
import { GameState } from '../types';
import { Dices, BrainCircuit, Eye } from 'lucide-react';

interface ControlBarProps {
  gameState: GameState;
  onSpin: () => void;
  onAnalyze: () => void;
  onReveal: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ gameState, onSpin, onAnalyze, onReveal }) => {
  
  const isSpinDisabled = gameState === GameState.ANALYZING || gameState === GameState.ANALYZED;
  const isAnalyzeDisabled = gameState !== GameState.READY;
  const isRevealDisabled = gameState !== GameState.ANALYZED;

  return (
    <div className="h-24 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex items-center justify-center gap-6 px-6">
      
      <button 
        onClick={onSpin}
        disabled={isSpinDisabled}
        className={`
          flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm tracking-wider transition-all duration-300
          ${isSpinDisabled 
            ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500' 
            : 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-105 shadow-lg shadow-black/20'}
        `}
      >
        <Dices className="w-5 h-5" />
        {gameState === GameState.REVEALED ? 'NEXT SETUP' : 'SPIN'}
      </button>

      <button 
        onClick={onAnalyze}
        disabled={isAnalyzeDisabled}
        className={`
          flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm tracking-wider transition-all duration-300
          ${isAnalyzeDisabled
            ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
            : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-cyan-500/25 hover:scale-105 shadow-lg border border-cyan-500/50'}
        `}
      >
        {gameState === GameState.ANALYZING ? (
           <span className="animate-pulse">PROCESSING...</span>
        ) : (
           <>
             <BrainCircuit className="w-5 h-5" />
             ANALYZE
           </>
        )}
      </button>

      <button 
        onClick={onReveal}
        disabled={isRevealDisabled}
        className={`
          flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm tracking-wider transition-all duration-300
          ${isRevealDisabled
            ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-500/25 hover:scale-105 shadow-lg'}
        `}
      >
        <Eye className="w-5 h-5" />
        REVEAL
      </button>

    </div>
  );
};