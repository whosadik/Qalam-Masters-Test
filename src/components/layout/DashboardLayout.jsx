"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { cn } from "@/lib/utils";

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

      {/* Sidebar: off‑canvas на мобилке, статичен на ≥md */}
      <div
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform shadow md:shadow-none",
          "bg-white md:bg-transparent md:border-0 border-r border-gray-200",
          "transition-transform duration-300 motion-reduce:transition-none",
          "md:translate-x-0",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <Sidebar
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          isMobileOpen={isMobileMenuOpen}
        />
      </div>

      {/* Мобильный оверлей */}
      {isMobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Закрыть меню"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Topbar */}
      <Topbar
        onMenuClick={() => setIsMobileMenuOpen((v) => !v)}
        isMobileMenuOpen={isMobileMenuOpen}
        aria-controls="app-sidebar"
        aria-expanded={isMobileMenuOpen}
      />

      {/* Контент */}
      <main
        id="main"
        className={cn(
          "pt-16 transition-[margin] duration-300 motion-reduce:transition-none",
          "md:ml-64"
        )}
      >
        <div className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
