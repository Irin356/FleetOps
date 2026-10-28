-- ==============================================================================
-- BYTEBEAM FLEETOPS - STAGE 2 POSTGRESQL DATABASE SCHEMA
-- Migration: 01_initial_schema.sql
-- Description: Creates drivers, vehicles, trips, ordered trip points, and alerts
--              with Row Level Security (RLS) policies.
-- ==============================================================================

-- 1. Enable UUID Extension (standard in PostgreSQL / Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(120) UNIQUE,
    license_number VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'VH-101'
    name VARCHAR(120) NOT NULL,
    plate_number VARCHAR(30) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (
        vehicle_type IN ('Electric Van', 'Heavy Cargo Truck', 'Reefer Truck', 'Delivery Scooter', 'Utility Pickup')
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'idle' CHECK (
        status IN ('moving', 'idle', 'offline', 'alert')
    ),
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    address TEXT NOT NULL,
    zone VARCHAR(100) NOT NULL,
    speed NUMERIC(5, 1) DEFAULT 0.0 NOT NULL,
    battery_level INTEGER NOT NULL CHECK (battery_level >= 0 AND battery_level <= 100),
    fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    engine_temp NUMERIC(5, 1) DEFAULT 40.0 NOT NULL,
    tire_pressure NUMERIC(4, 1) DEFAULT 32.0 NOT NULL,
    odometer_km NUMERIC(10, 1) DEFAULT 0.0 NOT NULL,
    estimated_range_km INTEGER NOT NULL,
    last_ping TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'TRP-801'
    vehicle_id VARCHAR(50) REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    origin VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    distance_km NUMERIC(6, 2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    avg_speed_kmh NUMERIC(5, 1) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (
        status IN ('in_progress', 'completed')
    ),
    start_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. ORDERED TRIP POINTS TABLE (GPS Breadcrumb Trail)
CREATE TABLE IF NOT EXISTS public.trip_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id VARCHAR(50) REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    sequence_order INTEGER NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(trip_id, sequence_order)
);

-- 6. VEHICLE ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.vehicle_alerts (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'ALT-301'
    vehicle_id VARCHAR(50) REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (
        severity IN ('critical', 'warning', 'info')
    ),
    category VARCHAR(50) NOT NULL CHECK (
        category IN ('temperature', 'battery', 'geofence', 'speed', 'maintenance')
    ),
    is_acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON public.vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON public.trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_trip_points_trip_seq ON public.trip_points(trip_id, sequence_order);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_id ON public.vehicle_alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_ack ON public.vehicle_alerts(is_acknowledged);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all operational tables
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_alerts ENABLE ROW LEVEL SECURITY;

-- DRIVERS POLICIES
-- Allow authenticated users to view all drivers
CREATE POLICY "Allow authenticated read drivers"
    ON public.drivers FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert/update drivers
CREATE POLICY "Allow authenticated manage drivers"
    ON public.drivers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- VEHICLES POLICIES
-- Allow authenticated users to read vehicles
CREATE POLICY "Allow authenticated read vehicles"
    ON public.vehicles FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated operators to update vehicle telemetry & status
CREATE POLICY "Allow authenticated update vehicles"
    ON public.vehicles FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated operators to register new vehicles
CREATE POLICY "Allow authenticated insert vehicles"
    ON public.vehicles FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- TRIPS POLICIES
CREATE POLICY "Allow authenticated read trips"
    ON public.trips FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated manage trips"
    ON public.trips FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- TRIP POINTS POLICIES
CREATE POLICY "Allow authenticated read trip_points"
    ON public.trip_points FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert trip_points"
    ON public.trip_points FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- VEHICLE ALERTS POLICIES
CREATE POLICY "Allow authenticated read vehicle_alerts"
    ON public.vehicle_alerts FOR SELECT
    TO authenticated
    USING (true);

-- Allow operators to acknowledge alerts (update is_acknowledged)
CREATE POLICY "Allow authenticated update vehicle_alerts"
    ON public.vehicle_alerts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated insert vehicle_alerts"
    ON public.vehicle_alerts FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- (Optional) If you also want anonymous read access during development before login:
-- You can run the following lines in SQL editor if desired:
CREATE POLICY "Allow anon read vehicles for preview" ON public.vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read drivers for preview" ON public.drivers FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read trips for preview" ON public.trips FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read trip_points for preview" ON public.trip_points FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read vehicle_alerts for preview" ON public.vehicle_alerts FOR SELECT TO anon USING (true);
