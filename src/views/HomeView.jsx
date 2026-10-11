// ==============================================================================
// HomeView Component — Immersive 3D Energy Narrative & P2P Microgrid Hub
// 1. Hero Dashboard Section (with Buy & Sell CTA buttons)
// 2. Real-Time Autonomous Electricity Transfer Animation (Hebbal -> Substation -> Consumer Villa)
// 3. 24/7 Autonomous Energy Agent AI Chatbot Integration
// 4. Services Section (4 Vibrant Neon Lime Cards)
// 5. One-Line Live Transaction History Bar (Beckn UEI Settled Orders)
// ==============================================================================

import React from 'react';
import { useApp } from '../context/AppContext';
import HeroDashboardSection from '../components/HeroDashboardSection';
import ElectricityTransferSection from '../components/ElectricityTransferSection';
import IntegratedChatbotSection from '../components/IntegratedChatbotSection';
import ServicesSection from '../components/ServicesSection';
import {
  Clock,
  ChevronRight,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';

export default function HomeView() {
  const {
    setCurrentView,
    orders,
    setActiveReceiptOrder
  } = useApp();

  const latestOrder = orders && orders.length > 0 ? orders[0] : null;

  return (
    <div className="w-full bg-[#070A08] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      
      {/* 1. HERO DASHBOARD PAGE (Image 1 ZEN Aesthetic: Dark Obsidian, Photographic Showcases, "POWER BUILT TO MOVE.") */}
      <HeroDashboardSection
        onBuy={() => setCurrentView('buy')}
        onSell={() => setCurrentView('sell')}
      />

      {/* 2. SUPERCOOL AUTONOMOUS ELECTRICITY TRANSFER ANIMATION (Non-scroll dependent, 60 FPS) */}
      <ElectricityTransferSection />

      {/* 3. AI CHATBOT INTEGRATION (Image 3 Style: Robot Avatar, Feature Checklist, Live Intelligence Console) */}
      <IntegratedChatbotSection />

      {/* 4. SERVICES SECTION (Image 2 Style: 4 Vibrant Rounded Neon Lime Cards) */}
      <ServicesSection onExploreMarketplace={() => setCurrentView('marketplace')} />

      {/* 5. ONE LINE OF HISTORY OF TRANSACTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {latestOrder ? (
          <div
            onClick={() => setActiveReceiptOrder(latestOrder)}
            className="bg-[#0C100D]/90 hover:bg-[#111812] border border-emerald-950/90 hover:border-emerald-500/50 rounded-2xl p-4 sm:px-6 shadow-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 text-[#B8FF24] border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#B8FF24]" />
              </div>
              <div className="flex flex-wrap items-center gap-2 min-w-0 text-slate-300">
                <span className="text-[10px] uppercase font-bold text-[#B8FF24] bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF24] animate-pulse"></span>
                  Live Settlement History
                </span>
                <span className="font-bold text-white">
                  {latestOrder.id}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-200">
                  {latestOrder.quantity_kwh} kWh Clean Solar @ ₹{latestOrder.price_per_kwh}/unit
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-white font-bold">
                  Total ₹{latestOrder.total_amount}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400">
                  {latestOrder.seller_name?.split(' ')[0] || 'Hebbal'} ➔ {latestOrder.buyer_name?.split(' ')[0] || 'Ananya'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-end md:self-auto flex-shrink-0">
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 text-[#B8FF24] border border-emerald-500/30 font-mono">
                {latestOrder.protocol_state}
              </span>
              <span className="text-xs font-bold text-[#B8FF24] group-hover:underline flex items-center gap-1 font-mono">
                <span>View Receipt</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#B8FF24] group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0C100D]/80 border border-emerald-950 text-xs font-mono text-slate-400 text-center flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[#B8FF24]" />
            <span>No previous settlements found. Click "Buy Energy" above to complete your first peer-to-peer trade!</span>
          </div>
        )}
      </div>

      {/* REGULATORY ASSUMPTION FOOTNOTE */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-12">
        <div className="p-3.5 rounded-2xl bg-[#070A08] border border-emerald-950/80 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2 leading-relaxed">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>KERC Open-Access Microgrid Wheeling • CEA Baseline: 0.54 kg CO₂ saved/kWh • Powered by AWS Lambda, DynamoDB & SNS</span>
          </div>
          <button
            onClick={() => setCurrentView('marketplace')}
            className="text-emerald-400 hover:underline flex items-center gap-1 flex-shrink-0 cursor-pointer font-bold self-end sm:self-auto"
          >
            <span>Explore All Offers</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
