import React from 'react';
import { Truck, Navigation, Clock, WifiOff, AlertOctagon, ChevronRight } from 'lucide-react';
import type { FleetStats, VehicleStatus } from '../types/fleet';

interface StatsOverviewProps {
  stats: FleetStats;
  selectedFilter: VehicleStatus | 'all';
  onSelectFilter: (filter: VehicleStatus | 'all') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  selectedFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'all' as const,
      label: 'Total Fleet',
      count: stats.total,
      sublabel: 'All monitored units',
      icon: Truck,
      color: 'blue',
      borderActive: 'border-blue-500 ring-2 ring-blue-500/20',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'moving' as const,
      label: 'Moving',
      fullLabel: 'Moving & In-Transit',
      count: stats.moving,
      sublabel: 'Active on road',
      icon: Navigation,
      color: 'emerald',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'idle' as const,
      label: 'Idle',
      fullLabel: 'Idle & Standby',
      count: stats.idle,
      sublabel: 'Stationary / parked',
      icon: Clock,
      color: 'amber',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'offline' as const,
      label: 'Offline',
      fullLabel: 'Offline / No Signal',
      count: stats.offline,
      sublabel: 'Heartbeat timeout',
      icon: WifiOff,
      color: 'slate',
      borderActive: 'border-slate-500 ring-2 ring-slate-500/20',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
      iconBg: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'alert' as const,
      label: 'Attention Needed',
      fullLabel: 'Attention Required',
      count: stats.attentionRequired,
      sublabel: 'Critical sensor alerts',
      icon: AlertOctagon,
      color: 'rose',
      borderActive: 'border-rose-500 ring-2 ring-rose-500/20',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <section aria-label="Fleet Summary Metrics">
      {/* Responsive Grid: 2 columns on Android/phone, 3 on tablet, 5 on desktop PC */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isSelected = selectedFilter === card.id;
          const isFifthCard = index === 4;

          return (
            <button
              key={card.id}
              onClick={() => onSelectFilter(card.id)}
              className={`text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 shadow-sm cursor-pointer group hover:shadow-md ${
                isFifthCard ? 'col-span-2 sm:col-span-1' : 'col-span-1'
              } ${
                isSelected
                  ? `${card.borderActive} bg-blue-50/40`
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl ${card.iconBg} transition-transform group-hover:scale-105 shrink-0`}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 flex items-center">
                  Filter
                  <ChevronRight className="h-3 w-3 ml-0.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-0.5 sm:mt-1">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  {card.count}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${card.badgeColor}`}>
                  {card.id}
                </span>
              </div>

              <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                <span className="sm:hidden">{card.label}</span>
                <span className="hidden sm:inline">{card.fullLabel}</span>
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                {card.sublabel}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
