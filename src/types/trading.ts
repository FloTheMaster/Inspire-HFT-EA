export type Timeframe = 'M1' | 'M5' | 'M15';

export interface StrategyParameters {
  magicNumber: number;
  tradeComment: string;
  timeframe: Timeframe;
  
  // Advanced Volume Analytics
  volumeType: 'TICK_VOLUME' | 'REAL_VOLUME';
  useVolumeFilter: boolean;
  volumeMaPeriod: number;              // Periodo Media Mobile Volumi (es. 20)
  volumeSpikeMultiplier: number;       // Moltiplicatore Spike di Volume (es. 1.35x)
  useObvMomentum: boolean;             // On-Balance Volume confirm
  
  // Volatility & Spread Filter (Bioscience / Dynamic Quant Filter)
  useAtrFilter: boolean;
  atrPeriod: number;                   // Periodo ATR (es. 14)
  minAtrPoints: number;                // Volatilità Minima richiesta (evita mercati morti)
  maxAtrPoints: number;                // Volatilità Massima consentita (blocca flash news)
  maxSpreadPoints: number;             // Spread Massimo assoluto (es. 20 pt)
  useDynamicSpreadFilter: boolean;     // Spread dinamico correlato all'ATR
  
  // Advanced Risk Management & Sizing
  sizingMethod: 'ATR_VOLATILITY_ADJUSTED' | 'RISK_PERCENT' | 'FIXED_LOT';
  riskPercent: number;                 // Rischio per trade (% Equity es. 1.0%)
  lotSize: number;                     // Lotto fisso base
  atrRiskMultiplier: number;           // Moltiplicatore ATR per SL dinamico (es. 1.5)
  maxDailyDrawdownPercent: number;     // Limite giornaliero ferreo (es. 3.5% Prop-Firm)
  maxOpenPositions: number;            // Max posizioni contemporanee (default 1)
  
  // Execution & Targets
  stopLossPoints: number;              // SL fisso o base (punti)
  takeProfitPoints: number;            // TP rapido per scalping (punti)
  useBreakEven: boolean;
  breakEvenTriggerPoints: number;      // Punti profitto per BE
  breakEvenLockPoints: number;         // Punti garantiti sopra ingresso
  useTrailingStop: boolean;
  trailingStartPoints: number;
  trailingStepPoints: number;
  maxSlippagePoints: number;
  
  // Micro-Momentum Filters
  fastEmaPeriod: number;
  slowEmaPeriod: number;
  trendEmaPeriod: number;
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  useBollingerBands: boolean;
  bbPeriod: number;
  bbDeviation: number;
  
  // Session Filters
  useTimeFilter: boolean;
  tradeLondonSession: boolean;
  tradeNYSession: boolean;
  tradeAsianSession: boolean;
}

export interface Trade {
  id: string;
  time: string;
  type: 'BUY' | 'SELL';
  openPrice: number;
  closePrice: number;
  lot: number;
  pnl: number;
  pnlPoints: number;
  durationSeconds: number;
  volume: number;
  atrAtEntry: number;
  spreadAtEntry: number;
  exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'BREAK_EVEN' | 'TRAILING_STOP' | 'VOLATILITY_EXIT';
}

export interface BacktestSummary {
  initialBalance: number;
  currentBalance: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  grossProfit: number;
  grossLoss: number;
  maxDrawdownPercent: number;
  maxDrawdownCurrency: number;
  sharpeRatio: number;
  sortinoRatio: number;
  averageTradeDuration: string;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  expectedPayoff: number;
  slippageImpactCost: number;
  commissionCost: number;
}

export interface PresetProfile {
  id: string;
  name: string;
  badge: string;
  description: string;
  winRateTarget: string;
  tradesPerDay: string;
  riskProfile: 'Basso' | 'Medio' | 'Istituzionale';
  params: Partial<StrategyParameters>;
}
