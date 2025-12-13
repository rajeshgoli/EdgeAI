import React, { useState, useRef } from 'react';
import { Settings, FileText, BarChart3, Lock, Zap, Paperclip, X, File as FileIcon } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-80 h-full glass-panel border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-mono font-bold text-white tracking-tighter flex items-center gap-2">
            <Zap className="text-edge-neon" fill="currentColor" />
            EDGE.AI
        </h1>
        <p className="text-xs text-slate-500 mt-1">Institutional Grade Backtester</p>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        
        {/* Strategy Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-edge-neon">
                <FileText size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Strategy Logic</h3>
             </div>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/5 text-slate-400 hover:text-white transition-all"
             >
                <Paperclip size={10} /> ATTACH PDF
             </button>
             <input 
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
             />
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="mb-3 space-y-2 animate-in fade-in slide-in-from-top-1">
                {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-edge-800 border border-white/10 text-xs group hover:border-edge-neon/30 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <FileIcon size={12} className="text-red-500 shrink-0"/>
                            <span className="truncate text-slate-300 font-mono">{file.name}</span>
                        </div>
                        <button 
                            onClick={() => removeFile(idx)}
                            className="text-slate-600 hover:text-red-400 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
          )}

          <div className="bg-black/40 rounded-lg p-3 border border-white/10 relative group transition-colors focus-within:border-edge-neon/50">
             <textarea 
                className="w-full bg-transparent text-xs text-slate-400 font-mono resize-y focus:outline-none min-h-[120px]"
                placeholder="Paste detailed strategy logic, rules, or conditions here..."
             ></textarea>
             <div className="absolute bottom-2 right-2 text-[10px] text-slate-600 pointer-events-none">Text Mode</div>
          </div>
        </div>

        {/* Metrics Section (Mock) */}
        <div className="mb-8">
            <div className="flex items-center gap-2 text-edge-neon mb-4">
                <BarChart3 size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Session Metrics</h3>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-white font-mono">--%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-edge-neon w-0 h-full"></div>
                </div>

                <div className="flex justify-between items-center text-sm mt-4">
                    <span className="text-slate-400">Profit Factor</span>
                    <span className="text-white font-mono">0.00</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-slate-400">Max Drawdown</span>
                    <span className="text-red-500 font-mono">0.00%</span>
                </div>
            </div>
        </div>

        {/* Locked Features */}
        <div className="mt-8 p-4 border border-white/5 rounded-lg bg-white/5">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Lock size={14} />
                <span className="text-xs font-bold uppercase">Pro Features</span>
            </div>
            <ul className="text-xs text-slate-500 space-y-2 ml-1">
                <li>• Multi-timeframe Analysis</li>
                <li>• Real-time Data Feed</li>
                <li>• Auto-Execution API</li>
            </ul>
        </div>

      </div>

      <div className="p-4 border-t border-white/5 text-center">
        <button className="text-xs text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
            <Settings size={12} /> System Configuration
        </button>
      </div>
    </div>
  );
};

export default Sidebar;