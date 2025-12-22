import { useQuery } from "@tanstack/react-query";
import { useCity } from "@/hooks/useCity";
import { usePollingGate } from "@/hooks/usePollingGate";
import { fetchWeather, fetchPrediction, fetchAirTraffic } from "@/lib/api";
import { computeClearSkyScore, getStatusFromScore } from "@/lib/score";
import { PredictionCard } from "@/components/PredictionCard";
import { WeatherCard } from "@/components/WeatherCard";
import { AirTrafficMiniMap } from "@/components/AirTrafficMiniMap";
import { ObservingTips } from "@/components/ObservingTips";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [city] = useCity();
  const isVisible = usePollingGate();

  const {
    data: weatherData,
    isLoading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useQuery({
    queryKey: ["weather", city],
    queryFn: () => fetchWeather(city),
    refetchInterval: isVisible ? 10 * 60 * 1000 : false, // 10 min
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: predictionData,
    isLoading: predictionLoading,
    error: predictionError,
    refetch: refetchPrediction,
  } = useQuery({
    queryKey: ["prediction", city],
    queryFn: () => fetchPrediction(city),
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: trafficData,
    isLoading: trafficLoading,
    error: trafficError,
    refetch: refetchTraffic,
  } = useQuery({
    queryKey: ["traffic", city],
    queryFn: () => fetchAirTraffic(city),
    refetchInterval: isVisible ? 60 * 1000 : false, // 60s
    staleTime: 30 * 1000,
  });

  const isLoading = weatherLoading || predictionLoading || trafficLoading;
  const hasError = weatherError || predictionError || trafficError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading observing conditions...</p>
        </div>
      </div>
    );
  }

  if (hasError || !weatherData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-card p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to load data</h2>
          <p className="text-muted-foreground mb-4">
            {weatherError?.message || predictionError?.message || trafficError?.message || "Unknown error"}
          </p>
          <Button onClick={() => {
            refetchWeather();
            refetchPrediction();
            refetchTraffic();
          }}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  const weather = weatherData.current_weather;
  const forecast = weatherData.forecast;
     const validAircraft =
  trafficData?.data?.aircraft?.filter(
    (plane) =>
      !plane.on_ground &&
      plane.latitude !== null &&
      plane.longitude !== null
  ) ?? [];


  // Compute or use prediction score
  const score =
    predictionData?.prediction !== null && predictionData?.prediction !== undefined
      ? {
          score: Math.round(predictionData.prediction),
          status: getStatusFromScore(predictionData.prediction),
          wind_kmh: Math.round(weather.wind_speed * 3.6),
          isHeuristic: false,
        }
      : computeClearSkyScore({
          cloud_percentage: weather.cloud_percentage,
          humidity: weather.humidity,
          wind_speed_ms: weather.wind_speed,
          pressure_hpa: weather.pressure,
        });

  return (
    <div className="space-y-6">
      <PredictionCard
        score={score}
        forecastTime={forecast.forecast_time}
        cloudPercentage={weather.cloud_percentage}
        humidity={weather.humidity}
        windKmh={score.wind_kmh}
        pressure={weather.pressure}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherCard current={weather} forecast={forecast} />
  
<AirTrafficMiniMap
  aircraftCount={validAircraft.length}
  city={city}
/>

      </div>

      <ObservingTips />
    </div>
  );
}
