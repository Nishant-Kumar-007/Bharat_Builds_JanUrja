import React from 'react';
import { ArrowUpRight, ChevronDown, Zap, Sun, ShieldCheck, Activity, TrendingUp } from 'lucide-react';

export default function HeroDashboardSection({
  onBuy = () => {},
  onSell = () => {},
  onScrollTo3D = () => {},
  onStartTrading = () => {}
}) {
  const handleBuy = () => {
    if (onBuy) onBuy();
    else if (onStartTrading) onStartTrading();
  };

  const handleSell = () => {
    if (onSell) onSell();
  };
  return (
    <section className="relative w-full h-[calc(100vh-3.5rem)] min-h-[560px] bg-[#070A08] text-white flex flex-col justify-between pt-0 pb-2 sm:pb-3 px-3 sm:px-6 overflow-hidden select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Decorative fluid side ribbons */}
      <div className="absolute top-0 left-0 w-24 h-56 bg-gradient-to-br from-emerald-900/15 to-transparent blur-2xl pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-24 h-56 bg-gradient-to-bl from-emerald-900/15 to-transparent blur-2xl pointer-events-none"></div>

      {/* TOP: 3 PHOTOGRAPHIC SHOWCASE PANELS — Left & Right stretch to edges, Middle stays centered */}
      <div className="w-full grid gap-2.5 sm:gap-4 pt-0 mt-0 relative z-10 flex-shrink-0" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
        
        {/* Panel 1: Real Solar Residential House — STRETCHED LEFT */}
        <div className="relative group overflow-hidden rounded-[16px] sm:rounded-[22px] max-h-[220px] sm:max-h-[255px] md:max-h-[275px] border border-emerald-500/30 bg-[#0C100D] shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#B8FF24]/60">
          <img
            src="/hero-solar-house.jpg"
            alt="Real Luxury Solar Residential House"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 text-left">
            <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-[#B8FF24] bg-black/75 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              PRODUCER • MANYATA
            </span>
            <p className="text-[9px] sm:text-[11px] font-bold text-white mt-0.5 truncate">25 kW Rooftop PV</p>
          </div>
        </div>

        {/* Panel 2: Tall Architectural Solar Skyscraper — STAYS ORIGINAL SIZE */}
        <div className="relative group overflow-hidden rounded-[16px] sm:rounded-[22px] aspect-[3/4] max-h-[220px] sm:max-h-[255px] md:max-h-[275px] border border-emerald-500/30 bg-[#0C100D] shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#B8FF24]/60 w-[180px] sm:w-[220px] md:w-[240px]">
          <img
            src="/hero-architecture.jpg"
            alt="Modern Solar Architectural Glass Facade"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 text-left">
            <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-[#B8FF24] bg-black/75 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              COMMERCIAL CO-OP
            </span>
            <p className="text-[9px] sm:text-[11px] font-bold text-white mt-0.5 truncate">Bifacial Glass Facade</p>
          </div>
        </div>

        {/* Panel 3: Real Consumer Household Villa with EV — STRETCHED RIGHT */}
        <div className="relative group overflow-hidden rounded-[16px] sm:rounded-[22px] max-h-[220px] sm:max-h-[255px] md:max-h-[275px] border border-emerald-500/30 bg-[#0C100D] shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-[#B8FF24]/60">
          <img
            src="/consumer-villa-ev.jpg"
            alt="Luxury Consumer Residential Villa with EV"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 text-left">
            <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider text-[#B8FF24] bg-black/75 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              CONSUMER • KORAMANGALA
            </span>
            <p className="text-[9px] sm:text-[11px] font-bold text-white mt-0.5 truncate">Smart EV Villa</p>
          </div>
        </div>

      </div>

      {/* EXACT MIDDLE: HERO TYPOGRAPHY & BUY/SELL BUTTONS (Balanced & Arranged in Middle of Screen) */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center my-auto py-2 relative z-10">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
          <span className="text-[#B8FF24] drop-shadow-[0_0_20px_rgba(184,255,36,0.35)]">
            POWER
          </span>{' '}
          BUILT TO MOVE.
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-normal mt-2 sm:mt-2.5">
          From rooftop solar generation to instant P2P settlement, we build modern energy microgrids with clarity, speed, and zero emissions.
        </p>

        {/* BUY & SELL ACTION BUTTONS (Placed in exact middle arrangement) */}
        <div className="mt-3.5 sm:mt-4 flex flex-row items-center justify-center gap-3.5 sm:gap-4.5">
          {/* 1. BUY ENERGY (Glowing Electric Lime Pill) */}
          <button
            onClick={handleBuy}
            className="bg-[#B8FF24] hover:bg-[#a5f012] text-slate-950 font-black px-7 sm:px-9 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm shadow-[0_0_25px_rgba(184,255,36,0.35)] hover:shadow-[0_0_35px_rgba(184,255,36,0.55)] transition-all cursor-pointer flex items-center space-x-2 hover:scale-103"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Buy Energy</span>
            <ArrowUpRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </button>

          {/* 2. SELL ENERGY (Sleek Dark Emerald Pill) */}
          <button
            onClick={handleSell}
            className="bg-[#0C100D] hover:bg-[#151D17] text-white border border-emerald-500/40 hover:border-[#B8FF24]/60 px-7 sm:px-9 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center space-x-2 hover:scale-103 shadow-lg shadow-black/40"
          >
            <TrendingUp className="w-4 h-4 text-[#B8FF24]" />
            <span>Sell Energy</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* BOTTOM: TELEMETRY STATUS PILL BAR */}
      <div className="max-w-3xl mx-auto w-full pt-1 pb-1 relative z-10 flex-shrink-0">
        <div className="bg-[#0C100D]/90 backdrop-blur-xl border border-emerald-950/80 rounded-xl px-3 py-1.5 sm:py-2 shadow-xl flex flex-wrap items-center justify-between gap-2 text-[9px] sm:text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#B8FF24]" />
            <span className="text-slate-400">Feeder:</span>
            <strong className="text-white">11kV Koramangala (50.01 Hz)</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Sun className="w-3 h-3 text-[#B8FF24]" />
            <span className="text-slate-400">Surplus:</span>
            <strong className="text-[#B8FF24]">+4.5 kWh Ready</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#B8FF24]" />
            <span className="text-slate-400">Tariff:</span>
            <strong className="text-white">₹5.80 / unit</strong>
            <span className="text-[9px] text-[#B8FF24] font-bold">(-25%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Backend:</span>
            <strong className="text-emerald-400">AWS Lambda Live</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
