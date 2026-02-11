"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

interface NotificationSettingsProps {
  phoneNumber?: string;
}

export default function NotificationSettings({ phoneNumber }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({
    whatsappNotifEnabled: false,
    alertThreshold: 100,
    scheduledNotifEnabled: false,
    scheduleTime: "07:00",
    scheduleDays: [] as string[],
  });

  const days = [
    { value: "MON", label: "Sen" },
    { value: "TUE", label: "Sel" },
    { value: "WED", label: "Rab" },
    { value: "THU", label: "Kam" },
    { value: "FRI", label: "Jum" },
    { value: "SAT", label: "Sab" },
    { value: "SUN", label: "Min" },
  ];

  const thresholds = [
    { value: 50, label: "SEDANG (ISPU > 50)", color: "text-yellow-600" },
    { value: 100, label: "TIDAK SEHAT (ISPU > 100)", color: "text-orange-600" },
    { value: 200, label: "SANGAT TIDAK SEHAT (ISPU > 200)", color: "text-red-600" },
    { value: 300, label: "BERBAHAYA (ISPU > 300)", color: "text-red-800" },
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/notifications/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          whatsappNotifEnabled: data.whatsappNotifEnabled,
          alertThreshold: data.alertThreshold || 100,
          scheduledNotifEnabled: data.scheduledNotifEnabled,
          scheduleTime: data.scheduleTime || "07:00",
          scheduleDays: data.scheduleDays || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Gagal menyimpan pengaturan");
      }
    } catch (err) {
      setError("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setSettings((prev) => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(day)
        ? prev.scheduleDays.filter((d) => d !== day)
        : [...prev.scheduleDays, day],
    }));
  };

  if (loading) {
    return (
      <div className="flex !items-center !justify-center !py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="!space-y-6">
      {/* Success Banner */}
      {success && (
        <div className="!rounded-xl !border !border-green-200 !bg-green-50 !px-4 !py-3 !text-sm !text-green-700 flex !items-center !gap-2">
          <CheckCircle2 size={16} />
          Pengaturan notifikasi berhasil disimpan!
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="!rounded-xl !border !border-red-200 !bg-red-50 !px-4 !py-3 !text-sm !text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex !items-start !justify-between">
        <div>
          <h3 className="!text-lg !font-semibold !mb-1">Notifikasi WhatsApp</h3>
          <p className="!text-sm !text-gray-600">
            Dapatkan peringatan kualitas udara langsung di WhatsApp
          </p>
        </div>
        {settings.whatsappNotifEnabled ? (
          <Bell className="w-5 h-5 text-green-600" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
      </div>

      {/* Phone Number Warning */}
      {!phoneNumber && (
        <div className="!p-4 !bg-yellow-50 !border !border-yellow-200 !rounded-lg">
          <div className="flex !items-start !gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 !mt-0.5" />
            <div>
              <p className="!text-sm !font-medium !text-yellow-800">
                Nomor telepon belum diisi
              </p>
              <p className="!text-sm !text-yellow-700 !mt-1">
                Silakan isi nomor telepon di profil Anda terlebih dahulu untuk mengaktifkan notifikasi WhatsApp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="!p-4 !bg-gray-50 !rounded-lg">
        <label className="flex !items-center !justify-between !cursor-pointer">
          <div>
            <p className="!font-medium">Aktifkan Notifikasi WhatsApp</p>
            <p className="!text-sm !text-gray-600 !mt-1">
              {phoneNumber ? `Kirim ke: ${phoneNumber}` : "Nomor telepon belum diisi"}
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-info !bg-white"
            checked={settings.whatsappNotifEnabled}
            disabled={!phoneNumber}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, whatsappNotifEnabled: e.target.checked }))
            }
          />
        </label>
      </div>

      {settings.whatsappNotifEnabled && (
        <>
          {/* Threshold Alert Settings */}
          <div className="!space-y-3">
            <div className="flex !items-center !gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h4 className="!font-medium">Peringatan Otomatis</h4>
            </div>
            <p className="!text-sm !text-gray-600">
              Kirim notifikasi saat kualitas udara melebihi ambang batas
            </p>
            <div className="!space-y-2">
              {thresholds.map((threshold) => (
                <label
                  key={threshold.value}
                  className="flex !items-center !gap-3 !p-3 !bg-gray-50 !rounded-lg !cursor-pointer hover:!bg-gray-100 !transition-colors"
                >
                  <input
                    type="radio"
                    name="threshold"
                    className="radio radio-info radio-sm !bg-white"
                    checked={settings.alertThreshold === threshold.value}
                    onChange={() =>
                      setSettings((prev) => ({ ...prev, alertThreshold: threshold.value }))
                    }
                  />
                  <span className={`!text-sm !font-medium ${threshold.color}`}>
                    {threshold.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Scheduled Notification Settings */}
          <div className="!space-y-3">
            <div className="flex !items-center !gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="!font-medium">Laporan Harian</h4>
            </div>
            <label className="flex !items-center !justify-between !p-3 !bg-gray-50 !rounded-lg !cursor-pointer">
              <span className="!text-sm">Aktifkan laporan harian</span>
              <input
                type="checkbox"
                className="toggle toggle-info toggle-sm !bg-white"
                checked={settings.scheduledNotifEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, scheduledNotifEnabled: e.target.checked }))
                }
              />
            </label>

            {settings.scheduledNotifEnabled && (
              <div className="!space-y-3 !pl-4">
                {/* Time Picker */}
                <div>
                  <label className="!text-sm !font-medium !mb-2 !block">Jam</label>
                  <input
                    type="time"
                    className="input input-bordered !w-full"
                    value={settings.scheduleTime}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, scheduleTime: e.target.value }))
                    }
                  />
                </div>

                {/* Day Selector */}
                <div>
                  <label className="!text-sm !font-medium !mb-2 !block">Hari</label>
                  <div className="flex !gap-2 !flex-wrap">
                    {days.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`!px-3 !py-2 !rounded-lg !text-sm !font-medium !transition-colors !border-none !cursor-pointer ${
                          settings.scheduleDays.includes(day.value)
                            ? "!bg-blue-600 !text-white"
                            : "!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving || !phoneNumber}
        className="!w-full !px-4 !py-3 !bg-blue-600 !text-white !rounded-xl !font-semibold hover:!bg-blue-700 !transition-colors !border-none !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin !inline !mr-2" />
            Menyimpan...
          </>
        ) : (
          "Simpan Pengaturan"
        )}
      </button>
    </div>
  );
}
