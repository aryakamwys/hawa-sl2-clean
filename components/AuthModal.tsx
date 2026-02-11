"use client";

import { useEffect, useState } from "react";
import { X, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = "login" }: AuthModalProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset mode and form data when opened with a different initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({ name: "", email: "", password: "" });
      setError("");
    }
  }, [isOpen, initialMode]);

  // UX: ESC close + lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = mode === "login" ? { email: formData.email, password: formData.password } : formData;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || (mode === "login" ? t?.auth?.loginFailed : t?.auth?.registerFailed));
        return;
      }

      onSuccess?.();
      onClose();

      setFormData({ name: "", email: "", password: "" });
    } catch {
      setError(t?.auth?.networkError || "Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError("");
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const title = mode === "login" ? t?.auth?.welcome : t?.auth?.createAccount;
  const subtitle =
    mode === "login"
      ? t?.auth?.loginSubtitle
      : t?.auth?.registerSubtitle;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label={t?.auth?.closeModalBackdrop || "Close modal backdrop"}
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[6px]"
      />

      {/* Dialog */}
      <div className="relative mx-auto flex min-h-full items-center justify-center !p-4">
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.18)]">
            {/* Top accent (lebih clean dari gradient besar) */}
            <div className="h-16 bg-gradient-to-r from-[#005AE1] to-[#70D8FF]" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              aria-label={t?.auth?.close || "Close"}
            >
              <X size={18} />
            </button>

            {/* Content */}
            <div className="!-mt-10 !px-6 !pb-7">
              {/* Header card */}
              <div className="rounded-2xl border border-black/5 bg-white/95 !p-5 shadow-sm">
                <h2 className="text-2xl font-extrabold text-gray-900">{title}</h2>
                <p className="!mt-1 text-sm text-gray-600">{subtitle}</p>

                {error && (
                  <div className="!mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 !px-4 !py-3 text-sm text-red-700">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="!mt-5 space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="!mb-2 block text-sm font-semibold text-gray-800">{t?.auth?.fullName}</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center !pl-4">
                          <User size={18} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t?.auth?.fullNamePlaceholder || "Masukkan nama lengkap"}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="!mb-2 block text-sm font-semibold text-gray-800">{t?.auth?.email}</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center !pl-4">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t?.auth?.emailPlaceholder || "nama@email.com"}
                        required
                        autoComplete="email"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="!mb-2 block text-sm font-semibold text-gray-800">{t?.auth?.password}</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center !pl-4">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={t?.auth?.passwordPlaceholder || "Minimal 6 karakter"}
                        required
                        minLength={6}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="!mt-8 btn w-full rounded-xl border-0 bg-[#005AE1] text-white hover:bg-[#004BB8] disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        {t?.auth?.loading || "Memuat..."}
                      </span>
                    ) : mode === "login" ? (
                      t?.auth?.login || "Masuk"
                    ) : (
                      t?.auth?.register || "Daftar"
                    )}
                  </button>

                  <p className="!pt-2 text-center text-sm text-gray-600">
                    {mode === "login" ? t?.auth?.noAccount : t?.auth?.hasAccount}{" "}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="font-semibold text-[#005AE1] hover:text-[#004BB8]"
                    >
                      {mode === "login" ? t?.auth?.registerFree : t?.auth?.login}
                    </button>
                  </p>
                </form>
              </div>

              {/* Small note */}
              <p className="!mt-4 text-center text-xs text-gray-500">
                Dengan melanjutkan, kamu menyetujui kebijakan dan ketentuan HAWA.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl bg-gray-50 !px-4 !py-3 text-[15px] text-gray-900 placeholder:text-gray-400 " +
  "outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#005AE1]/25 focus:bg-white transition";

function Field({
  label,
  icon,
  input,
}: {
  label: string;
  icon: React.ReactNode;
  input: React.ReactNode;
}) {
  return (
    <div>
      <label className="!mb-2 block text-sm font-semibold text-gray-800">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center !pl-4">
          {icon}
        </div>
        <div className="!pl-10">{input}</div>
      </div>
    </div>
  );
}
