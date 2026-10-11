import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Sun,
  BatteryCharging,
  ArrowRight,
  ShieldCheck,
  Activity,
  Gauge,
  Sparkles,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Leaf,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function ElectricityTransferSection() {
  const [speedMultiplier, setSpeedMultiplier] = useState(1.5);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedHub, setSelectedHub] = useState('all');
  const [surgeTrigger, setSurgeTrigger] = useState(0);

  // Live telemetry counters that increment smoothly
  const [transferredUnits, setTransferredUnits] = useState(4.5);
  const [co2Saved, setCo2Saved] = useState(2.43);
  const [evBatterySoc, setEvBatterySoc] = useState(68);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Live simulation ticker for realism
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTransferredUnits((prev) => Number((prev + 0.01 * speedMultiplier).toFixed(2)));
      setCo2Saved((prev) => Number((prev + 0.0054 * speedMultiplier).toFixed(3)));
      setEvBatterySoc((prev) => (prev >= 99 ? 65 : Number((prev + 0.02 * speedMultiplier).toFixed(1))));
    }, 400);

    return () => clearInterval(interval);
  }, [isPaused, speedMultiplier]);

  // Particle transmission engine on 2D Canvas (Lightweight, 60fps, zero lag)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool (Vibrant Electric Lime & Emerald)
    const particleCount = 45;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        progress: Math.random(),
        speed: (0.003 + Math.random() * 0.003),
        size: 2.5 + Math.random() * 2.5,
        offsetY: (Math.random() - 0.5) * 16,
        color: Math.random() > 0.35 ? '#B8FF24' : '#10B981',
        glow: 6 + Math.random() * 8,
      });
    }

    let lastTime = performance.now();

    const render = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // Define Conduit Bezier Waypoints
      const p0 = { x: width * 0.16, y: height * 0.5 };
      const p1 = { x: width * 0.33, y: height * 0.32 };
      const pMid = { x: width * 0.5, y: height * 0.38 };
      const p2 = { x: width * 0.67, y: height * 0.32 };
      const p3 = { x: width * 0.84, y: height * 0.5 };

      // Helper to compute cubic bezier point
      const getConduitPoint = (t) => {
        if (t <= 0.5) {
          const localT = t * 2;
          const u = 1 - localT;
          const x = u * u * p0.x + 2 * u * localT * p1.x + localT * localT * pMid.x;
          const y = u * u * p0.y + 2 * u * localT * p1.y + localT * localT * pMid.y;
          return { x, y };
        } else {
          const localT = (t - 0.5) * 2;
          const u = 1 - localT;
          const x = u * u * pMid.x + 2 * u * localT * p2.x + localT * localT * p3.x;
          const y = u * u * pMid.y + 2 * u * localT * p2.y + localT * localT * p3.y;
          return { x, y };
        }
      };

      // 1. Draw Catenary High-Voltage Cables (Dual Cables with Neon Core)
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0F2617';
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const pt = getConduitPoint(i / 60);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Glowing Neon Inner Core
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(184, 255, 36, 0.45)';
      ctx.shadowColor = '#B8FF24';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.restore();

      // 2. Draw Moving Electron Stream Particles
      if (!isPaused) {
        particles.forEach((p) => {
          p.progress += p.speed * speedMultiplier;
          if (p.progress > 1) {
            p.progress = 0;
            p.offsetY = (Math.random() - 0.5) * 16;
          }

          const basePt = getConduitPoint(p.progress);
          const x = basePt.x;
          const y = basePt.y + p.offsetY;

          // Draw Glowing Particle Head
          ctx.save();
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.glow;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fill();

          // Particle Trail Tail
          const tailPt = getConduitPoint(Math.max(0, p.progress - 0.03));
          ctx.lineWidth = p.size * 0.7;
          ctx.strokeStyle = 'rgba(184, 255, 36, 0.35)';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tailPt.x, tailPt.y + p.offsetY);
          ctx.stroke();

          ctx.restore();
        });
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPaused, speedMultiplier]);

  const handleTriggerSurge = () => {
    setSpeedMultiplier(3.5);
    setSurgeTrigger((prev) => prev + 1);
    setTransferredUnits((prev) => Number((prev + 1.5).toFixed(2)));
    setCo2Saved((prev) => Number((prev + 0.81).toFixed(3)));
    setTimeout(() => {
      setSpeedMultiplier(1.5);
    }, 1800);
  };

  return (
    <section
      id="live-energy-transfer"
      className="relative w-full bg-[#070A08] py-16 px-4 sm:px-8 border-t border-b border-emerald-950/60 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] select-none text-white"
    >
      {/* Background ambient lighting - Warm Emerald & Lime */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-emerald-950/20 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B8FF24_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* TOP TITLE & INTERACTIVE TRANSMISSION CONTROLS */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4 border-b border-emerald-950/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B8FF24] animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B8FF24] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
                Autonomous P2P Wheeling Active
              </span>
              <span className="text-xs font-mono text-emerald-400/80">
                11kV Substation Line • Koramangala Feeder
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Real-Time Household Energy Transfer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Watch surplus solar electricity flow deterministically from Hebbal Prosumer Villa to Ananya Reddy's EV Charging Node across the open Beckn UEI distribution network.
            </p>
          </div>

          {/* Speed & Flow Controls */}
          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            {/* Speed Pills */}
            <div className="bg-[#0B0F0C] border border-emerald-900/50 rounded-2xl p-1 flex items-center gap-1 text-xs font-mono">
              {[
                { label: '1x Real', val: 1.0 },
                { label: '2x Rapid', val: 2.0 },
                { label: '4x Turbo', val: 4.0 },
              ].map((spd) => (
                <button
                  key={spd.label}
                  onClick={() => setSpeedMultiplier(spd.val)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
                    speedMultiplier === spd.val
                      ? 'bg-[#B8FF24] text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-white hover:bg-[#151D17]'
                  }`}
                >
                  {spd.label}
                </button>
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="bg-[#0B0F0C] hover:bg-[#151D17] text-slate-200 border border-emerald-900/50 p-2.5 rounded-2xl transition-all cursor-pointer"
              title={isPaused ? 'Resume Energy Stream' : 'Pause Energy Stream'}
            >
              {isPaused ? <Play className="w-4 h-4 text-[#B8FF24]" /> : <Pause className="w-4 h-4 text-[#B8FF24]" />}
            </button>

            {/* Surge Pulse Trigger */}
            <button
              onClick={handleTriggerSurge}
              className="bg-[#B8FF24] hover:bg-[#a6f014] text-slate-950 font-black px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(184,255,36,0.3)] hover:shadow-[0_0_28px_rgba(184,255,36,0.45)] cursor-pointer flex items-center space-x-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>Surge +1.5 kWh</span>
            </button>
          </div>
        </div>

        {/* MAIN VISUAL CONDUIT CONTAINER (Households + Central Conduit) */}
        <div className="relative w-full bg-[#0A0E0B]/95 rounded-[36px] border border-emerald-950/80 p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[480px] flex flex-col justify-between">
          
          {/* Canvas Electron Particle Beam Layer */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* 3 NODE CARDS: PRODUCER (LEFT) • SUBSTATION (CENTER) • CONSUMER (RIGHT) */}
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-center">
            
            {/* 1. LEFT NODE: SOLAR PROSUMER VILLA */}
            <div
              onClick={() => setSelectedHub('producer')}
              className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 backdrop-blur-xl relative group cursor-pointer ${
                selectedHub === 'producer'
                  ? 'bg-[#0E1510] border-[#B8FF24] ring-2 ring-[#B8FF24]/40 shadow-2xl scale-102'
                  : 'bg-[#0C100D]/90 hover:bg-[#0E1510] border-emerald-900/40 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B8FF24] bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  SOLAR PROSUMER NODE
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8FF24] animate-pulse"></span>
              </div>

              {/* Household Image & Solar Badge */}
              <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video border border-emerald-900/40 bg-black shadow-inner">
                <img
                  src="/hero-solar-house.jpg"
                  alt="Hebbal Solar Household"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono font-bold text-white">
                  <span>Hebbal Solar Park</span>
                  <span className="text-[#B8FF24]">25 kW PV Array</span>
                </div>
              </div>

              {/* Real-time Generation Meters */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#070A08] border border-emerald-950">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    PV Generation:
                  </span>
                  <strong className="text-emerald-400 text-sm">32.50 kWh</strong>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#070A08] border border-emerald-950">
                  <span className="text-slate-400">Self-Consumption:</span>
                  <strong className="text-slate-300">28.00 kWh</strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50">
                  <span className="text-[#B8FF24] font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#B8FF24]" />
                    Export Surplus:
                  </span>
                  <strong className="text-[#B8FF24] text-base font-black">+4.50 kWh</strong>
                </div>
              </div>
            </div>

            {/* 2. CENTER NODE: 11kV BESCOM SMART FEEDER SUBSTATION */}
            <div
              onClick={() => setSelectedHub('substation')}
              className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 backdrop-blur-xl relative group cursor-pointer text-center ${
                selectedHub === 'substation'
                  ? 'bg-[#0E1510] border-[#B8FF24] ring-2 ring-[#B8FF24]/40 shadow-2xl scale-102'
                  : 'bg-[#0C100D]/90 hover:bg-[#0E1510] border-emerald-900/40 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B8FF24] bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  DISTRIBUTION TRANSFORMER
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8FF24] animate-pulse"></span>
              </div>

              {/* Pulsing Transformer Core Icon */}
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#070A08] border border-emerald-500/40 flex items-center justify-center mb-4 shadow-xl shadow-emerald-950/40 group-hover:rotate-3 transition-transform">
                <Cpu className="w-10 h-10 text-[#B8FF24] animate-pulse" />
              </div>

              <h3 className="text-xl font-black text-white tracking-tight">
                BESCOM 11kV Feeder
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Koramangala Substation Bus #4
              </p>

              {/* Grid Impedance & Wheeling Rates */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono text-left">
                <div className="p-2 rounded-xl bg-[#070A08] border border-emerald-950">
                  <span className="text-slate-400 block text-[10px] uppercase">Frequency</span>
                  <strong className="text-emerald-400 text-sm">50.01 Hz</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#070A08] border border-emerald-950">
                  <span className="text-slate-400 block text-[10px] uppercase">Line Loss</span>
                  <strong className="text-[#B8FF24] text-sm">0.02%</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#070A08] border border-emerald-950 col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[10px] uppercase">Wheeling Fee</span>
                    <strong className="text-[#B8FF24] text-xs">₹0.15 / kWh</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-950/80 flex items-center justify-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Feeder Thermal Congestion</span>
              </div>
            </div>

            {/* 3. RIGHT NODE: CONSUMER RESIDENTIAL VILLA & EV CHARGER */}
            <div
              onClick={() => setSelectedHub('consumer')}
              className={`p-6 sm:p-7 rounded-3xl border transition-all duration-300 backdrop-blur-xl relative group cursor-pointer ${
                selectedHub === 'consumer'
                  ? 'bg-[#0E1510] border-[#B8FF24] ring-2 ring-[#B8FF24]/40 shadow-2xl scale-102'
                  : 'bg-[#0C100D]/90 hover:bg-[#0E1510] border-emerald-900/40 hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B8FF24] bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  CONSUMER RESIDENCE & EV
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#B8FF24] animate-pulse"></span>
              </div>

              {/* Real Consumer Villa Architectural Image with EV parked & charging */}
              <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video border border-emerald-900/40 bg-black shadow-inner">
                <img
                  src="/consumer-villa-ev.jpg"
                  alt="Ananya Reddy Consumer Villa with EV Charging"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono font-bold text-white">
                  <span>Ananya Reddy Villa</span>
                  <span className="text-[#B8FF24]">EV Fast Charger</span>
                </div>
              </div>

              {/* Live Consumption & EV Charge Progress */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#070A08] border border-emerald-950">
                  <span className="text-slate-400">Current Load Deficit:</span>
                  <strong className="text-amber-400 text-sm">8.20 kWh</strong>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-[#070A08] border border-emerald-950">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-[#B8FF24]" />
                    EV Battery SOC:
                  </span>
                  <strong className="text-[#B8FF24] text-sm">{evBatterySoc}% Charged</strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50">
                  <span className="text-[#B8FF24] font-bold flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-[#B8FF24]" />
                    Clean Solar Influx:
                  </span>
                  <strong className="text-[#B8FF24] text-base font-black">+{transferredUnits.toFixed(2)} kWh</strong>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM TELEMETRY DOCK (Real ESG metrics & Settlement Ticker) */}
          <div className="mt-8 pt-6 border-t border-emerald-950/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            
            <div className="p-3.5 rounded-2xl bg-[#070A08] border border-emerald-950 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-400" />
                CO₂ Emissions Avoided:
              </span>
              <strong className="text-emerald-400 text-sm font-bold">
                {co2Saved.toFixed(3)} kg
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#070A08] border border-emerald-950 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#B8FF24]" />
                Transmission Rate:
              </span>
              <strong className="text-[#B8FF24] text-sm font-bold">
                {(3.2 * speedMultiplier).toFixed(1)} kW Dynamic
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#070A08] border border-emerald-950 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B8FF24]" />
                Contract Settlement:
              </span>
              <strong className="text-[#B8FF24] text-sm font-bold">
                ₹5.80 / kWh Locked
              </strong>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
