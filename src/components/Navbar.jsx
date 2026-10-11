// ==============================================================================
// Clean, Streamlined Header Component for JanUrja
// Midnight Navy Glass Design with Home, Marketplace, DISCOM, Wallet, and Location
// ==============================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sun,
  Home,
  ShoppingBag,
  TrendingUp,
  MapPin,
  ChevronDown,
  Menu,
  Trash2,
  User,
  Check,
  ShieldCheck,
  Zap,
  Activity,
  LogOut,
  Wallet
} from 'lucide-react';
import { isLiveSupabaseAvailable } from '../services/supabaseClient';

export const BENGALURU_LOCATIONS = [
  { id: 'ALL', label: 'All Bengaluru Grid', desc: 'BESCOM Metro Microgrid' },
  { id: 'North-BLR', label: 'North Bengaluru', desc: 'Hebbal, Yelahanka, Manyata' },
  { id: 'South-BLR', label: 'South Bengaluru', desc: 'Koramangala, Jayanagar, HSR' },
  { id: 'East-BLR', label: 'East Bengaluru', desc: 'Indiranagar, Whitefield, Marathahalli' },
  { id: 'West-BLR', label: 'West Bengaluru', desc: 'Malleshwaram, Rajajinagar' },
  { id: 'Central-BLR', label: 'Central Bengaluru', desc: 'MG Road, Shivajinagar, BESCOM HQ' }
];

