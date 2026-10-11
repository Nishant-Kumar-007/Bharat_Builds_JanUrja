import React from 'react';
import {
  Sun,
  Home,
  Zap,
  ArrowRight,
  ShieldCheck,
  Leaf,
  BatteryCharging,
  Info
} from 'lucide-react';
import { STAGES } from './ScrollStageOverlay';

export default function Fallback2DView({
  scrollProgress = 0,
  onJumpToStage = () => {},
  selectedNode = null,
  onSelectNode = () => {},
}) {
  const activeStageIndex = Math.min(3, Math.floor(scrollProgress * 4));
  const currentStage = STAGES[activeStageIndex];

  return (
    <div className="w-full bg-[#0B132B] rounded-3xl p-6 sm:p-10 border border-slate-800 text-white shadow-2xl relative overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      {/* Header with Accessibility Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Accessible 2D Microgrid Diagram (WebGL Fallback Mode)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Bengaluru Urban P2P Solar Distribution
          </h2>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {STAGES.map((stg, idx) => (
            <button
              key={stg.id}
              onClick={() => onJumpToStage(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                idx === activeStageIndex
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {idx + 1}. {stg.title}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 2D Topology Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 my-6">
        
        {/* Node 1: Producer */}
        <div
          onClick={() => onSelectNode('producer')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
            selectedNode === 'producer'
              ? 'bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
            <Sun className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
            PRODUCER (BPP)
          </span>
          <h3 className="text-base font-black text-white mt-2">Hebbal Solar Park</h3>
          <p className="text-xs text-slate-400 mt-1">25 kW Monocrystalline Array</p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-xs font-mono">
            <span className="text-slate-400">Surplus:</span>
            <span className="text-emerald-400 font-bold">+4.5 kWh</span>
          </div>
        </div>

        {/* Node 2: Substation */}
        <div
          onClick={() => onSelectNode('substation')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
            selectedNode === 'substation'
              ? 'bg-sky-950/60 border-sky-400 ring-2 ring-sky-400/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-sky-500/50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
            <Zap className="w-6 h-6 text-sky-400" />
          </div>
          <span className="text-[10px] font-mono text-sky-400 uppercase font-bold px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800">
            11kV FEEDER BUS
          </span>
          <h3 className="text-base font-black text-white mt-2">BESCOM Substation #4</h3>
          <p className="text-xs text-slate-400 mt-1">Wheeling Rate: ₹0.15/kWh</p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-xs font-mono">
            <span className="text-slate-400">Frequency:</span>
            <span className="text-sky-300 font-bold">50.01 Hz (Stable)</span>
          </div>
        </div>

        {/* Node 3: Consumer 1 */}
        <div
          onClick={() => onSelectNode('consumer1')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative group ${
            selectedNode === 'consumer1'
              ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30'
              : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/50'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
            <Home className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">
            EV CONSUMER (BAP)
          </span>
          <h3 className="text-base font-black text-white mt-2">Ananya Reddy EV Hub</h3>
          <p className="text-xs text-slate-400 mt-1">Koramangala 11kW EV Charger</p>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-xs font-mono">
            <span className="text-slate-400">Matched Price:</span>
            <span className="text-cyan-300 font-bold">₹5.80 / kWh</span>
          </div>
        </div>

      </div>

      {/* Stage Explanatory Panel */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
            Active Narrative: {currentStage.stageNumber} — {currentStage.title}
          </span>
          <p className="text-sm text-slate-300 mt-1">
            Energy flows deterministically from high-generation rooftop solar arrays to deficit consumers via Karnataka state distribution network agreements.
          </p>
        </div>

        <button
          onClick={() => onJumpToStage((activeStageIndex + 1) % 4)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
        >
          <span>Next Narrative</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
