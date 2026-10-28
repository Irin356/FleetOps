-- ==============================================================================
-- BYTEBEAM FLEETOPS - POSTGRESQL COMPLETE SETUP SCRIPT
-- Paste into Supabase SQL Editor, press Ctrl+A (select all), and click "Run".
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean previous tables if they exist
DROP TABLE IF EXISTS public.trip_points CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.vehicle_alerts CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;

-- 3. DRIVERS TABLE
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(120) UNIQUE,
    license_number VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. VEHICLES TABLE
CREATE TABLE public.vehicles (
    id VARCHAR(50) PRIMARY KEY,
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

-- 5. TRIPS TABLE
CREATE TABLE public.trips (
    id VARCHAR(50) PRIMARY KEY,
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

-- 6. ORDERED TRIP POINTS TABLE
CREATE TABLE public.trip_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id VARCHAR(50) REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    sequence_order INTEGER NOT NULL,
    lat NUMERIC(9, 6) NOT NULL,
    lng NUMERIC(9, 6) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(trip_id, sequence_order)
);

-- 7. VEHICLE ALERTS TABLE
CREATE TABLE public.vehicle_alerts (
    id VARCHAR(50) PRIMARY KEY,
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

-- 8. INDEXES
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_vehicles_driver_id ON public.vehicles(driver_id);
CREATE INDEX idx_trips_vehicle_id ON public.trips(vehicle_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_trip_points_trip_seq ON public.trip_points(trip_id, sequence_order);
CREATE INDEX idx_alerts_vehicle_id ON public.vehicle_alerts(vehicle_id);
CREATE INDEX idx_alerts_is_ack ON public.vehicle_alerts(is_acknowledged);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_alerts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full operational access
CREATE POLICY "Auth users read drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users manage drivers" ON public.drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth users read vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth users insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users read trips" ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users manage trips" ON public.trips FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth users read trip_points" ON public.trip_points FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users insert trip_points" ON public.trip_points FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Auth users read vehicle_alerts" ON public.vehicle_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users update vehicle_alerts" ON public.vehicle_alerts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth users insert vehicle_alerts" ON public.vehicle_alerts FOR INSERT TO authenticated WITH CHECK (true);

-- Allow public read for preview access
CREATE POLICY "Anon read vehicles" ON public.vehicles FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read drivers" ON public.drivers FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read trips" ON public.trips FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read trip_points" ON public.trip_points FOR SELECT TO anon USING (true);
CREATE POLICY "Anon read vehicle_alerts" ON public.vehicle_alerts FOR SELECT TO anon USING (true);

-- 10. SEED DRIVERS
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d1111111-1111-1111-1111-111111111111', 'Anandhu Nair', '+91 98471 20491', 'anandhu.nair@fleetops.local', 'KL-07-2018-00912');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d2222222-2222-2222-2222-222222222222', 'Muhammed Shafi', '+91 94473 11822', 'shafi.m@fleetops.local', 'KL-07-2016-04419');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d3333333-3333-3333-3333-333333333333', 'Deepa Varghese', '+91 97455 33209', 'deepa.v@fleetops.local', 'KL-07-2020-07801');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d4444444-4444-4444-4444-444444444444', 'Kiran Joseph', '+91 94960 88210', 'kiran.j@fleetops.local', 'KL-07-2019-05510');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d5555555-5555-5555-5555-555555555555', 'Rohan Kurian', '+91 98952 14330', 'rohan.k@fleetops.local', 'KL-07-2021-08392');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d6666666-6666-6666-6666-666666666666', 'Vipin Das', '+91 97471 99201', 'vipin.das@fleetops.local', 'KL-07-2022-02219');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d7777777-7777-7777-7777-777777777777', 'Sujith Kumar', '+91 94460 77114', 'sujith.k@fleetops.local', 'KL-07-2015-06190');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d8888888-8888-8888-8888-888888888888', 'Farhan Azeez', '+91 98462 88470', 'farhan.a@fleetops.local', 'KL-07-2017-03011');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('d9999999-9999-9999-9999-999999999999', 'Harikrishnan P.', '+91 99951 44029', 'hari.p@fleetops.local', 'KL-07-2018-01142');
INSERT INTO public.drivers (id, name, phone, email, license_number)
VALUES ('daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Basil Eldho', '+91 97463 22105', 'basil.e@fleetops.local', 'KL-07-2023-08930');

