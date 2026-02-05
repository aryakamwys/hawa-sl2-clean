"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import AnimatedDock from "@/components/animata/container/animated-dock";
import { Home, Map, Info, Settings, Layers } from "lucide-react";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const dockItems = [
    { title: "Home", icon: <Home size={22} />, href: "/", active: false },
    { title: "Map", icon: <Map size={22} />, href: "/map", active: true },
    { title: "Layers", icon: <Layers size={22} />, href: "#", active: false },
    { title: "Info", icon: <Info size={22} />, href: "#", active: false },
    { title: "Settings", icon: <Settings size={22} />, href: "#", active: false },
  ];

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map centered on Bandung, Indonesia
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [-6.9175, 107.6191],
          zoom: 12,
          zoomControl: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* Full screen map */}
      <div 
        ref={mapRef} 
        className="w-screen h-screen"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Floating dock at bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <AnimatedDock 
          items={dockItems}
          largeClassName=""
          smallClassName=""
        />
      </div>
    </>
  );
}