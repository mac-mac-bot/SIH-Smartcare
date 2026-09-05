import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Facility } from "../types";
import { Translations } from "../services/i18n";
import { Compass, Phone, AlertTriangle } from "lucide-react";

interface MapViewProps {
  facilities: Facility[];
  userLat: number;
  userLon: number;
  t: Translations;
  onSelectFacility: (fac: Facility) => void;
  onOpenRadar: (fac: Facility) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  facilities,
  userLat,
  userLon,
  t,
  onSelectFacility,
  onOpenRadar
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean previous instance if existing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLon],
        zoom: 11,
        zoomControl: true,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // OSM tile layer with error handling
      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      });

      tileLayer.on("tileerror", () => {
        setTileError(true);
      });

      tileLayer.addTo(map);

      // Custom User Location Marker (Pulse Blue)
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div style="position:relative; display:flex; align-items:center; justify-content:center; width:28px; height:28px;">
            <div style="position:absolute; width:28px; height:28px; border-radius:50%; background:rgba(56,189,248,0.4); animation:ping 1.5s infinite;"></div>
            <div style="position:relative; width:14px; height:14px; border-radius:50%; background:#0284c7; border:2px solid #ffffff; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      L.marker([userLat, userLon], { icon: userIcon })
        .addTo(map)
        .bindPopup("<strong>Your Location</strong><br/>Demo / GPS center");

      // Facility Markers
      facilities.forEach((fac) => {
        const isRecommended = fac.is_top_recommendation;
        const isAvailable = fac.service_status === "AVAILABLE";
        const bgColor = isRecommended ? "#059669" : isAvailable ? "#0d9488" : "#991b1b";

        const facIcon = L.divIcon({
          className: "custom-fac-marker",
          html: `
            <div style="background:${bgColor}; color:white; font-size:10px; font-weight:bold; padding:4px 8px; border-radius:12px; border:2px solid white; box-shadow:0 3px 6px rgba(0,0,0,0.35); white-space:nowrap; display:flex; align-items:center; gap:3px;">
              ${isRecommended ? "⭐ " : ""}${fac.name.split(" ")[0]} (${fac.distance_km || 0}km)
            </div>
          `,
          iconSize: [80, 26],
          iconAnchor: [40, 13]
        });

        const marker = L.marker([fac.latitude, fac.longitude], { icon: facIcon }).addTo(map);

        const popupContent = document.createElement("div");
        popupContent.className = "p-1 space-y-1 text-xs";
        popupContent.innerHTML = `
          <div style="font-weight:bold; font-size:13px; color:#0f172a;">${fac.name}</div>
          <div style="color:#64748b; font-size:11px;">${fac.type} • ${fac.distance_km || 0} km away</div>
          <div style="margin-top:4px; font-size:11px;">
            <strong>${fac.service_requested || "Service"}:</strong> 
            <span style="color:${isAvailable ? "#059669" : "#dc2626"}; font-weight:600;">
              ${fac.service_status || "Check details"}
            </span>
          </div>
          <div style="margin-top:6px; display:flex; gap:6px;">
            <a href="tel:${fac.phone}" style="display:inline-block; background:#0d9488; color:white; padding:4px 8px; border-radius:6px; text-decoration:none; font-size:11px;">
              📞 Call
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
      });

      // Fit bounds to show user and facilities
      const group = L.featureGroup([
        L.marker([userLat, userLon]),
        ...facilities.map((f) => L.marker([f.latitude, f.longitude]))
      ]);
      map.fitBounds(group.getBounds().pad(0.2));
    } catch (e) {
      console.warn("Leaflet map init warning:", e);
      setTileError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [facilities, userLat, userLon]);

  return (
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-teal-200/80 shadow-sm bg-teal-50">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {tileError && (
        <div className="absolute top-2 left-2 right-2 bg-amber-900/90 text-amber-100 p-2 rounded-lg text-xs flex items-center justify-between z-10 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span>Map tiles unavailable offline. Use Zero-Tile Radar.</span>
          </div>
          {facilities.length > 0 && (
            <button
              onClick={() => onOpenRadar(facilities[0])}
              className="bg-amber-700 hover:bg-amber-600 px-2 py-1 rounded text-[11px] font-medium"
            >
              Open Radar
            </button>
          )}
        </div>
      )}

      {/* Floating control to switch to radar */}
      {facilities.length > 0 && (
        <div className="absolute bottom-2 right-2 z-10">
          <button
            onClick={() => onOpenRadar(facilities[0])}
            className="flex items-center gap-1.5 bg-teal-900/90 hover:bg-teal-950 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm border border-teal-700 transition"
          >
            <Compass className="w-3.5 h-3.5 text-teal-300" />
            <span>Zero-Tile Radar</span>
          </button>
        </div>
      )}
    </div>
  );
};
