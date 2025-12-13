import React, { useState, useRef } from 'react';
import { Settings, FileText, Cpu } from 'lucide-react';
import { compileStrategy } from '../services/api';

interface SidebarProps {
  onStrategyCompiled: (persona: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onStrategyCompiled }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      const result = await compileStrategy(file);
      onStrategyCompiled(result.persona);
    } catch (err) {
      console.error(err);
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-[380px] h-full bg-[#0f172a]/90 backdrop-blur-sm flex flex-col flex-shrink-0 border-r border-slate-700/30">
      {/* Logo Section */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Edge.ai</h1>
            <p className="text-[11px] text-slate-500 tracking-wider">SYSTEM V.2.1</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto">

        {/* Strategy Config Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">STRATEGY CONFIG</span>
          </div>
          <div className="bg-[#1e293b]/60 rounded-lg border border-slate-700/40 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-400">ACTIVE MODEL</span>
              <span className="text-sm font-medium text-emerald-400">GOLDBACH-ALPHA</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">TIMEFRAME</span>
              <span className="text-sm font-medium text-white">4H</span>
            </div>
          </div>
        </div>

        {/* Context Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">CONTEXT (PDF/TEXT)</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="ml-auto px-3 py-1 text-xs font-medium bg-[#1e293b] hover:bg-[#334155] text-slate-300 rounded border border-slate-600/50 transition-colors"
            >
              {isUploading ? 'Loading...' : 'Preview'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <div className="bg-[#1e293b]/60 rounded-lg border border-slate-700/40 p-4">
            <textarea
              className="w-full h-36 bg-transparent text-sm text-slate-400 placeholder-slate-500 resize-none focus:outline-none leading-relaxed"
              placeholder={`// Paste your strategy logic here...
// e.g. 'Look for Fair Value Gaps on 4H timeframe with RSI divergence...'

(System currently running default Goldbach Trend logic)`}
            />
          </div>
        </div>

        {/* Live Telemetry Section */}
        <div className="bg-[#1e293b]/40 rounded-lg border border-cyan-500/20 p-4">
          <h3 className="text-sm font-semibold text-cyan-400 mb-3">LIVE TELEMETRY</h3>
          <div className="h-1 w-full bg-slate-700/50 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-cyan-500 w-1/2 rounded-full"></div>
          </div>
          <p className="text-xs text-cyan-400/70 tracking-wide">NEURAL ENGINE ONLINE</p>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;
