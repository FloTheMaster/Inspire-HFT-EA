import React from 'react';
import { Flame, Bot, Download, Copy, Check, Sparkles, ShieldCheck, FileText } from 'lucide-react';

interface Props {
  onOpenAi: () => void;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  copied: boolean;
  onOpenDossier: () => void;
}

export const Header: React.FC<Props> = ({ onOpenAi, onCopyCode, onDownloadCode, copied, onOpenDossier }) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Symbol Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/25">
            <Flame className="w-6 h-6 fill-current" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-100 text-base sm:text-lg tracking-tight">
                INSPIRE <span className="text-amber-400 font-mono">GOLD</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                XAUUSD M15/H15
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Volume Flow & ATR Sizing
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Advanced Quantitative Trading System • High-Frequency & Micro-Scalping Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Technical Dossier Button */}
          <button
            onClick={onOpenDossier}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition font-mono"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Rapporto A-M</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 text-xs font-bold transition font-mono"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI Advisor</span>
          </button>

          {/* Copy MQL5 */}
          <button
            onClick={onCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition font-mono"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span className="hidden sm:inline">{copied ? 'Copiato!' : 'Copia .mq5'}</span>
          </button>

          {/* Download .mq5 */}
          <button
            onClick={onDownloadCode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 font-mono"
          >
            <Download className="w-4 h-4" />
            <span>Scarica .mq5</span>
          </button>
        </div>
      </div>
    </header>
  );
};
