import React, { useEffect, useRef, useState } from "react";
import { Compass, Phone, X, Navigation, ShieldCheck } from "lucide-react";
import { Facility } from "../types";
import { Translations } from "../services/i18n";
import { calculateBearing, getCompassDirection } from "../services/haversine";

interface OfflineCanvasNavProps {
  facility: Facility;
  userLat: number;
  userLon: number;
  t: Translations;
  onClose: () => void;
}

export const OfflineCanvasNav: React.FC<OfflineCanvasNavProps> = ({
  facility,
  userLat,
  userLon,
  t,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSupport, setHasCompassSupport] = useState(false);

  const distanceKm = facility.distance_km || 0;
  const bearing = calculateBearing(userLat, userLon, facility.latitude, facility.longitude);
  const compassDir = getCompassDirection(bearing);

  // Optional: Listen to device orientation for authentic compass heading
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore - webkitCompassHeading for iOS
      const heading = e.webkitCompassHeading || (e.alpha !== null ? 360 - e.alpha : null);
      if (heading !== null) {
        setDeviceHeading(Math.round(heading));
        setHasCompassSupport(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Draw Canvas Radar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 24;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#042f2e"; // Teal 950
    ctx.fillRect(0, 0, width, height);

    // Concentric Range Rings
    const rings = [0.25, 0.5, 0.75, 1.0];
    const maxScaleKm = Math.max(25, Math.ceil(distanceKm * 1.3));

    ctx.strokeStyle = "rgba(45, 212, 191, 0.2)"; // Teal 400 with opacity
    ctx.lineWidth = 1;

    rings.forEach((ratio) => {
      const r = maxRadius * ratio;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.stroke();

      // Range Label
      ctx.fillStyle = "rgba(153, 246, 228, 0.5)";
      ctx.font = "10px sans-serif";
      const ringKm = Math.round(maxScaleKm * ratio);
      ctx.fillText(`${ringKm}km`, cx + 4, cy - r + 12);
    });

    // Crosshairs
    ctx.strokeStyle = "rgba(45, 212, 191, 0.15)";
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.stroke();

    // Cardinal directions
    ctx.fillStyle = "rgba(204, 251, 241, 0.8)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", cx, cy - maxRadius + 14);
    ctx.fillText("S", cx, cy + maxRadius - 6);
    ctx.fillText("E", cx + maxRadius - 10, cy + 4);
    ctx.fillText("W", cx - maxRadius + 10, cy + 4);

    // Effective angle: If device heading is available, adjust target angle relative to device orientation
    const effectiveAngleDeg = hasCompassSupport && deviceHeading !== null
      ? (bearing - deviceHeading + 360) % 360
      : bearing;

    const angleRad = ((effectiveAngleDeg - 90) * Math.PI) / 180; // 0 deg is North (top)
    const scaledDistance = Math.min(1.0, distanceKm / maxScaleKm) * maxRadius;
    const targetX = cx + Math.cos(angleRad) * scaledDistance;
    const targetY = cy + Math.sin(angleRad) * scaledDistance;

    // Vector line
    ctx.strokeStyle = "#2dd4bf"; // Teal 400
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Facility target marker
    ctx.fillStyle = "#14b8a6";
    ctx.beginPath();
    ctx.arc(targetX, targetY, 10, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(targetX, targetY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Target Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    const labelY = targetY > cy ? targetY + 20 : targetY - 14;
    ctx.fillText(`${facility.name.split(" ")[0]} (${distanceKm}km)`, targetX, labelY);

    // Center User Marker (Pulse)
    ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#38bdf8"; // Sky 400
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, 2 * Math.PI);
    ctx.fill();
  }, [facility, userLat, userLon, distanceKm, bearing, deviceHeading, hasCompassSupport]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-teal-950 text-white rounded-2xl w-full max-w-md overflow-hidden border border-teal-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-teal-800 flex items-center justify-between bg-teal-900/50">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-base font-semibold leading-none">Zero-Tile Offline Radar</h2>
              <p className="text-[11px] text-teal-300 mt-1">Haversine Vector • No Map Tiles Required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-teal-800 text-teal-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-4 flex flex-col items-center justify-center bg-teal-950">
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="rounded-full shadow-inner border border-teal-800/80 bg-teal-950"
          />

          <div className="mt-3 flex items-center gap-2 text-[12px] text-teal-200">
            <Navigation className="w-4 h-4 text-teal-400 rotate-45" />
            <span>Bearing: <strong>{bearing}° ({compassDir})</strong></span>
            <span>•</span>
            <span>Distance: <strong>{distanceKm} km</strong></span>
          </div>

          <p className="text-[11px] text-teal-400/80 text-center mt-1">
            {hasCompassSupport
              ? "🧭 Device compass active — Radar rotates with phone"
              : "📍 North-Up Relative Radar — Rotate device to align with North"}
          </p>
        </div>

        {/* Facility Info Card */}
        <div className="p-5 bg-teal-900/80 border-t border-teal-800 space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">{facility.name}</h3>
              <span className="text-xs bg-teal-800 text-teal-200 px-2 py-0.5 rounded">
                {facility.type}
              </span>
            </div>
            <p className="text-xs text-teal-200/90 mt-0.5">{facility.tamilName}</p>
            <p className="text-xs text-teal-300/80 mt-1">{facility.address}</p>
          </div>

          {/* Service badge */}
          {facility.service_requested && (
            <div className="flex items-center justify-between text-xs bg-teal-950/60 p-2.5 rounded-lg border border-teal-800/50">
              <span className="text-teal-200">Service: {facility.service_requested}</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                facility.service_status === "AVAILABLE"
                  ? "bg-emerald-900 text-emerald-300 border border-emerald-700"
                  : facility.service_status === "LIMITED"
                  ? "bg-amber-900 text-amber-300 border border-amber-700"
                  : "bg-rose-900 text-rose-300 border border-rose-700"
              }`}>
                {facility.service_status}
              </span>
            </div>
          )}

          {/* Call & Close */}
          <div className="flex gap-2 pt-1">
            <a
              href={`tel:${facility.phone}`}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition shadow"
            >
              <Phone className="w-4 h-4" />
              {t.callFacility} ({facility.phone})
            </a>
            <button
              onClick={onClose}
              className="bg-teal-800 hover:bg-teal-700 text-teal-200 font-medium py-2.5 px-4 rounded-xl text-xs transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
