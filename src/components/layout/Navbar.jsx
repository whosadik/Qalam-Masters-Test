"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "../../assets/QM_logo-.png";
// import NotificationsButton from "@/components/NotificationsButton"; // <- пока убрали
import ProfileMenu from "@/components/ProfileMenu";
import { User as UserIcon, Compass } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import DashboardNavigatorModal, {
  useCommandK,
} from "@/components/DashboardNavigatorModal";
import { http, withParams } from "@/lib/apiClient";
import { API } from "@/constants/api";
import { listMyJournalMemberships } from "@/services/journalMembershipsService";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  useCommandK(setNavOpen);

  const navigate = useNavigate();
  const { user, isAuthenticated, isOrgAdmin, logout, booted } = useAuth();
  // готовность навбара: дожидаемся бутстрапа контекста
  const ready = booted;

  // локальный user для показа, если контекст ещё пуст
  const displayUser = user || null;

  const [roleSet, setRoleSet] = useState(() => new Set());
  useEffect(() => {
    if (!ready || !isAuthenticated) {
      setRoleSet(new Set());
      return;
    }
    (async () => {
      const memberships = await listMyJournalMemberships({ page_size: 500 });
      // m.role — строка: "reviewer" | "editor" | "chief_editor" | "secretary" | "proofreader" | ...
      const next = new Set(memberships.map((m) => String(m.role)));
      setRoleSet(next);
    })();
  }, [ready, isAuthenticated]);

  const isReviewer = roleSet.has("reviewer");
  const isEditor = roleSet.has("editor");
  const isChief = roleSet.has("chief_editor");
  const isSecretary = roleSet.has("secretary");
  const isProofreader = roleSet.has("proofreader");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  const navItems = [
    {
      title: "Дашборды",
      links: [
        {
          to: "/author-dashboard",
          label: "Дашборд автора",
          type: "dashboard",
          desc: "Подачи, черновики, статусы",
        },
        {
          to: "/reviewer-dashboard",
          label: "Дашборд рецензента",
          type: "dashboard",
          desc: "Рецензирование, задачи",
        },
        {
          to: "/editorial-board-dashboard",
          label: "Дашборд редколлегии",
          type: "dashboard",
          desc: "Очередь, публикации",
        },
        {
          to: "/editor-chief-dashboard",
          label: "Дашборд главного редактора",
          type: "dashboard",
          desc: "Управление журналом",
        },
        {
          to: "/admin-dashboard",
          label: "Админ-панель",
          type: "dashboard",
          desc: "Пользователи, права, системные настройки",
        },
      ],
    },
    {
      title: "Профили",
      links: [
        {
          to: "/author-profile",
          label: "Профиль автора",
          desc: "Личные данные, настройки",
        },
        {
          to: "/reviewer-profile",
          label: "Профиль рецензента",
          desc: "Специализации, загрузка CV",
        },
        {
          to: "/editorial-profile",
          label: "Профиль редакции",
          desc: "Информация об аккаунте редакции",
        },
      ],
    },
    {
      title: "Действия",
      links: [
        {
          to: "/submit-article",
          label: "Подать статью",
          desc: "Создать новую заявку",
        },
      ],
    },
    {
      title: "Публичные страницы",
      links: [
        { to: "/", label: "Главная", type: "home" },
        { to: "/about-journal", label: "О платформе" },
        { to: "/author-info", label: "Информация для авторов" },
        { to: "/publication-terms", label: "Для Журналов" },
        { to: "/requirements", label: "Требования" },
      ],
    },
    {
      title: "Вход",
      links: [
        { to: "/login", label: "Войти" },
        { to: "/register", label: "Зарегистрироваться" },
      ],
    },
  ];

  // гостю — публичные/вход; пользователю — рабочие секции
  const filteredNavItems = useMemo(() => {
    if (isAuthenticated) {
      return navItems.filter(
        (s) => s.title !== "Вход" && s.title !== "Публичные страницы"
      );
    }
    return navItems.filter(
      (s) => s.title === "Публичные страницы" || s.title === "Вход"
    );
  }, [isAuthenticated]);

  const avatarNode = (
    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
      <UserIcon className="h-4 w-4 text-white" />
    </div>
  );

  const displayName =
    displayUser?.first_name || displayUser?.last_name
      ? `${displayUser?.first_name || ""} ${displayUser?.last_name || ""}`.trim()
      : displayUser?.name || "Профиль";

  const primaryDashPath = isChief
    ? "/editor-chief-dashboard"
    : isEditor
      ? "/editorial-board-dashboard"
      : isSecretary
        ? "/secretary-dashboard"
        : isProofreader
          ? "/proofreafer-dashboard"
          : isReviewer
            ? "/reviewer-dashboard"
            : isOrgAdmin
              ? "/moderator"
              : "/author-dashboard";
  const primaryDashLabel = isChief
    ? "Гл. редактор"
    : isEditor
      ? "Редколлегия"
      : isSecretary
        ? "Секретарь"
        : isProofreader
          ? "Корректор"
          : isReviewer
            ? "Рецензент"
            : isOrgAdmin
              ? "Модер."
              : "ЛК";

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Лого */}
            <Link to="/" className="shrink-0">
              <span className="flex items-center gap-2">
                <img
                  className="h-16 w-16 object-contain"
                  src={Logo}
                  alt="Qalam Masters логотип"
                  width={80}
                  height={80}
                />
              </span>
            </Link>

            {/* Десктоп-навигация */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium transition-colors"
                    : "text-gray-600 hover:text-[#3972FE] transition-colors"
                }
              >
                Главная
              </NavLink>

              <NavLink
                to="/author-info"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium transition-colors"
                    : "text-gray-600 hover:text-[#3972FE] transition-colors"
                }
              >
                Для авторов
              </NavLink>

              <NavLink
                to="/for-journals"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium transition-colors"
                    : "text-gray-600 hover:text-[#3972FE] transition-colors"
                }
              >
                Для журналов
              </NavLink>

              <NavLink
                to="/contacts"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium transition-colors"
                    : "text-gray-600 hover:text-[#3972FE] transition-colors"
                }
              >
                Контакты
              </NavLink>
            </nav>

            {/* Правый блок (десктоп) */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button variant="outline">Войти</Button>
                  </Link>
                  <Link to="/register">
                    <Button className=" bg-[#3972FE] hover:bg-[#2f62df] text-white">
                      Зарегистрироваться
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {!ready && (
                    <div className="h-9 w-[140px] rounded-md bg-gray-100 animate-pulse" />
                  )}
                  {ready && (
                    <>
                      {/* показываем кнопки для КАЖДОЙ роли, если она есть */}
                      {isChief && (
                        <Link to="/editor-chief-dashboard">
                          <Button variant="outline">Главный редактор</Button>
                        </Link>
                      )}
                      {isEditor && (
                        <Link to="/editorial-board-dashboard">
                          <Button variant="outline">Редколлегия</Button>
                        </Link>
                      )}
                      {isSecretary && (
                        <Link to="/secretary-dashboard">
                          <Button variant="outline">Секретарь</Button>
                        </Link>
                      )}
                      {isProofreader && (
                        <Link to="/proofreader-dashboard">
                          <Button variant="outline">Корректор</Button>
                        </Link>
                      )}
                      {isReviewer && (
                        <Link to="/reviewer-dashboard">
                          <Button variant="outline">Рецензент</Button>
                        </Link>
                      )}
                      {/* если специальных ролей нет — показать авторский кабинет */}
                      {!isChief &&
                        !isEditor &&
                        !isSecretary &&
                        !isProofreader &&
                        !isReviewer &&
                        !isOrgAdmin && (
                          <Link to="/author-dashboard">
                            <Button variant="outline">Личный кабинет</Button>
                          </Link>
                        )}
                      {/* модератор отдельной кнопкой */}
                      {isOrgAdmin && (
                        <Link to="/moderator">
                          <Button variant="outline">Кабинет модератора</Button>
                        </Link>
                      )}
                    </>
                  )}

                  <ProfileMenu
                    name={displayName}
                    email={displayUser?.email}
                    avatar={avatarNode}
                    onProfile={() => navigate("/author-profile")}
                    onSettings={() => navigate("/settings")}
                    onLogout={() => {
                      logout();
                      navigate("/");
                    }}
                  />
                </>
              )}
            </div>

            {/* Правый блок (мобилка) */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={() => setNavOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Навигация"
                title="Навигация"
              >
                <Compass className="h-5 w-5" />
              </button>

              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Войти
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Регистрация</Button>
                  </Link>
                </>
              ) : (
                <>
                  {!ready ? (
                    <div className="h-8 w-[64px] rounded bg-gray-100 animate-pulse" />
                  ) : (
                    <Link to={primaryDashPath}>
                      <Button variant="outline" size="sm">
                        {primaryDashLabel}
                      </Button>
                    </Link>
                  )}

                  {/* <NotificationsButton ... /> */}

                  <ProfileMenu
                    name={displayName}
                    email={displayUser?.email}
                    showNameOnDesktop={false}
                    onProfile={() => {
                      closeMenu();
                      navigate("/author-profile");
                    }}
                    onSettings={() => {
                      closeMenu();
                      navigate("/settings");
                    }}
                    onLogout={() => {
                      logout();
                      closeMenu();
                      navigate("/");
                    }}
                  />
                </>
              )}

              {/* Бургер */}
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Открыть меню"
                aria-controls="mobile-menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                {open ? (
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
        </div>
      </header>

      {/* Оверлей для off-canvas меню */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Закрыть меню"
          onClick={closeMenu}
        />
      )}

      {/* Мобильное меню */}
      <div
        id="mobile-menu"
        className={[
          "fixed md:hidden z-50 left-0 right-0 top-0 origin-top",
          "bg-white shadow-lg border-b",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-y-0" : "-translate-y-full",
        ].join(" ")}
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pb-6 pt-20">
          {!isAuthenticated ? (
            <nav className="grid gap-4">
              <Link
                to="/about-journal"
                onClick={closeMenu}
                className="py-2 text-base text-gray-700 hover:text-gray-900"
              >
                О платформе
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
          ) : (
            <nav className="grid gap-4">
              <Link
                to="/author-dashboard"
                onClick={closeMenu}
                className="py-2 text-base text-gray-700 hover:text-gray-900"
              >
                Мои статьи
              </Link>
              <Link
                to="/reviews"
                onClick={closeMenu}
                className="py-2 text-base text-gray-700 hover:text-gray-900"
              >
                Рецензии
              </Link>
              <Link
                to="/messages"
                onClick={closeMenu}
                className="py-2 text-base text-gray-700 hover:text-gray-900"
              >
                Переписка
              </Link>
              <Link
                to="/archive"
                onClick={closeMenu}
                className="py-2 text-base text-gray-700 hover:text-gray-900"
              >
                Архив
              </Link>
            </nav>
          )}
        </div>
      </div>

      <DashboardNavigatorModal
        open={navOpen}
        onClose={() => setNavOpen(false)}
        items={filteredNavItems}
      />
    </>
  );
}
