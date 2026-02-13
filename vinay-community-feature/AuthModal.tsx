"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
      />

      {/* Dialog */}
      <div className="relative mx-auto flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
            
            {/* Top accent header */}
            <div className="h-20 bg-gradient-to-r from-[#005AE1] to-[#70D8FF] relative">
               {/* FIXED CLOSE BUTTON:
                  - Increased opacity/contrast (bg-black/20)
                  - Ensure z-index is high (z-10)
                  - Added explicit hover state for better visibility
               */}
               <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-white hover:bg-black/30 transition-colors cursor-pointer"
                aria-label={t?.auth?.close || "Close"}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content Container */}
            <div className="-mt-10 px-6 pb-8">
              {/* Main Card */}
              <div className="relative rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
                  <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t?.auth?.fullName}</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t?.auth?.fullNamePlaceholder || "Your full name"}
                        required
                        className={inputClass}
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t?.auth?.email}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t?.auth?.emailPlaceholder || "name@example.com"}
                      required
                      autoComplete="email"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">{t?.auth?.password}</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={t?.auth?.passwordPlaceholder || "Min. 6 characters"}
                      required
                      minLength={6}
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-[#005AE1] py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-[#004BB8] hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="inline-flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        {t?.auth?.loading || "Processing..."}
                      </span>
                    ) : mode === "login" ? (
                      t?.auth?.login || "Sign In"
                    ) : (
                      t?.auth?.register || "Create Account"
                    )}
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      {mode === "login" ? t?.auth?.noAccount : t?.auth?.hasAccount}{" "}
                      <button
                        type="button"
                        onClick={switchMode}
                        className="font-bold text-[#005AE1] hover:text-[#004BB8] hover:underline"
                      >
                        {mode === "login" ? t?.auth?.registerFree : t?.auth?.login}
                      </button>
                    </p>
                  </div>
                </form>
              </div>

              {/* Footer Note */}
              <p className="mt-6 text-center text-xs text-gray-400 max-w-xs mx-auto">
                By continuing, you agree to HAWA's Terms of Service & Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#005AE1] focus:bg-white focus:ring-4 focus:ring-[#005AE1]/10 transition-all outline-none";