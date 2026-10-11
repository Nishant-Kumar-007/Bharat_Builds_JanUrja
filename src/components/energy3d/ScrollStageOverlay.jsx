import React from 'react';
import {
  Sun,
  Zap,
  TrendingDown,
  Leaf,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

export const STAGES = [
  {
    id: 'generate',
    stageNumber: 'STAGE A',
    title: 'Surplus Generation',
    subtitle: 'Rooftop Solar PV Surplus',
    badge: 'Solar Generation Active',
    badgeColor: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50',
  },
  {
    id: 'connect',
    stageNumber: 'STAGE B',
    title: 'Feeder Routing',
    subtitle: 'Overhead 11kV Microgrid Bus',
    badge: 'Line Energized & Discovered',
    badgeColor: 'text-sky-300 bg-sky-950/80 border-sky-500/50',
  },
  {
    id: 'match',
    stageNumber: 'STAGE C',
    title: 'Autonomous Match',
    subtitle: 'EV Consumer Lock-in',
    badge: 'Beckn P2P Agreement Locked',
    badgeColor: 'text-cyan-300 bg-cyan-950/80 border-cyan-500/50',
  },
  {
    id: 'impact',
    stageNumber: 'STAGE D',
    title: 'Impact & Equilibrium',
    subtitle: 'Zero-Emission Local Transfer',
    badge: 'Network Balanced & Settled',
    badgeColor: 'text-purple-300 bg-purple-950/80 border-purple-500/50',
  },
];

export default function ScrollStageOverlay({
  scrollProgress = 0,
  onJumpToStage = () => {},
  activeOffer = null,
  activeNode = null,
}) {
  // Determine active stage index (0, 1, 2, 3)
  const activeStageIndex = Math.min(3, Math.floor(scrollProgress * 4));
  const currentStage = STAGES[activeStageIndex];

  // Micro progress within stage (0 to 1)
  const stageProgress = (scrollProgress * 4) % 1;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 sm:p-8 select-none">
      
      {/* TOP BAR: Stage Pill Navigation & Progress Bar */}
      <div className="w-full max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-slate-950/75 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Stage Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {STAGES.map((stg, idx) => {
              const isActive = idx === activeStageIndex;
              const isPast = idx < activeStageIndex;
              return (
                <button
                  key={stg.id}
                  onClick={() => onJumpToStage(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-102 ring-1 ring-white/30'
                      : isPast
                      ? 'bg-slate-900/90 text-emerald-400 hover:bg-slate-800 border border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                  aria-label={`Jump to ${stg.stageNumber}: ${stg.title}`}
                >
                  <span className="text-[10px] opacity-75">{idx + 1}.</span>
                  <span>{stg.title}</span>
                </button>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 w-full sm:w-48">
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-150"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold whitespace-nowrap">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

        </div>
      </div>

      {/* CENTER-LEFT FLOATING STORY CARD */}
      <div className="w-full max-w-lg pointer-events-auto my-auto">
        <div className="bg-slate-950/85 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl text-white relative overflow-hidden transition-all duration-300">
          
          {/* Top Stage Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {currentStage.stageNumber} • {currentStage.subtitle}
            </span>
            <span
              className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${currentStage.badgeColor}`}
            >
              {currentStage.badge}
            </span>
          </div>

          {/* STAGE A CONTENT: GENERATION */}
          {activeStageIndex === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Sun className="w-7 h-7 text-amber-400" />
                Surplus Clean Energy Generated
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong className="text-emerald-300">Hebbal Solar Research Park</strong> generates 32.5 kWh from high-efficiency monocrystalline rooftop panels. Local facility demand is 28.0 kWh, releasing a verified <strong className="text-white">+4.5 kWh green surplus</strong> into the local microgrid.
              </p>

              {/* Real Metric Capsules */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">PV Generation</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">32.5 <span className="text-xs font-normal">kWh</span></span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Self-Load</span>
                  <span className="text-base sm:text-lg font-black text-rose-400">28.0 <span className="text-xs font-normal">kWh</span></span>
                </div>
                <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-emerald-300 block uppercase font-bold">Net Surplus</span>
                  <span className="text-base sm:text-lg font-black text-emerald-300">+4.5 <span className="text-xs font-normal">kWh</span></span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE B CONTENT: CONNECT */}
          {activeStageIndex === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Zap className="w-7 h-7 text-sky-400" />
                Line Energized & Feeder Discovery
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The open <strong className="text-sky-300">Universal Energy Interface (UEI)</strong> protocol scans the 11kV Koramangala distribution feeder. Green electrons flow through the overhead catenary bus toward downstream households without congesting state transmission transformers.
              </p>

              {/* Real Grid Telemetry */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Feeder Voltage</span>
                  <span className="text-base sm:text-lg font-black text-sky-400">230.5 <span className="text-xs font-normal">V</span></span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Grid Frequency</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">50.01 <span className="text-xs font-normal">Hz</span></span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Wheeling Fee</span>
                  <span className="text-base sm:text-lg font-black text-amber-300">₹0.15 <span className="text-xs font-normal">/kWh</span></span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE C CONTENT: MATCH */}
          {activeStageIndex === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-cyan-400" />
                Matched with EV Consumer
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong className="text-cyan-300">Ananya Reddy EV Charge Point</strong> is matched in real-time. The autonomous agent selects Hebbal Solar over distant grid power, locking in <strong className="text-emerald-300">₹5.80/kWh</strong> (25% cheaper than the ₹7.80/kWh utility commercial tariff).
              </p>

              {/* Order & Contract Breakdown */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Selected Producer:</span>
                  <span className="text-emerald-300 font-bold">Hebbal Solar Park (S1-North)</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Contract Quantity:</span>
                  <span className="text-white font-bold">4.50 kWh</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Settled Unit Price:</span>
                  <span className="text-cyan-300 font-bold">₹5.80 / unit</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono pt-1.5 border-t border-slate-800">
                  <span className="text-slate-400 font-bold">Estimated Order Total:</span>
                  <span className="text-emerald-400 font-black text-sm">₹26.10 (Escrow Lock)</span>
                </div>
              </div>
            </div>
          )}

          {/* STAGE D CONTENT: IMPACT */}
          {activeStageIndex === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Leaf className="w-7 h-7 text-emerald-400" />
                Clean Environmental Impact
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                By consuming clean energy locally, the neighborhood eliminates 5-8% long-distance transmission line losses and displaces coal-fired thermal power on Karnataka's state grid.
              </p>

              {/* Impact Figures */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">CO₂ Avoided</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">2.43 <span className="text-xs font-normal">kg</span></span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Losses Saved</span>
                  <span className="text-base sm:text-lg font-black text-sky-400">0.32 <span className="text-xs font-normal">kWh</span></span>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Trees Equiv.</span>
                  <span className="text-base sm:text-lg font-black text-teal-300">0.11 <span className="text-xs font-normal">trees/day</span></span>
                </div>
              </div>

              {/* Transparent Disclaimer */}
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed font-mono">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  Simulated microgrid model (CEA factor 0.54 kg CO₂/kWh). Actual physical delivery & settlement are facilitated through BESCOM utility interconnects.
                </span>
              </div>
            </div>
          )}

          {/* Scroll Prompt at Bottom */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-[11px]">
              Scroll down to follow flow
              <ArrowRight className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            </span>
            <span className="text-[11px] text-slate-500">
              Stage {activeStageIndex + 1} of 4
            </span>
          </div>

        </div>
      </div>

      {/* BOTTOM HINT / LEGEND PREVIEW */}
      <div className="w-full max-w-4xl mx-auto pointer-events-auto flex items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Producer</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300">EV Consumer</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
            <span className="text-slate-300">Substation</span>
          </span>
        </div>

        <span className="hidden sm:inline-block text-[11px] text-slate-500 bg-slate-950/60 px-3 py-1.5 rounded-full border border-slate-800/60">
          Tap any household in 3D to inspect telemetry
        </span>
      </div>

    </div>
  );
}
