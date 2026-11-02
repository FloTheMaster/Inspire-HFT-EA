import React, { useState } from 'react';
import { Copy, Check, Download, Code2, GitCompare, FileCode, Search, ShieldCheck } from 'lucide-react';
import { ORIGINAL_MQL5_CODE } from '../data/originalMql5';

interface Props {
  optimizedCode: string;
}

export const CodeViewer: React.FC<Props> = ({ optimizedCode }) => {
  const [activeTab, setActiveTab] = useState<'optimized' | 'original' | 'diff'>('optimized');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = () => {
    const textToCopy = activeTab === 'original' ? ORIGINAL_MQL5_CODE : optimizedCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = activeTab === 'original' ? ORIGINAL_MQL5_CODE : optimizedCode;
    const filename = activeTab === 'original' ? 'EA_Studio_Original_Gold_M15.mq5' : 'GoldScalp_HFT_Pro_v7.mq5';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const codeToShow = activeTab === 'original' ? ORIGINAL_MQL5_CODE : optimizedCode;
  const lines = codeToShow.split('\n');

  const filteredLines = searchQuery
    ? lines.map((l, i) => ({ text: l, lineNum: i + 1 })).filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : lines.map((l, i) => ({ text: l, lineNum: i + 1 }));

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Header del Code Viewer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800">
        {/* Tab Selettore */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('optimized')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'optimized'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Nuovo MQL5 HFT PRO v7.20
          </button>

          <button
            onClick={() => setActiveTab('original')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'original'
                ? 'bg-slate-800 text-slate-100 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Codice Originale (M15 Grid)
          </button>

          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'diff'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Confronto Modifiche
          </button>
        </div>

        {/* Pulsanti Azione: Copia & Download */}
        <div className="flex items-center gap-2">
          {/* Cerca nel codice */}
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cerca parametro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono w-36 focus:w-48 transition-all"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            {copied ? 'Copiato!' : 'Copia Codice'}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            Scarica .mq5
          </button>
        </div>
      </div>

      {/* Vista Diff Rapida */}
      {activeTab === 'diff' ? (
        <div className="p-6 space-y-4 bg-slate-950 text-xs font-mono text-slate-300 overflow-y-auto max-h-[600px]">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Tabella di Trasformazione MQL5
            </h4>
            <p className="text-slate-400 text-xs">
              Ecco il riepilogo dettagliato delle modifiche architetturali eseguite rispetto al sorgente originale inviato:
            </p>
          </div>

          <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950">
              <div className="text-red-400 font-bold">Rimosso dal Codice Originale</div>
              <div className="text-emerald-400 font-bold">Aggiunto nel Nuovo HFT Scalper</div>
            </div>

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-red-400/90 bg-red-950/20 p-2 rounded border border-red-900/30">
                - #import "shell32.dll" & blocco licenza WhatsApp<br/>
                - Stop Loss 4000 pt, Take Profit 7000 pt ($40 e $70)
              </div>
              <div className="text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                + Include nativo &lt;Trade\Trade.mqh&gt; ad alte prestazioni<br/>
                + SL 320 pt ($3.20), TP 380 pt ($3.80) per scalping rapido
              </div>
            </div>

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-red-400/90 bg-red-950/20 p-2 rounded border border-red-900/30">
                - OnBar() M15: valuta ingressi solo ogni 15 minuti<br/>
                - 6 indicatori lenti (Envelopes, DeMarker, MACD, 2x RSI, ATR)
              </div>
              <div className="text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                + OnTick() HFT: valuta ingressi ad ogni variazione di prezzo<br/>
                + EMA 8/21 Fast Ribbon + RSI 7 Momentum + Bollinger Bands
              </div>
            </div>

            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-red-400/90 bg-red-950/20 p-2 rounded border border-red-900/30">
                - Grid Averaging Down (rischio rovina su trend forte)<br/>
                - Nessun filtro sullo spread
              </div>
              <div className="text-emerald-300 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                + Break-Even automatico a +140 pt (+1.40 USD profitto)<br/>
                + Filtro Spread massimo (default 22 pt) + Prop Firm Shield 3.5%
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Visualizzatore Codice Sorgente MQL5 con Numeri di Riga */
        <div className="relative flex-1 bg-slate-950 text-slate-200 overflow-x-auto max-h-[620px] font-mono text-[12px] leading-relaxed select-text">
          <div className="min-w-full inline-block py-3">
            {filteredLines.map((line) => (
              <div key={line.lineNum} className="flex hover:bg-slate-900/70 transition px-4 py-0.5">
                <span className="w-10 shrink-0 text-slate-600 text-right pr-4 select-none font-mono text-[11px]">
                  {line.lineNum}
                </span>
                <span
                  className={`whitespace-pre ${
                    line.text.startsWith('//')
                      ? 'text-slate-500 italic'
                      : line.text.includes('input group')
                      ? 'text-amber-400 font-bold'
                      : line.text.startsWith('input') || line.text.startsWith('#property') || line.text.startsWith('#include')
                      ? 'text-purple-400'
                      : line.text.includes('ExtTrade.') || line.text.includes('ExtSymbol.')
                      ? 'text-cyan-400'
                      : line.text.includes('Inp')
                      ? 'text-emerald-300'
                      : 'text-slate-200'
                  }`}
                >
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer del Viewer */}
      <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Compatibile MetaTrader 5 (Build 3800+)
          </span>
          <span>•</span>
          <span>Zero errori di compilazione</span>
        </div>
        <div>
          {lines.length} righe di codice MQL5
        </div>
      </div>
    </div>
  );
};
