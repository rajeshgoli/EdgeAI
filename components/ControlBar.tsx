import React from 'react';
import { GameState } from '../types';
import { Dices, BrainCircuit, Eye, PlayCircle } from 'lucide-react';

interface ControlBarProps {
  gameState: GameState;
  onSpin: () => void;
  onAnalyze: () => void;
  onReveal: () => void;
  onReset: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ gameState, onSpin, onAnalyze, onReveal, onReset }) => {
  return (
    <div className="h-24 glass-panel border-t border-white/10 flex items-center justify-center space-x-8 px-8">
      
      {/* Spin Button */}
      <button 
        onClick={onSpin}
        disabled={gameState === 'ANALYZING' || gameState === 'REVEALED'}
        className={`
          flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300
          ${gameState === 'IDLE' || gameState === 'REVEALED' 
            ? 'bg-edge-neon text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
        `}
      >
        {gameState === 'REVEALED' ? <PlayCircle size={24} /> : <Dices size={24} />}
        {gameState === 'REVEALED' ? 'Next Trade' : 'Spin Market'}
      </button>

      {/* Analyze Button */}
      <button 
        onClick={onAnalyze}
        disabled={gameState !== 'READY'}
        className={`
          flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300
          ${gameState === 'READY'
            ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
        `}
      >
        <BrainCircuit size={24} />
        Analyze Setup
      </button>

      {/* Reveal Button */}
      <button 
        onClick={onReveal}
        disabled={gameState !== 'ANALYZED'}
        className={`
          flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300
          ${gameState === 'ANALYZED'
            ? 'bg-edge-bull text-black shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-105'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
        `}
      >
        <Eye size={24} />
        Reveal Future
      </button>

    </div>
  );
};

export default ControlBar;
