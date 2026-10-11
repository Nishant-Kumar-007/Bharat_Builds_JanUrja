import React from 'react';
import {
  Sun,
  Home,
  Zap,
  X,
  ArrowRight,
  ShieldCheck,
  BatteryCharging,
  TrendingUp,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function HouseholdInspectorModal({
  selectedNode = null,
  onClose = () => {},
}) {
  const { setCurrentView, setFilterZone, offers } = useApp();

  if (!selectedNode) return null;

  // Node telemetry profiles mapped to the existing data contracts
  const nodeDetails = {
    producer: {
      id: 'NODE-2010',
      name: 'Hebbal Solar Research Park',
      owner: 'Dr. Ramesh / Manyata Tech Park Array',
      role: 'Solar Prosumer (BPP)',
      roleColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      zone: 'S1-North',
      address: 'Manyata Tech Park Rooftop Array, Hebbal, North Bengaluru',
      capacity: '25.0 kW',
      generation: '32.5 kWh',
      consumption: '28.0 kWh',
      netStatus: '+4.5 kWh Surplus',
      statusColor: 'text-emerald-400',
      frequency: '50.01 Hz',
      voltage: '232.0 V',
      offerPrice: '₹5.80 / kWh',
      offerQuantity: '15.0 kWh',
      offerRule: 'Manyata Tech Park flat-rate solar surplus for North Bengaluru uplift.',
      actionLabel: 'Buy From This Producer',
      actionView: 'buy',
    },
    consumer1: {
      id: 'NODE-3045',
      name: 'Ananya Reddy EV Fast Charge',
      owner: 'Ananya Reddy (EV Fleet Co-op)',
      role: 'EV Consumer (BAP)',
      roleColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      zone: 'S3-South',
      address: '4th Block, Koramangala, South Bengaluru',
      capacity: '2.0 kW (Rooftop PV)',
      generation: '0.8 kWh',
      consumption: '9.0 kWh',
      netStatus: '-8.2 kWh Deficit',
      statusColor: 'text-amber-400',
      frequency: '49.95 Hz',
      voltage: '227.6 V',
      offerPrice: 'Target: < ₹6.00 / kWh',
      offerQuantity: 'Demands 8.2 kWh',
      offerRule: 'Auto-match with cleanest solar provider undercutting BESCOM by 15%.',
      actionLabel: 'Match With This Consumer',
      actionView: 'sell',
    },
    consumer2: {
      id: 'NODE-6032',
      name: 'Indiranagar Commercial Rooftop Co-op',
      owner: 'Indiranagar Retail Alliance',
      role: 'Commercial Prosumer / Co-op',
      roleColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      zone: 'S2-East',
      address: '100ft Road, Indiranagar, East Bengaluru',
      capacity: '18.0 kW',
      generation: '18.0 kWh',
      consumption: '5.2 kWh',
      netStatus: '+12.8 kWh Surplus',
      statusColor: 'text-purple-400',
      frequency: '49.98 Hz',
      voltage: '229.5 V',
      offerPrice: '₹6.20 / kWh',
      offerQuantity: '22.5 kWh',
      offerRule: 'Undercut BESCOM commercial tariff by 20%. Floor price ₹5.80/kWh.',
      actionLabel: 'View Active Offer',
      actionView: 'marketplace',
    },
    substation: {
      id: 'NODE-4015',
      name: 'BESCOM Central Substation Feeder #4',
      owner: 'Karnataka State Electricity Regulatory Commission (KERC)',
      role: 'Regulator / Utility Feeder (DISCOM)',
      roleColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      zone: 'Central-Hub',
      address: 'BESCOM 110kV Substation, Shivajinagar, Central Bengaluru',
      capacity: '100.0 kW Feeder Transformer',
      generation: '50.0 kWh (Grid Reserve)',
      consumption: '15.0 kWh',
      netStatus: 'Balanced Bus',
      statusColor: 'text-sky-400',
      frequency: '50.00 Hz',
      voltage: '230.0 V',
      offerPrice: 'Tariff: ₹7.80 / kWh (Peak)',
      offerQuantity: 'Wheeling: ₹0.15/kWh',
      offerRule: 'State utility grid stability balancer and settlement guarantor.',
      actionLabel: 'Open DISCOM Dashboard',
      actionView: 'discom',
    },
  };

  const data = nodeDetails[selectedNode] || nodeDetails.producer;

  const handleAction = () => {
    onClose();
    if (data.zone) setFilterZone(data.zone);
    setCurrentView(data.actionView);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md select-none animate-fadeIn">
      <div className="bg-slate-950/90 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative text-white space-y-5">
        
        {/* Header & Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${data.roleColor}`}>
                {data.role}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">
                {data.id}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {data.name}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span>{data.address}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
            aria-label="Close inspector modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Solar Capacity</span>
            <span className="text-base font-black text-white">{data.capacity}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Current Flow</span>
            <span className={`text-base font-black ${data.statusColor}`}>{data.netStatus}</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Grid Frequency</span>
            <span className="text-base font-black text-emerald-400">{data.frequency}</span>
          </div>
        </div>

        {/* Commercial & Contract Terms */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Trading Rate:</span>
            <span className="text-cyan-300 font-bold">{data.offerPrice}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Available Volume:</span>
            <span className="text-white font-bold">{data.offerQuantity}</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 italic font-mono">
            "{data.offerRule}"
          </div>
        </div>

        {/* Actions & Regulatory Notice */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleAction}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer hover:scale-101"
          >
            <span>{data.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] font-mono text-slate-500 text-center leading-relaxed">
            P2P settlement facilitated under Karnataka Electricity Regulatory Commission (KERC) peer-to-peer framework via Beckn protocol smart contracts.
          </p>
        </div>

      </div>
    </div>
  );
}
