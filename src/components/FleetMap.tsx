import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Vehicle, VehicleStatus } from '../types/fleet';
import {
  Navigation,
  Battery,
  Gauge,
  Compass,
  Eye,
} from 'lucide-react';

interface FleetMapProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  statusFilter: VehicleStatus | 'all';
  onFilterChange: (status: VehicleStatus | 'all') => void;
  activeRoute?: [number, number][];
}

// Controller component to smoothly re-center map when a vehicle is selected
const MapController: React.FC<{ targetCoords: [number, number] | null }> = ({
  targetCoords,
}) => {
  const map = useMap();

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 14, {
        duration: 1.2,
      });
    }
  }, [targetCoords, map]);

  return null;
};

// Reset View Helper Button on Map
const ResetViewButton: React.FC<{ defaultCoords: [number, number]; defaultZoom: number }> = ({
  defaultCoords,
  defaultZoom,
}) => {
  const map = useMap();

  return (
    <button
      onClick={() => map.flyTo(defaultCoords, defaultZoom, { duration: 1 })}
      className="leaflet-control bg-white/95 backdrop-blur text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg shadow-md border border-slate-300 text-[11px] sm:text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-slate-50 transition-colors"
      title="Reset view to central Kochi"
    >
      <Compass className="h-3.5 w-3.5 text-blue-600 shrink-0" />
      <span className="hidden xs:inline">Reset</span>
      <span className="hidden sm:inline">to Kochi</span>
    </button>
  );
};

export const FleetMap: React.FC<FleetMapProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  statusFilter,
  onFilterChange,
  activeRoute,
}) => {
  const KOCHI_CENTER: [number, number] = [9.975, 76.295];
  const DEFAULT_ZOOM = 12;

  // Filter vehicles according to active filter
  const displayedVehicles = vehicles.filter(
    (v) => statusFilter === 'all' || v.status === statusFilter
  );

  // Generate customized L.divIcon based on vehicle status
  const createVehicleIcon = (vehicle: Vehicle, isSelected: boolean) => {
    let bgClass = 'bg-slate-500';
    let pulseClass = '';

    switch (vehicle.status) {
      case 'moving':
        bgClass = 'bg-emerald-500';
        pulseClass = '<div class="absolute -inset-1 rounded-full bg-emerald-400 opacity-60 animate-ping"></div>';
        break;
      case 'idle':
        bgClass = 'bg-amber-500';
        break;
      case 'alert':
        bgClass = 'bg-rose-600';
        pulseClass = '<div class="absolute -inset-1.5 rounded-full bg-rose-500 opacity-75 animate-ping"></div>';
        break;
      case 'offline':
        bgClass = 'bg-slate-600';
        break;
    }

    const selectedRing = isSelected
      ? 'ring-4 ring-blue-500 ring-offset-2 scale-125 z-50'
      : '';

    const html = `
      <div class="relative flex items-center justify-center transition-transform cursor-pointer ${selectedRing}">
        ${pulseClass}
        <div class="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full ${bgClass} text-white shadow-lg border-2 border-white flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
          ${
            vehicle.status === 'moving'
              ? '▶'
              : vehicle.status === 'alert'
              ? '!'
              : vehicle.status === 'idle'
              ? '❚❚'
              : '✕'
          }
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-fleet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[500px] xl:h-[540px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100">
      {/* Map Header Overlay with status filters (scrollable on mobile) */}
      <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-xl border border-slate-200 shadow-md max-w-[calc(100%-80px)] sm:max-w-none overflow-x-auto">
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1.5 hidden sm:inline">
          Filter:
        </span>
        {(['all', 'moving', 'idle', 'alert', 'offline'] as const).map((st) => (
          <button
            key={st}
            onClick={() => onFilterChange(st)}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold capitalize transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Map Active Assets Counter Overlay (Tablet & Desktop) */}
      <div className="absolute top-2.5 right-2.5 z-[1000] hidden md:flex items-center space-x-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-slate-800">
          {displayedVehicles.length} / {vehicles.length} Units Visible
        </span>
      </div>

      {/* Actual React Leaflet Map */}
      <MapContainer
        center={KOCHI_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Map FlyTo controller */}
        <MapController
          targetCoords={
            selectedVehicle
              ? [selectedVehicle.location.lat, selectedVehicle.location.lng]
              : null
          }
        />

        {/* Active Route Breadcrumb Trail from PostgreSQL trip_points */}
        {activeRoute && activeRoute.length > 0 && (
          <Polyline
            positions={activeRoute}
            pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.85, dashArray: '6, 8' }}
          />
        )}

        {/* Custom Reset View Control in top-right */}
        <div className="leaflet-top leaflet-right" style={{ marginTop: '56px', marginRight: '10px' }}>
          <ResetViewButton defaultCoords={KOCHI_CENTER} defaultZoom={DEFAULT_ZOOM} />
        </div>

        {/* Plot Vehicle Markers */}
        {displayedVehicles.map((vehicle) => {
          const isSelected = selectedVehicle?.id === vehicle.id;
          const icon = createVehicleIcon(vehicle, isSelected);

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.location.lat, vehicle.location.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectVehicle(vehicle),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 min-w-[200px] sm:min-w-[220px]">
                  {/* Popup Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {vehicle.plateNumber}
                      </h4>
                      <p className="text-[11px] text-slate-500">{vehicle.name}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        vehicle.status === 'moving'
                          ? 'bg-emerald-100 text-emerald-800'
                          : vehicle.status === 'alert'
                          ? 'bg-rose-100 text-rose-800'
                          : vehicle.status === 'idle'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </div>

                  {/* Telemetry Snapshot */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-500">
                        <Gauge className="h-3.5 w-3.5 mr-1 text-blue-500" />
                        Speed:
                      </span>
                      <span className="font-semibold text-slate-900">
                        {vehicle.telemetry.speed} km/h
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-500">
                        <Battery className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                        Battery:
                      </span>
                      <span className="font-semibold text-slate-900">
                        {vehicle.telemetry.batteryLevel}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-slate-500">
                        <Navigation className="h-3.5 w-3.5 mr-1 text-slate-400" />
                        Driver:
                      </span>
                      <span className="font-medium text-slate-800">
                        {vehicle.driver.name}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 italic truncate max-w-[200px]">
                      {vehicle.location.address}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectVehicle(vehicle)}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Open Telemetry Panel</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
