"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Search, LayoutDashboard, Home, Bell, User } from "lucide-react";

export default function DashboardNavigatorModal({
  open,
  onClose,
  items = [],
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Закрывать при смене маршрута
  useEffect(() => {
    if (open) onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Фокус на поле поиска
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // ESC закрыть
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Фильтрация
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items
      .map((sec) => ({
        ...sec,
        links: sec.links.filter(
          (l) =>
            l.label.toLowerCase().includes(q) ||
            (l.desc && l.desc.toLowerCase().includes(q)) ||
            (sec.title && sec.title.toLowerCase().includes(q))
        ),
      }))
      .filter((sec) => sec.links.length > 0);
  }, [items, query]);

  if (!open) return null;

  return (
    <>
      {/* оверлей */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      {/* модалка */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
          {/* шапка с поиском */}
          <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск разделов и дашбордов… (Ctrl/Cmd + K)"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* контент */}
          <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Ничего не найдено
              </div>
            ) : (
              filtered.map((sec) => (
                <div key={sec.title || Math.random()} className="mb-3">
                  {sec.title && (
                    <div className="px-3 py-2 text-xs uppercase tracking-wide text-gray-500">
                      {sec.title}
                    </div>
                  )}
                  <div className="grid gap-2 px-2">
                    {sec.links.map((l) => (
                      <button
                        key={l.to}
                        onClick={() => navigate(l.to)}
                        className="w-full text-left p-3 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                            {l.icon ? (
                              l.icon
                            ) : l.type === "dashboard" ? (
                              <LayoutDashboard className="h-5 w-5 text-gray-700" />
                            ) : l.type === "home" ? (
                              <Home className="h-5 w-5 text-gray-700" />
                            ) : l.type === "alerts" ? (
                              <Bell className="h-5 w-5 text-gray-700" />
                            ) : (
                              <User className="h-5 w-5 text-gray-700" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {l.label}
                            </div>
                            {l.desc && (
                              <div className="text-xs text-gray-500">
                                {l.desc}
                              </div>
                            )}
                          </div>
                          {l.badge && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                              {l.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// хук для глобального шортката Ctrl/Cmd + K
export function useCommandK(setOpen) {
  useEffect(() => {
    const handler = (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);
}
