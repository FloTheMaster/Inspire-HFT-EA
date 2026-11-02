import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, TrendingUp, ShieldCheck, Activity, Flame, ChevronRight, BarChart3, Gauge } from 'lucide-react';
import { StrategyParameters, Trade, BacktestSummary } from '../types/trading';

interface Props {
  params: StrategyParameters;
  onTradeFinished?: (trade: Trade) => void;
  metrics: BacktestSummary;
  setMetrics: React.Dispatch<React.SetStateAction<BacktestSummary>>;
}

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  emaFast: number;
  emaSlow: number;
  bbUpper: number;
  bbLower: number;
  volume: number;
  volumeMA: number;
  atr: number; // in points
}

export const SimulatorChart: React.FC<Props> = ({ params, onTradeFinished, metrics, setMetrics }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(2);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(2735.40);
  const [spread, setSpread] = useState<number>(18);
  const [currentAtr, setCurrentAtr] = useState<number>(240); // points
  const [currentVolumeRatio, setCurrentVolumeRatio] = useState<number>(1.1);

  const [activePosition, setActivePosition] = useState<{
    ticket: number;
    type: 'BUY' | 'SELL';
    openPrice: number;
    sl: number;
    tp: number;
    isBreakEven: boolean;
    openTime: number;
    lot: number;
    atrAtEntry: number;
  } | null>(null);

  const [tradeLogs, setTradeLogs] = useState<Trade[]>([]);
  const [notification, setNotification] = useState<{ text: string; type: 'win' | 'be' | 'loss' | 'volume' } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Genera candele storiche realistiche di Gold con Volumi e ATR
  useEffect(() => {
    let basePrice = 2730.00;
    const initialCandles: Candle[] = [];
    let fast = basePrice;
    let slow = basePrice;
    let avgVol = 1200;

    for (let i = 0; i < 45; i++) {
      const delta = (Math.random() - 0.48) * 1.8;
      const open = basePrice;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * 0.9;
      const low = Math.min(open, close) - Math.random() * 0.9;
      basePrice = close;

      fast = fast * 0.75 + close * 0.25;
      slow = slow * 0.90 + close * 0.10;

      const vol = Math.floor(800 + Math.random() * 1400);
      avgVol = avgVol * 0.9 + vol * 0.1;
      const atrVal = Math.floor(180 + Math.random() * 120);

      initialCandles.push({
        time: `${14 + Math.floor(i / 60)}:${(i % 60).toString().padStart(2, '0')}`,
        open,
        high,
        low,
        close,
        emaFast: fast,
        emaSlow: slow,
        bbUpper: fast + 2.2,
        bbLower: fast - 2.2,
        volume: vol,
        volumeMA: Math.floor(avgVol),
        atr: atrVal,
      });
    }

    setCandles(initialCandles);
    setCurrentPrice(basePrice);
    setCurrentAtr(initialCandles[initialCandles.length - 1].atr);
  }, []);

  // Tick Engine di Simulazione HFT con Volume Flow & ATR
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(80, 400 / speed);
    const interval = setInterval(() => {
      const volatility = 0.45;
      const tickDelta = (Math.random() - 0.485) * volatility;
      
      setCurrentPrice((prevPrice) => {
        const nextPrice = Number((prevPrice + tickDelta).toFixed(2));
        const point = 0.01;

        // Spread realistico con micro-variazioni (15-24 pt)
        const currentSpreadPoints = Math.floor(16 + Math.random() * 6);
        setSpread(currentSpreadPoints);

        // Controllo se abbiamo una posizione attiva aperta
        if (activePosition) {
          const ptDiff = activePosition.type === 'BUY'
            ? (nextPrice - activePosition.openPrice) / point
            : (activePosition.openPrice - nextPrice) / point;

          // 1. Check Break-Even trigger
          if (params.useBreakEven && !activePosition.isBreakEven && ptDiff >= params.breakEvenTriggerPoints) {
            const newSl = activePosition.type === 'BUY'
              ? activePosition.openPrice + params.breakEvenLockPoints * point
              : activePosition.openPrice - params.breakEvenLockPoints * point;

            setActivePosition((pos) => (pos ? { ...pos, isBreakEven: true, sl: Number(newSl.toFixed(2)) } : null));
            setNotification({
              text: `🛡️ INSPIRE GOLD: Break-Even attivato! SL protetto a +${params.breakEvenLockPoints} pt ($${(params.breakEvenLockPoints * 0.01).toFixed(2)})`,
              type: 'be'
            });
            setTimeout(() => setNotification(null), 3000);
          }

          // 2. Check Take Profit Hit
          const isTpHit = activePosition.type === 'BUY'
            ? nextPrice >= activePosition.tp
            : nextPrice <= activePosition.tp;

          // 3. Check Stop Loss Hit
          const isSlHit = activePosition.type === 'BUY'
            ? nextPrice <= activePosition.sl
            : nextPrice >= activePosition.sl;

          if (isTpHit || isSlHit) {
            const exitPrice = isTpHit ? activePosition.tp : activePosition.sl;
            const finalPts = activePosition.type === 'BUY'
              ? (exitPrice - activePosition.openPrice) / point
              : (activePosition.openPrice - exitPrice) / point;

            const profitDollar = Number((finalPts * 0.1 * activePosition.lot).toFixed(2));
            const durationSec = Math.floor((Date.now() - activePosition.openTime) / 1000);

            const completedTrade: Trade = {
              id: Math.random().toString(36).substring(7),
              time: new Date().toLocaleTimeString(),
              type: activePosition.type,
              openPrice: activePosition.openPrice,
              closePrice: exitPrice,
              lot: activePosition.lot,
              pnl: profitDollar,
              pnlPoints: Math.round(finalPts),
              durationSeconds: Math.max(12, durationSec),
              volume: 1850,
              atrAtEntry: activePosition.atrAtEntry,
              spreadAtEntry: currentSpreadPoints,
              exitReason: isTpHit ? 'TAKE_PROFIT' : activePosition.isBreakEven ? 'BREAK_EVEN' : 'STOP_LOSS'
            };

            setTradeLogs((prev) => [completedTrade, ...prev.slice(0, 7)]);
            if (onTradeFinished) onTradeFinished(completedTrade);

            // Update metrics
            setMetrics((m) => {
              const isWin = profitDollar > 0;
              const newTot = m.totalTrades + 1;
              const newWin = isWin ? m.winningTrades + 1 : m.winningTrades;
              const newGrossP = isWin ? m.grossProfit + profitDollar : m.grossProfit;
              const newGrossL = !isWin ? m.grossLoss + Math.abs(profitDollar) : m.grossLoss;

              return {
                ...m,
                currentBalance: Number((m.currentBalance + profitDollar).toFixed(2)),
                netProfit: Number((m.netProfit + profitDollar).toFixed(2)),
                totalTrades: newTot,
                winningTrades: newWin,
                losingTrades: isWin ? m.losingTrades : m.losingTrades + 1,
                winRate: Number(((newWin / newTot) * 100).toFixed(1)),
                profitFactor: newGrossL > 0 ? Number((newGrossP / newGrossL).toFixed(2)) : newGrossP,
                grossProfit: Number(newGrossP.toFixed(2)),
                grossLoss: Number(newGrossL.toFixed(2)),
              };
            });

            setNotification({
              text: isTpHit
                ? `🎯 TAKE PROFIT COLPITO! +$${profitDollar.toFixed(2)} (+${Math.round(finalPts)} pt)`
                : activePosition.isBreakEven
                ? `🔒 CHIUSO A BREAK-EVEN PROTETTO: +$${profitDollar.toFixed(2)}`
                : `🛑 STOP LOSS: -$${Math.abs(profitDollar).toFixed(2)}`,
              type: isTpHit ? 'win' : activePosition.isBreakEven ? 'be' : 'loss'
            });
            setTimeout(() => setNotification(null), 3500);

            setActivePosition(null);
          }
        } else {
          // Ricerca Segnale HFT con Volume Spike ed ATR
          if (candles.length > 5 && currentSpreadPoints <= params.maxSpreadPoints) {
            const lastCandle = candles[candles.length - 1];
            const prevCandle = candles[candles.length - 2];

            const isAtrValid = !params.useAtrFilter || (currentAtr >= params.minAtrPoints && currentAtr <= params.maxAtrPoints);
            const isVolumeSpike = !params.useVolumeFilter || (lastCandle.volume >= lastCandle.volumeMA * params.volumeSpikeMultiplier);

            const fastAboveSlow = lastCandle.emaFast > lastCandle.emaSlow;
            const prevFastBelowSlow = prevCandle.emaFast <= prevCandle.emaSlow;

            // Sizing calcolato su ATR o fisso
            const calculatedLot = params.sizingMethod === 'ATR_VOLATILITY_ADJUSTED'
              ? Number(Math.max(0.04, Math.min(0.25, (100.0 / (currentAtr * 1.5)))).toFixed(2))
              : params.lotSize;

            // Micro-Momentum BUY con conferma di volume
            if (isAtrValid && isVolumeSpike && fastAboveSlow && (prevFastBelowSlow || Math.random() < 0.12)) {
              const tpPrice = Number((nextPrice + params.takeProfitPoints * point).toFixed(2));
              const slPrice = Number((nextPrice - params.stopLossPoints * point).toFixed(2));
              setActivePosition({
                ticket: Math.floor(100000 + Math.random() * 900000),
                type: 'BUY',
                openPrice: nextPrice,
                sl: slPrice,
                tp: tpPrice,
                isBreakEven: false,
                openTime: Date.now(),
                lot: calculatedLot,
                atrAtEntry: currentAtr,
              });
              setNotification({
                text: `⚡ INSPIRE GOLD BUY: ${nextPrice.toFixed(2)} | Volume: ${(lastCandle.volume / lastCandle.volumeMA).toFixed(2)}x MA | ATR: ${currentAtr} pt`,
                type: 'volume'
              });
              setTimeout(() => setNotification(null), 3000);
            }
            // Micro-Momentum SELL con conferma di volume
            else if (isAtrValid && isVolumeSpike && !fastAboveSlow && (prevFastBelowSlow || Math.random() < 0.12)) {
              const tpPrice = Number((nextPrice - params.takeProfitPoints * point).toFixed(2));
              const slPrice = Number((nextPrice + params.stopLossPoints * point).toFixed(2));
              setActivePosition({
                ticket: Math.floor(100000 + Math.random() * 900000),
                type: 'SELL',
                openPrice: nextPrice,
                sl: slPrice,
                tp: tpPrice,
                isBreakEven: false,
                openTime: Date.now(),
                lot: calculatedLot,
                atrAtEntry: currentAtr,
              });
              setNotification({
                text: `⚡ INSPIRE GOLD SELL: ${nextPrice.toFixed(2)} | Volume: ${(lastCandle.volume / lastCandle.volumeMA).toFixed(2)}x MA | ATR: ${currentAtr} pt`,
                type: 'volume'
              });
              setTimeout(() => setNotification(null), 3000);
            }
          }
        }

        // Aggiorna l'ultima candela o creane una nuova
        setCandles((oldCandles) => {
          if (oldCandles.length === 0) return oldCandles;
          const updated = [...oldCandles];
          const last = { ...updated[updated.length - 1] };

          last.close = nextPrice;
          if (nextPrice > last.high) last.high = nextPrice;
          if (nextPrice < last.low) last.low = nextPrice;

          last.emaFast = last.emaFast * 0.8 + nextPrice * 0.2;
          last.emaSlow = last.emaSlow * 0.95 + nextPrice * 0.05;
          last.bbUpper = last.emaFast + 2.1;
          last.bbLower = last.emaFast - 2.1;
          last.volume += Math.floor(8 + Math.random() * 15);

          setCurrentVolumeRatio(Number((last.volume / (last.volumeMA || 1000)).toFixed(2)));

          updated[updated.length - 1] = last;

          // Se sono passati diversi tick, apri una nuova candela
          if (Math.random() < 0.075) {
            const now = new Date();
            const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            const newVol = Math.floor(700 + Math.random() * 1500);
            const newAvgVol = Math.floor(last.volumeMA * 0.92 + newVol * 0.08);
            const newAtr = Math.floor(currentAtr * 0.9 + (Math.abs(nextPrice - last.open) / 0.01) * 0.1);
            setCurrentAtr(newAtr);

            updated.push({
              time: timeStr,
              open: nextPrice,
              high: nextPrice,
              low: nextPrice,
              close: nextPrice,
              emaFast: last.emaFast,
              emaSlow: last.emaSlow,
              bbUpper: last.bbUpper,
              bbLower: last.bbLower,
              volume: newVol,
              volumeMA: newAvgVol,
              atr: newAtr,
            });
            return updated.slice(-45);
          }

          return updated;
        });

        return nextPrice;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, speed, activePosition, params, candles.length, currentAtr]);

  // Disegno su Canvas ad alte prestazioni con Sub-Chart dei Volumi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Sfondo dark terminal
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Coordinate divisione: 75% prezzo, 25% sub-chart volumi
    const priceHeight = height * 0.72;
    const volumeTop = height * 0.75;
    const volumeHeight = height * 0.22;

    // Griglia
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < priceHeight; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Linea divisoria sub-chart volumi
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, volumeTop - 4);
    ctx.lineTo(width, volumeTop - 4);
    ctx.stroke();

    // Etichetta sub-chart
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('TICK VOLUME & VOLUME MA(20)', 15, volumeTop + 8);

    // Scaling prezzo
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    if (activePosition) {
      minPrice = Math.min(minPrice, activePosition.sl, activePosition.tp);
      maxPrice = Math.max(maxPrice, activePosition.sl, activePosition.tp);
    }

    const pricePadding = (maxPrice - minPrice) * 0.15 || 2.0;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    const getY = (p: number) => priceHeight - ((p - minPrice) / priceRange) * (priceHeight - 30) - 15;
    const candleWidth = Math.max(6, Math.floor((width - 80) / candles.length));

    // Bollinger Bands
    ctx.fillStyle = 'rgba(245, 158, 11, 0.04)';
    ctx.beginPath();
    candles.forEach((c, idx) => {
      const x = idx * candleWidth + 20;
      const y = getY(c.bbUpper);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    for (let idx = candles.length - 1; idx >= 0; idx--) {
      const x = idx * candleWidth + 20;
      const y = getY(candles[idx].bbLower);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Fast EMA (Oro)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    candles.forEach((c, idx) => {
      const x = idx * candleWidth + 20;
      const y = getY(c.emaFast);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Slow EMA (Ciano)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    candles.forEach((c, idx) => {
      const x = idx * candleWidth + 20;
      const y = getY(c.emaSlow);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Candele & Volumi
    candles.forEach((c, idx) => {
      const x = idx * candleWidth + 20;
      const isGreen = c.close >= c.open;
      const candleColor = isGreen ? '#10b981' : '#f43f5e';

      // Candlestick Wick
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // Candlestick Body
      const bodyTop = getY(Math.max(c.open, c.close));
      const bodyBottom = getY(Math.min(c.open, c.close));
      const bodyHeight = Math.max(2, bodyBottom - bodyTop);

      ctx.fillStyle = candleColor;
      ctx.fillRect(x - candleWidth * 0.38, bodyTop, candleWidth * 0.76, bodyHeight);

      // Volume Bar nel Sub-Chart
      const isVolumeSpike = c.volume >= c.volumeMA * params.volumeSpikeMultiplier;
      const volHeight = Math.max(3, (c.volume / (maxVolume || 1)) * volumeHeight);
      const volY = height - volHeight - 2;

      ctx.fillStyle = isVolumeSpike ? '#f59e0b' : isGreen ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)';
      ctx.fillRect(x - candleWidth * 0.35, volY, candleWidth * 0.7, volHeight);
    });

    // Volume MA Line nel Sub-Chart
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    candles.forEach((c, idx) => {
      const x = idx * candleWidth + 20;
      const maHeight = (c.volumeMA / (maxVolume || 1)) * volumeHeight;
      const maY = height - maHeight - 2;
      if (idx === 0) ctx.moveTo(x, maY);
      else ctx.lineTo(x, maY);
    });
    ctx.stroke();

    // Linea Posizione Attiva (Entry, SL, TP)
    if (activePosition) {
      const entryY = getY(activePosition.openPrice);
      const slY = getY(activePosition.sl);
      const tpY = getY(activePosition.tp);

      ctx.strokeStyle = activePosition.type === 'BUY' ? '#10b981' : '#f43f5e';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(width, entryY);
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, tpY);
      ctx.lineTo(width, tpY);
      ctx.stroke();

      ctx.strokeStyle = activePosition.isBreakEven ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(0, slY);
      ctx.lineTo(width, slY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`TP: ${activePosition.tp}`, width - 75, tpY - 4);

      ctx.fillStyle = activePosition.isBreakEven ? '#38bdf8' : '#ef4444';
      ctx.fillText(activePosition.isBreakEven ? `BE LOCK: ${activePosition.sl}` : `SL: ${activePosition.sl}`, width - 85, slY - 4);
    }

    // Linea Prezzo Corrente
    const currentY = getY(currentPrice);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, currentY);
    ctx.lineTo(width - 70, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Badge Prezzo Corrente a destra
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(width - 68, currentY - 10, 68, 20);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(currentPrice.toFixed(2), width - 62, currentY + 4);
  }, [candles, currentPrice, activePosition, params.volumeSpikeMultiplier]);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Bar Indicatori Live */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono font-bold text-amber-400 text-sm">XAUUSD</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {params.timeframe} • TICK FLOW
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono pl-3 border-l border-slate-800">
            {/* Spread Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Spread:</span>
              <span className={`font-bold ${spread <= params.maxSpreadPoints ? 'text-emerald-400' : 'text-rose-400'}`}>
                {spread} pt
              </span>
            </div>

            {/* ATR Volatility Badge */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-slate-400">ATR(14):</span>
              <span className="text-cyan-400 font-bold">{currentAtr} pt</span>
            </div>

            {/* Volume Spike Ratio */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="text-slate-400">Vol Ratio:</span>
              <span className={`font-bold ${currentVolumeRatio >= params.volumeSpikeMultiplier ? 'text-amber-400' : 'text-slate-300'}`}>
                {currentVolumeRatio}x MA
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pausa' : 'Riprendi'}
          </button>

          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded font-mono ${
                  speed === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const jump = (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 2.2);
              setCurrentPrice((p) => Number((p + jump).toFixed(2)));
            }}
            title="Simula improvviso spike di volatilità dell'oro"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition font-mono"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Spike Gold</span>
          </button>
        </div>
      </div>

      {/* Grafico Canvas con Volume Sub-Chart */}
      <div className="relative w-full h-84 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={840}
          height={340}
          className="w-full h-full block"
        />

        {/* Notifica Pop-up Eventi */}
        {notification && (
          <div
            className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-2xl border backdrop-blur-md transition-all animate-bounce ${
              notification.type === 'win'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                : notification.type === 'be'
                ? 'bg-sky-950/90 text-sky-300 border-sky-500/50'
                : notification.type === 'volume'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
            }`}
          >
            {notification.text}
          </div>
        )}

        {/* Indicatore HUD Posizione Attiva */}
        <div className="absolute bottom-3 left-4 bg-slate-950/90 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center gap-4 text-xs font-mono backdrop-blur-md">
          {activePosition ? (
            <>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activePosition.type === 'BUY' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'
                  }`}
                ></span>
                <span className="font-bold text-slate-200">{activePosition.type} {activePosition.lot} lot</span>
              </div>
              <div className="text-slate-400">
                Open: <span className="text-slate-200">{activePosition.openPrice.toFixed(2)}</span>
              </div>
              <div className="text-slate-400">
                P&L:{' '}
                <span
                  className={`font-bold ${
                    ((currentPrice - activePosition.openPrice) * (activePosition.type === 'BUY' ? 1 : -1)) >= 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {activePosition.type === 'BUY'
                    ? ((currentPrice - activePosition.openPrice) * 10 * activePosition.lot * 10).toFixed(2)
                    : ((activePosition.openPrice - currentPrice) * 10 * activePosition.lot * 10).toFixed(2)}{' '}
                  USD
                </span>
              </div>
              {activePosition.isBreakEven && (
                <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">
                  BE LOCKED
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Scansione Tick & Volume Flow in corso...</span>
            </div>
          )}
        </div>
      </div>

      {/* Log Recenti Operazioni HFT */}
      <div className="p-4 bg-slate-950/60 border-t border-slate-800/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" /> Ultime Operazioni Eseguite (INSPIRE GOLD Engine)
          </span>
          <span className="text-xs font-mono text-emerald-400">
            Win Rate: {metrics.winRate}% ({metrics.winningTrades}/{metrics.totalTrades})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {tradeLogs.length === 0 ? (
            <div className="col-span-full py-3 text-center text-xs text-slate-500 font-mono">
              In attesa delle prime chiusure del simulatore HFT...
            </div>
          ) : (
            tradeLogs.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                  t.pnl >= 0
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                    : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 font-bold">
                    <span>{t.type} {t.lot}L</span>
                    <span className="text-slate-400 text-[10px]">({t.durationSeconds}s)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{t.exitReason}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {t.pnl >= 0 ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.pnlPoints >= 0 ? `+${t.pnlPoints} pt` : `${t.pnlPoints} pt`}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
