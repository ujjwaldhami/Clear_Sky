import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Aircraft } from "@/lib/types";

interface TrafficMapProps {
  center: [number, number];
  aircraft: Aircraft[];
  zoom?: number;
}

export function TrafficMap({
  center,
  aircraft,
  zoom = 8,
}: TrafficMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  /* =========================
     INIT MAP
     ========================= */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoom,
      zoomControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [zoom]);

  /* =========================
     UPDATE AIRCRAFT
     ========================= */
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const validAircraft = aircraft.filter(
      (p) => p.latitude !== null && p.longitude !== null
    );

    const currentMarkers = new Map<string, L.Marker>();

    /* ✈️ CLEAR YELLOW PLANE ICON */
    const createPlaneIcon = (rotation: number) =>
      L.divIcon({
        html: `
          <div style="
            transform: rotate(${rotation}deg);
            font-size: 28px;
            color: #facc15; /* yellow-400 */
            text-shadow:
              0 0 6px rgba(250,204,21,0.9),
              0 0 12px rgba(250,204,21,0.6);
          ">
            ✈
          </div>
        `,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

    validAircraft.forEach((plane) => {
      const key = plane.icao24;
      let marker = markersRef.current.get(key);

      if (!marker) {
        marker = L.marker(
          [plane.latitude!, plane.longitude!],
          {
            icon: createPlaneIcon(plane.true_track ?? 0),
          }
        );

        marker.bindPopup(`
          <div style="font-size:12px">
            <strong>${plane.callsign || plane.icao24}</strong><br/>
            Country: ${plane.origin_country}<br/>
            Altitude: ${
              plane.baro_altitude
                ? `${Math.round(plane.baro_altitude)} m`
                : "N/A"
            }<br/>
            Speed: ${
              plane.velocity
                ? `${Math.round(plane.velocity * 3.6)} km/h`
                : "N/A"
            }
          </div>
        `);

        marker.addTo(map);
      } else {
        marker.setLatLng([
          plane.latitude!,
          plane.longitude!,
        ]);
        marker.setIcon(
          createPlaneIcon(plane.true_track ?? 0)
        );
      }

      currentMarkers.set(key, marker);
    });

    /* REMOVE OLD MARKERS */
    markersRef.current.forEach((marker, key) => {
      if (!currentMarkers.has(key)) {
        marker.remove();
      }
    });

    markersRef.current = currentMarkers;

    /* 🔥 AUTO FIT TO AIRCRAFT */
    if (validAircraft.length > 0) {
      const bounds = L.latLngBounds(
        validAircraft.map(
          (p) => [p.latitude!, p.longitude!] as [number, number]
        )
      );

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [80, 80],
          animate: true,
        });
      }
    } else {
      map.setView(center, zoom);
    }
  }, [aircraft, center, zoom]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}
