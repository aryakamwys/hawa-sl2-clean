"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface NotificationSettingsProps {
  phoneNumber?: string;
}

export default function NotificationSettings({ phoneNumber }: NotificationSettingsProps) {
  const { t } = useLanguage();
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
    { value: "MON", label: t?.settings?.notificationSettings?.daysMap?.MON || "Sen" },
    { value: "TUE", label: t?.settings?.notificationSettings?.daysMap?.TUE || "Sel" },
    { value: "WED", label: t?.settings?.notificationSettings?.daysMap?.WED || "Rab" },
    { value: "THU", label: t?.settings?.notificationSettings?.daysMap?.THU || "Kam" },
    { value: "FRI", label: t?.settings?.notificationSettings?.daysMap?.FRI || "Jum" },
    { value: "SAT", label: t?.settings?.notificationSettings?.daysMap?.SAT || "Sab" },
    { value: "SUN", label: t?.settings?.notificationSettings?.daysMap?.SUN || "Min" },
  ];

  const thresholds = [
    { value: 50, label: t?.settings?.notificationSettings?.thresholds?.["50"] || "SEDANG (ISPU > 50)", color: "text-yellow-600" },
    { value: 100, label: t?.settings?.notificationSettings?.thresholds?.["100"] || "TIDAK SEHAT (ISPU > 100)", color: "text-orange-600" },
    { value: 200, label: t?.settings?.notificationSettings?.thresholds?.["200"] || "SANGAT TIDAK SEHAT (ISPU > 200)", color: "text-red-600" },
    { value: 300, label: t?.settings?.notificationSettings?.thresholds?.["300"] || "BERBAHAYA (ISPU > 300)", color: "text-red-800" },
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
        setError(errorData.message || t?.settings?.notificationSettings?.error || "Gagal menyimpan pengaturan");
      }
    } catch (err) {
      setError(t?.settings?.notificationSettings?.error || "Gagal menyimpan pengaturan");
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
          {t?.settings?.notificationSettings?.success || "Pengaturan notifikasi berhasil disimpan!"}
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
          <h3 className="!text-lg !font-semibold !mb-1">{t?.settings?.notificationSettings?.title || "Notifikasi WhatsApp"}</h3>
          <p className="!text-sm !text-gray-600">
            {t?.settings?.notificationSettings?.description || "Dapatkan peringatan kualitas udara langsung di WhatsApp"}
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
                {t?.settings?.notificationSettings?.phoneMissing || "Nomor telepon belum diisi"}
              </p>
              <p className="!text-sm !text-yellow-700 !mt-1">
                {t?.settings?.notificationSettings?.phoneMissingDesc || "Silakan isi nomor telepon di profil Anda terlebih dahulu untuk mengaktifkan notifikasi WhatsApp."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enable/Disable Toggle */}
      <div className="!p-4 !bg-gray-50 !rounded-lg">
        <label className="flex !items-center !justify-between !cursor-pointer">
          <div>
            <p className="!font-medium">{t?.settings?.notificationSettings?.enable || "Aktifkan Notifikasi WhatsApp"}</p>
            <p className="!text-sm !text-gray-600 !mt-1">
              {phoneNumber ? `${t?.settings?.notificationSettings?.sendTo || "Kirim ke"}: ${phoneNumber}` : (t?.settings?.notificationSettings?.phoneMissing || "Nomor telepon belum diisi")}
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
              <h4 className="!font-medium">{t?.settings?.notificationSettings?.autoAlerts || "Peringatan Otomatis"}</h4>
            </div>
            <p className="!text-sm !text-gray-600">
              {t?.settings?.notificationSettings?.autoAlertsDesc || "Kirim notifikasi saat kualitas udara melebihi ambang batas"}
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
              <h4 className="!font-medium">{t?.settings?.notificationSettings?.dailyReport || "Laporan Harian"}</h4>
            </div>
            <label className="flex !items-center !justify-between !p-3 !bg-gray-50 !rounded-lg !cursor-pointer">
              <span className="!text-sm">{t?.settings?.notificationSettings?.enableDaily || "Aktifkan laporan harian"}</span>
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
                  <label className="!text-sm !font-medium !mb-2 !block">{t?.settings?.notificationSettings?.time || "Jam"}</label>
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
                  <label className="!text-sm !font-medium !mb-2 !block">{t?.settings?.notificationSettings?.days || "Hari"}</label>
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
            {t?.settings?.notificationSettings?.saving || "Menyimpan..."}
          </>
        ) : (
          t?.settings?.notificationSettings?.save || "Simpan Pengaturan"
        )}
      </button>
    </div>
  );
}
