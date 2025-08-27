"use client";

import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  User,
  FileText,
  Users,
  Shield,
  Crown,
  Settings,
  BookOpen,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

const navigationItems = [
  { path: "/", label: "Главная", icon: Home },
  { path: "/submit-article", label: "Подать статью", icon: Upload },
  { path: "/author-dashboard", label: "Дашборд автора", icon: PenTool },
  { path: "/reviewer-dashboard", label: "Дашборд рецензента", icon: FileText },
  { path: "/editorial-profile", label: "Редколлегия", icon: Users },
  {
    path: "/editorial-board-dashboard",
    label: "Редакционный совет",
    icon: Shield,
  },
  { path: "/editor-chief-dashboard", label: "Главный редактор", icon: Crown },
  { path: "/admin-dashboard", label: "Администратор", icon: Settings },
  { path: "/author-profile", label: "Профиль автора", icon: User },
  { path: "/reviewer-profile", label: "Профиль рецензента", icon: BookOpen },
];

/**
 * Пропсы опциональны: Sidebar работает и без них,
 * но если переданы — на мобилке пункты закрывают меню.
 */
export default function Sidebar({ onCloseMobile, isMobileOpen }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Восстанавливаем/сохраняем состояние коллапса
  useEffect(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    if (saved != null) setIsCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", isCollapsed ? "1" : "0");
  }, [isCollapsed]);

  // Закрываем меню по клику на Link только на мобилке
  const handleItemClick = () => {
    if (typeof onCloseMobile === "function") onCloseMobile();
  };

  return (
    <aside
      className={cn(
        // ширина задаётся родителем (в Layout это w-64), тут — на всю доступную ширину
        "h-full w-full bg-white border-r border-gray-200",
        "flex flex-col"
      )}
      role="navigation"
      aria-label="Боковое меню"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="h-7 w-7 text-blue-600 shrink-0" />
          {!isCollapsed && (
            <span className="text-base font-semibold text-gray-900 truncate">
              Qalam Masters
            </span>
          )}
        </div>
        {/* Кнопка коллапса видна только на md+ (на мобилке меню off-canvas) */}
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className="hidden md:inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label={isCollapsed ? "Развернуть сайдбар" : "Свернуть сайдбар"}
          aria-pressed={isCollapsed}
          title={isCollapsed ? "Развернуть" : "Свернуть"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-3 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleItemClick}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5",
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Левая актив‑полоска */}
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-5 rounded-r",
                    isActive ? "w-0.5 bg-blue-600" : "w-0"
                  )}
                  aria-hidden="true"
                />
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive
                      ? "text-blue-600"
                      : "text-gray-500 group-hover:text-gray-700"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Низ сайдбара (можно добавить версию, ссылку на помощь и т.д.) */}
      <div className="border-t border-gray-200 px-3 py-3 text-xs text-gray-500">
        {!isCollapsed && (
          <span>© {new Date().getFullYear()} Qalam Masters</span>
        )}
      </div>
    </aside>
  );
}
