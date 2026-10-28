import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FleetMap } from './components/FleetMap';
import { VehicleTable } from './components/VehicleTable';
import { VehicleDetailsPanel } from './components/VehicleDetailsModal';
import { TripsList } from './components/TripsList';
import { AlertQueue } from './components/AlertQueue';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SetupRequired } from './components/SetupRequired';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { useAuth } from './context/AuthContext';
import {
  fetchFleetDataFromSupabase,
  fetchTripRoutePoints,
  updateAlertAcknowledgmentInSupabase,
  updateVehiclePingInSupabase,
} from './services/fleetService';
import {
  INITIAL_VEHICLES,
  INITIAL_ALERTS,
  INITIAL_TRIPS,
} from './data/mockFleetData';
import type { Vehicle, FleetAlert, Trip, VehicleStatus, FleetStats } from './types/fleet';
import {
  MapPin,
  RefreshCw,
  AlertOctagon,
  Radio,
  ServerOff,
} from 'lucide-react';

export function App() {
  const { user, loading: authLoading, isConfigured, signOut } = useAuth();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Syncing...');
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [isPageTransitioning, setIsPageTransitioning] = useState<boolean>(false);

  // Database Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<FleetAlert[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeRoute, setActiveRoute] = useState<[number, number][]>([]);
  const [activeRouteTripId, setActiveRouteTripId] = useState<string | null>(null);

  // Connection & Data Loading States
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDemoPreviewMode, setIsDemoPreviewMode] = useState<boolean>(false);

  // Compute live statistics dynamically from actual records
  const fleetStats: FleetStats = {
    total: vehicles.length,
    moving: vehicles.filter((v) => v.status === 'moving').length,
    idle: vehicles.filter((v) => v.status === 'idle').length,
    offline: vehicles.filter((v) => v.status === 'offline').length,
    attentionRequired: alerts.filter((a) => !a.isAcknowledged).length,
  };

  // 1. Data Fetching Logic (Supabase vs Demo Preview)
  const loadFleetData = useCallback(async () => {
    if (!isConfigured) {
      if (isDemoPreviewMode) {
        setVehicles(INITIAL_VEHICLES);
        setAlerts(INITIAL_ALERTS);
        setTrips(INITIAL_TRIPS);
        setLastUpdated('Demo Mode');
      }
      return;
    }

    setIsLoadingData(true);
    setLoadError(null);

    try {
      const payload = await fetchFleetDataFromSupabase();
      setVehicles(payload.vehicles);
      setAlerts(payload.alerts);
      setTrips(payload.trips);

      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err: any) {
      console.error('Error fetching Supabase fleet data:', err);
      setLoadError(err.message || 'Unable to load fleet data from Supabase PostgreSQL.');
    } finally {
      setIsLoadingData(false);
    }
  }, [isConfigured, isDemoPreviewMode]);

  // Load data when user authenticates or mode changes
  useEffect(() => {
    if (user || isDemoPreviewMode) {
      loadFleetData();
    }
  }, [user, isDemoPreviewMode, loadFleetData]);

  // 2. Periodic Live Telemetry Simulation
  useEffect(() => {
    if (!isSimulating || vehicles.length === 0) return;

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === 'moving') {
            const latDelta = (Math.random() - 0.48) * 0.0006;
            const lngDelta = (Math.random() - 0.48) * 0.0006;
            const speedFluctuation = Math.floor((Math.random() - 0.5) * 4);
            const newSpeed = Math.max(20, Math.min(65, v.telemetry.speed + speedFluctuation));
            const newLat = Number((v.location.lat + latDelta).toFixed(5));
            const newLng = Number((v.location.lng + lngDelta).toFixed(5));

            // If Supabase is connected, periodically sync simulated ping
            if (isConfigured && user) {
              updateVehiclePingInSupabase(v.id, {
                lat: newLat,
                lng: newLng,
                speed: newSpeed,
              });
            }

            return {
              ...v,
              location: {
                ...v.location,
                lat: newLat,
                lng: newLng,
                lastPing: 'Just now',
              },
              telemetry: {
                ...v.telemetry,
                speed: newSpeed,
              },
            };
          }
          return v;
        })
      );

      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, vehicles.length, isConfigured, user]);

  // Handle vehicle selection
  const handleSelectVehicleById = (vehicleId: string) => {
    const found = vehicles.find((v) => v.id === vehicleId);
    if (found) {
      setSelectedVehicle(found);
    }
  };

  // Toggle route polyline for a trip (from ordered PostgreSQL trip_points)
  const handleViewRoute = async (tripId: string) => {
    if (activeRouteTripId === tripId) {
      setActiveRoute([]);
      setActiveRouteTripId(null);
      return;
    }

    try {
      const points = await fetchTripRoutePoints(tripId);
      if (points.length > 0) {
        setActiveRoute(points);
        setActiveRouteTripId(tripId);
      } else {
        // Fallback default coordinates if trip_points table not yet populated
        const trip = trips.find((t) => t.id === tripId);
        if (trip) {
          const v = vehicles.find((veh) => veh.id === trip.vehicleId);
          if (v) {
            setActiveRoute([
              [v.location.lat - 0.02, v.location.lng - 0.03],
              [v.location.lat - 0.01, v.location.lng - 0.015],
              [v.location.lat, v.location.lng],
            ]);
            setActiveRouteTripId(tripId);
          }
        }
      }
    } catch {
      setActiveRoute([]);
      setActiveRouteTripId(null);
    }
  };

  // Manual ping simulation for a specific vehicle
  const handleSimulatePing = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const speedBoost = v.status === 'moving' ? Math.floor(Math.random() * 6) - 3 : 0;
          const updatedSpeed = Math.max(0, v.telemetry.speed + speedBoost);

          if (isConfigured && user) {
            updateVehiclePingInSupabase(v.id, { speed: updatedSpeed });
          }

          return {
            ...v,
            location: {
              ...v.location,
              lastPing: '1s ago (manual poll)',
            },
            telemetry: {
              ...v.telemetry,
              speed: updatedSpeed,
            },
          };
        }
        return v;
      })
    );
  };

  // Acknowledge alert with real Supabase PostgreSQL update
  const handleAcknowledgeAlert = async (alertId: string) => {
    const current = alerts.find((a) => a.id === alertId);
    if (!current) return;

    const newAckState = !current.isAcknowledged;

    // Optimistically update local UI state
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isAcknowledged: newAckState } : a))
    );

    // Persist to Supabase PostgreSQL
    if (isConfigured && user) {
      try {
        await updateAlertAcknowledgmentInSupabase(alertId, newAckState);
      } catch (err) {
        console.error('Failed to update alert in Supabase:', err);
      }
    }
  };

  // Sync selected vehicle with live data updates
  const activeSelectedVehicle = selectedVehicle
    ? vehicles.find((v) => v.id === selectedVehicle.id) || selectedVehicle
    : null;

  // --------------------------------------------------------------------------
  // CONDITIONAL RENDERING FOR CONFIGURATION & AUTH
  // --------------------------------------------------------------------------

  // 1. Initial Auth Loading State
  const transitionToNextPage = (callback: () => void) => {
    if (isPageTransitioning) return;
    setIsPageTransitioning(true);
    window.setTimeout(() => {
      callback();
      window.setTimeout(() => setIsPageTransitioning(false), 80);
    }, 420);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-800 space-y-4">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/25">
          <Radio className="h-7 w-7 text-white animate-pulse" />
        </div>
        <p className="text-sm font-bold tracking-wide text-slate-900">
          FleetOps Fleet Management Dashboard
        </p>
        <p className="text-xs text-slate-500">
          Connecting to Supabase Session...
        </p>
      </div>
    );
  }

  // 2. Public landing experience
  if (!isConfigured && !isDemoPreviewMode && showLanding) {
    return (
      <div className={`landing-transition-shell ${isPageTransitioning ? 'is-transitioning' : ''}`}>
        <LandingPage
          onDemo={() => transitionToNextPage(() => {
            setIsDemoPreviewMode(true);
            setShowLanding(false);
            setVehicles(INITIAL_VEHICLES);
            setAlerts(INITIAL_ALERTS);
            setTrips(INITIAL_TRIPS);
          })}
          onSignIn={() => transitionToNextPage(() => setShowLanding(false))}
        />
        <div className="page-transition-overlay" aria-hidden="true"><span /></div>
      </div>
    );
  }

  // 3. Missing Configuration setup
  if (!isConfigured && !isDemoPreviewMode) {
    return (
      <SetupRequired
        onContinueDemoPreview={() => {
          setIsDemoPreviewMode(true);
          setVehicles(INITIAL_VEHICLES);
          setAlerts(INITIAL_ALERTS);
          setTrips(INITIAL_TRIPS);
        }}
      />
    );
  }

  // 4. Unauthenticated landing or login
  if (isConfigured && !user && !isDemoPreviewMode) {
    if (showLanding) {
      return (
        <div className={`landing-transition-shell ${isPageTransitioning ? 'is-transitioning' : ''}`}>
          <LandingPage
            onDemo={() => transitionToNextPage(() => setShowLanding(false))}
            onSignIn={() => transitionToNextPage(() => setShowLanding(false))}
          />
          <div className="page-transition-overlay" aria-hidden="true"><span /></div>
        </div>
      );
    }
    return <LoginPage />;
  }

  // --------------------------------------------------------------------------
  // PROTECTED FLEETOPS DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="flex h-screen h-[100dvh] w-full bg-slate-50 text-slate-800 font-sans overflow-hidden antialiased">
      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        vehicleCount={vehicles.length}
        activeTripsCount={trips.filter((t) => t.status === 'in_progress').length}
        unreadAlertsCount={alerts.filter((a) => !a.isAcknowledged).length}
        userEmail={user?.email}
        onSignOut={isConfigured ? signOut : undefined}
        isLiveBackend={isConfigured && !!user}
      />

      {/* Main Operations Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sticky Top Navbar */}
        <Navbar
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          onRefreshData={loadFleetData}
          lastUpdated={lastUpdated}
          isLiveBackend={isConfigured && !!user}
        />

        {/* Scrollable Main Workspace - with bottom padding on mobile for BottomNav */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-20 lg:pb-6">
          {/* Error Banner with Retry State */}
          {loadError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Supabase PostgreSQL Error</h4>
                  <p className="text-xs text-rose-700">{loadError}</p>
                </div>
              </div>
              <button
                onClick={loadFleetData}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoadingData && vehicles.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 animate-spin">
                <RefreshCw className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Fetching fleet records from Supabase PostgreSQL...
              </p>
              <p className="text-xs text-slate-500">
                Querying vehicles, telematics sensors, and drivers
              </p>
            </div>
          ) : vehicles.length === 0 && !loadError ? (
            /* Empty State */
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3">
              <ServerOff className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Fleet Records Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your Supabase tables are ready, but no vehicle records were returned. Run the seed script in your Supabase SQL editor to populate demo data.
              </p>
              <div className="pt-2">
                <code className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                  supabase/migrations/02_seed_data.sql
                </code>
              </div>
              <button
                onClick={loadFleetData}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center space-x-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh After Seeding</span>
              </button>
            </div>
          ) : (
            <>
              {/* Overview Tab (Default Full Operations Command View) */}
              {activeTab === 'overview' && (
                <>
                  {/* Summary Metrics Cards */}
                  <StatsOverview
                    stats={fleetStats}
                    selectedFilter={statusFilter}
                    onSelectFilter={(newFilter) => setStatusFilter(newFilter)}
                  />

                  {/* Map & Live Operations Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                          Live Telematics Geospatial Map
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                        Click any marker or table row to view live IoT diagnostics
                      </span>
                    </div>

                    <FleetMap
                      vehicles={vehicles}
                      selectedVehicle={activeSelectedVehicle}
                      onSelectVehicle={(v) => setSelectedVehicle(v)}
                      statusFilter={statusFilter}
                      onFilterChange={(st) => setStatusFilter(st)}
                      activeRoute={activeRoute}
                    />
                  </div>

                  {/* Vehicle Table */}
                  <VehicleTable
                    vehicles={vehicles}
                    selectedVehicle={activeSelectedVehicle}
                    onSelectVehicle={(v) => setSelectedVehicle(v)}
                    statusFilter={statusFilter}
                    onStatusFilterChange={(st) => setStatusFilter(st)}
                  />

                  {/* Lower Dual Grid: Recent Trips & Operational Alert Queue */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AlertQueue
                      alerts={alerts}
                      onAcknowledgeAlert={handleAcknowledgeAlert}
                      onSelectVehicleById={handleSelectVehicleById}
                    />
                    <TripsList
                      trips={trips}
                      vehicles={vehicles}
                      onSelectVehicleById={handleSelectVehicleById}
                      onViewRoute={handleViewRoute}
                      activeRouteTripId={activeRouteTripId}
                    />
                  </div>
                </>
              )}

              {/* Vehicles Tab: Focused Asset Table & Map */}
              {activeTab === 'vehicles' && (
                <div className="space-y-6">
                  <StatsOverview
                    stats={fleetStats}
                    selectedFilter={statusFilter}
                    onSelectFilter={(newFilter) => setStatusFilter(newFilter)}
                  />

                  <VehicleTable
                    vehicles={vehicles}
                    selectedVehicle={activeSelectedVehicle}
                    onSelectVehicle={(v) => setSelectedVehicle(v)}
                    statusFilter={statusFilter}
                    onStatusFilterChange={(st) => setStatusFilter(st)}
                  />

                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-800">
                      Regional Asset Distribution (Kochi Hub)
                    </h3>
                    <FleetMap
                      vehicles={vehicles}
                      selectedVehicle={activeSelectedVehicle}
                      onSelectVehicle={(v) => setSelectedVehicle(v)}
                      statusFilter={statusFilter}
                      onFilterChange={(st) => setStatusFilter(st)}
                      activeRoute={activeRoute}
                    />
                  </div>
                </div>
              )}

              {/* Trips Tab: Dedicated Dispatch & Transit corridors */}
              {activeTab === 'trips' && (
                <div className="space-y-6">
                  <TripsList
                    trips={trips}
                    vehicles={vehicles}
                    onSelectVehicleById={handleSelectVehicleById}
                    onViewRoute={handleViewRoute}
                    activeRouteTripId={activeRouteTripId}
                  />
                </div>
              )}

              {/* Alerts Tab: Operational Alert Triage Queue */}
              {activeTab === 'alerts' && (
                <div className="space-y-6">
                  <AlertQueue
                    alerts={alerts}
                    onAcknowledgeAlert={handleAcknowledgeAlert}
                    onSelectVehicleById={handleSelectVehicleById}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Slide-out Vehicle Diagnostics Details Panel */}
      {activeSelectedVehicle && (
        <VehicleDetailsPanel
          vehicle={activeSelectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          onCenterOnMap={(v) => {
            setSelectedVehicle({ ...v });
          }}
          onSimulatePing={handleSimulatePing}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Android & iOS Phones) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        vehicleCount={vehicles.length}
        unreadAlertsCount={alerts.filter((a) => !a.isAcknowledged).length}
      />
    </div>
  );
}

export default App;
