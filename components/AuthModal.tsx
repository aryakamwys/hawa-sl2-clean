"use client";

import { useEffect, useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    const body = mode === "login" ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || (mode === "login" ? "Login gagal." : "Daftar gagal."));
        return;
      }

      onSuccess?.();
      onClose();

      setEmail("");
      setPassword("");
      setName("");
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError("");
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const title = mode === "login" ? "Selamat Datang" : "Buat Akun";
  const subtitle =
    mode === "login"
      ? "Masuk untuk melanjutkan ke HAWA."
      : "Daftar untuk mulai memantau kualitas udara.";

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <button
        aria-label="Close modal backdrop"
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
              aria-label="Close"
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
                  <div className="!mt-4 rounded-xl border border-red-200 bg-red-50 !px-4 !py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="!mt-5 space-y-4">
                  {mode === "register" && (
                    <Field
                      label="Nama Lengkap"
                      icon={<User size={18} className="text-gray-400" />}
                      input={
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Masukkan nama lengkap"
                          required
                          className={inputClass}
                        />
                      }
                    />
                  )}

                  <Field
                    label="Email"
                    icon={<Mail size={18} className="text-gray-400" />}
                    input={
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        required
                        autoComplete="email"
                        className={inputClass}
                      />
                    }
                  />

                  <Field
                    label="Password"
                    icon={<Lock size={18} className="text-gray-400" />}
                    input={
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        className={inputClass}
                      />
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="!mt-8 btn w-full rounded-xl border-0 bg-[#005AE1] text-white hover:bg-[#004BB8] disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="loading loading-spinner loading-sm" />
                        Memuat...
                      </span>
                    ) : mode === "login" ? (
                      "Masuk"
                    ) : (
                      "Daftar"
                    )}
                  </button>

                  <p className="!pt-2 text-center text-sm text-gray-600">
                    {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="font-semibold text-[#005AE1] hover:text-[#004BB8]"
                    >
                      {mode === "login" ? "Daftar Gratis" : "Masuk"}
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
