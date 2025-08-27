"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Search, User, Settings, LogOut, Menu, X } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Закрытие по клику вне и по Escape
  useEffect(() => {
    const onClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowProfile(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const anyMenuOpen = showNotifications || showProfile;

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-full px-3 sm:px-4">
        {/* Бургер (мобилки) */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Открыть боковое меню"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>

        {/* Поиск (адаптивный) */}
        <div className="flex-1 flex items-center justify-center md:justify-start">
          {/* Кнопка-лупа на мобилке */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label={mobileSearchOpen ? "Скрыть поиск" : "Показать поиск"}
            onClick={() => setMobileSearchOpen((v) => !v)}
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Поле поиска: всегда видно на md+, на мобилке — по клику */}
          <div
            className={`relative w-full max-w-md mx-3 ${mobileSearchOpen ? "block" : "hidden"} md:block`}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              aria-label="Поиск по сайту"
            />
          </div>
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Уведомления */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowProfile(false);
              }}
              className="p-2 rounded-lg hover:bg-gray-100 relative focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-haspopup="menu"
              aria-expanded={showNotifications}
              aria-label="Открыть уведомления"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span
                className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 text-white text-[10px] leading-4 rounded-full text-center"
                aria-label="3 новых уведомления"
              >
                3
              </span>
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto z-50"
                role="menu"
                aria-label="Список уведомлений"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Уведомления</h3>
                </div>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  role="menuitem"
                >
                  <p className="text-sm text-gray-900">
                    Новая статья на рецензию
                  </p>
                  <p className="text-xs text-gray-500 mt-1">2 минуты назад</p>
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  role="menuitem"
                >
                  <p className="text-sm text-gray-900">Рецензия готова</p>
                  <p className="text-xs text-gray-500 mt-1">1 час назад</p>
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  role="menuitem"
                >
                  <p className="text-sm text-gray-900">
                    Статья принята к публикации
                  </p>
                  <p className="text-xs text-gray-500 mt-1">3 часа назад</p>
                </button>
              </div>
            )}
          </div>

          {/* Профиль */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfile((v) => !v);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-haspopup="menu"
              aria-expanded={showProfile}
              aria-label="Открыть меню профиля"
            >
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                Иван Иванов
              </span>
            </button>

            {showProfile && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                role="menu"
                aria-label="Меню профиля"
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">Иван Иванов</p>
                  <p className="text-sm text-gray-500">ivan@example.com</p>
                </div>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  <span>Профиль</span>
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  role="menuitem"
                >
                  <Settings className="h-4 w-4" />
                  <span>Настройки</span>
                </button>
                <hr className="my-2" />
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Выйти</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Оверлей под дропдаунами на мобилке для закрытия по тапу вне */}
      {anyMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 md:hidden bg-transparent"
          aria-label="Закрыть открытое меню"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
}
