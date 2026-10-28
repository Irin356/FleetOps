import React, { useState } from 'react';
import { Route, ArrowRight, MapPin } from 'lucide-react';
import type { Trip, Vehicle } from '../types/fleet';

interface TripsListProps {
  trips: Trip[];
  vehicles: Vehicle[];
  onSelectVehicleById: (vehicleId: string) => void;
  onViewRoute?: (tripId: string) => void;
  activeRouteTripId?: string | null;
}

export const TripsList: React.FC<TripsListProps> = ({
  trips,
  vehicles,
  onSelectVehicleById,
  onViewRoute,
  activeRouteTripId,
}) => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filteredTrips = trips.filter(
    (t) => filter === 'all' || t.status === filter
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Route className="h-5 w-5 text-blue-600" />
            <span>Recent Trips & Dispatch Operations</span>
          </h3>
          <p className="text-xs text-slate-500">
            Logistics corridors across Kochi Metro & Cochin Port industrial belts
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          {(['all', 'in_progress', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                filter === st
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'in_progress' ? 'Active' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid / List */}
      <div className="divide-y divide-slate-100">
        {filteredTrips.map((trip) => {
          const vehicle = vehicles.find((v) => v.id === trip.vehicleId);

          return (
            <div
              key={trip.id}
              className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Trip Route Details */}
              <div className="flex items-start space-x-3.5">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    trip.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-600 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  <Route className="h-5 w-5" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {trip.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        trip.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {trip.status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                    {vehicle && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        Live: {vehicle.telemetry.speed} km/h
                      </span>
                    )}
                  </div>

                  {/* Origin to Destination */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-800 pt-0.5">
                    <span className="flex items-center text-slate-700">
                      <MapPin className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                      <span>{trip.origin}</span>
                    </span>
                    <ArrowRight className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="text-blue-900 font-bold">{trip.destination}</span>
                  </div>

                  {/* Driver & Plate */}
                  <p className="text-[11px] text-slate-500 truncate">
                    Vehicle: <span className="font-semibold text-slate-700">{trip.vehiclePlate}</span> • Driver: {trip.driverName}
                  </p>
                </div>
              </div>

              {/* Metrics & Actions */}
              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold text-slate-900">{trip.distanceKm} km</p>
                    <p className="text-[10px] text-slate-400">Distance</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold text-slate-900">{trip.durationMinutes}m</p>
                    <p className="text-[10px] text-slate-400">Duration</p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold text-slate-900">{trip.avgSpeedKmH} km/h</p>
                    <p className="text-[10px] text-slate-400">Avg Speed</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full xs:w-auto justify-end">
                  {onViewRoute && (
                    <button
                      onClick={() => onViewRoute(trip.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                        activeRouteTripId === trip.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {activeRouteTripId === trip.id ? 'Route Visible' : 'Show Route'}
                    </button>
                  )}

                  <button
                    onClick={() => onSelectVehicleById(trip.vehicleId)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-semibold text-xs transition-colors border border-blue-200 hover:border-transparent shrink-0 cursor-pointer"
                  >
                    Locate
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
