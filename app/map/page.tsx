"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import AnimatedDock from "@/components/animata/container/animated-dock";
import SettingsModal from "@/components/SettingsModal";
import { Home, Map, Info, Settings, Layers, User, LogOut, Sparkles, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AIAnalysis {
  status: string;
  headline: string;
  targetGroups?: string;
  analysis: {
    meaningForCitizens: string;
    actionRequired: string;
    safetySteps: string;
  };
  usage?: {
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    cost: string;
  };
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [analyzingDevice, setAnalyzingDevice] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const router = useRouter();

  const handleSettingsClick = () => {
    if (!user) {
      setShowLoginRequired(true);
    } else {
      setShowSettings(true);
    }
  };

  const analyzeIoTDevice = async () => {
    setAnalyzingDevice(true);
    try {
      // Fetch latest device data from API
      const devicesRes = await fetch("/api/admin/devices");
      if (!devicesRes.ok) {
        alert("Failed to fetch device data");
        return;
      }

      const devicesData = await devicesRes.json();
      if (!devicesData.devices || devicesData.devices.length === 0) {
        alert("No device data available");
        return;
      }

      // Get the latest record (first one)
      const latestData = devicesData.devices[0];

      // Analyze with AI using real data
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: latestData.timestamp,
          pm25Raw: parseFloat(latestData.pm25Raw),
          pm25Density: parseFloat(latestData.pm25Density),
          pm10Density: parseFloat(latestData.pm10Density),
          airQualityLevel: latestData.airQualityLevel,
          temperature: parseFloat(latestData.temperature),
          humidity: parseFloat(latestData.humidity),
          pressure: parseFloat(latestData.pressure),
          deviceId: latestData.deviceId,
          location: "Jalan Cisirung, Bandung"
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to analyze");
        return;
      }

      const result = await res.json();
      setAiResult(result);
      setShowAiModal(true);
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("Failed to get AI analysis");
    } finally {
      setAnalyzingDevice(false);
    }
  };

  const dockItems = [
    { title: "Home", icon: <Home size={22} />, href: "/", active: false },
    { title: "Map", icon: <Map size={22} />, href: "/map", active: true },
    { title: "Layers", icon: <Layers size={22} />, href: "#", active: false },
    { title: "Info", icon: <Info size={22} />, href: "#", active: false },
    { title: "Settings", icon: <Settings size={22} />, href: "#", active: false, onClick: handleSettingsClick },
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

        // Add marker for IoT device
        const deviceIcon = L.divIcon({
          className: 'custom-device-marker',
          html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([-6.970145263211866, 107.6167380802031], { icon: deviceIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="min-width: 220px;">
              <div style="font-weight: bold; margin-bottom: 8px;">HAWA IoT Sensor</div>
              <div style="font-size: 13px; color: #666; margin-bottom: 12px;">Device: 10:B4:1D:E8:2E:E4</div>
              <button 
                id="ask-ai-btn"
                style="
                  width: 100%;
                  padding: 10px 16px;
                  background: #005AE1;
                  color: white;
                  border: none;
                  border-radius: 12px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 600;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  transition: all 0.2s ease;
                "
                onmouseover="this.style.background='#004BB8'"
                onmouseout="this.style.background='#005AE1'"
              >
                <span style="font-size: 16px;">✨</span>
                Ask AI
              </button>
            </div>
          `)
          .on('popupopen', () => {
            const btn = document.getElementById('ask-ai-btn');
            if (btn) {
              btn.onclick = analyzeIoTDevice;
            }
          });
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

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Login Required Modal */}
      {showLoginRequired && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl !p-6 max-w-sm w-full !mx-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 !mb-2">Login Required</h3>
              <p className="text-gray-600 !mb-6">You need to login first to access settings.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginRequired(false)}
                  className="flex-1 !px-4 !py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginRequired(false);
                    router.push('/');
                  }}
                  className="flex-1 !px-4 !py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAiModal && aiResult && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl !p-6 max-w-2xl w-full !mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between !mb-4">
              <div>
                <div className="flex items-center gap-2 !mb-2">
                  <Sparkles className="text-purple-600" size={24} />
                  <h3 className="text-xl font-semibold text-gray-900">AI Analysis</h3>
                </div>
                <div className={`inline-flex !px-3 !py-1 rounded-full text-sm font-medium ${
                  aiResult.status === "AMAN" ? "bg-green-100 text-green-700" :
                  aiResult.status === "WASPADA" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {aiResult.status}
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {/* Headline */}
            <div className="!mb-4 !p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
              <p className="text-lg font-semibold text-gray-900">{aiResult.headline}</p>
              {aiResult.targetGroups && (
                <p className="text-sm text-gray-600 !mt-2">
                  <span className="font-medium">Perhatian khusus:</span> {aiResult.targetGroups}
                </p>
              )}
            </div>

            {/* Analysis Sections */}
            <div className="space-y-4">
              {/* Meaning for Citizens */}
              <div className="!p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 !mb-2">📊 Apa Artinya Buat Warga</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{aiResult.analysis.meaningForCitizens}</p>
              </div>

              {/* Action Required */}
              <div className="!p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="text-sm font-semibold text-amber-900 !mb-2">⚡ Apa yang Harus Dilakukan Sekarang</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{aiResult.analysis.actionRequired}</p>
              </div>

              {/* Safety Steps */}
              <div className="!p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="text-sm font-semibold text-green-900 !mb-2">🛡️ Langkah Aman</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{aiResult.analysis.safetySteps}</p>
              </div>
            </div>

            {/* Usage Info (Admin only) */}
            {aiResult.usage && (
              <div className="!mt-4 !p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Tokens:</span> {aiResult.usage.tokenUsage.totalTokens} 
                  ({aiResult.usage.tokenUsage.promptTokens} prompt + {aiResult.usage.tokenUsage.completionTokens} completion)
                  <span className="!ml-3 font-medium">Cost:</span> {aiResult.usage.cost}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay for AI */}
      {analyzingDevice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl !p-6 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-purple-600" size={32} />
            <p className="text-sm text-gray-600">Analyzing air quality...</p>
          </div>
        </div>
      )}
    </>
  );
}