-- 11. SEED VEHICLES
INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-101', 'Bytebeam Carrier Alpha', 'KL-07-CK-9120', 'Electric Van', 'moving', 'd1111111-1111-1111-1111-111111111111', 9.939200, 76.273100, 'Marine Drive Gateway, Ernakulam', 'Central Urban Corridor', 48.0, 82, NULL, 44.0, 33.0, 24890.0, 145, NOW());

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-102', 'Kochi Express Hauler', 'KL-07-BR-4412', 'Heavy Cargo Truck', 'moving', 'd2222222-2222-2222-2222-222222222222', 9.965400, 76.262800, 'Willingdon Island Port Wharf 4', 'Cochin Port Customs Zone', 36.0, 65, 74, 82.0, 36.0, 89410.0, 340, NOW() - INTERVAL '12 seconds');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-103', 'Infopark Tech Shuttle', 'KL-07-DJ-7801', 'Electric Van', 'moving', 'd3333333-3333-3333-3333-333333333333', 10.012500, 76.358200, 'Infopark Expressway Phase 2, Kakkanad', 'SmartCity SEZ', 54.0, 91, NULL, 41.0, 32.0, 16320.0, 180, NOW() - INTERVAL '5 seconds');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-104', 'ColdChain Reefer Unit 1', 'KL-07-CQ-5510', 'Reefer Truck', 'alert', 'd4444444-4444-4444-4444-444444444444', 10.026100, 76.312500, 'Kalamassery Premier Junction, NH 544', 'Industrial Corridor', 62.0, 28, NULL, 102.0, 31.0, 42100.0, 58, NOW() - INTERVAL '20 seconds');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-105', 'Lulu Metro Express', 'KL-07-BN-8392', 'Electric Van', 'idle', 'd5555555-5555-5555-5555-555555555555', 10.023600, 76.310100, 'Edappally Toll Hub, Lulu Mall Logistics Bay', 'Retail Hub', 0.0, 44, NULL, 38.0, 34.0, 31800.0, 76, NOW() - INTERVAL '1 minute');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-106', 'Rapid Courier Scooter 09', 'KL-07-CS-2219', 'Delivery Scooter', 'moving', 'd6666666-6666-6666-6666-666666666666', 9.967800, 76.319500, 'Vyttila Mobility Hub Transit Ring', 'Multimodal Hub', 41.0, 73, NULL, 35.0, 29.0, 8940.0, 62, NOW() - INTERVAL '3 seconds');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-107', 'Aluva Feeder Cargo', 'KL-07-AF-6190', 'Utility Pickup', 'offline', 'd7777777-7777-7777-7777-777777777777', 10.107600, 76.351600, 'Aluva Railway Goods Shed Depot', 'North District Yard', 0.0, 12, 18, 24.0, 32.0, 67120.0, 24, NOW() - INTERVAL '42 minutes');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-108', 'Fort Heritage Dispatch', 'KL-07-EK-3011', 'Electric Van', 'idle', 'd8888888-8888-8888-8888-888888888888', 9.965800, 76.242200, 'Fort Kochi Bazaar Road Customs Gate', 'Heritage Logistics Zone', 0.0, 67, NULL, 36.0, 33.0, 19450.0, 110, NOW() - INTERVAL '4 minutes');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-109', 'Tripunithura Express Hub', 'KL-07-DM-1142', 'Heavy Cargo Truck', 'moving', 'd9999999-9999-9999-9999-999999999999', 9.951200, 76.350800, 'Tripunithura Hill Palace Bypass', 'South Bypass Corridor', 51.0, 88, 62, 78.0, 35.0, 53900.0, 290, NOW() - INTERVAL '8 seconds');

INSERT INTO public.vehicles (id, name, plate_number, vehicle_type, status, driver_id, lat, lng, address, zone, speed, battery_level, fuel_level, engine_temp, tire_pressure, odometer_km, estimated_range_km, last_ping)
VALUES ('VH-110', 'Bolgatty Marina Courier', 'KL-07-DL-8930', 'Delivery Scooter', 'alert', 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 9.988100, 76.265400, 'Bolgatty Event Centre Approach', 'Island Tourism & Commercial', 22.0, 14, NULL, 39.0, 26.0, 11200.0, 11, NOW() - INTERVAL '15 seconds');

-- 12. SEED TRIPS
INSERT INTO public.trips (id, vehicle_id, driver_id, origin, destination, distance_km, duration_minutes, avg_speed_kmh, status, start_time, end_time)
VALUES ('TRP-801', 'VH-101', 'd1111111-1111-1111-1111-111111111111', 'Marine Drive Gateway', 'Infopark Kakkanad Phase 1', 14.60, 32, 42.0, 'in_progress', NOW() - INTERVAL '32 minutes', NULL);

INSERT INTO public.trips (id, vehicle_id, driver_id, origin, destination, distance_km, duration_minutes, avg_speed_kmh, status, start_time, end_time)
VALUES ('TRP-802', 'VH-102', 'd2222222-2222-2222-2222-222222222222', 'Cochin Port Wharf 4', 'Kalamassery Container Freight Station', 21.20, 48, 34.0, 'in_progress', NOW() - INTERVAL '48 minutes', NULL);

