"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Закрыть меню по Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Блокируем скролл страницы при открытом мобильном меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Перейти к контенту
      </a>
      {/* Topbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen((v) => !v)}
        isMobileMenuOpen={isMobileMenuOpen}></Navbar>

      {/* Контент */}
      <main
        id="main"
        className={cn(
          "transition-[margin] duration-300 motion-reduce:transition-none",
        )}
      >
        <div className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
