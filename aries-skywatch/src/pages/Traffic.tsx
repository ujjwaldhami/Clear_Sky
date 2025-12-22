import { useQuery } from "@tanstack/react-query";
import { useCity } from "@/hooks/useCity";
import { usePollingGate } from "@/hooks/usePollingGate";
import { fetchAirTraffic, fetchWeather } from "@/lib/api";
import { TrafficMap } from "@/components/TrafficMap";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Traffic() {
  const [city] = useCity();
  const isVisible = usePollingGate();

  /* ---------------- WEATHER (for map center) ---------------- */
  const { data: weatherData } = useQuery({
    queryKey: ["weather", city],
    queryFn: () => fetchWeather(city),
    staleTime: 5 * 60 * 1000,
  });

  /* ---------------- AIR TRAFFIC ---------------- */
  const {
    data: trafficData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["traffic", city],
    queryFn: () => fetchAirTraffic(city),
    refetchInterval: isVisible ? 15 * 1000 : false,
    staleTime: 10 * 1000,
  });

  /* ---------------- MAP CENTER ---------------- */
  const center: [number, number] = weatherData
    ? [
        weatherData.current_weather.coordinates.latitude,
        weatherData.current_weather.coordinates.longitude,
      ]
    : [28.6667, 77.2167]; // Delhi fallback

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading air traffic data...</p>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (error || !trafficData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Failed to load traffic data
          </h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || "Unknown error"}
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </Card>
      </div>
    );
  }

  /* ---------------- SAFE AIRCRAFT HANDLING ---------------- */
  const rawAircraft = trafficData?.data?.aircraft ?? [];

  const aircraft = rawAircraft.filter(
    (plane) =>
      !plane.on_ground &&
      plane.latitude !== null &&
      plane.longitude !== null
  );

  const avgAltitude =
    aircraft.length > 0
      ? Math.round(
          aircraft.reduce(
            (sum, p) => sum + (p.baro_altitude || 0),
            0
          ) / aircraft.length
        )
      : 0;

  const avgSpeed =
    aircraft.length > 0
      ? Math.round(
          (aircraft.reduce(
            (sum, p) => sum + (p.velocity || 0),
            0
          ) /
            aircraft.length) *
            3.6
        )
      : 0;

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Plane className="w-8 h-8 text-primary" />
              Live Air Traffic
            </h1>
            <p className="text-muted-foreground">
              Real-time aircraft positions near {city}
            </p>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Aircraft Count
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {aircraft.length}
              </p>
            </div>
            <Plane className="w-10 h-10 text-primary/50" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Avg Altitude
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {avgAltitude}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  m
                </span>
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary/50" />
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Avg Speed
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {avgSpeed}
                <span className="text-base font-normal text-muted-foreground ml-1">
                  km/h
                </span>
              </p>
            </div>
            <Plane className="w-10 h-10 text-primary/50" />
          </div>
        </Card>
      </motion.div>

      {/* MAP */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Live Map</h2>
            <Badge variant="secondary" className="animate-pulse">
              Updating every 15s
            </Badge>
          </div>

          <div className="h-[600px] relative">
            {/* MAP ALWAYS RENDERS */}
            <TrafficMap center={center} aircraft={aircraft} zoom={9} />

            {/* EMPTY STATE OVERLAY */}
            {aircraft.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-muted-foreground bg-background/70 backdrop-blur-md px-6 py-4 rounded-xl border border-border">
                  <Plane className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium">
                    No aircraft detected
                  </p>
                  <p className="text-sm">
                    There is currently no air traffic near {city}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
