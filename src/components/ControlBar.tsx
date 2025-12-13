import React from 'react';
import { Dices, BrainCircuit, Eye } from 'lucide-react';
import { GameState } from '../types';

interface ControlBarProps {
  gameState: GameState;
  onSpin: () => void;
  onAnalyze: () => void;
  onReveal: () => void;
  onReset: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({ gameState, onSpin, onAnalyze, onReveal, onReset }) => {
  return (
    <div className="h-24 bg-edge-800 border-t border-edge-700 flex items-center justify-center space-x-8 px-8 z-20 shadow-2xl">

      {/* Spin Button */}
      <button
        onClick={onSpin}
        disabled={gameState === 'ANALYZING'}
        className={`
          group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center
          ${gameState === 'IDLE' || gameState === 'REVEALED'
            ? 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
            : 'bg-edge-700 text-slate-500 cursor-not-allowed opacity-50'}
        `}
      >
        <Dices className="mr-2" size={24} />
        {gameState === 'REVEALED' ? 'SPIN AGAIN' : 'SPIN MARKET'}
      </button>

      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={gameState !== 'READY'}
        className={`
          group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center
          ${gameState === 'READY'
            ? 'bg-edge-neon text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]'
            : 'bg-edge-700 text-slate-500 cursor-not-allowed opacity-50'}
        `}
      >
        <BrainCircuit className={`mr-2 ${gameState === 'ANALYZING' ? 'animate-pulse' : ''}`} size={24} />
        {gameState === 'ANALYZING' ? 'ANALYZING...' : 'ANALYZE'}
      </button>

      {/* Reveal Button */}
      <button
        onClick={onReveal}
        disabled={gameState !== 'ANALYZED'}
        className={`
          group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center
          ${gameState === 'ANALYZED'
            ? 'bg-edge-accent text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
            : 'bg-edge-700 text-slate-500 cursor-not-allowed opacity-50'}
        `}
      >
        <Eye className="mr-2" size={24} />
        REVEAL FUTURE
      </button>

    </div>
  );
};

export default ControlBar;
