import React from 'react';
import {
  Smartphone,
  TrendingUp,
  Sliders,
  Award,
  ArrowUpRight,
  Zap,
  Globe,
  Leaf
} from 'lucide-react';

export default function ServicesSection({ onExploreMarketplace = () => {} }) {
  const SERVICES_LIST = [
    {
      id: 'p2p-trading',
      title: 'Peer-to-Peer Solar Trading',
      description:
        'Direct local energy trading between rooftop solar producers and neighborhood consumers without utility middlemen.',
      icon: <Smartphone className="w-8 h-8 text-slate-950 stroke-[2]" />,
      tag: 'AWS Lambda',
    },
    {
      id: 'dynamic-pricing',
      title: 'Pay-per-kWh Dynamic Pricing',
      description:
        'Self-negotiating AI agent algorithms that undercut peak utility grid tariffs by 15-20% while protecting prosumer floor profits.',
      icon: <Zap className="w-8 h-8 text-slate-950 stroke-[2]" />,
      tag: 'AWS DynamoDB',
    },
    {
      id: 'feeder-optimization',
      title: '11kV Feeder Balancing & Optimization',
      description:
        'Real-time duck curve mitigation and line impedance monitoring preventing transformer thermal overload.',
      icon: <Globe className="w-8 h-8 text-slate-950 stroke-[2]" />,
      tag: 'AWS EventBridge',
    },
    {
      id: 'carbon-offsets',
      title: 'Growth Plan for Clean Energy',
      description:
        'Verifiable ESG carbon accounting computed at 0.54 kg CO₂ per avoided central-grid coal unit with instant certification.',
      icon: <TrendingUp className="w-8 h-8 text-slate-950 stroke-[2]" />,
      tag: 'AWS SNS',
    },
  ];

  return (
    <section className="relative w-full bg-[#070A08] py-20 px-4 sm:px-8 text-white font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none border-t border-emerald-950/80">
      {/* Subtle Grid Background Pattern (Image 2 Style) */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#B8FF24_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section (Image 2 Style) */}
        <div className="max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Services
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            Everything your brand and microgrid needs for more clarity, strong positioning, and sustainable energy growth.
          </p>
        </div>

        {/* 4 VIBRANT ROUNDED NEON LIME GREEN CARDS (Image 2 Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {SERVICES_LIST.map((srv) => (
            <div
              key={srv.id}
              onClick={onExploreMarketplace}
              className="bg-[#B8FF24] hover:bg-[#a6f212] text-slate-950 rounded-[32px] sm:rounded-[36px] p-8 sm:p-10 shadow-2xl transition-all duration-300 hover:scale-102 cursor-pointer flex flex-col justify-between min-h-[220px] group relative overflow-hidden"
            >
              {/* Top Row: Title + Icon + Corner Cross Accent */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-black tracking-widest text-slate-800 bg-black/10 px-2.5 py-0.5 rounded-full inline-block">
                      {srv.tag}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                      {srv.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center group-hover:rotate-6 transition-transform">
                      {srv.icon}
                    </div>
                    <span className="text-xl font-mono text-slate-800 font-bold select-none opacity-60">
                      ×
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-900 font-semibold leading-relaxed mt-2 max-w-md">
                  {srv.description}
                </p>
              </div>

              {/* Bottom Action Pill */}
              <div className="pt-6 flex items-center justify-between border-t border-slate-950/15 text-xs font-black">
                <span className="uppercase tracking-wider">Explore Capabilities</span>
                <div className="w-8 h-8 rounded-full bg-slate-950 text-[#B8FF24] flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
