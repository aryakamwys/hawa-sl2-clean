"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import AnimatedDock from "@/components/animata/container/animated-dock";
import { Home, Map, Info, Settings, Layers, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const dockItems = [
    { title: "Home", icon: <Home size={22} />, href: "/", active: false },
    { title: "Map", icon: <Map size={22} />, href: "/map", active: true },
    { title: "Layers", icon: <Layers size={22} />, href: "#", active: false },
    { title: "Info", icon: <Info size={22} />, href: "#", active: false },
    { title: "Settings", icon: <Settings size={22} />, href: "#", active: false },
  ];

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setShowDropdown(false);
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

      {/* User card in top right corner */}
      <div className="fixed top-4 right-4 z-[1000]">
        {loading ? (
          <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg">
            <div className="w-20 h-5 bg-gray-200 animate-pulse rounded" />
          </div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-xl !px-2 !py-1 shadow-lg hover:shadow-xl transition-all duration-200 border border-white/50"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.charAt(0).toUpperCase() || <User size={16} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role === 'ADMIN' ? 'Admin' : 'User'}</p>
              </div>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute top-full right-0 !mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[160px]">
                <div className="!px-4 !py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 !px-2 !py-1 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/"
            className="flex items-center gap-2 bg-white-500/10 hover:bg-blue-500/20 text-blue-800 backdrop-blur-md border border-blue-500/20 rounded-xl !px-4 !py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-sm"
          >
            <User size={18} />
            Login
          </a>
        )}
      </div>
      
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