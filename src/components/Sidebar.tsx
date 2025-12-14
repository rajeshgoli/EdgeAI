import React, { useState, useRef } from 'react';
import { Settings, FileText, Cpu, Paperclip, X } from 'lucide-react';
import { compileStrategy } from '../services/api';

interface TradeStats {
  wins: number;
  losses: number;
  cumulativePnl: number;
}

interface SidebarProps {
  onStrategyCompiled?: (persona: string, label: string) => void;
  onStrategyCleared?: () => void;
  activeModel?: string;
  tradeStats?: TradeStats;
}

export const Sidebar: React.FC<SidebarProps> = ({ onStrategyCompiled, onStrategyCleared, activeModel, tradeStats }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const result = await compileStrategy(file);
      setUploadStatus('success');
      if (onStrategyCompiled) {
        onStrategyCompiled(result.persona, result.label || 'custom');
      }
    } catch (err) {
      console.error('Failed to upload strategy:', err);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onStrategyCleared) {
      onStrategyCleared();
    }
  };

  return (
    <div className="w-80 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col p-6 flex-shrink-0">
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
                <span className={`text-xs font-mono ${activeModel && activeModel !== 'none' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {activeModel?.toUpperCase() || 'NONE'}
                </span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">TIMEFRAME</span>
                <span className="text-xs text-slate-300 font-mono">4H</span>
             </div>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-3">
            <FileText className="w-4 h-4" />
            CONTEXT (PDF/TEXT)
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="ml-auto flex items-center gap-1 px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Paperclip className="w-3 h-3" />
              {isUploading ? 'Uploading...' : 'Attach'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.md"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Attached File Display */}
          {fileName && (
            <div className={`mb-3 p-2 rounded-lg border flex items-center justify-between ${
              uploadStatus === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : uploadStatus === 'error'
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-slate-800/50 border-slate-700'
            }`}>
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className={`w-4 h-4 flex-shrink-0 ${
                  uploadStatus === 'success' ? 'text-emerald-400' :
                  uploadStatus === 'error' ? 'text-red-400' : 'text-slate-400'
                }`} />
                <span className="text-xs text-slate-300 truncate font-mono">{fileName}</span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {uploadStatus === 'success' && (
            <p className="text-xs text-emerald-400 mb-2">Strategy compiled successfully!</p>
          )}
          {uploadStatus === 'error' && (
            <p className="text-xs text-red-400 mb-2">Failed to compile strategy. Try again.</p>
          )}

          {!fileName && (
            <p className="text-xs text-slate-500 italic">
              Attach a PDF/TXT to customize the analysis strategy.
            </p>
          )}
        </div>

        <div className="mt-8 p-4 rounded-xl border border-cyan-500/10 bg-cyan-500/5">
            <h3 className="text-cyan-400 text-xs font-bold mb-2">PERFORMANCE</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {tradeStats?.wins ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-rose-400 font-mono">
                  {tradeStats?.losses ?? 0}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Losses</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold font-mono ${
                  (tradeStats?.cumulativePnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(tradeStats?.cumulativePnl ?? 0) >= 0 ? '+' : ''}{(tradeStats?.cumulativePnl ?? 0).toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">P&L</div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
