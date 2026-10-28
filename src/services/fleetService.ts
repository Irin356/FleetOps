import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Vehicle, FleetAlert, Trip, FleetStats } from '../types/fleet';

export interface FleetPayload {
  vehicles: Vehicle[];
  trips: Trip[];
  alerts: FleetAlert[];
  stats: FleetStats;
}

/**
 * Transforms Supabase database rows into frontend TypeScript Vehicle models
 */
const mapDatabaseVehicle = (row: any): Vehicle => {
  return {
    id: row.id,
    name: row.name,
    plateNumber: row.plate_number,
    type: row.vehicle_type,
    status: row.status,
    driver: {
      name: row.driver?.name || 'Unassigned Driver',
      phone: row.driver?.phone || 'N/A',
      avatar: row.driver?.avatar_url,
    },
    location: {
      lat: Number(row.lat),
      lng: Number(row.lng),
      address: row.address,
      zone: row.zone,
      lastPing: formatTimeAgo(row.last_ping),
    },
    telemetry: {
      speed: Number(row.speed || 0),
      batteryLevel: Number(row.battery_level || 0),
      fuelLevel: row.fuel_level ? Number(row.fuel_level) : undefined,
      engineTemp: Number(row.engine_temp || 40),
      tirePressure: Number(row.tire_pressure || 32),
      odometerKm: Number(row.odometer_km || 0),
      estimatedRangeKm: Number(row.estimated_range_km || 0),
    },
    activeAlertCount: 0, // calculated from alerts join
  };
};

/**
 * Transforms Supabase trip records into frontend Trip models
 */
const mapDatabaseTrip = (row: any, vehiclePlate: string, driverName: string): Trip => {
  const start = new Date(row.start_time);
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehiclePlate,
    driverName,
    origin: row.origin,
    destination: row.destination,
    distanceKm: Number(row.distance_km || 0),
    durationMinutes: Number(row.duration_minutes || 0),
    avgSpeedKmH: Number(row.avg_speed_kmh || 0),
    status: row.status,
    startTime: isNaN(start.getTime()) ? row.start_time : start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    endTime: row.end_time ? new Date(row.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
  };
};

/**
 * Transforms Supabase alert records into frontend FleetAlert models
 */
const mapDatabaseAlert = (row: any, vehiclePlate: string): FleetAlert => {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehiclePlate,
    title: row.title,
    description: row.description,
    severity: row.severity,
    category: row.category,
    isAcknowledged: Boolean(row.is_acknowledged),
    timestamp: formatTimeAgo(row.created_at),
  };
};

/**
 * Relative time formatter for telematics timestamps
 */
function formatTimeAgo(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Fetches real Fleet data from Supabase PostgreSQL tables
 */
export const fetchFleetDataFromSupabase = async (): Promise<FleetPayload> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase project credentials not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  // 1. Query Vehicles joined with Driver
  const { data: rawVehicles, error: vehiclesError } = await supabase
    .from('vehicles')
    .select(`
      *,
      driver:drivers (
        id,
        name,
        phone,
        email,
        avatar_url
      )
    `)
    .order('id', { ascending: true });

  if (vehiclesError) {
    throw new Error(`Failed to load vehicles from Supabase: ${vehiclesError.message}`);
  }

  // 2. Query Alerts
  const { data: rawAlerts, error: alertsError } = await supabase
    .from('vehicle_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (alertsError) {
    throw new Error(`Failed to load alerts from Supabase: ${alertsError.message}`);
  }

  // 3. Query Trips joined with Driver
  const { data: rawTrips, error: tripsError } = await supabase
    .from('trips')
    .select(`
      *,
      driver:drivers (
        name
      )
    `)
    .order('start_time', { ascending: false });

  if (tripsError) {
    throw new Error(`Failed to load trips from Supabase: ${tripsError.message}`);
  }

  // Map database records into frontend models
  const vehiclesMap = new Map<string, any>();
  rawVehicles.forEach((v) => vehiclesMap.set(v.id, v));

  const alerts: FleetAlert[] = (rawAlerts || []).map((a) => {
    const v = vehiclesMap.get(a.vehicle_id);
    return mapDatabaseAlert(a, v ? v.plate_number : a.vehicle_id);
  });

  const vehicles: Vehicle[] = (rawVehicles || []).map((v) => {
    const mapped = mapDatabaseVehicle(v);
    mapped.activeAlertCount = alerts.filter((a) => a.vehicleId === v.id && !a.isAcknowledged).length;
    return mapped;
  });

  const trips: Trip[] = (rawTrips || []).map((t) => {
    const v = vehiclesMap.get(t.vehicle_id);
    const driverName = t.driver?.name || (v?.driver?.name) || 'Fleet Operator';
    return mapDatabaseTrip(t, v ? v.plate_number : t.vehicle_id, driverName);
  });

  // Calculate live statistics dynamically from actual records
  const stats: FleetStats = {
    total: vehicles.length,
    moving: vehicles.filter((v) => v.status === 'moving').length,
    idle: vehicles.filter((v) => v.status === 'idle').length,
    offline: vehicles.filter((v) => v.status === 'offline').length,
    attentionRequired: alerts.filter((a) => !a.isAcknowledged).length,
  };

  return { vehicles, trips, alerts, stats };
};

/**
 * Fetches ordered breadcrumb GPS points for route visualization
 */
export const fetchTripRoutePoints = async (tripId: string): Promise<[number, number][]> => {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('trip_points')
    .select('lat, lng')
    .eq('trip_id', tripId)
    .order('sequence_order', { ascending: true });

  if (error || !data) {
    console.error(`Error loading route points for ${tripId}:`, error);
    return [];
  }

  return data.map((pt) => [Number(pt.lat), Number(pt.lng)]);
};

/**
 * Updates alert acknowledgment in Supabase PostgreSQL
 */
export const updateAlertAcknowledgmentInSupabase = async (
  alertId: string,
  isAcknowledged: boolean
): Promise<void> => {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase
    .from('vehicle_alerts')
    .update({ is_acknowledged: isAcknowledged })
    .eq('id', alertId);

  if (error) {
    throw new Error(`Failed to update alert: ${error.message}`);
  }
};

/**
 * Updates live telemetry / ping in Supabase PostgreSQL
 */
export const updateVehiclePingInSupabase = async (
  vehicleId: string,
  updates: { lat?: number; lng?: number; speed?: number }
): Promise<void> => {
  if (!isSupabaseConfigured) return;

  const payload: any = {
    last_ping: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (updates.lat !== undefined) payload.lat = updates.lat;
  if (updates.lng !== undefined) payload.lng = updates.lng;
  if (updates.speed !== undefined) payload.speed = updates.speed;

  const { error } = await supabase
    .from('vehicles')
    .update(payload)
    .eq('id', vehicleId);

  if (error) {
    console.error(`Failed to push telemetry ping for ${vehicleId}:`, error);
  }
};
