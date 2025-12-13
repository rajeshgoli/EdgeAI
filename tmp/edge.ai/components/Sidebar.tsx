import React from 'react';
import { Settings, FileText, Cpu } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="w-80 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col p-6 hidden md:flex">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Cpu className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Edge.ai
          </h1>
          <p className="text-xs text-slate-500 font-mono">SYSTEM V.2.1</p>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3">
            <Settings className="w-4 h-4" />
            STRATEGY CONFIG
          </label>
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 shadow-inner">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500">ACTIVE MODEL</span>
                <span className="text-xs text-emerald-400 font-mono">GOLDBACH-ALPHA</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">TIMEFRAME</span>
                <span className="text-xs text-slate-300 font-mono">5 MIN</span>
             </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3">
            <FileText className="w-4 h-4" />
            CONTEXT (PDF/TEXT)
          </label>
          <textarea 
            className="w-full h-48 bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
            placeholder="// Paste your strategy logic here...
// e.g. 'Look for Fair Value Gaps on 5m timeframe with RSI divergence...'
            
(System currently running default Goldbach Trend logic)"
          />
        </div>

        <div className="mt-8 p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5">
            <h3 className="text-cyan-400 text-xs font-bold mb-1">LIVE TELEMETRY</h3>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-2/3 animate-pulse"></div>
            </div>
            <p className="text-[10px] text-cyan-300/60 mt-2 font-mono">NEURAL ENGINE ONLINE</p>
        </div>
      </div>
    </div>
  );
};