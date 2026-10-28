import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Navigation,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import type { FleetAlert, AlertSeverity } from '../types/fleet';

interface AlertQueueProps {
  alerts: FleetAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onSelectVehicleById: (vehicleId: string) => void;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  alerts,
  onAcknowledgeAlert,
  onSelectVehicleById,
}) => {
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    return severityFilter === 'all' || alert.severity === severityFilter;
  });

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertOctagon,
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-600',
          container: 'border-l-4 border-l-rose-600 bg-rose-50/20',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          container: 'border-l-4 border-l-amber-500 bg-amber-50/20',
        };
      case 'info':
        return {
          icon: Info,
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          container: 'border-l-4 border-l-blue-500 bg-blue-50/20',
        };
    }
  };

  const activeAlertsCount = alerts.filter((a) => !a.isAcknowledged).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Operational Alert Queue
            </h3>
            {activeAlertsCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                {activeAlertsCount} Unresolved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Automated sensor anomalies, geofence breaches, and thermal safety thresholds
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
          {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="divide-y divide-slate-100">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 p-4">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">All alerts cleared</p>
            <p className="text-xs text-slate-400 mt-0.5">No alerts match the selected criteria</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 ${
                  alert.isAcknowledged ? 'opacity-70 bg-slate-50/40' : style.container
                }`}
              >
                {/* Left: Icon & Alert Info */}
                <div className="flex items-start space-x-3.5">
                  <div className={`p-2 rounded-xl shrink-0 ${style.badge}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${style.badge}`}>
                        {alert.severity}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {alert.title}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {alert.vehiclePlate}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp}</span>
                      </span>
                      <span>•</span>
                      <span className="capitalize font-medium text-slate-500">
                        {alert.category}
                      </span>
                      {alert.isAcknowledged && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Acknowledged</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-start md:self-center pt-2 md:pt-0">
                  <button
                    onClick={() => onSelectVehicleById(alert.vehicleId)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Locate</span>
                  </button>

                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      alert.isAcknowledged
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{alert.isAcknowledged ? 'Resolved' : 'Acknowledge'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
