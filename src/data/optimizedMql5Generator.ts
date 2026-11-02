import { StrategyParameters } from '../types/trading';

export function generateOptimizedMql5Code(params: StrategyParameters): string {
  return `//+------------------------------------------------------------------+
//|                                        InspireGold_v8_0_HFT.mq5  |
//|                         PROJECT: INSPIRE GOLD                    |
//|         Advanced Quantitative Trading System for XAUUSD (M15)    |
//|              Volume Flow • ATR Volatility Sizing • HFT Engine    |
//+------------------------------------------------------------------+
#property copyright   "INSPIRE GOLD Quantitative Trading Systems"
#property link        "https://inspiregold.quant"
#property version     "8.00"
#property description "Sistema Quantitativo Istituzionale per XAUUSD con Volume Flow & ATR Volatility Sizing"
#property strict

// Librerie di esecuzione a bassa latenza standard MT5
#include <Trade\\Trade.mqh>
#include <Trade\\PositionInfo.mqh>
#include <Trade\\AccountInfo.mqh>
#include <Trade\\SymbolInfo.mqh>

//--- INPUT PARAMETERS ---
input group "=== [1] IDENTIFICAZIONE & TIMEFRAME ==="
input ulong             InpMagicNumber          = ${params.magicNumber};      // Magic Number Univoco
input string            InpTradeComment         = "${params.tradeComment}"; // Commento Ordini
input ENUM_TIMEFRAMES   InpTimeframe            = PERIOD_${params.timeframe};           // Timeframe Principale (M15/M5/M1)

input group "=== [2] ANALISI AVANZATA DEI VOLUMI (TICK & REALE) ==="
input bool              InpUseVolumeFilter      = ${params.useVolumeFilter ? 'true' : 'false'};           // Attiva Filtro di Volume Istituzionale
input ENUM_APPLIED_VOLUME InpVolumeType         = VOLUME_${params.volumeType === 'REAL_VOLUME' ? 'REAL' : 'TICK'};      // Tipo di Volume (Tick / Reale)
input int               InpVolumeMAPeriod       = ${params.volumeMaPeriod};             // Periodo Media Mobile del Volume
input double            InpVolumeSpikeRatio     = ${params.volumeSpikeMultiplier.toFixed(2)};           // Moltiplicatore Spike Volume (es. 1.35x la media)
input bool              InpUseObvMomentum       = ${params.useObvMomentum ? 'true' : 'false'};           // Conferma Direzionale con On-Balance Volume (OBV)

input group "=== [3] FILTRI DINAMICI: VOLATILITA (ATR) & SPREAD ==="
input bool              InpUseAtrFilter         = ${params.useAtrFilter ? 'true' : 'false'};           // Attiva Filtro Dinamico ATR
input int               InpAtrPeriod            = ${params.atrPeriod};             // Periodo ATR Volatilità
input int               InpMinAtrPoints         = ${params.minAtrPoints};            // Volatilità Minima Richiesta (punti: evita mercati morti)
input int               InpMaxAtrPoints         = ${params.maxAtrPoints};            // Volatilità Massima Consentita (punti: evita flash news)
input int               InpMaxSpreadPoints      = ${params.maxSpreadPoints};             // Spread Massimo Assoluto (punti su Gold)
input bool              InpDynamicSpreadFilter  = ${params.useDynamicSpreadFilter ? 'true' : 'false'};           // Spread Dinamico (% dell'ATR attuale)

input group "=== [4] GESTIONE AVANZATA DEL RISCHIO & SIZE DINAMICA ==="
enum ENUM_SIZING_MODE
{
   SIZING_ATR_VOLATILITY, // Size calcolata su Volatilità ATR (Istituzionale)
   SIZING_RISK_PERCENT,   // Size calcolata su % del Saldo/Equity
   SIZING_FIXED_LOT       // Lotto Fisso
};
input ENUM_SIZING_MODE  InpSizingMode           = ${params.sizingMethod === 'ATR_VOLATILITY_ADJUSTED' ? 'SIZING_ATR_VOLATILITY' : params.sizingMethod === 'RISK_PERCENT' ? 'SIZING_RISK_PERCENT' : 'SIZING_FIXED_LOT'}; // Modello di Calcolo Size
input double            InpRiskPercent          = ${params.riskPercent.toFixed(2)};           // Rischio per Operazione (% Equity)
input double            InpFixedLotSize         = ${params.lotSize.toFixed(2)};           // Lotto Fisso Base
input double            InpAtrRiskMultiplier    = ${params.atrRiskMultiplier.toFixed(2)};           // Moltiplicatore ATR per Stop Loss Dinamico
input double            InpMaxDailyDrawdownPct  = ${params.maxDailyDrawdownPercent.toFixed(1)};            // Max Drawdown Giornaliero (% - Prop-Firm Shield)
input int               InpMaxOpenPositions     = 1;               // Numero Massimo Posizioni Contemporanee

input group "=== [5] TARGETS SCALPING & PROTEZIONI POSIZIONE ==="
input int               InpStopLoss             = ${params.stopLossPoints};            // Stop Loss Base (punti: 100 pt = $1.00 Gold)
input int               InpTakeProfit           = ${params.takeProfitPoints};            // Take Profit Base (punti)
input bool              InpUseBreakEven         = ${params.useBreakEven ? 'true' : 'false'};           // Attiva Break-Even Dinamico
input int               InpBETriggerPoints      = ${params.breakEvenTriggerPoints};            // Profitto per Spostare SL a Break-Even
input int               InpBELockPoints         = ${params.breakEvenLockPoints};             // Profitto Minimo Garantito a Break-Even
input bool              InpUseTrailing          = ${params.useTrailingStop ? 'true' : 'false'};           // Attiva Trailing Stop Parabolico
input int               InpTrailingStart        = ${params.trailingStartPoints};            // Inizio Trailing Stop (punti profitto)
input int               InpTrailingStep         = ${params.trailingStepPoints};             // Passo di Aggiornamento Trailing (punti)
input int               InpMaxSlippage          = ${params.maxSlippagePoints};             // Tolleranza Massima Slippage (punti)

input group "=== [6] SEGNALI MICRO-MOMENTUM & TREND FILTERS ==="
input int               InpFastEma              = ${params.fastEmaPeriod};              // Fast EMA (Micro-Momentum)
input int               InpSlowEma              = ${params.slowEmaPeriod};             // Slow EMA (Trend Locale)
input int               InpTrendEma             = ${params.trendEmaPeriod};             // Trend Baseline EMA (Filtro Macro)
input int               InpRsiPeriod            = ${params.rsiPeriod};              // Periodo RSI Veloce
input int               InpRsiOB                = ${params.rsiOverbought};             // Soglia Ipercomprato RSI
input int               InpRsiOS                = ${params.rsiOversold};             // Soglia Ipervenduto RSI
input bool              InpUseBollinger         = ${params.useBollingerBands ? 'true' : 'false'};           // Filtro Bande di Bollinger
input int               InpBBPeriod             = ${params.bbPeriod};             // Periodo Bollinger
input double            InpBBDeviation          = ${params.bbDeviation.toFixed(1)};            // Deviazione Standard Bollinger

input group "=== [7] FILTRI TEMPORALI SESSIONE ==="
input bool              InpUseTimeFilter        = ${params.useTimeFilter ? 'true' : 'false'};           // Attiva Filtro Orari Sessioni
input int               InpStartHourGMT         = 7;               // Ora Inizio Trading (GMT)
input int               InpEndHourGMT           = 21;              // Ora Fine Trading (GMT)

//--- OGGETTI GLOBALI MT5 ---
CTrade                  g_Trade;
CPositionInfo           g_Position;
CAccountInfo            g_Account;
CSymbolInfo             g_Symbol;

// Handle degli Indicatori Tecnici
int                     h_Atr                   = INVALID_HANDLE;
int                     h_FastEma               = INVALID_HANDLE;
int                     h_SlowEma               = INVALID_HANDLE;
int                     h_TrendEma              = INVALID_HANDLE;
int                     h_Rsi                   = INVALID_HANDLE;
int                     h_Bollinger             = INVALID_HANDLE;
int                     h_Obv                   = INVALID_HANDLE;

// Variabili di Stato del Sistema
double                  g_InitialDailyEquity    = 0.0;
datetime                g_CurrentTradingDay     = 0;
bool                    g_TradingBlockedToday   = false;
datetime                g_LastExecutionTime     = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   if(!g_Symbol.Name(_Symbol))
   {
      Print("INSPIRE GOLD ERRORE: Impossibile inizializzare il simbolo: ", _Symbol);
      return INIT_FAILED;
   }
   g_Symbol.Refresh();

   // Configura il motore di esecuzione CTrade
   g_Trade.SetExpertMagicNumber(InpMagicNumber);
   g_Trade.SetDeviationInPoints(InpMaxSlippage);
   g_Trade.SetTypeFillingBySymbol(_Symbol);

   // Inizializza l'ATR per Volatilità Dinamica e Sizing
   h_Atr = iATR(_Symbol, InpTimeframe, InpAtrPeriod);
   if(h_Atr == INVALID_HANDLE)
   {
      Print("INSPIRE GOLD ERRORE: Handle ATR non valido!");
      return INIT_FAILED;
   }

   // Inizializza gli Indicatori di Momentum
   h_FastEma  = iMA(_Symbol, InpTimeframe, InpFastEma, 0, MODE_EMA, PRICE_CLOSE);
   h_SlowEma  = iMA(_Symbol, InpTimeframe, InpSlowEma, 0, MODE_EMA, PRICE_CLOSE);
   h_TrendEma = iMA(_Symbol, InpTimeframe, InpTrendEma, 0, MODE_EMA, PRICE_CLOSE);
   h_Rsi      = iRSI(_Symbol, InpTimeframe, InpRsiPeriod, PRICE_CLOSE);

   if(InpUseBollinger)
      h_Bollinger = iBands(_Symbol, InpTimeframe, InpBBPeriod, 0, InpBBDeviation, PRICE_CLOSE);

   if(InpUseObvMomentum)
      h_Obv = iOBV(_Symbol, InpTimeframe, InpVolumeType);

   if(h_FastEma == INVALID_HANDLE || h_SlowEma == INVALID_HANDLE || h_TrendEma == INVALID_HANDLE || h_Rsi == INVALID_HANDLE)
   {
      Print("INSPIRE GOLD ERRORE: Impossibile creare gli handle degli indicatori!");
      return INIT_FAILED;
   }

   // Snapshot Equity Giornaliera per Prop-Firm Shield
   g_InitialDailyEquity = g_Account.Equity();
   g_CurrentTradingDay  = (datetime)(TimeCurrent() / 86400 * 86400);

   PrintFormat(">>> INSPIRE GOLD v8.00 Avviato con Successo su %s [%s] - Magic: %d <<<",
               _Symbol, EnumToString(InpTimeframe), InpMagicNumber);

   UpdateDashboard();
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   if(h_Atr       != INVALID_HANDLE) IndicatorRelease(h_Atr);
   if(h_FastEma   != INVALID_HANDLE) IndicatorRelease(h_FastEma);
   if(h_SlowEma   != INVALID_HANDLE) IndicatorRelease(h_SlowEma);
   if(h_TrendEma  != INVALID_HANDLE) IndicatorRelease(h_TrendEma);
   if(h_Rsi       != INVALID_HANDLE) IndicatorRelease(h_Rsi);
   if(h_Bollinger != INVALID_HANDLE) IndicatorRelease(h_Bollinger);
   if(h_Obv       != INVALID_HANDLE) IndicatorRelease(h_Obv);

   Comment("");
}

//+------------------------------------------------------------------+
//| Expert tick function - HFT TICK ENGINE                           |
//+------------------------------------------------------------------+
void OnTick()
{
   g_Symbol.Refresh();
   g_Symbol.RefreshRates();

   // 1. Reset Giornaliero e Monitoraggio Drawdown (Prop-Firm Shield)
   datetime today = (datetime)(TimeCurrent() / 86400 * 86400);
   if(today != g_CurrentTradingDay)
   {
      g_CurrentTradingDay   = today;
      g_InitialDailyEquity  = g_Account.Equity();
      g_TradingBlockedToday = false;
   }

   double currentEquity = g_Account.Equity();
   if(g_InitialDailyEquity > 0)
   {
      double dailyDD = (g_InitialDailyEquity - currentEquity) / g_InitialDailyEquity * 100.0;
      if(dailyDD >= InpMaxDailyDrawdownPct)
      {
         if(!g_TradingBlockedToday)
         {
            PrintFormat("INSPIRE GOLD SAFETY ALERT: Max Drawdown Giornaliero raggiunto (%.2f%%). Trading Sospeso.", dailyDD);
            CloseAllOpenPositions();
            g_TradingBlockedToday = true;
         }
         UpdateDashboard();
         return;
      }
   }

   if(g_TradingBlockedToday) return;

   // 2. Gestione Posizioni Aperte: Break-Even Istantaneo e Trailing Stop
   ManageActivePositions();

   // 3. Aggiorna Dashboard Statistica On-Chart
   UpdateDashboard();

   // 4. Controlla Filtri di Sessione e Orario
   if(!IsSessionTradingAllowed()) return;

   // 5. Filtro Dinamico ATR di Volatilità
   double atrValue = GetCurrentATR();
   int atrPoints   = (int)MathRound(atrValue / g_Symbol.Point());

   if(InpUseAtrFilter)
   {
      if(atrPoints < InpMinAtrPoints)
         return; // Mercato troppo piatto, rischio falsi segnali

      if(atrPoints > InpMaxAtrPoints)
         return; // Volatilità anomala o flash news, rischio slippage estremo
   }

   // 6. Filtro Spread Dinamico
   int currentSpread = g_Symbol.Spread();
   if(currentSpread > InpMaxSpreadPoints)
      return; // Spread troppo elevato

   if(InpDynamicSpreadFilter && atrPoints > 0)
   {
      // Lo spread non deve erodere più dell'8% dell'escursione ATR
      double maxAllowedSpreadByAtr = atrPoints * 0.08;
      if(currentSpread > maxAllowedSpreadByAtr)
         return;
   }

   // 7. Limite Posizioni Contemporanee
   if(CountActivePositions() >= InpMaxOpenPositions)
      return;

   // 8. Analisi dei Volumi (Tick / Reali) e Segnale di Ingresso
   if(InpUseVolumeFilter && !IsVolumeConfirmed())
      return;

   int signal = EvaluateEntrySignal();
   if(signal == 0) return;

   // 9. Calcolo Size e Invio Ordine a Bassa Latenza
   double calculatedLots = ComputeLotSize(atrPoints);
   if(calculatedLots <= 0) return;

   ExecuteMarketOrder(signal, calculatedLots, atrPoints);
}

//+------------------------------------------------------------------+
//| Analisi Istituzionale dei Volumi (Tick & Real Volume)            |
//+------------------------------------------------------------------+
bool IsVolumeConfirmed()
{
   long volumeBuffer[];
   ArraySetAsSeries(volumeBuffer, true);

   int copied = (InpVolumeType == VOLUME_REAL)
      ? CopyRealVolume(_Symbol, InpTimeframe, 0, InpVolumeMAPeriod + 2, volumeBuffer)
      : CopyTickVolume(_Symbol, InpTimeframe, 0, InpVolumeMAPeriod + 2, volumeBuffer);

   if(copied < InpVolumeMAPeriod + 1)
      return true; // Dati non sufficienti: prosegue senza bloccare

   long currentVol = volumeBuffer[0];
   double sum = 0.0;
   for(int i = 1; i <= InpVolumeMAPeriod; i++)
   {
      sum += (double)volumeBuffer[i];
   }
   double avgVol = sum / InpVolumeMAPeriod;

   // Richiede che il volume corrente superi la media mobile dei volumi del fattore spike configurato
   bool isSpike = (currentVol >= avgVol * InpVolumeSpikeRatio);

   // Controllo aggiuntivo OBV (se attivo)
   if(InpUseObvMomentum && h_Obv != INVALID_HANDLE)
   {
      double obvValues[];
      ArraySetAsSeries(obvValues, true);
      if(CopyBuffer(h_Obv, 0, 0, 3, obvValues) >= 3)
      {
         // Verifica pendenza dell'OBV
         bool obvRising  = obvValues[0] > obvValues[1];
         bool obvFalling = obvValues[0] < obvValues[1];
         return isSpike && (obvRising || obvFalling);
      }
   }

   return isSpike;
}

//+------------------------------------------------------------------+
//| Riconoscimento Segnali Micro-Momentum con Filtro Trend           |
//+------------------------------------------------------------------+
int EvaluateEntrySignal()
{
   double fastEma[], slowEma[], trendEma[], rsi[];
   ArraySetAsSeries(fastEma, true);
   ArraySetAsSeries(slowEma, true);
   ArraySetAsSeries(trendEma, true);
   ArraySetAsSeries(rsi, true);

   if(CopyBuffer(h_FastEma, 0, 0, 3, fastEma) < 3) return 0;
   if(CopyBuffer(h_SlowEma, 0, 0, 3, slowEma) < 3) return 0;
   if(CopyBuffer(h_TrendEma, 0, 0, 3, trendEma) < 3) return 0;
   if(CopyBuffer(h_Rsi, 0, 0, 3, rsi) < 3) return 0;

   double bbUpper[], bbLower[], bbMiddle[];
   if(InpUseBollinger)
   {
      ArraySetAsSeries(bbUpper, true);
      ArraySetAsSeries(bbLower, true);
      ArraySetAsSeries(bbMiddle, true);
      if(CopyBuffer(h_Bollinger, 1, 0, 3, bbUpper) < 3) return 0;
      if(CopyBuffer(h_Bollinger, 2, 0, 3, bbLower) < 3) return 0;
      if(CopyBuffer(h_Bollinger, 0, 0, 3, bbMiddle) < 3) return 0;
   }

   double bid = g_Symbol.Bid();
   double ask = g_Symbol.Ask();

   // --- CONDIZIONE BUY (LONG) ---
   bool buyTrendOk = (bid > trendEma[0]) && (fastEma[0] > slowEma[0]);
   bool buyCrossOk = (fastEma[0] >= slowEma[0] && fastEma[1] <= slowEma[1]) || (fastEma[0] > slowEma[0] && rsi[0] > 51.0 && rsi[1] <= 51.0);
   bool buyRsiOk   = (rsi[0] >= 50.0 && rsi[0] <= InpRsiOB);
   bool buyBBOk    = !InpUseBollinger || (ask > bbMiddle[0] && ask <= bbUpper[0] + 40 * _Point);

   if(buyTrendOk && buyCrossOk && buyRsiOk && buyBBOk)
      return 1; // BUY

   // --- CONDIZIONE SELL (SHORT) ---
   bool sellTrendOk = (ask < trendEma[0]) && (fastEma[0] < slowEma[0]);
   bool sellCrossOk = (fastEma[0] <= slowEma[0] && fastEma[1] >= slowEma[1]) || (fastEma[0] < slowEma[0] && rsi[0] < 49.0 && rsi[1] >= 49.0);
   bool sellRsiOk   = (rsi[0] <= 50.0 && rsi[0] >= InpRsiOS);
   bool sellBBOk    = !InpUseBollinger || (bid < bbMiddle[0] && bid >= bbLower[0] - 40 * _Point);

   if(sellTrendOk && sellCrossOk && sellRsiOk && sellBBOk)
      return -1; // SELL

   return 0;
}

//+------------------------------------------------------------------+
//| Esecuzione Ordine a Mercato con SL & TP Dinamici                 |
//+------------------------------------------------------------------+
void ExecuteMarketOrder(int signal, double lots, int atrPoints)
{
   double point = g_Symbol.Point();
   double ask   = g_Symbol.Ask();
   double bid   = g_Symbol.Bid();

   // Calcolo SL & TP (Fisso o Adattato all'ATR)
   int slPoints = InpStopLoss;
   int tpPoints = InpTakeProfit;

   if(InpSizingMode == SIZING_ATR_VOLATILITY && atrPoints > 0)
   {
      slPoints = (int)MathRound(atrPoints * InpAtrRiskMultiplier);
      tpPoints = (int)MathRound(slPoints * 1.25); // Risk/Reward Ratio minimo 1:1.25
   }

   if(signal > 0) // BUY
   {
      double sl = (slPoints > 0) ? NormalizeDouble(bid - slPoints * point, _Digits) : 0.0;
      double tp = (tpPoints > 0) ? NormalizeDouble(ask + tpPoints * point, _Digits) : 0.0;

      if(g_Trade.Buy(lots, _Symbol, ask, sl, tp, InpTradeComment))
      {
         PrintFormat("INSPIRE GOLD >>> BUY APERTO: Lotti=%.2f | Prezzo=%.2f | SL=%.2f | TP=%.2f | ATR=%d pt",
                     lots, ask, sl, tp, atrPoints);
         g_LastExecutionTime = TimeCurrent();
      }
   }
   else if(signal < 0) // SELL
   {
      double sl = (slPoints > 0) ? NormalizeDouble(ask + slPoints * point, _Digits) : 0.0;
      double tp = (tpPoints > 0) ? NormalizeDouble(bid - tpPoints * point, _Digits) : 0.0;

      if(g_Trade.Sell(lots, _Symbol, bid, sl, tp, InpTradeComment))
      {
         PrintFormat("INSPIRE GOLD >>> SELL APERTO: Lotti=%.2f | Prezzo=%.2f | SL=%.2f | TP=%.2f | ATR=%d pt",
                     lots, bid, sl, tp, atrPoints);
         g_LastExecutionTime = TimeCurrent();
      }
   }
}

//+------------------------------------------------------------------+
//| Gestione Dinamica Posizioni (Break-Even e Trailing Stop)          |
//+------------------------------------------------------------------+
void ManageActivePositions()
{
   double point = g_Symbol.Point();
   double bid   = g_Symbol.Bid();
   double ask   = g_Symbol.Ask();

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(!g_Position.SelectByIndex(i)) continue;
      if(g_Position.Symbol() != _Symbol || g_Position.Magic() != InpMagicNumber) continue;

      ulong ticket               = g_Position.Ticket();
      ENUM_POSITION_TYPE posType = g_Position.PositionType();
      double openPrice           = g_Position.PriceOpen();
      double currentSL           = g_Position.StopLoss();
      double currentTP           = g_Position.TakeProfit();

      // --- LOGICA BREAK-EVEN RAPIDO ---
      if(InpUseBreakEven)
      {
         if(posType == POSITION_TYPE_BUY)
         {
            double profitPoints = (bid - openPrice) / point;
            if(profitPoints >= InpBETriggerPoints)
            {
               double newSL = NormalizeDouble(openPrice + InpBELockPoints * point, _Digits);
               if(currentSL < newSL || currentSL == 0.0)
               {
                  if(g_Trade.PositionModify(ticket, newSL, currentTP))
                     PrintFormat("INSPIRE GOLD: Break-Even attivato su BUY #%d (SL portato a %.2f)", ticket, newSL);
               }
            }
         }
         else if(posType == POSITION_TYPE_SELL)
         {
            double profitPoints = (openPrice - ask) / point;
            if(profitPoints >= InpBETriggerPoints)
            {
               double newSL = NormalizeDouble(openPrice - InpBELockPoints * point, _Digits);
               if(currentSL > newSL || currentSL == 0.0)
               {
                  if(g_Trade.PositionModify(ticket, newSL, currentTP))
                     PrintFormat("INSPIRE GOLD: Break-Even attivato su SELL #%d (SL portato a %.2f)", ticket, newSL);
               }
            }
         }
      }

      // --- TRAILING STOP DINAMICO ---
      if(InpUseTrailing)
      {
         if(posType == POSITION_TYPE_BUY)
         {
            double profitPoints = (bid - openPrice) / point;
            if(profitPoints >= InpTrailingStart)
            {
               double targetSL = NormalizeDouble(bid - InpTrailingStep * point, _Digits);
               if(targetSL > currentSL + point * 10)
                  g_Trade.PositionModify(ticket, targetSL, currentTP);
            }
         }
         else if(posType == POSITION_TYPE_SELL)
         {
            double profitPoints = (openPrice - ask) / point;
            if(profitPoints >= InpTrailingStart)
            {
               double targetSL = NormalizeDouble(ask + InpTrailingStep * point, _Digits);
               if(targetSL < currentSL - point * 10 || currentSL == 0.0)
                  g_Trade.PositionModify(ticket, targetSL, currentTP);
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Calcolo Dimensionamento Size (ATR Volatility Adjusted / Risk %)  |
//+------------------------------------------------------------------+
double ComputeLotSize(int atrPoints)
{
   if(InpSizingMode == SIZING_FIXED_LOT)
      return InpFixedLotSize;

   double equity       = g_Account.Equity();
   double riskCapital  = equity * (InpRiskPercent / 100.0);
   double tickValue    = g_Symbol.TickValue();
   if(tickValue <= 0) tickValue = 1.0;

   double pointsAtRisk = InpStopLoss;
   if(InpSizingMode == SIZING_ATR_VOLATILITY && atrPoints > 0)
   {
      pointsAtRisk = atrPoints * InpAtrRiskMultiplier;
   }
   if(pointsAtRisk <= 0) pointsAtRisk = 300.0;

   double calculatedLots = riskCapital / (pointsAtRisk * tickValue);

   double minLot  = g_Symbol.LotsMin();
   double maxLot  = g_Symbol.LotsMax();
   double stepLot = g_Symbol.LotsStep();

   calculatedLots = MathFloor(calculatedLots / stepLot) * stepLot;
   if(calculatedLots < minLot) calculatedLots = minLot;
   if(calculatedLots > maxLot) calculatedLots = maxLot;

   return NormalizeDouble(calculatedLots, 2);
}

//+------------------------------------------------------------------+
//| Estrazione Valore ATR Corrente                                   |
//+------------------------------------------------------------------+
double GetCurrentATR()
{
   double atrBuffer[];
   ArraySetAsSeries(atrBuffer, true);
   if(CopyBuffer(h_Atr, 0, 0, 1, atrBuffer) > 0)
      return atrBuffer[0];
   return 0.0;
}

//+------------------------------------------------------------------+
//| Conteggio Posizioni Attive sul Magic Number                      |
//+------------------------------------------------------------------+
int CountActivePositions()
{
   int count = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(!g_Position.SelectByIndex(i)) continue;
      if(g_Position.Symbol() == _Symbol && g_Position.Magic() == InpMagicNumber)
         count++;
   }
   return count;
}

//+------------------------------------------------------------------+
//| Chiusura Emergenza Posizioni                                     |
//+------------------------------------------------------------------+
void CloseAllOpenPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(!g_Position.SelectByIndex(i)) continue;
      if(g_Position.Symbol() == _Symbol && g_Position.Magic() == InpMagicNumber)
         g_Trade.PositionClose(g_Position.Ticket());
   }
}

//+------------------------------------------------------------------+
//| Filtro Orari Sessioni                                            |
//+------------------------------------------------------------------+
bool IsSessionTradingAllowed()
{
   if(!InpUseTimeFilter) return true;

   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);

   // Evita finestra rollover notturno broker (23:55 - 00:10 GMT) con spread anomalo
   if(dt.hour == 23 && dt.min >= 55) return false;
   if(dt.hour == 0 && dt.min <= 10) return false;

   return (dt.hour >= InpStartHourGMT && dt.hour <= InpEndHourGMT);
}

//+------------------------------------------------------------------+
//| Dashboard Istituzionale On-Chart INSPIRE GOLD                    |
//+------------------------------------------------------------------+
void UpdateDashboard()
{
   int spread    = g_Symbol.Spread();
   double atr    = GetCurrentATR();
   int atrPts    = (int)MathRound(atr / g_Symbol.Point());

   string statusStr = g_TradingBlockedToday ? "BLOCCO GIORNALIERO ATTIVO (Max DD)" : "ATTIVO - SCANSIONE FLUSSO ORDINI";

   string dash = StringFormat(
      "═══════════════════════════════════════════\\n" +
      "          PROJECT: INSPIRE GOLD v8.00      \\n" +
      "     Institutional Quantitative Scalping   \\n" +
      "═══════════════════════════════════════════\\n" +
      " Simbolo: %s | Timeframe: %s\\n" +
      " Spread Attuale: %d pt (Max: %d pt) [%s]\\n" +
      " Volatilità ATR(14): %d pt (Range %d-%d pt)\\n" +
      " Filtro Volumi: %s (%s Spike %.2fx)\\n" +
      " Posizioni Attive: %d / %d\\n" +
      " Equity Conto: %.2f USD (Rischio: %.2f%%)\\n" +
      " Stato Motore: %s\\n" +
      "═══════════════════════════════════════════",
      _Symbol, EnumToString(InpTimeframe),
      spread, InpMaxSpreadPoints, (spread <= InpMaxSpreadPoints ? "OK" : "ALTO - BLOCCATO"),
      atrPts, InpMinAtrPoints, InpMaxAtrPoints,
      InpUseVolumeFilter ? "ATTIVO" : "DISATTIVATO",
      InpVolumeType == VOLUME_REAL ? "Real" : "Tick",
      InpVolumeSpikeRatio,
      CountActivePositions(), InpMaxOpenPositions,
      g_Account.Equity(), InpRiskPercent,
      statusStr
   );

   Comment(dash);
}
//+------------------------------------------------------------------+
`;
}
