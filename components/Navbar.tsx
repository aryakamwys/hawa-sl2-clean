"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import { LogOut } from "lucide-react";

type NavItem = { label: string; href: string };

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export default function Navbar({
  nav,
  lang = "ID",
  onLangChange,
}: {
  nav: NavItem[];
  lang?: "ID" | "EN" | "SU";
  onLangChange?: (v: "ID" | "EN" | "SU") => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user session on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center">
        <nav
          className={[
            "inline-flex items-center justify-center gap-8",
            "rounded-full bg-white/90 backdrop-blur-md",
            "border-3 border-[#005AE1]/20",
            "shadow-lg shadow-[#005AE1]/20",
            "transition-all duration-300",
            scrolled ? "py-2 px-10" : "py-3 px-12",
          ].join(" ")}
        >
          <Link
            href="/"
            className="!ml-2 flex items-center justify-center !w-12 !h-12 rounded-full bg-transparent hover:scale-105 transition-transform duration-200"
            aria-label="Hawa"
          >
            <Image src="/logo.png" alt="Hawa" width={28} height={28} priority />
          </Link>

          <div className="h-6 w-px bg-gray-200" />

          <ul className="flex items-center gap-6 text-sm font-medium text-gray-700">
            {nav.map((it) => (
              <li key={it.href}>
                <a
                  href={it.href}
                  className="hover:text-[#005AE1] transition-colors duration-200"
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-4">
            <details className="dropdown dropdown-end">
              <summary className="flex items-center gap-1 cursor-pointer text-base font-medium text-gray-700 hover:text-[#005AE1] transition-colors">
                {lang}
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </summary>
              <ul className="menu dropdown-content mt-3 w-28 rounded-xl bg-white p-2 shadow-lg">
                {(["ID", "EN", "SU"] as const).map((v) => (
                  <li key={v}>
                    <button
                      type="button"
                      onClick={() => onLangChange?.(v)}
                      className={`text-base ${v === lang ? "text-[#005AE1] font-semibold" : "text-gray-700"}`}
                    >
                      {v}
                    </button>
                  </li>
                ))}
              </ul>
            </details>

            {isLoading ? (
              <div className="!mr-4 text-sm text-gray-500">Loading...</div>
            ) : user ? (
              <button
                onClick={handleLogout}
                className="!mr-4 btn btn-sm btn-circle bg-[#005AE1] hover:bg-[#004BB8] text-white border-none"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn rounded-full !px-4 !py-1 text-base font-semibold bg-transparent text-[#005AE1] border border-[#005AE1] hover:bg-[#005AE1] hover:text-white transition-all duration-200"
                >
                  Masuk
                </button>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="!mr-4 btn rounded-full !px-7 !py-2 text-base font-semibold bg-[#005AE1] text-white hover:bg-[#004BB8] transition-all duration-200 border-none"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={fetchUser}
      />
    </>
  );
}