export default function Navbar() {
  const {
    currentView,
    setCurrentView,
    currentUser,
    switchPersona,
    signOut,
    deleteAccount,
    profiles,
    filterZone,
    setFilterZone,
    isProtocolMonitorOpen,
    setIsProtocolMonitorOpen,
    setIsSettingsOpen,
    setIsAuthModalOpen,
    setIsWalletModalOpen
  } = useApp();

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Determine current active Bengaluru location label
  const currentLocation = BENGALURU_LOCATIONS.find(
    (loc) => loc.id === filterZone || loc.id.includes(filterZone?.split('-')[0])
  ) || BENGALURU_LOCATIONS[0];

  const handleSelectLocation = (locId) => {
    setFilterZone(locId);
    setIsLocationOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/80 bg-[#070A08]/90 backdrop-blur-xl shadow-lg font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-3">
        
        {/* LEFT: Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 flex-shrink-0">
          <div
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 p-1 shadow-md shadow-emerald-950/40 border border-slate-800 group-hover:scale-105 group-hover:border-emerald-500/50 transition-all duration-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="Jan-Urja Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white block leading-none">
                Jan-Urja
              </span>
              <p className="text-[10px] font-mono text-emerald-400/90 tracking-wide mt-0.5">
                Universal Energy Interface
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Navigation Pills & Tools */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
          
          {/* Home Pill */}
          <button
            onClick={() => setCurrentView('home')}
            className={`px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
              currentView === 'home'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/25 shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Marketplace Pill */}
          <button
            onClick={() => setCurrentView('marketplace')}
            className={`hidden sm:flex px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
              currentView === 'marketplace'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-cyan-500/25 shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Marketplace</span>
          </button>

          {/* DISCOM Hub Pill */}
          <button
            onClick={() => setCurrentView('discom')}
            className={`hidden md:flex px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
              currentView === 'discom'
                ? 'bg-sky-500 text-slate-950 font-black shadow-sky-500/25 shadow-md'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>DISCOM</span>
          </button>

          {/* Wallet Balance Pill */}
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="px-3 sm:px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-500/40 hover:scale-102"
            title="JanUrja Wallet & Instant Payout Gateway"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>₹{Number(currentUser?.wallet_balance ?? 1000).toFixed(0)}</span>
          </button>

          {/* Bengaluru Location Selector Pill */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-emerald-950/80 bg-[#0C100D] hover:bg-[#151D17] transition-all text-slate-200 text-xs font-bold cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#B8FF24]" />
              <span>{currentLocation.label.replace(' Bengaluru', '')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Locations Dropdown */}
            {isLocationOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-[#0C100D] rounded-2xl shadow-2xl border border-emerald-950/80 p-2 z-50 animate-in fade-in duration-150"
                onClick={() => setIsLocationOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-emerald-950/80 mb-1">
                  <p className="text-[11px] font-mono text-[#B8FF24] uppercase tracking-wider font-bold">
                    Select Bengaluru Feeder Zone
                  </p>
                </div>
                <div className="space-y-1">
                  {BENGALURU_LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLocation(loc.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        currentLocation.id === loc.id
                          ? 'bg-emerald-950 text-[#B8FF24] font-bold border border-emerald-500/40'
                          : 'hover:bg-[#151D17] text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{loc.label}</p>
                        <p className="text-[10px] text-slate-400">{loc.desc}</p>
                      </div>
                      {currentLocation.id === loc.id && <Check className="w-3.5 h-3.5 text-[#B8FF24] flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-1.5 sm:p-2 rounded-full bg-[#0C100D] hover:bg-[#151D17] text-slate-200 border border-emerald-950/80 transition-all cursor-pointer flex items-center justify-center focus:outline-none"
              title="Menu"
              aria-label="Navigation Menu"
            >
              <Menu className="w-4 sm:w-5 h-4 sm:h-5 text-slate-300" />
            </button>

            {/* Menu Dropdown */}
            {isProfileOpen && (
              <>
                {/* Backdrop to close on click outside */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />

                <div
                  className="absolute right-0 mt-2 w-64 bg-[#0C100D] rounded-2xl shadow-2xl border border-emerald-950/80 p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-100"
                >
                  {/* Option 1: Profile Name and Role */}
                  <div className="p-3 bg-[#070A08] rounded-xl border border-emerald-950 flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 text-[#B8FF24] flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-xs border border-emerald-500/40">
                      {currentUser?.avatar || <User className="w-5 h-5 text-[#B8FF24]" />}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-sm text-white truncate">
                        {currentUser?.full_name || currentUser?.name || 'My Profile'}
                      </p>
                      <p className="text-xs text-[#B8FF24] font-semibold capitalize tracking-wide font-mono">
                        {currentUser?.role || 'Consumer'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {/* Mobile Only: Marketplace */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setCurrentView('marketplace');
                      }}
                      className="sm:hidden w-full py-2.5 px-3 rounded-xl text-slate-200 hover:bg-[#151D17] text-xs font-bold flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#B8FF24] flex-shrink-0" />
                      <span>Marketplace</span>
                    </button>

                    {/* Mobile Only: DISCOM */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setCurrentView('discom');
                      }}
                      className="md:hidden w-full py-2.5 px-3 rounded-xl text-slate-200 hover:bg-[#151D17] text-xs font-bold flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                    >
                      <Activity className="w-4 h-4 text-[#B8FF24] flex-shrink-0" />
                      <span>DISCOM Dashboard</span>
                    </button>

                    {/* Option: Wallet & Payouts */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsWalletModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-[#B8FF24] hover:bg-emerald-950/50 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Wallet className="w-4 h-4 text-[#B8FF24] flex-shrink-0" />
                        <span>Wallet & Payouts</span>
                      </div>
                      <span className="font-extrabold text-[11px] bg-emerald-950 text-[#B8FF24] px-2 py-0.5 rounded-full border border-emerald-500/40">
                        ₹{Number(currentUser?.wallet_balance ?? 1000).toFixed(0)}
                      </span>
                    </button>

                    {/* Option 2: Delete my account */}
                    <button
                      onClick={async () => {
                        setIsProfileOpen(false);
                        const confirmed = window.confirm(
                          'Are you sure you want to permanently delete your account? This action cannot be undone.'
                        );
                        if (confirmed) {
                          await deleteAccount();
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-rose-400 hover:bg-rose-950/40 text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>Delete my account</span>
                    </button>

                    {/* Option 3: Log out */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-slate-300 hover:bg-[#151D17] text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
