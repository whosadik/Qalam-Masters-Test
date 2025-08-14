import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "../../../public/writing 1.png";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Закрытие по Escape и блокировка скролла страницы, когда меню открыто
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    if (open) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Лого */}
            <Link to="/" className="shrink-0" onClick={closeMenu}>
              <span className="flex items-center gap-2">
                <img
                  className="h-10 w-10 object-contain"
                  src={Logo}
                  alt="Qalam Masters логотип"
                  width={40}
                  height={40}
                />
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  Qalam Masters
                </span>
              </span>
            </Link>

            {/* Десктоп-навигация */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/about-journal"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                О журнале
              </Link>
              <Link
                to="/editorial-board"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Редколлегия
              </Link>
              <Link
                to="/author-info"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Информация для авторов
              </Link>
              <Link
                to="/publication-terms"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Условия публикации
              </Link>
            </nav>

            {/* Десктоп-кнопки */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline">Войти</Button>
              </Link>
              <Link to="/register">
                <Button>Зарегистрироваться</Button>
              </Link>
            </div>

            {/* Бургер для мобилок */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Открыть меню"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                // Иконка "крестик"
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                // Иконка "бургер"
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Оверлей на мобилке */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Закрыть меню"
          onClick={closeMenu}
        />
      )}

      {/* Мобильное меню (off-canvas снизу/сверху) */}
      <div
        id="mobile-menu"
        className={[
          "fixed md:hidden z-50 left-0 right-0 top-0 origin-top",
          "bg-white shadow-lg border-b",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 pt-20">
          {/* Навигация */}
          <nav className="grid gap-4">
            <Link
              to="/about-journal"
              onClick={closeMenu}
              className="py-2 text-base text-gray-700 hover:text-gray-900"
            >
              О журнале
            </Link>
            <Link
              to="/editorial-board"
              onClick={closeMenu}
              className="py-2 text-base text-gray-700 hover:text-gray-900"
            >
              Редколлегия
            </Link>
            <Link
              to="/author-info"
              onClick={closeMenu}
              className="py-2 text-base text-gray-700 hover:text-gray-900"
            >
              Информация для авторов
            </Link>
            <Link
              to="/publication-terms"
              onClick={closeMenu}
              className="py-2 text-base text-gray-700 hover:text-gray-900"
            >
              Условия публикации
            </Link>
          </nav>

          {/* Кнопки */}
          <div className="mt-6 grid gap-3">
            <Link to="/login" onClick={closeMenu} className="w-full">
              <Button variant="outline" className="w-full">
                Войти
              </Button>
            </Link>
            <Link to="/register" onClick={closeMenu} className="w-full">
              <Button className="w-full">Зарегистрироваться</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
