import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  Sliders,
  Sparkles,
  Zap,
  Info,
  Maximize2
} from 'lucide-react';

export default function EnergyControls({
  isPaused = false,
  onTogglePause = () => {},
  onResetView = () => {},
  reducedMotion = false,
  onToggleReducedMotion = () => {},
  selectedNode = null,
  onSelectNode = () => {},
  nodes = [],
}) {
  return (
    <div className="absolute top-24 right-4 sm:right-8 z-20 pointer-events-auto flex flex-col items-end gap-2.5">
      
      {/* Controls Floating Pill Bar */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 text-xs font-mono text-slate-300">
        
        {/* Pause / Resume Animation */}
        <button
          onClick={onTogglePause}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={isPaused ? 'Resume decorative particle animation' : 'Pause decorative particle animation'}
          aria-label={isPaused ? 'Resume animation' : 'Pause animation'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline text-[11px]">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetView}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          title="Reset 3D camera to overview"
          aria-label="Reset camera view"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Reset View</span>
        </button>

        {/* Toggle Reduced Motion */}
        <button
          onClick={onToggleReducedMotion}
          className={`p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            reducedMotion
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title={reducedMotion ? 'Reduced motion enabled (click to disable)' : 'Enable reduced motion'}
          aria-label={reducedMotion ? 'Disable reduced motion' : 'Enable reduced motion'}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">
            {reducedMotion ? 'Reduced Motion: ON' : 'Motion'}
          </span>
        </button>

      </div>

      {/* Quick Household Selector Dropdown / Pills */}
      <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 text-[11px] font-mono text-slate-300 min-w-[200px]">
        <span className="text-[10px] text-slate-500 uppercase px-2 py-0.5 tracking-wider">
          Explore Households
        </span>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectNode(selectedNode === 'producer' ? null : 'producer')}
            className={`px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between ${
              selectedNode === 'producer'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Hebbal Solar Park</span>
            </span>
            <span className="text-[10px] text-emerald-400">+4.5 kWh</span>
          </button>

          <button
            onClick={() => onSelectNode(selectedNode === 'consumer1' ? null : 'consumer1')}
            className={`px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between ${
              selectedNode === 'consumer1'
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Ananya Reddy EV</span>
            </span>
            <span className="text-[10px] text-amber-400">-8.2 kWh</span>
          </button>

          <button
            onClick={() => onSelectNode(selectedNode === 'consumer2' ? null : 'consumer2')}
            className={`px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between ${
              selectedNode === 'consumer2'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold'
                : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Indiranagar Co-op</span>
            </span>
            <span className="text-[10px] text-purple-400">Co-op</span>
          </button>

          <button
            onClick={() => onSelectNode(selectedNode === 'substation' ? null : 'substation')}
            className={`px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer flex items-center justify-between ${
              selectedNode === 'substation'
                ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40 font-bold'
                : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>BESCOM Substation</span>
            </span>
            <span className="text-[10px] text-sky-400">11kV Bus</span>
          </button>
        </div>
      </div>

    </div>
  );
}
