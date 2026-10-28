import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Truck,
  ChevronRight,
  MapPin,
  Phone,
  Zap,
  Gauge,
} from 'lucide-react';
import type { Vehicle, VehicleStatus, VehicleType } from '../types/fleet';

interface VehicleTableProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  statusFilter: VehicleStatus | 'all';
  onStatusFilterChange: (status: VehicleStatus | 'all') => void;
}

type SortField = 'plateNumber' | 'speed' | 'batteryLevel' | 'status';
type SortOrder = 'asc' | 'desc';

export const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('speed');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Available vehicle types for filtering
  const vehicleTypes: (VehicleType | 'all')[] = [
    'all',
    'Electric Van',
    'Heavy Cargo Truck',
    'Reefer Truck',
    'Delivery Scooter',
    'Utility Pickup',
  ];

  // Filtering logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesType = selectedType === 'all' || v.type === selectedType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.plateNumber.toLowerCase().includes(q) ||
      v.name.toLowerCase().includes(q) ||
      v.driver.name.toLowerCase().includes(q) ||
      v.location.address.toLowerCase().includes(q) ||
      v.location.zone.toLowerCase().includes(q);

    return matchesStatus && matchesType && matchesSearch;
  });

  // Sorting logic
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'plateNumber') {
      comparison = a.plateNumber.localeCompare(b.plateNumber);
    } else if (sortField === 'speed') {
      comparison = a.telemetry.speed - b.telemetry.speed;
    } else if (sortField === 'batteryLevel') {
      comparison = a.telemetry.batteryLevel - b.telemetry.batteryLevel;
    } else if (sortField === 'status') {
      comparison = a.status.localeCompare(b.status);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'moving':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="capitalize">Moving</span>
          </span>
        );
      case 'idle':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500" />
            <span className="capitalize">Idle</span>
          </span>
        );
      case 'alert':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-rose-600 animate-ping" />
            <span className="capitalize">Alert</span>
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-slate-400" />
            <span className="capitalize">Offline</span>
          </span>
        );
    }
  };

  const getBatteryColor = (level: number) => {
    if (level < 20) return 'bg-rose-500 text-rose-700';
    if (level < 40) return 'bg-amber-500 text-amber-700';
    return 'bg-emerald-500 text-emerald-700';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header & Filter Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Monitored Fleet Assets
            </h3>
            <p className="text-xs text-slate-500">
              Showing {sortedVehicles.length} of {vehicles.length} units in Kochi region
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search plate, driver, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          {/* Status Tabs (horizontally scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center shrink-0">
              <Filter className="h-3 w-3 mr-1" /> Status:
            </span>
            {(['all', 'moving', 'idle', 'alert', 'offline'] as const).map((st) => (
              <button
                key={st}
                onClick={() => onStatusFilterChange(st)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type Dropdown Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer w-full sm:w-auto"
            >
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Vehicle Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 1. MOBILE ANDROID VIEW (Card Grid - shown only on mobile < md) */}
      {/* --------------------------------------------------------------------- */}
      <div className="block md:hidden divide-y divide-slate-100">
        {sortedVehicles.length === 0 ? (
          <div className="py-12 text-center text-slate-400 p-4">
            <Truck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No vehicles match filters</p>
            <p className="text-xs text-slate-400 mt-0.5">Try resetting the status filter or clearing search</p>
          </div>
        ) : (
          sortedVehicles.map((vehicle) => {
            const isSelected = selectedVehicle?.id === vehicle.id;
            return (
              <div
                key={vehicle.id}
                onClick={() => onSelectVehicle(vehicle)}
                className={`p-4 transition-colors cursor-pointer active:bg-blue-50/70 ${
                  isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Header: Plate & Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                        <span>{vehicle.plateNumber}</span>
                        {vehicle.activeAlertCount > 0 && (
                          <span
                            className="h-2 w-2 rounded-full bg-rose-500 animate-ping"
                            title={`${vehicle.activeAlertCount} active alert`}
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{vehicle.name} • {vehicle.type}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(vehicle.status)}</div>
                </div>

                {/* Driver & Location */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 my-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Driver</span>
                    <span className="font-semibold text-slate-800 truncate block">{vehicle.driver.name}</span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Phone className="h-2.5 w-2.5" />
                      <span>{vehicle.driver.phone}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Zone</span>
                    <span className="font-semibold text-slate-800 truncate block flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                      <span className="truncate">{vehicle.location.zone}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">{vehicle.location.address}</span>
                  </div>
                </div>

                {/* Telemetry Metrics & Tap Action */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Speed</span>
                      <span className="font-bold text-slate-900 text-xs flex items-center space-x-0.5">
                        <Gauge className="h-3 w-3 text-blue-500" />
                        <span>{vehicle.telemetry.speed} km/h</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Battery / Range</span>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span className="font-bold text-slate-900 text-xs">{vehicle.telemetry.batteryLevel}%</span>
                        <span className="text-[10px] text-slate-400">({vehicle.telemetry.estimatedRangeKm} km)</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-blue-600 flex items-center">
                    <span>Inspect</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. PC / TABLET DESKTOP TABLE VIEW (shown on md:block and above) */}
      {/* --------------------------------------------------------------------- */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th
                onClick={() => toggleSort('plateNumber')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center space-x-1">
                  <span>Vehicle & Model</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Driver</th>
              <th
                onClick={() => toggleSort('status')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('speed')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center space-x-1">
                  <span>Speed</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('batteryLevel')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center space-x-1">
                  <span>Battery / Fuel</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3.5 px-4">Location / Zone</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {sortedVehicles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">No vehicles match filters</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try resetting the status filter or clearing your search</p>
                </td>
              </tr>
            ) : (
              sortedVehicles.map((vehicle) => {
                const isSelected = selectedVehicle?.id === vehicle.id;
                return (
                  <tr
                    key={vehicle.id}
                    onClick={() => onSelectVehicle(vehicle)}
                    className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    {/* Vehicle & Model */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 shrink-0">
                          <Truck className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{vehicle.plateNumber}</span>
                            {vehicle.activeAlertCount > 0 && (
                              <span
                                className="h-2 w-2 rounded-full bg-rose-500 animate-ping"
                                title={`${vehicle.activeAlertCount} active alert`}
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{vehicle.name} • {vehicle.type}</p>
                        </div>
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{vehicle.driver.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Phone className="h-2.5 w-2.5" />
                        <span>{vehicle.driver.phone}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">{getStatusBadge(vehicle.status)}</td>

                    {/* Speed */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {vehicle.telemetry.speed}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">km/h</span>
                      </div>
                    </td>

                    {/* Battery */}
                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span className="flex items-center space-x-1">
                          <Zap className="h-3 w-3 text-amber-500" />
                          <span>{vehicle.telemetry.batteryLevel}%</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {vehicle.telemetry.estimatedRangeKm} km
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getBatteryColor(
                            vehicle.telemetry.batteryLevel
                          )}`}
                          style={{ width: `${vehicle.telemetry.batteryLevel}%` }}
                        />
                      </div>
                    </td>

                    {/* Zone / Location */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="flex items-center space-x-1 text-slate-900 font-medium truncate">
                        <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                        <span className="truncate">{vehicle.location.zone}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{vehicle.location.address}</p>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(vehicle);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
