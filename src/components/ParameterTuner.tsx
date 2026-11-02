import React from 'react';
import { Sliders, Shield, Zap, Sparkles, Clock, Target, Gauge, BarChart2, Activity } from 'lucide-react';
import { StrategyParameters, PresetProfile } from '../types/trading';
import { STRATEGY_PRESETS } from '../data/strategyPresets';

interface Props {
  params: StrategyParameters;
  onChange: (updated: StrategyParameters) => void;
  onSelectPreset: (preset: PresetProfile) => void;
  activePresetId?: string;
}

export const ParameterTuner: React.FC<Props> = ({ params, onChange, onSelectPreset, activePresetId }) => {
  const updateField = <K extends keyof StrategyParameters>(key: K, value: StrategyParameters[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-6 shadow-xl">
      {/* Sezione Preset Rapidi */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Preset Ottimizzati INSPIRE GOLD (M15 / H15 & M1)
          </label>
          <span className="text-[11px] text-slate-500 font-mono">1-Click Quant Presets</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STRATEGY_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {preset.badge}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {preset.winRateTarget}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-xs line-clamp-1">{preset.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Trades: {preset.tradesPerDay}</span>
                  <span className={preset.riskProfile === 'Basso' ? 'text-emerald-400' : preset.riskProfile === 'Istituzionale' ? 'text-cyan-400' : 'text-amber-400'}>
                    {preset.riskProfile}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Griglia Controlli Parametri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-slate-800/80">
        {/* Gruppo 1: Analisi Avanzata dei Volumi */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            <BarChart2 className="w-4 h-4 text-purple-400" /> Analisi Volumi (Tick & Reali)
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Toggle Filtro Volume */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Filtro Volume Istituzionale</span>
                <input
                  type="checkbox"
                  checked={params.useVolumeFilter}
                  onChange={(e) => updateField('useVolumeFilter', e.target.checked)}
                  className="accent-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {params.useVolumeFilter && (
                <>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-slate-400 block text-[10px] mb-1">Tipo Volume</label>
                      <select
                        value={params.volumeType}
                        onChange={(e) => updateField('volumeType', e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs"
                      >
                        <option value="TICK_VOLUME">Tick Volume</option>
                        <option value="REAL_VOLUME">Real Volume</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 block text-[10px] mb-1">Periodo MA(Vol)</label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={params.volumeMaPeriod}
                        onChange={(e) => updateField('volumeMaPeriod', parseInt(e.target.value) || 20)}
                        className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Volume Spike Ratio:</span>
                      <span className="text-purple-400 font-bold">{params.volumeSpikeMultiplier}x la media</span>
                    </div>
                    <input
                      type="range"
                      min="1.10"
                      max="2.00"
                      step="0.05"
                      value={params.volumeSpikeMultiplier}
                      onChange={(e) => updateField('volumeSpikeMultiplier', parseFloat(e.target.value))}
                      className="w-full accent-purple-500 bg-slate-800 rounded cursor-pointer mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 text-[11px]">Conferma OBV Momentum</span>
                    <input
                      type="checkbox"
                      checked={params.useObvMomentum}
                      onChange={(e) => updateField('useObvMomentum', e.target.checked)}
                      className="accent-purple-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Timeframe selector */}
            <div>
              <label className="text-slate-400 block mb-1.5">Timeframe Operativo</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['M1', 'M5', 'M15'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => updateField('timeframe', tf)}
                    className={`py-1.5 rounded-lg text-center font-bold transition ${
                      params.timeframe === tf
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf} {tf === 'M15' ? '⚡ Base' : tf === 'M1' ? '🔥 HFT' : 'Scalp'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gruppo 2: Filtri Volatilità ATR & Spread */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            <Activity className="w-4 h-4 text-cyan-400" /> Filtri Volatilità (ATR) & Spread
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Toggle Filtro ATR */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Filtro Dinamico ATR(14)</span>
                <input
                  type="checkbox"
                  checked={params.useAtrFilter}
                  onChange={(e) => updateField('useAtrFilter', e.target.checked)}
                  className="accent-cyan-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {params.useAtrFilter && (
                <>
                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>ATR Min (evita mercato piatto):</span>
                      <span className="text-cyan-400 font-bold">{params.minAtrPoints} pt</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="300"
                      step="10"
                      value={params.minAtrPoints}
                      onChange={(e) => updateField('minAtrPoints', parseInt(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 rounded cursor-pointer mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>ATR Max (blocca flash crash):</span>
                      <span className="text-rose-400 font-bold">{params.maxAtrPoints} pt</span>
                    </div>
                    <input
                      type="range"
                      min="350"
                      max="900"
                      step="20"
                      value={params.maxAtrPoints}
                      onChange={(e) => updateField('maxAtrPoints', parseInt(e.target.value))}
                      className="w-full accent-rose-500 bg-slate-800 rounded cursor-pointer mt-1"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Max Spread Filter */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Spread Massimo Consentito:</span>
                <span className="text-amber-400 font-bold">{params.maxSpreadPoints} punti</span>
              </div>
              <input
                type="range"
                min="12"
                max="35"
                step="1"
                value={params.maxSpreadPoints}
                onChange={(e) => updateField('maxSpreadPoints', parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Rifiuto immediato dell'ordine se lo spread &gt; {params.maxSpreadPoints} pt</span>
            </div>

            {/* Dynamic Spread Filter Checkbox */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
              <span className="text-slate-300">Spread Dinamico (% ATR)</span>
              <input
                type="checkbox"
                checked={params.useDynamicSpreadFilter}
                onChange={(e) => updateField('useDynamicSpreadFilter', e.target.checked)}
                className="accent-amber-500 w-3.5 h-3.5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Gruppo 3: Gestione del Rischio & Size Dinamica */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" /> Rischio & Size su Volatilità
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Modalità Sizing */}
            <div>
              <label className="text-slate-400 block mb-1">Modello di Calcolo Size</label>
              <select
                value={params.sizingMethod}
                onChange={(e) => updateField('sizingMethod', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs font-bold"
              >
                <option value="ATR_VOLATILITY_ADJUSTED">ATR Volatility Adjusted (Istituzionale)</option>
                <option value="RISK_PERCENT">% Fissa Equity (Standard)</option>
                <option value="FIXED_LOT">Lotto Fisso</option>
              </select>
            </div>

            {/* Rischio % per trade */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-slate-300 block font-semibold">Rischio per Operazione</span>
                <span className="text-[10px] text-slate-500">% Equity del conto</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0.2"
                  max="5.0"
                  step="0.1"
                  value={params.riskPercent}
                  onChange={(e) => updateField('riskPercent', parseFloat(e.target.value) || 1.0)}
                  className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-center text-amber-400 font-bold text-xs"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>

            {/* Break Even Rapido */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Break-Even Istantaneo</span>
                <input
                  type="checkbox"
                  checked={params.useBreakEven}
                  onChange={(e) => updateField('useBreakEven', e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
              </div>
              {params.useBreakEven && (
                <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                  <span>Trigger: +{params.breakEvenTriggerPoints} pt</span>
                  <span className="text-sky-400 font-bold">Lock: +{params.breakEvenLockPoints} pt</span>
                </div>
              )}
            </div>

            {/* Max Daily Drawdown (Prop-Firm Shield) */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Max Daily Drawdown:</span>
                <span className="text-cyan-400 font-bold">{params.maxDailyDrawdownPercent}%</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="5.0"
                step="0.5"
                value={params.maxDailyDrawdownPercent}
                onChange={(e) => updateField('maxDailyDrawdownPercent', parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Blocco ordini se la perdita giornaliera supera il {params.maxDailyDrawdownPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
