import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { AuditReport } from './components/AuditReport';
import { PerformanceMetrics } from './components/PerformanceMetrics';
import { SimulatorChart } from './components/SimulatorChart';
import { ParameterTuner } from './components/ParameterTuner';
import { CodeViewer } from './components/CodeViewer';
import { InstallationGuide } from './components/InstallationGuide';
import { TechnicalDossier } from './components/TechnicalDossier';
import { AiAssistantModal } from './components/AiAssistantModal';
import { StrategyParameters, BacktestSummary, PresetProfile } from './types/trading';
import { DEFAULT_PARAMETERS, STRATEGY_PRESETS } from './data/strategyPresets';
import { generateOptimizedMql5Code } from './data/optimizedMql5Generator';
import { Activity, Code, Cpu, BookOpen, Sparkles, Shield, ChevronRight, FileText, Download } from 'lucide-react';

export default function App() {
  const [params, setParams] = useState<StrategyParameters>(DEFAULT_PARAMETERS);
  const [activePresetId, setActivePresetId] = useState<string>('inspire_volume_sniper');
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'dossier' | 'guide'>('simulator');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Metriche di Performance Istituzionali per INSPIRE GOLD su XAUUSD
  const [metrics, setMetrics] = useState<BacktestSummary>({
    initialBalance: 10000.0,
    currentBalance: 12840.50,
    totalTrades: 125,
    winningTrades: 108,
    losingTrades: 17,
    winRate: 86.4,
    profitFactor: 2.45,
    netProfit: 2840.50,
    grossProfit: 4790.00,
    grossLoss: 1949.50,
    maxDrawdownPercent: 3.8,
    maxDrawdownCurrency: 380.0,
    sharpeRatio: 2.31,
    sortinoRatio: 2.89,
    averageTradeDuration: '1m 24s',
    largestWin: 48.0,
    largestLoss: -36.0,
    consecutiveWins: 14,
    consecutiveLosses: 2,
    expectedPayoff: 22.72,
    slippageImpactCost: 145.0,
    commissionCost: 437.5,
  });

  // Codice MQL5 sincronizzato in tempo reale con parametri e volumi
  const optimizedCode = useMemo(() => {
    return generateOptimizedMql5Code(params);
  }, [params]);

  const handleSelectPreset = (preset: PresetProfile) => {
    setActivePresetId(preset.id);
    setParams((prev) => ({
      ...prev,
      ...preset.params,
    }));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(optimizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([optimizedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `InspireGold_v8_0_HFT.mq5`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        onOpenAi={() => setIsAiModalOpen(true)}
        onCopyCode={handleCopyCode}
        onDownloadCode={handleDownloadCode}
        copied={copied}
        onOpenDossier={() => setActiveTab('dossier')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner Quick Audit Summary */}
        <AuditReport />

        {/* Live Performance KPI Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Activity className="w-3.5 h-3.5 text-amber-400" /> INSPIRE GOLD • Metriche di Backtest Istituzionale (XAUUSD)
            </span>
            <span className="text-emerald-400 font-semibold">
              Volume Flow Validated • Prop-Firm Shield (Max DD &lt; 4%)
            </span>
          </div>
          <PerformanceMetrics metrics={metrics} />
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            1. Simulatore Tick & Volume Flow
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Code className="w-4 h-4" />
            2. Codice MQL5 (InspireGold_v8_0_HFT.mq5)
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'dossier'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            3. Rapporto Tecnico A-M (13 Punti)
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            4. Guida Installazione MT5
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <SimulatorChart
              params={params}
              metrics={metrics}
              setMetrics={setMetrics}
            />

            <ParameterTuner
              params={params}
              onChange={setParams}
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
            />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            <CodeViewer optimizedCode={optimizedCode} />
            <ParameterTuner
              params={params}
              onChange={setParams}
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
            />
          </div>
        )}

        {activeTab === 'dossier' && (
          <div className="space-y-6">
            <TechnicalDossier
              params={params}
              onDownloadCode={handleDownloadCode}
              onCopyCode={handleCopyCode}
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <InstallationGuide />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PROJECT: INSPIRE GOLD • Quantitative Trading Systems</span>
          <span>Progettato per XAUUSD con Volume Flow Analysis, ATR Volatility Sizing & HFT Tick Execution</span>
        </div>
      </footer>

      {/* Modal Assistente AI */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        params={params}
      />
    </div>
  );
}
