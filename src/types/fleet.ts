export type VehicleStatus = 'moving' | 'idle' | 'offline' | 'alert';

export type VehicleType = 'Electric Van' | 'Heavy Cargo Truck' | 'Reefer Truck' | 'Delivery Scooter' | 'Utility Pickup';

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: VehicleType;
  status: VehicleStatus;
  driver: {
    name: string;
    phone: string;
    avatar?: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    zone: string;
    lastPing: string;
  };
  telemetry: {
    speed: number; // km/h
    batteryLevel: number; // 0-100%
    fuelLevel?: number; // 0-100%
    engineTemp: number; // °C
    tirePressure: number; // PSI
    odometerKm: number;
    estimatedRangeKm: number;
  };
  activeAlertCount: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface FleetAlert {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  isAcknowledged: boolean;
  category: 'temperature' | 'battery' | 'geofence' | 'speed' | 'maintenance';
}

export interface Trip {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMinutes: number;
  avgSpeedKmH: number;
  status: 'in_progress' | 'completed';
  startTime: string;
  endTime?: string;
  routeCoordinates?: [number, number][];
}

export interface FleetStats {
  total: number;
  moving: number;
  idle: number;
  offline: number;
  attentionRequired: number;
}
