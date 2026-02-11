"use client";

import { useState, useEffect } from "react";
import { X, Thermometer, Droplets, Wind } from "lucide-react";
import LottieLoader from "@/components/LottieLoader";
import GroqIcon from "@/components/GroqIcon";

interface RegionForecastModalProps {
  regionId: string;
  regionName: string;
  onClose: () => void;
}

interface ForecastData {
  region: string;
  regionId: string;
  climate: {
    month: string;
    year: number;
    temperature: { min: number; max: number; avg: number };
    humidity: { min: number; max: number; avg: number };
    wind: { min: number; max: number; avg: number };
  };
  aiPrediction: string;
}

export default function RegionForecastModal({
  regionId,
  regionName,
  onClose,
}: RegionForecastModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ForecastData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchForecast();
  }, [regionId]);

  const fetchForecast = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/regions/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId, regionName }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil data");
      }

      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Gagal memuat data forecast. Coba lagi.");
      console.error("[RegionForecast] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !flex !items-center !justify-center !z-[10000] !p-4">
      <div className="!bg-white/95 !backdrop-blur-md !rounded-2xl !w-full !max-w-lg !max-h-[90vh] !overflow-y-auto !shadow-2xl !border !border-gray-200/50 !p-6">
        {/* Header — matching Groq AI Analysis style */}
        <div className="!flex !items-start !justify-between !mb-5">
          <div>
            <div className="!flex !items-center !gap-2.5 !mb-2">
              <GroqIcon size={22} className="!text-[#F55036]" />
              <h3 className="!text-xl !font-bold !text-gray-900 !m-0">{regionName}</h3>
            </div>
            {data && (
              <div className="!inline-flex !px-3 !py-1 !rounded-full !text-sm !font-semibold !bg-blue-50 !text-blue-700 !border !border-blue-200">
                Data Iklim {data.climate.month} {data.climate.year}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="!text-gray-400 hover:!text-gray-600 !p-1 !rounded-lg hover:!bg-gray-100 !transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {loading ? (
          <div className="!flex !flex-col !items-center !justify-center !py-10">
            <LottieLoader size={100} text="Menganalisis data iklim..." />
          </div>
        ) : error ? (
          <div className="!text-center !py-8">
            <p className="!text-red-500 !mb-3">{error}</p>
            <button
              onClick={fetchForecast}
              className="!px-4 !py-2 !bg-[#005AE1] !text-white !rounded-xl !text-sm hover:!bg-[#004BB8] !transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : data ? (
          <div className="!space-y-4">
            {/* Climate Headline */}
            <div className="!p-4 !bg-gradient-to-r !from-gray-50 !to-slate-50 !rounded-xl !border !border-gray-200">
              <h4 className="!text-sm !font-bold !text-gray-800 !mb-3 !tracking-wide !uppercase" style={{fontSize: '11px', letterSpacing: '0.05em'}}>Data Sensor Iklim</h4>
              <div className="!grid !grid-cols-3 !gap-3">
                {/* Temperature */}
                <div className="!text-center">
                  <div className="!flex !items-center !justify-center !gap-1 !mb-1">
                    <Thermometer size={13} className="!text-orange-500" />
                    <span className="!text-xs !font-semibold !text-gray-500">Suhu</span>
                  </div>
                  <div className="!text-lg !font-bold !text-gray-900">{data.climate.temperature.avg}°C</div>
                  <div className="!text-xs !text-gray-400">{data.climate.temperature.min}° — {data.climate.temperature.max}°</div>
                </div>
                {/* Humidity */}
                <div className="!text-center">
                  <div className="!flex !items-center !justify-center !gap-1 !mb-1">
                    <Droplets size={13} className="!text-blue-500" />
                    <span className="!text-xs !font-semibold !text-gray-500">Kelembaban</span>
                  </div>
                  <div className="!text-lg !font-bold !text-gray-900">{data.climate.humidity.avg}%</div>
                  <div className="!text-xs !text-gray-400">{data.climate.humidity.min}% — {data.climate.humidity.max}%</div>
                </div>
                {/* Wind */}
                <div className="!text-center">
                  <div className="!flex !items-center !justify-center !gap-1 !mb-1">
                    <Wind size={13} className="!text-emerald-500" />
                    <span className="!text-xs !font-semibold !text-gray-500">Angin</span>
                  </div>
                  <div className="!text-lg !font-bold !text-gray-900">{data.climate.wind.avg} <span className="!text-xs !font-normal">kn</span></div>
                  <div className="!text-xs !text-gray-400">{data.climate.wind.min} — {data.climate.wind.max} kn</div>
                </div>
              </div>
            </div>

            {/* AI Prediction — matching Groq Analysis card style */}
            <div className="!p-4 !bg-white !rounded-xl !border !border-gray-200">
              <h4 className="!text-sm !font-bold !text-gray-800 !mb-2 !tracking-wide !uppercase" style={{fontSize: '11px', letterSpacing: '0.05em'}}>Prediksi Kualitas Udara</h4>
              <p className="!text-sm !text-gray-600 !leading-relaxed !whitespace-pre-line">
                {data.aiPrediction}
              </p>
            </div>

            {/* Data Source */}
            <p className="!text-xs !text-gray-400 !text-center">
              Sumber data: BPS Kota Bandung — AI: Groq (llama-4-scout)
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
