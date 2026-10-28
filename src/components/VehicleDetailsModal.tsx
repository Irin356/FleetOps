import React, { useState } from 'react';
import {
  X,
  Truck,
  Phone,
  MessageSquare,
  Navigation,
  Battery,
  Gauge,
  Thermometer,
  Disc,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { Vehicle } from '../types/fleet';

interface VehicleDetailsPanelProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onCenterOnMap: (vehicle: Vehicle) => void;
  onSimulatePing: (vehicleId: string) => void;
}

export const VehicleDetailsPanel: React.FC<VehicleDetailsPanelProps> = ({
  vehicle,
  onClose,
  onCenterOnMap,
  onSimulatePing,
}) => {
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!vehicle) return null;

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const isTempCritical = vehicle.telemetry.engineTemp > 90;
  const isBatteryLow = vehicle.telemetry.batteryLevel < 20;

  return (
    <>
      {/* Mobile Backdrop - clicking backdrop closes drawer */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300 animate-in slide-in-from-right">
        {/* Action Notification Toast */}
        {actionNotice && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center justify-between animate-fade-in border border-slate-700">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                    {vehicle.plateNumber}
                  </h3>
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      vehicle.status === 'moving'
                        ? 'bg-emerald-100 text-emerald-800'
                        : vehicle.status === 'alert'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : vehicle.status === 'idle'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{vehicle.name} • {vehicle.type}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
              aria-label="Close vehicle details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Action Toolbar */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => {
                onCenterOnMap(vehicle);
                triggerNotice('Map centered on ' + vehicle.plateNumber);
              }}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors border border-blue-200 cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Center Map</span>
            </button>

            <button
              onClick={() => {
                onSimulatePing(vehicle.id);
                triggerNotice('Simulated IoT packet for ' + vehicle.id);
              }}
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-300 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Simulate Ping</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 pb-8 sm:pb-6">
          {/* Driver Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Assigned Operator
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                  {vehicle.driver.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{vehicle.driver.name}</p>
                  <p className="text-xs text-slate-500 truncate">{vehicle.driver.phone}</p>
                </div>
              </div>

              <div className="flex space-x-1.5 shrink-0">
                <a
                  href={`tel:${vehicle.driver.phone}`}
                  onClick={() => triggerNotice(`Opening dialer for ${vehicle.driver.name}`)}
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  title="Call driver"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <button
                  onClick={() => triggerNotice(`Dispatch message sent to ${vehicle.driver.name}`)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                  title="Send message"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Telemetry Metric Cards Grid */}
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Realtime IoT Telemetry
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* Speed */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Speed</span>
                  <Gauge className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">
                  {vehicle.telemetry.speed} <span className="text-xs text-slate-500 font-normal">km/h</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Limit: 60 km/h
                </div>
              </div>

              {/* Battery / SOC */}
              <div className={`p-3 sm:p-3.5 rounded-xl border ${isBatteryLow ? 'bg-rose-50 border-rose-300' : 'bg-slate-50/60 border-slate-200'}`}>
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Battery</span>
                  <Battery className={`h-4 w-4 ${isBatteryLow ? 'text-rose-600' : 'text-emerald-600'}`} />
                </div>
                <div className={`text-lg sm:text-xl font-bold ${isBatteryLow ? 'text-rose-700' : 'text-slate-900'}`}>
                  {vehicle.telemetry.batteryLevel}%
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  Range: {vehicle.telemetry.estimatedRangeKm} km
                </div>
              </div>

              {/* Inverter Temp */}
              <div className={`p-3 sm:p-3.5 rounded-xl border ${isTempCritical ? 'bg-rose-50 border-rose-300' : 'bg-slate-50/60 border-slate-200'}`}>
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Inverter Temp</span>
                  <Thermometer className={`h-4 w-4 ${isTempCritical ? 'text-rose-600' : 'text-slate-600'}`} />
                </div>
                <div className={`text-lg sm:text-xl font-bold ${isTempCritical ? 'text-rose-700' : 'text-slate-900'}`}>
                  {vehicle.telemetry.engineTemp}°C
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {isTempCritical ? 'Warning: High Temp' : 'Normal Range'}
                </div>
              </div>

              {/* Tire Pressure */}
              <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Tire Pressure</span>
                  <Disc className="h-4 w-4 text-slate-600" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">
                  {vehicle.telemetry.tirePressure} <span className="text-xs text-slate-500 font-normal">PSI</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  4 Wheels Balanced
                </div>
              </div>
            </div>
          </div>

          {/* Location & GPS Diagnostics */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-sm space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Location Diagnostics
            </span>
            <div className="flex items-start space-x-2.5">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 text-xs truncate">{vehicle.location.address}</p>
                <p className="text-[11px] text-slate-500 truncate">{vehicle.location.zone}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Coordinates</span>
              <span className="font-mono text-slate-800 font-medium text-[11px]">
                {vehicle.location.lat.toFixed(4)}° N, {vehicle.location.lng.toFixed(4)}° E
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Heartbeat</span>
              <span className="font-medium text-emerald-600 flex items-center space-x-1">
                <Radio className="h-3 w-3 animate-pulse" />
                <span>{vehicle.location.lastPing}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Odometer</span>
              <span className="font-semibold text-slate-900 font-mono text-[11px]">
                {vehicle.telemetry.odometerKm.toLocaleString()} km
              </span>
            </div>
          </div>

          {/* Emergency Dispatch Button */}
          <button
            onClick={() => triggerNotice(`Notice logged for ${vehicle.plateNumber}: Operations supervisor alerted`)}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Dispatch Fleet Maintenance Alert</span>
          </button>
        </div>
      </div>
    </>
  );
};
