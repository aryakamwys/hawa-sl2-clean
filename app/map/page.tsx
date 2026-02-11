"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import AnimatedDock from "@/components/animata/container/animated-dock";
import SettingsModal from "@/components/SettingsModal";
import InfoModal from "@/components/InfoModal";
import GameHubModal from "@/components/gamification/GameHubModal";
import ForecastModal from "@/components/forecast/ForecastModal";
import RegionForecastModal from "@/components/map/RegionForecastModal";
import { Home, Map, Info, Settings, Gamepad2, User, LogOut, Loader2, X, TrendingUp, Send, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import LottieLoader from "@/components/LottieLoader";
import MetaIcon from "@/components/MetaIcon";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useLanguage } from "@/hooks/useLanguage";





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
  const { t, language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [analyzingDevice, setAnalyzingDevice] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showGameHub, setShowGameHub] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [latestDeviceData, setLatestDeviceData] = useState<any>(null);
  const [selectedRegion, setSelectedRegion] = useState<{ id: string; name: string } | null>(null);
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
          location: "Jalan Cisirung, Bandung",
          language // Pass language to API
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to analyze");
        return;
      }

      const result = await res.json();
      setAiResult(result);
      setLatestDeviceData(latestData); // Store for WhatsApp sending
      setShowAiModal(true);
    } catch (error) {
      console.error("AI analysis error:", error);
      alert("Failed to get AI analysis");
    } finally {
      setAnalyzingDevice(false);
    }
  };

  const sendToWhatsApp = async () => {
    if (!latestDeviceData || !aiResult) {
      alert("No data available to send");
      return;
    }

    setSendingWhatsApp(true);
    try {
      const pm25 = parseFloat(latestDeviceData.pm25Density) || 0;
      const pm10 = parseFloat(latestDeviceData.pm10Density) || 0;
      
      const calculateISPU = (p25: number, p10: number) => {
        const pm25ISPU = p25 <= 15.5 ? 50 : p25 <= 55.4 ? 100 : p25 <= 150.4 ? 200 : p25 <= 250.4 ? 300 : 500;
        const pm10ISPU = p10 <= 50 ? 50 : p10 <= 150 ? 100 : p10 <= 350 ? 200 : p10 <= 420 ? 300 : 500;
        return Math.max(pm25ISPU, pm10ISPU);
      };

      const ispu = calculateISPU(pm25, pm10);
      const category = aiResult.status || "SEDANG";

      console.log("[WA Debug] Sending:", { pm25, pm10, ispu, category });

      const res = await fetch("/api/notifications/send-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pm25: pm25 || 1,
          pm10: pm10 || 1,
          ispu: ispu || 50,
          category,
          location: "Jalan Cisirung, Bandung",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[WA Debug] Error response:", data);
        alert(data.message || data.error || "Failed to send WhatsApp notification");
        return;
      }

      alert("✅ Rekomendasi berhasil dikirim ke WhatsApp!");
    } catch (error) {
      console.error("WhatsApp send error:", error);
      alert("❌ Gagal mengirim ke WhatsApp");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const dockItems = [
    { title: "Home", icon: <Home size={22} />, href: "/", active: false },
    { title: "Map", icon: <Map size={22} />, href: "/map", active: true },
    { title: "Forecast", icon: <TrendingUp size={22} />, href: "#", active: false, onClick: () => setShowForecast(true) },
    { title: "Point", icon: <Gamepad2 size={22} />, href: "#", active: false, onClick: () => setShowGameHub(true) },
    { title: "Info", icon: <Info size={22} />, href: "#", active: false, onClick: () => setShowInfo(true) },
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

        // Add marker for IoT device with Lottie animation
        const deviceIcon = L.divIcon({
          className: 'custom-device-marker',
          html: '<dotlottie-player src="https://lottie.host/c353be7e-e6ea-4b7c-9042-e6fb0acabf55/r1pijIcpRs.lottie" background="transparent" speed="1" style="width: 56px; height: 56px;" loop autoplay></dotlottie-player>',
          iconSize: [56, 56],
          iconAnchor: [28, 28],
        });

        // IoT Device locations in Bandung
        const iotDevices = [
          { lat: -6.9311, lng: 107.6048, name: "HAWA IoT Sensor — Cicendo", deviceId: "10:B4:1D:E8:2E:E4" },
          { lat: -6.9147, lng: 107.6189, name: "HAWA IoT Sensor — Coblong", deviceId: "10:B4:1D:E8:2E:E5" },
          { lat: -6.9224, lng: 107.6378, name: "HAWA IoT Sensor — Cibeunying Kaler", deviceId: "10:B4:1D:E8:2E:E6" },
          { lat: -6.9410, lng: 107.6317, name: "HAWA IoT Sensor — Batununggal", deviceId: "10:B4:1D:E8:2E:E7" },
        ];

        // Add markers for all IoT devices
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          iotDevices.forEach((device) => {
            L.marker([device.lat, device.lng], { icon: deviceIcon })
              .addTo(map)
              .bindPopup(`
                <div style="min-width: 240px; background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 16px; padding: 16px; border: 1px solid rgba(0,90,225,0.1);">
                  <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #111;">${device.name}</div>
                  <div style="font-size: 12px; color: #888; margin-bottom: 14px; font-family: monospace;">${device.deviceId}</div>
                  <button
                    id="ask-ai-btn-${device.deviceId}"
                    style="
                      width: 100%;
                      padding: 11px 16px;
                      background: linear-gradient(135deg, #F55036, #E8380D);
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
                      box-shadow: 0 2px 8px rgba(245,80,54,0.3);
                    "
                    onmouseover="this.style.opacity='0.9'"
                    onmouseout="this.style.opacity='1'"
                  >
                    <svg width='16' height='16' viewBox='0 0 1981.58 562.32' fill='white' xmlns='http://www.w3.org/2000/svg'><path d='M1378.01.31h-.04c-109.6 0-198.78 89.18-198.78 198.78s89.18 198.78 198.78 198.78 198.78-89.18 198.78-198.81C1576.56 89.66 1487.4.5 1378.01.31m93.33 198.78c0 51.49-41.88 93.36-93.36 93.36s-93.36-41.88-93.36-93.36 41.88-93.36 93.36-93.36 93.36 41.87 93.36 93.36M908.86 180.75c.43-11.74 1.43-23.13 3.67-34.68l.05-.23c2.83-13.62 7.15-26.73 12.81-38.99 11.8-25.1 29.21-47.21 50.41-64.03 20.78-16.39 45.11-28.6 70.38-35.33 12.4-3.45 25.23-5.67 38.18-6.6 28.63-2.05 56.94 1.15 83.9 11.24 9.98 3.74 19.95 8.47 29.26 13.87l15.78 9.17-50.61 88.04-15.8-8.8c-10.95-6.1-22.78-9.84-35.16-11.11-12.97-1.17-26.36 0-38.93 3.43-11.9 3.18-23.24 8.94-32.86 16.64-9 7.25-16.26 16.51-20.96 26.71-5.08 11.01-6.98 23.13-6.98 35.17v199.17H908.85V180.75ZM873.03 187.44c-1.25-50.37-21.77-97.51-57.79-132.72C779.25 19.54 731.74.1 681.47 0h-1.63C574.85 0 488.97 85.15 488.05 190.59c-.45 51.35 19.07 99.82 54.95 136.49 35.9 36.68 83.86 57.12 135.2 57.57h58.51V282.78h-55.55c-24.09.33-46.84-8.87-64.06-25.73-17.24-16.87-26.88-39.48-27.14-63.68-.55-49.87 39.38-90.9 89.04-91.5h2.39c49.58 0 90.14 40.58 90.42 90.37v177.83c0 49.22-40.06 89.74-89.31 90.37-23.59-.18-45.76-9.55-62.43-26.43l-12.93-13.07-.05.05-51.98 91.8c34.69 31.66 79.12 49.17 126.28 49.52h2.59c50.55-.72 97.97-20.94 133.54-56.97 35.54-36.02 55.27-83.78 55.53-134.6V187.46H873v-.02ZM1790.21.29c-51.34 0-99.58 20.01-135.85 56.38-36.21 36.3-56.11 84.53-56.01 135.76 0 105.86 86.07 191.97 191.87 191.97h54.41V282.67h-54.41c-49.74 0-90.19-40.48-90.19-90.24s40.45-90.24 90.19-90.24c22.6 0 44.23 8.44 60.92 23.76 16.11 14.8 28.77 34.62 28.77 56.46v367.66h101.67V192.43c0-105.94-85.85-192.14-191.37-192.14M165.98 342.21H0L272.4 1.5l-68.75 220.11H369.6L97.23 562.32z'/></svg>
                    ${t?.map?.analysisTitle || "Meta AI Analysis"}
                  </button>
                </div>
              `, { className: 'leaflet-popup-transparent' })
              .on("popupopen", () => {
                const btn = document.getElementById(`ask-ai-btn-${device.deviceId}`);
                if (btn) {
                  btn.onclick = analyzeIoTDevice;
                }
              });
          });
        }
        // Load GeoJSON kecamatan boundaries
        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          fetch('/bandung-kecamatan.geojson')
            .then(res => res.json())
            .then(geojsonData => {
              L.geoJSON(geojsonData, {
                style: () => ({
                  color: '#005AE1',
                  weight: 0.8,
                  opacity: 0.25,
                  fillColor: 'transparent',
                  fillOpacity: 0,
                }),
                onEachFeature: (feature, layer) => {
                  const name = feature.properties?.nama_kecamatan || 'Unknown';
                  const id = feature.properties?.id_kecamatan || '';
                  layer.bindTooltip(name, {
                    permanent: false,
                    direction: 'center',
                    className: 'kecamatan-tooltip',
                  });
                  layer.on('mouseover', () => {
                    (layer as any).setStyle({ fillColor: '#005AE1', fillOpacity: 0.2, weight: 1.8, opacity: 0.7 });
                  });
                  layer.on('mouseout', () => {
                    (layer as any).setStyle({ fillColor: 'transparent', fillOpacity: 0, weight: 0.8, opacity: 0.25 });
                  });
                  layer.on('click', () => {
                    window.dispatchEvent(new CustomEvent('kecamatan-click', { detail: { id, name } }));
                  });
                },
              }).addTo(map);
            })
            .catch(err => console.error('Failed to load GeoJSON:', err));
        }
      }
    });

    // Listen for kecamatan clicks
    const handleKecClick = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSelectedRegion({ id: detail.id, name: detail.name });
    };
    window.addEventListener('kecamatan-click', handleKecClick);

    return () => {
      window.removeEventListener('kecamatan-click', handleKecClick);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [language]); // Re-run when language changes

  // Driver.js Tour
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { 
          element: '#user-profile-card', 
          popover: { 
            title: t?.map?.tour?.profileTitle || "Profil & Akun", 
            description: t?.map?.tour?.profileDesc || "Login untuk akses fitur personalisasi dan notifikasi WhatsApp.", 
            side: "left", 
            align: 'start' 
          } 
        },
        { 
          element: '#dock-container', 
          popover: { 
            title: t?.map?.tour?.navTitle || "Menu Navigasi", 
            description: t?.map?.tour?.navDesc || "Akses cepat ke Forecast, Game Hub, Info, dan Pengaturan.", 
            side: "top", 
            align: 'center' 
          } 
        },
        { 
          popover: { 
            title: t?.map?.tour?.interactionTitle || "Interaksi Peta", 
            description: t?.map?.tour?.interactionDesc || "Klik wilayah kecamatan untuk data iklim, atau klik marker sensor untuk analisis AI.", 
          } 
        }
      ]
    });
    driverObj.drive();
  };

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hawa_map_tour_seen');
    if (!hasSeenTour) {
      setTimeout(() => {
        startTour();
        localStorage.setItem('hawa_map_tour_seen', 'true');
      }, 2000);
    }
  }, [language]);

  return (
    <>
      {/* Full screen map */}
      <div 
        id="map-container"
        ref={mapRef} 
        className="w-screen h-screen"
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Tools Button Only */}
      <div className="fixed top-4 left-4 z-[1000]">
        <button
          id="tutorial-btn"
          onClick={startTour}
          className="p-3 bg-white/90 backdrop-blur-md text-[#005AE1] hover:bg-white rounded-2xl shadow-lg border border-white/50 transition-all active:scale-95"
          title={t?.map?.startTutorial || "Mulai Tutorial"}
        >
          <HelpCircle size={20} />
        </button>
      </div>

      {/* User card in top right corner */}
      <div id="user-profile-card" className="fixed top-4 right-4 z-[1000]">
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
                  {t?.nav?.logout || "Logout"}
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
            {t?.nav?.login || "Login"}
          </a>
        )}
      </div>
      
      {/* Floating dock at bottom */}
      <div id="dock-container" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
        <AnimatedDock 
          items={dockItems}
          largeClassName=""
          smallClassName=""
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* Info Modal */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* Game Hub Modal */}
      {showGameHub && <GameHubModal onClose={() => setShowGameHub(false)} />}

      {/* Forecast Modal */}
      {showForecast && <ForecastModal onClose={() => setShowForecast(false)} />}

      {/* Region Forecast Modal */}
      {selectedRegion && (
        <RegionForecastModal
          regionId={selectedRegion.id}
          regionName={selectedRegion.name}
          onClose={() => setSelectedRegion(null)}
        />
      )}

      {/* Login Required Modal */}
      {showLoginRequired && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl !p-6 max-w-sm w-full !mx-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 !mb-2">{t?.map?.loginRequired || "Login Required"}</h3>
              <p className="text-gray-600 !mb-6">{t?.map?.loginRequiredDesc || "You need to login first to access settings."}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginRequired(false)}
                  className="flex-1 !px-4 !py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {t?.map?.cancel || "Cancel"}
                </button>
                <button
                  onClick={() => {
                    setShowLoginRequired(false);
                    router.push('/');
                  }}
                  className="flex-1 !px-4 !py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  {t?.nav?.login || "Login"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {showAiModal && aiResult && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl !p-6 max-w-2xl w-full !mx-4 max-h-[80vh] overflow-y-auto border border-gray-200/50">
            {/* Header */}
            <div className="flex items-start justify-between !mb-5">
              <div>
                <div className="flex items-center gap-2.5 !mb-2">
                  <MetaIcon size={22} className="text-[#0081FB]" />
                  <h3 className="text-xl font-bold text-gray-900">{t?.map?.analysisTitle || "Meta AI Analysis"}</h3>
                </div>
                <div className={`inline-flex !px-3 !py-1 rounded-full text-sm font-semibold ${
                  aiResult.status === "AMAN" ? "bg-green-50 text-green-700 border border-green-200" :
                  aiResult.status === "WASPADA" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                  "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {aiResult.status}
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Headline */}
            <div className="!mb-5 !p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
              <p className="text-base font-semibold text-gray-900 leading-relaxed">{aiResult.headline}</p>
              {aiResult.targetGroups && (
                <p className="text-sm text-gray-500 !mt-2">
                  <span className="font-semibold text-gray-700">Perhatian khusus:</span> {aiResult.targetGroups}
                </p>
              )}
            </div>

            {/* Analysis Sections */}
            <div className="space-y-3">
              <div className="!p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-800 !mb-2 tracking-wide uppercase" style={{fontSize: '11px', letterSpacing: '0.05em'}}>{t?.map?.meaning || "Meaning for Citizens"}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{aiResult.analysis.meaningForCitizens}</p>
              </div>

              <div className="!p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-800 !mb-2 tracking-wide uppercase" style={{fontSize: '11px', letterSpacing: '0.05em'}}>{t?.map?.action || "Action Required"}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{aiResult.analysis.actionRequired}</p>
              </div>

              <div className="!p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="text-sm font-bold text-gray-800 !mb-2 tracking-wide uppercase" style={{fontSize: '11px', letterSpacing: '0.05em'}}>{t?.map?.safety || "Safety Steps"}</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{aiResult.analysis.safetySteps}</p>
              </div>
            </div>

            {/* WhatsApp Button */}
            <div className="!mt-4">
              <button
                onClick={sendToWhatsApp}
                disabled={sendingWhatsApp}
                className="w-full flex items-center justify-center gap-2 !px-4 !py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingWhatsApp ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    {t?.map?.sending || "Sending..."}
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    {t?.map?.sendWhatsapp || "Send Recommendation to WhatsApp"}
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center !mt-2">
                {t?.map?.whatsappDesc || "Get this recommendation directly on your WhatsApp"}
              </p>
            </div>

            {/* Usage Info (Admin only) */}
            {aiResult.usage && (
              <div className="!mt-4 !p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Tokens:</span> {aiResult.usage.tokenUsage.totalTokens} 
                  ({aiResult.usage.tokenUsage.promptTokens} prompt + {aiResult.usage.tokenUsage.completionTokens} completion)
                  <span className="!ml-3 font-medium text-gray-700">Cost:</span> {aiResult.usage.cost}
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
            <LottieLoader size={80} text={t?.map?.analyzing || "Analyzing..."} />
          </div>
        </div>
      )}
    </>
  );
}