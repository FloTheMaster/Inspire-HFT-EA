export const ORIGINAL_MQL5_CODE = `/**
 * EA Studio Expert Advisor Grid
 * Exported from Expert Advisor Studio - Gold M15
 * 
 * PROBLEMI PRINCIPALI IDENTIFICATI DALL'AI:
 * 1. Timeframe M15 con controllo su OnBar() -> Troppo lento per scalping / HFT!
 * 2. Stop Loss 4000 punti e Take Profit 7000 punti -> Non è scalping, è swing trading ad alto rischio!
 * 3. 6 indicatori contrastanti (Envelopes + DeMarker + MACD + RSI 34 + RSI 19 + ATR) -> Paralisi da analisi!
 * 4. Modalità Grid (Averaging Down) con moltiplicatore 1.1x -> Rischio bruciatura conto su Gold!
 * 5. Blocco Licenza con DLL ShellExecuteW per WhatsApp -> Fallisce nei test MT5 Strategy Tester!
 */
#import "shell32.dll"
int ShellExecuteW(int hwnd, string lpOperation, string lpFile, string lpParameters, string lpDirectory, int nShowCmd);
#import

input string   LicenseKey = "36266170";
bool licenseValid = false;
datetime ExpireDate = D'2026.11.12';
string         RenewalWhatsApp = "https://wa.me/35799163253?text=Vorrei rinnovare la licenza EA";

#property copyright "Forex Software Ltd."
#property version   "6.8"
#property strict

static input string _Properties_ = "------";
static input int    Magic_Number = 1119886110;
static input double Entry_Amount =     0.01;
       input int    Stop_Loss    =     4000; // SL troppo largo per scalping!
       input int    Take_Profit  =     7000; // TP troppo distante!

static input bool OppositeReverseEnabled = true;

// Indicatori lenti e sovrapposti
static input string ___1______   = "------"; // Envelopes
       input int    Ind1Param0   =        8;
       input double Ind1Param1   =     0.10;

static input string ___2______   = "------"; // DeMarker (35)
       input int    Ind2Param0   =       35;
       input double Ind2Param1   =     0.45;

static input string ___3______   = "------"; // MACD (5, 19, 9)
       input int    Ind3Param0   =        5;
       input int    Ind3Param1   =       19;
       input int    Ind3Param2   =        9;

static input string ___4______   = "------"; // RSI (34)
       input int    Ind4Param0   =       34;
       input int    Ind4Param1   =       45;

static input string ___5______   = "------"; // RSI (19)
       input int    Ind5Param0   =       19;
       input int    Ind5Param1   =       30;

static input string ___6______   = "------"; // ATR (12)
       input int    Ind6Param0   =       12;
       input double Ind6Param1   =   0.0015;

// Grid (Averaging Down) - Pericoloso su Gold
static input string ___Grid_____        = "------";
static input bool   GridEnable          =    false;
       input int    GridDistancePips    =      1000;
       input double GridDistanceScale     =  1.1;
       input double GridVolumeScale        =   1.1;
       input int    GridMaxPositions       =    10;

void OnTick(void)
{
   // In questo codice OnTick gestisce solo la griglia. 
   // L'ingresso avviene SOLO su OnBar (ogni 15 minuti)!
   const datetime time = Time(0);
   if(time > barTime)
     {
      barTime = time;
      OnBar(); // <--- RITARDO ENORME PER SCALPING
     }
}
`;
