import React from 'react';
import { LayoutDashboard, Truck, Route, AlertTriangle } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  vehicleCount: number;
  unreadAlertsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  vehicleCount,
  unreadAlertsCount,
}) => {
  const tabs = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'vehicles' as NavTab,
      label: 'Vehicles',
      icon: Truck,
      badge: vehicleCount > 0 ? vehicleCount : null,
    },
    {
      id: 'trips' as NavTab,
      label: 'Trips',
      icon: Route,
      badge: null,
    },
    {
      id: 'alerts' as NavTab,
      label: 'Alerts',
      icon: AlertTriangle,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden shadow-lg safe-bottom"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110 text-blue-600 stroke-[2.2]' : 'text-slate-500'
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2 text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center ${
                      tab.id === 'alerts'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
