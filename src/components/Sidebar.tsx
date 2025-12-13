import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { compileStrategy } from '../services/api';

interface SidebarProps {
  onStrategyCompiled: (persona: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onStrategyCompiled }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setError(null);

    try {
      const result = await compileStrategy(file);
      onStrategyCompiled(result.persona);
    } catch (err) {
      setError("Failed to process strategy.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-80 bg-edge-800 border-r border-edge-700 flex flex-col p-6 z-20 shadow-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tighter">
          EDGE<span className="text-edge-neon">.AI</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Protocol v1.0</p>
      </div>

      <div className="flex-1">
        <div className="mb-6">
          <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">Strategy Module</label>

          <div className="relative group">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept=".txt,.pdf,.md"
            />
            <div className={`
              border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300
              ${fileName ? 'border-edge-neon/50 bg-edge-neon/5' : 'border-edge-700 hover:border-slate-500 hover:bg-white/5'}
            `}>
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edge-neon mb-2"></div>
              ) : fileName ? (
                <CheckCircle className="text-edge-neon mb-2" size={24} />
              ) : (
                <Upload className="text-slate-500 mb-2 group-hover:text-white transition-colors" size={24} />
              )}

              <span className="text-sm font-medium text-slate-300">
                {isUploading ? "Ingesting..." : fileName || "Upload Strategy"}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {fileName ? "Ready for Analysis" : "Drag & drop or click"}
              </span>
            </div>
          </div>

          {error && (
            <div className="mt-2 flex items-center text-red-400 text-xs">
              <AlertCircle size={12} className="mr-1" />
              {error}
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl bg-black/20 border border-white/5">
          <h3 className="text-xs font-mono text-slate-400 mb-2 uppercase">Active Persona</h3>
          <div className="text-sm text-slate-300 leading-relaxed">
            {fileName ? (
              <span className="text-edge-neon">
                <span className="inline-block w-2 h-2 rounded-full bg-edge-neon mr-2 animate-pulse"></span>
                Custom Strategy Loaded
              </span>
            ) : (
              <span className="text-slate-500">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-600 mr-2"></span>
                Standard Protocol (Goldbach)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600 font-mono text-center">
        SYSTEM STATUS: ONLINE
      </div>
    </div>
  );
};

export default Sidebar;