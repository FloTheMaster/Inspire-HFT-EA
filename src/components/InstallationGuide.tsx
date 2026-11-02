import React from 'react';
import { Terminal, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Cpu, ShieldCheck } from 'lucide-react';

export const InstallationGuide: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Apri MetaEditor 5',
      desc: 'In MetaTrader 5, premi F4 sulla tastiera oppure clicca su Strumenti > Editor del linguaggio MetaQuotes (MetaEditor).'
    },
    {
      step: '02',
      title: 'Crea Nuovo Expert Advisor',
      desc: 'Clicca su "Nuovo" (Ctrl+N), seleziona "Expert Advisor (modello)", nominalo "GoldScalp_HFT_Pro_v7" e clicca Avanti fino alla fine.'
    },
    {
      step: '03',
      title: 'Incolla il Codice & Compila con F7',
      desc: 'Cancella tutto il testo predefinito, incolla il codice ottimizzato generato da questa app e premi F7 (Compila). Vedrai: "0 errors, 0 warnings".'
    },
    {
      step: '04',
      title: 'Attacca l\'EA al Grafico XAUUSD M1',
      desc: 'Torna in MT5, apri il grafico di XAUUSD (Gold), imposta il Timeframe su M1 (o M5), trascina l\'EA dal navigatore e spunta "Consenti Trading Automatico".'
    }
  ];

  const testerTips = [
    {
      title: 'Modello di Test: "Ogni tick basato su tick reali"',
      content: 'Nel Tester di Strategia di MT5, imposta sempre la modalità "Every tick based on real ticks". Lo scalping HFT lavora sui singoli tick: i modelli a candele non riflettono i veri micro-movimenti.'
    },
    {
      title: 'Spread Broker e Conti Consigliati',
      content: 'Usa conti RAW o ECN (spread su Gold tipicamente tra 10 e 20 punti). Nei conti standard lo spread è troppo largo per il micro-scalping.'
    },
    {
      title: 'Regole Prop-Firm (FTMO, Funding Pips)',
      content: 'Il nostro EA include il parametro "MaxDailyLossPct" impostato al 3.5%, impedendo di superare il limite massimo del 5% giornaliero imposto dalle challenge.'
    }
  ];

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-100 text-lg">Guida all'Installazione & Backtest su MT5</h3>
          <p className="text-xs text-slate-400">Istruzioni passo-passo per rendere operativo l'Expert Advisor in 2 minuti</p>
        </div>
      </div>

      {/* 4 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {steps.map((s) => (
          <div key={s.step} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative overflow-hidden">
            <span className="text-3xl font-black font-mono text-amber-500/20 absolute -right-1 -top-1">
              {s.step}
            </span>
            <div className="text-xs font-bold text-amber-400 font-mono">PASSO {s.step}</div>
            <h4 className="font-bold text-slate-200 text-sm">{s.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Suggerimenti Pro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {testerTips.map((tip, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{tip.title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-5">{tip.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
