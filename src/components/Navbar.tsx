import React from 'react';
import {
  Menu,
  Activity,
  Play,
  Square,
  RefreshCw,
  MapPin,
  Database,
  Sparkles,
} from 'lucide-react';
import type { NavTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavTab;
  onOpenMobileMenu: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onRefreshData: () => void;
  lastUpdated: string;
  isLiveBackend?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobileMenu,
  isSimulating,
  onToggleSimulation,
  onRefreshData,
  lastUpdated,
  isLiveBackend = false,
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'FleetOps Fleet Management Dashboard', subtitle: 'Real-time telemetry, live map, and asset status' };
      case 'vehicles':
        return { title: 'Fleet Vehicles', subtitle: 'Manage fleet assets, telematics health, and diagnostics' };
      case 'trips':
        return { title: 'Trips & Dispatch', subtitle: 'Active routes, cargo transit corridors, and completion logs' };
      case 'alerts':
        return { title: 'Operational Alert Queue', subtitle: 'Prioritized diagnostic anomalies and geofence events' };
    }
  };

  const { title, subtitle } = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Top Banner indicating Stage 2 Supabase or Demo Preview Mode */}
      <div
        className={`px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-inner transition-colors ${
          isLiveBackend
            ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white'
            : 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white'
        }`}
      >
        <div className="flex items-center space-x-2 truncate">
          <span
            className={`flex h-2 w-2 rounded-full ${
              isLiveBackend ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span
            className={`font-semibold ${
              isLiveBackend ? 'text-emerald-300' : 'text-amber-300'
            }`}
          >
            {isLiveBackend ? 'STAGE 2 CONNECTED:' : 'DEMO PREVIEW:'}
          </span>
          <span className="text-slate-200 truncate">
            {isLiveBackend
              ? 'Real Supabase PostgreSQL Database & Auth active. RLS enabled.'
              : 'Local demonstration mode. Connect real Supabase credentials anytime.'}
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-300">
          <span className="flex items-center space-x-1">
            <Database className="h-3 w-3 text-cyan-400" />
            <span>{isLiveBackend ? 'PostgreSQL Connected' : 'Local Demo'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Kochi Telematics Grid</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Left: Mobile Toggle & Page Header */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden border border-slate-200"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <MapPin className="h-3 w-3 text-blue-600" />
                <span>Kochi Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
          </div>
        </div>

        {/* Right: Actions (Simulation Toggle & Refresh) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live Simulation Button */}
          <button
            onClick={onToggleSimulation}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm cursor-pointer ${
              isSimulating
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 ring-2 ring-emerald-500/20'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title={isSimulating ? 'Pause live coordinate & speed updates' : 'Start live IoT packet simulation'}
          >
            {isSimulating ? (
              <>
                <Square className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                <span className="hidden sm:inline">Simulation:</span>
                <span className="font-bold text-emerald-700">ACTIVE</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-slate-500 text-slate-500" />
                <span className="hidden sm:inline">Live Stream:</span>
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={onRefreshData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
            title="Refresh telemetry snapshot"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Sync</span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({lastUpdated})</span>
          </button>

          {/* Realtime Status Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs border border-slate-200">
            <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">100% Up</span>
          </div>
        </div>
      </div>
    </header>
  );
};
