"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, AlertCircle } from "lucide-react";
import LottieLoader from "@/components/LottieLoader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface ForecastPrediction {
  timestamp: string;
  "PM2.5_ug_m3": number;
  "PM10_ug_m3": number;
  "aqi_ispu": number;
  category: string;
}

interface ForecastData {
  predictions: ForecastPrediction[];
  metadata: {
    generatedAt: string;
    historicalDataPoints: number;
    historicalDataRange: {
      from: string;
      to: string;
    };
    predictionCount: number;
  };
}

interface ForecastModalProps {
  onClose: () => void;
}

export default function ForecastModal({ onClose }: ForecastModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/forecast/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate forecast");
      }

      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getISPUColor = (ispu: number) => {
    if (ispu <= 50) return "#10b981"; // Green - BAIK
    if (ispu <= 100) return "#3b82f6"; // Blue - SEDANG
    if (ispu <= 200) return "#f59e0b"; // Orange - TIDAK SEHAT
    if (ispu <= 300) return "#ef4444"; // Red - SANGAT TIDAK SEHAT
    return "#7f1d1d"; // Dark Red - BERBAHAYA
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "BAIK":
        return "!bg-green-100 !text-green-800 !border-green-300";
      case "SEDANG":
        return "!bg-blue-100 !text-blue-800 !border-blue-300";
      case "TIDAK SEHAT":
        return "!bg-orange-100 !text-orange-800 !border-orange-300";
      case "SANGAT TIDAK SEHAT":
        return "!bg-red-100 !text-red-800 !border-red-300";
      case "BERBAHAYA":
        return "!bg-red-900 !text-white !border-red-900";
      default:
        return "!bg-gray-100 !text-gray-800 !border-gray-300";
    }
  };

  // Transform data for charts
  const chartData = forecastData?.predictions.map((pred) => ({
    time: format(new Date(pred.timestamp), "HH:00"),
    date: format(new Date(pred.timestamp), "dd MMM"),
    PM25: pred["PM2.5_ug_m3"],
    PM10: pred["PM10_ug_m3"],
    ISPU: pred["aqi_ispu"],
    category: pred.category,
  }));

  return (
    <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-[2000] !flex !items-center !justify-center !p-4">
      <div className="!bg-white !rounded-2xl !shadow-2xl !w-full !max-w-6xl !max-h-[90vh] !flex !flex-col !overflow-hidden">
        {/* Header */}
        <div className="!flex !items-center !justify-between !px-6 !py-4 !border-b !border-gray-200">
          <div>
            <h2 className="!text-2xl !font-bold !text-gray-900 !m-0">48-Hour Air Quality Forecast</h2>
            <p className="!text-sm !text-gray-600 !mt-1 !m-0">
              Prediksi kualitas udara untuk 2 hari ke depan
            </p>
          </div>
          <div className="!flex !items-center !gap-2">
            <button
              onClick={fetchForecast}
              disabled={loading}
              className="!p-2 hover:!bg-gray-100 !rounded-lg !transition-colors !bg-transparent !border-none !cursor-pointer disabled:!opacity-50"
              title="Refresh forecast"
            >
              <RefreshCw size={20} className={`!text-gray-600 ${loading ? "!animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="!p-2 hover:!bg-gray-100 !rounded-lg !transition-colors !bg-transparent !border-none !cursor-pointer"
            >
              <X size={22} className="!text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="!flex-1 !overflow-y-auto !p-6">
          {loading && (
            <div className="!flex !flex-col !items-center !justify-center !py-16">
              <LottieLoader size={120} text="Generating forecast..." />
              <p className="!text-gray-500 !text-sm !mt-2">Analyzing historical data and predicting trends</p>
            </div>
          )}

          {error && (
            <div className="!flex !flex-col !items-center !justify-center !py-20">
              <div className="!w-16 !h-16 !bg-red-100 !rounded-full !flex !items-center !justify-center !mb-4">
                <AlertCircle className="!text-red-600" size={32} />
              </div>
              <h3 className="!text-xl !font-bold !text-gray-900 !mb-2">Failed to Generate Forecast</h3>
              <p className="!text-gray-600 !text-center !max-w-md">{error}</p>
              <button
                onClick={fetchForecast}
                className="!mt-6 !px-6 !py-3 !bg-[#005AE1] !text-white !rounded-xl !font-semibold hover:!bg-[#004BB8] !transition-colors !border-none !cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {forecastData && chartData && (
            <div className="!space-y-6">
              {/* Metadata */}
              <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-4">
                <div className="!p-4 !bg-gray-50 !rounded-xl !border !border-gray-200">
                  <div className="!text-sm !text-gray-600 !mb-1">Generated At</div>
                  <div className="!text-lg !font-bold !text-gray-900">
                    {format(new Date(forecastData.metadata.generatedAt), "dd MMM yyyy, HH:mm")}
                  </div>
                </div>
                <div className="!p-4 !bg-gray-50 !rounded-xl !border !border-gray-200">
                  <div className="!text-sm !text-gray-600 !mb-1">Historical Data</div>
                  <div className="!text-lg !font-bold !text-gray-900">
                    {forecastData.metadata.historicalDataPoints} points
                  </div>
                </div>
                <div className="!p-4 !bg-gray-50 !rounded-xl !border !border-gray-200">
                  <div className="!text-sm !text-gray-600 !mb-1">Predictions</div>
                  <div className="!text-lg !font-bold !text-gray-900">
                    {forecastData.metadata.predictionCount} hours
                  </div>
                </div>
              </div>

              {/* PM2.5 Chart */}
              <div className="!p-6 !bg-white !border !border-gray-200 !rounded-xl">
                <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !m-0">PM2.5 Forecast (μg/m³)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="PM25" stroke="#005AE1" strokeWidth={2} name="PM2.5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* PM10 Chart */}
              <div className="!p-6 !bg-white !border !border-gray-200 !rounded-xl">
                <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !m-0">PM10 Forecast (μg/m³)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="PM10" stroke="#70D8FF" strokeWidth={2} name="PM10" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* ISPU Chart */}
              <div className="!p-6 !bg-white !border !border-gray-200 !rounded-xl">
                <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !m-0">ISPU Forecast</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ISPU" stroke="#10b981" strokeWidth={2} name="ISPU" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Hourly Breakdown */}
              <div className="!p-6 !bg-white !border !border-gray-200 !rounded-xl">
                <h3 className="!text-lg !font-bold !text-gray-900 !mb-4 !m-0">Hourly Breakdown</h3>
                <div className="!max-h-96 !overflow-y-auto">
                  <table className="!w-full !text-sm">
                    <thead className="!bg-gray-50 !sticky !top-0">
                      <tr>
                        <th className="!px-4 !py-3 !text-left !font-semibold !text-gray-700">Time</th>
                        <th className="!px-4 !py-3 !text-left !font-semibold !text-gray-700">PM2.5</th>
                        <th className="!px-4 !py-3 !text-left !font-semibold !text-gray-700">PM10</th>
                        <th className="!px-4 !py-3 !text-left !font-semibold !text-gray-700">ISPU</th>
                        <th className="!px-4 !py-3 !text-left !font-semibold !text-gray-700">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastData.predictions.map((pred, index) => (
                        <tr key={index} className="!border-t !border-gray-200 hover:!bg-gray-50">
                          <td className="!px-4 !py-3 !text-gray-900">
                            {format(new Date(pred.timestamp), "dd MMM, HH:00")}
                          </td>
                          <td className="!px-4 !py-3 !text-gray-900">{pred["PM2.5_ug_m3"].toFixed(1)}</td>
                          <td className="!px-4 !py-3 !text-gray-900">{pred["PM10_ug_m3"].toFixed(1)}</td>
                          <td className="!px-4 !py-3 !font-semibold" style={{ color: getISPUColor(pred["aqi_ispu"]) }}>
                            {pred["aqi_ispu"]}
                          </td>
                          <td className="!px-4 !py-3">
                            <span
                              className={`!inline-block !px-3 !py-1 !rounded-full !text-xs !font-semibold !border ${getCategoryBadgeColor(
                                pred.category
                              )}`}
                            >
                              {pred.category}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
