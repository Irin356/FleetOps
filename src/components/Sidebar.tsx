import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Route,
  AlertTriangle,
  Radio,
  X,
  Server,
  ShieldCheck,
  LogOut,
  Database,
} from 'lucide-react';

export type NavTab = 'overview' | 'vehicles' | 'trips' | 'alerts';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  vehicleCount: number;
  activeTripsCount: number;
  unreadAlertsCount: number;
  userEmail?: string | null;
  onSignOut?: () => void;
  isLiveBackend?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile,
  onCloseMobile,
  vehicleCount,
  activeTripsCount,
  unreadAlertsCount,
  userEmail,
  onSignOut,
  isLiveBackend = false,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'vehicles' as NavTab,
      label: 'Fleet Vehicles',
      icon: Truck,
      badge: vehicleCount.toString(),
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'trips' as NavTab,
      label: 'Trips & Dispatch',
      icon: Route,
      badge: `${activeTripsCount} Active`,
      badgeColor: 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
    },
    {
      id: 'alerts' as NavTab,
      label: 'Alert Queue',
      icon: AlertTriangle,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b1329] text-slate-200 border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/30">
              <Radio className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold tracking-tight text-white text-lg">FleetOps</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Fleet Management Dashboard</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations Console
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-4.5 w-4.5 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Operational Environment Info Card */}
          <div className="pt-6">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Gateway Status
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-2 text-slate-300 font-medium">
                  <Server className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Kochi Hub Edge</span>
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Latency</span>
                <span className="font-mono text-slate-200">22 ms</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>MQTT Broker</span>
                <span className="font-mono text-slate-200">bytebeam.io:8883</span>
              </div>
            </div>
          </div>
        </div>

        {/* User / Operator Card Footer */}
        <div className="border-t border-slate-800/80 p-4 bg-[#080e1e] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-blue-400 font-semibold border border-slate-700">
                {userEmail ? userEmail.slice(0, 2).toUpperCase() : 'FO'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {userEmail ? userEmail.split('@')[0] : 'Demo Operator'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {userEmail || 'demo-preview@fleetops.local'}
                </p>
              </div>
            </div>

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors cursor-pointer"
                title="Sign out of Supabase"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/60 text-slate-400">
            <span className="flex items-center space-x-1">
              <Database className="h-3 w-3 text-cyan-400" />
              <span>{isLiveBackend ? 'Supabase Live' : 'Demo Preview'}</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400 font-medium">
              <ShieldCheck className="h-3 w-3" />
              <span>RLS Active</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