INSERT INTO public.trips (id, vehicle_id, driver_id, origin, destination, distance_km, duration_minutes, avg_speed_kmh, status, start_time, end_time)
VALUES ('TRP-803', 'VH-106', 'd6666666-6666-6666-6666-666666666666', 'Edappally Toll Bay', 'Vyttila Mobility Hub Hub C', 7.80, 18, 38.0, 'in_progress', NOW() - INTERVAL '18 minutes', NULL);

INSERT INTO public.trips (id, vehicle_id, driver_id, origin, destination, distance_km, duration_minutes, avg_speed_kmh, status, start_time, end_time)
VALUES ('TRP-804', 'VH-108', 'd8888888-8888-8888-8888-888888888888', 'Bolgatty Marina Hub', 'Fort Kochi Mattancherry Spice Yard', 12.40, 35, 29.0, 'completed', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 25 minutes');

INSERT INTO public.trips (id, vehicle_id, driver_id, origin, destination, distance_km, duration_minutes, avg_speed_kmh, status, start_time, end_time)
VALUES ('TRP-805', 'VH-109', 'd9999999-9999-9999-9999-999999999999', 'Aroor Industrial Park', 'Tripunithura Freight Depot', 18.50, 41, 44.0, 'completed', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 19 minutes');

-- 13. SEED TRIP POINTS (Ordered Route Breadcrumb Trail)
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-801', 1, 9.979200, 76.276100, NOW() - INTERVAL '30 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-801', 2, 9.983500, 76.284200, NOW() - INTERVAL '25 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-801', 3, 9.991200, 76.299000, NOW() - INTERVAL '20 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-801', 4, 10.002100, 76.321000, NOW() - INTERVAL '15 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-801', 5, 10.012500, 76.358200, NOW() - INTERVAL '10 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-801', 6, 9.939200, 76.273100, NOW() - INTERVAL '2 minutes');

INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-802', 1, 9.965400, 76.262800, NOW() - INTERVAL '45 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-802', 2, 9.958200, 76.281000, NOW() - INTERVAL '35 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-802', 3, 9.982100, 76.302500, NOW() - INTERVAL '25 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-802', 4, 10.015000, 76.310500, NOW() - INTERVAL '15 minutes');
INSERT INTO public.trip_points (trip_id, sequence_order, lat, lng, recorded_at) VALUES ('TRP-802', 5, 10.026100, 76.312500, NOW() - INTERVAL '5 minutes');

-- 14. SEED VEHICLE ALERTS
INSERT INTO public.vehicle_alerts (id, vehicle_id, title, description, severity, category, is_acknowledged, created_at)
VALUES ('ALT-301', 'VH-104', 'High Inverter/Engine Temperature', 'Core powertrain sensor temperature exceeded threshold (102°C at Kalamassery NH544). Immediate inspection advised.', 'critical', 'temperature', FALSE, NOW() - INTERVAL '3 minutes');

INSERT INTO public.vehicle_alerts (id, vehicle_id, title, description, severity, category, is_acknowledged, created_at)
VALUES ('ALT-302', 'VH-110', 'Critical Battery Warning (<15%)', 'Vehicle state of charge dropped to 14% at Bolgatty. Return to nearest fast charging dock recommended.', 'critical', 'battery', FALSE, NOW() - INTERVAL '8 minutes');

INSERT INTO public.vehicle_alerts (id, vehicle_id, title, description, severity, category, is_acknowledged, created_at)
VALUES ('ALT-303', 'VH-107', 'Telematics Heartbeat Lost', 'No GPS telemetry packet received for >40 minutes from Aluva Depot yard. Unit flagged as offline.', 'warning', 'maintenance', FALSE, NOW() - INTERVAL '42 minutes');

INSERT INTO public.vehicle_alerts (id, vehicle_id, title, description, severity, category, is_acknowledged, created_at)
VALUES ('ALT-304', 'VH-104', 'Geofence Deviation Advisory', 'Vehicle exited scheduled NH544 Freight Corridor boundary towards Aluva feeder road.', 'warning', 'geofence', TRUE, NOW() - INTERVAL '1 hour');

INSERT INTO public.vehicle_alerts (id, vehicle_id, title, description, severity, category, is_acknowledged, created_at)
VALUES ('ALT-305', 'VH-103', 'Scheduled 15,000 km Service Notice', 'Tata Ace EV preventive battery balancer check scheduled within next 500 km.', 'info', 'maintenance', TRUE, NOW() - INTERVAL '3 hours');
