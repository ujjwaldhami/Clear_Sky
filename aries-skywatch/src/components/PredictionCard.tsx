import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Droplets, Wind, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import { ClearSkyScore } from "@/lib/types";
import { getStatusBadgeClass } from "@/lib/score";
import { formatIST } from "@/lib/time";

interface PredictionCardProps {
  score: ClearSkyScore;
  forecastTime?: string;
  cloudPercentage: number;
  humidity: number;
  windKmh: number;
  pressure: number;
}

/* =========================
   OBSERVATION MESSAGE
   ========================= */
function getObservationMessage(status: string) {
  if (status === "Clear") {
    return {
      title: "FAVOURABLE FOR OBSERVATION",
      desc: "Clear sky expected — Good visibility",
      className:
        "bg-emerald-500/15 text-emerald-400 border-emerald-400/30 shadow-[0_0_18px_rgba(16,185,129,0.25)]",
    };
  }

  if (status === "Moderate") {
    return {
      title: "MARGINAL FOR OBSERVATION",
      desc: "Some cloud cover — Limited visibility",
      className:
        "bg-amber-600/15 text-amber-300 border-amber-500/30 shadow-[0_0_14px_rgba(217,119,6,0.25)]",
    };
  }

  return {
    title: "NOT FAVOURABLE FOR OBSERVATION",
    desc: "Heavy cloud cover — Observation unlikely",
    className:
      "bg-red-600/15 text-red-400 border-red-500/30 shadow-[0_0_16px_rgba(239,68,68,0.3)]",
  };
}
function getCardGlowClass(status: string) {
  if (status === "Clear") return "glow-green";
  if (status === "Moderate") return "glow-amber";
  return "glow-red";
}



export function PredictionCard({
  score,
  forecastTime,
  cloudPercentage,
  humidity,
  windKmh,
  pressure,
}: PredictionCardProps) {
  const statusClass = getStatusBadgeClass(score.status);
  const observation = getObservationMessage(score.status);
  const cardGlowClass = getCardGlowClass(score.status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        className={`glass-card p-8 transition-shadow duration-500 ${cardGlowClass}`}
      >
        {/* HEADER */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            Observing Conditions Tonight
          </h2>

          <div className="flex items-center gap-6 flex-wrap">
            {/* SCORE */}
            <span className="text-5xl font-bold tabular-nums">
              {score.score}
            </span>

            {/* STATUS BADGES */}
            <div className="flex flex-col gap-1">
              <Badge className={`${statusClass} px-3 py-1 text-sm font-semibold`}>
                {score.status}
              </Badge>

              {score.isHeuristic && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  Heuristic
                </Badge>
              )}
            </div>

            {/* OBSERVATION MESSAGE */}
            <div
              className={`rounded-md border px-4 py-2 ${observation.className}`}
            >
              <div className="text-xs font-bold tracking-wide">
                {observation.title}
              </div>
              <div className="text-[11px] opacity-80">
                {observation.desc}
              </div>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Cloud</div>
              <div className="text-lg font-semibold tabular-nums">
                {cloudPercentage}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="text-lg font-semibold tabular-nums">
                {humidity}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="text-lg font-semibold tabular-nums">
                {windKmh} km/h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Pressure</div>
              <div className="text-lg font-semibold tabular-nums">
                {pressure} hPa
              </div>
            </div>
          </div>
        </div>

        {/* NEXT FORECAST */}
        {forecastTime && (
          <div className="text-sm text-muted-foreground pt-4 border-t border-border">
            Next forecast: expected in 4 hours
          </div>
        )}
      </Card>
    </motion.div>
  );
}
