import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface AirTrafficMiniMapProps {
  aircraftCount: number;
  city: string;
}

export function AirTrafficMiniMap({
  aircraftCount,
  city,
}: AirTrafficMiniMapProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Air Traffic</h3>
          </div>

          <Badge variant="secondary" className="text-lg font-bold px-3">
            {aircraftCount}
          </Badge>
        </div>

        <div className="bg-muted/20 rounded-lg h-40 mb-4 flex items-center justify-center border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative z-10 text-center">
            <Plane className="w-12 h-12 text-primary/60 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-muted-foreground">
              {aircraftCount > 0
                ? `${aircraftCount} aircraft detected near ${city}`
                : `No aircraft detected near ${city}`}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/traffic?city=${city}`)}
        >
          View Full Map
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </motion.div>
  );
}
