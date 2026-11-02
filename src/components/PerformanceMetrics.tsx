import React from 'react';
import { TrendingUp, Target, Shield, Clock, BarChart3, Award, ArrowUpRight, Percent } from 'lucide-react';
import { BacktestSummary } from '../types/trading';

interface Props {
  metrics: BacktestSummary;
}

export const PerformanceMetrics: React.FC<Props> = ({ metrics }) => {
  const roi = ((metrics.netProfit / metrics.initialBalance) * 100).toFixed(2);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* 1. Win Rate */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs uppercase font-mono tracking-wider">Win Rate</span>
          <Target className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black font-mono text-emerald-400 flex items-baseline gap-1">
            {metrics.winRate}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            {metrics.winningTrades} Vinti / {metrics.totalTrades} Totali
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="bg-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, metrics.winRate)}%` }}
          />
        </div>
      </div>

      {/* 2. Profit Factor */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs uppercase font-mono tracking-wider">Profit Factor</span>
          <Award className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black font-mono text-amber-400">
            {metrics.profitFactor.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Gross: +${metrics.grossProfit.toFixed(0)} / -${metrics.grossLoss.toFixed(0)}
          </div>
        </div>
        <div className="text-[10px] text-emerald-400/90 font-mono mt-2 flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" /> Eccellente (&gt; 2.0)
        </div>
      </div>

      {/* 3. Net Profit */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs uppercase font-mono tracking-wider">Net Profit</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black font-mono text-emerald-400">
            +${metrics.netProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            ROI: <span className="text-emerald-400 font-semibold">+{roi}%</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-2">
          Capitale: ${metrics.currentBalance.toFixed(2)}
        </div>
      </div>

      {/* 4. Max Drawdown */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs uppercase font-mono tracking-wider">Max Drawdown</span>
          <Shield className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black font-mono text-cyan-400">
            {metrics.maxDrawdownPercent}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            -${metrics.maxDrawdownCurrency} Max DD
          </div>
        </div>
        <div className="text-[10px] text-emerald-400/90 font-mono mt-2">
          100% Prop-Firm Safe
        </div>
      </div>

      {/* 5. Avg Trade Duration */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs uppercase font-mono tracking-wider">Durata Media</span>
          <Clock className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black font-mono text-purple-400">
            {metrics.averageTradeDuration}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Micro-Scalping HFT
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-2">
          Zero esposizione overnight
        </div>
      </div>

      {/* 6. Sharpe Ratio */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs uppercase font-mono tracking-wider">Sharpe Ratio</span>
          <BarChart3 className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2">
          <div className="text-2xl font-black font-mono text-sky-400">
            {metrics.sharpeRatio.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Consistenza Rendimenti
          </div>
        </div>
        <div className="text-[10px] text-sky-400/80 font-mono mt-2">
          Alta qualità statistica
        </div>
      </div>
    </div>
  );
};
