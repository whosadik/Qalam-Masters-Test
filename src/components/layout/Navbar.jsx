"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "../../assets/QM_logo-.png";
import ProfileMenu from "@/components/ProfileMenu";
import { User as UserIcon, Compass, ArrowRight } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { listMyJournalMemberships } from "@/services/journalMembershipsService";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrgAdmin, logout, booted } = useAuth();

  // Mobile sheet open/close
  const [open, setOpen] = useState(false);

  // ====== Roles loading ======
  const [roles, setRoles] = useState({
    reviewer: false,
    editor: false,
    chief: false,
    secretary: false,
    proofreader: false,
  });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!booted || !isAuthenticated) {
        if (alive)
          setRoles({
            reviewer: false,
            editor: false,
            chief: false,
            secretary: false,
            proofreader: false,
          });
        return;
      }
      try {
        const memberships = await listMyJournalMemberships({ page_size: 500 });
        if (!alive) return;
        const set = new Set((memberships || []).map((m) => String(m.role)));
        setRoles({
          reviewer: set.has("reviewer"),
          editor: set.has("editor"),
          chief: set.has("chief_editor"),
          secretary: set.has("secretary"),
          proofreader: set.has("proofreader"),
        });
      } catch {
        // мягко игнорим – просто оставим роли пустыми
        if (alive) {
          setRoles({
            reviewer: false,
            editor: false,
            chief: false,
            secretary: false,
            proofreader: false,
          });
        }
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [booted, isAuthenticated]);

  useEffect(() => {
    let alive = true;

    async function load() {
      // когда не залогинен — чистим роли
      if (!booted || !isAuthenticated || !user?.id) {
        if (alive) {
          setRoles({
            reviewer: false,
            editor: false,
            chief: false,
            secretary: false,
            proofreader: false,
          });
        }
        return;
      }

      try {
        // 1) Пытаемся спросить только "мои" membership-ы
        // Проверь, поддерживает ли твой сервис такие параметры:
        // const memberships = await listMyJournalMemberships({ page_size: 500, mine: true });

        const memberships = await listMyJournalMemberships({ page_size: 500 });

        if (!alive) return;

        // 2) Если бэк всё равно вернул всех, фильтруем по текущему юзеру
        const onlyMine = (memberships || []).filter((m) => {
          // подстроимся под разные формы
          const uid = m.user?.id ?? m.user_id ?? m.user ?? null;
          return String(uid) === String(user.id);
        });

        const set = new Set(onlyMine.map((m) => String(m.role)));
        setRoles({
          reviewer: set.has("reviewer"),
          editor: set.has("editor"),
          chief: set.has("chief_editor"),
          secretary: set.has("secretary"),
          proofreader: set.has("proofreader"),
        });
      } catch {
        if (alive) {
          setRoles({
            reviewer: false,
            editor: false,
            chief: false,
            secretary: false,
            proofreader: false,
          });
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [booted, isAuthenticated, user?.id]);

  // Esc закрывает мобильное меню + блокируем скролл, когда открыто
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

  // ====== Primary dashboard resolver ======
  function getPrimaryDashboard(r, isOrgAdminFlag) {
    if (r.chief)
      return { to: "/editor-chief-dashboard", label: "Гл. редактор" };
    if (r.editor)
      return { to: "/editorial-board-dashboard", label: "Редколлегия" };
    if (r.secretary) return { to: "/secretary-dashboard", label: "Секретарь" };
    if (r.proofreader)
      return { to: "/proofreafer-dashboard", label: "Корректор" };
    if (r.reviewer) return { to: "/reviewer-dashboard", label: "Рецензент" };
    // отдельная кнопка модератора ниже; основной — личный кабинет автора
    return { to: "/author-dashboard", label: "Личный кабинет" };
  }

  const primary = useMemo(
    () => getPrimaryDashboard(roles, isOrgAdmin),
    [roles, isOrgAdmin]
  );

  // display user/avatar
  const displayUser = user || null;
  const avatarNode = (
    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
      <UserIcon className="h-4 w-4 text-white" />
    </div>
  );
  const displayName =
    displayUser?.first_name || displayUser?.last_name
      ? `${displayUser?.first_name || ""} ${displayUser?.last_name || ""}`.trim()
      : displayUser?.name || "Профиль";

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
                    ? "text-[#3972FE] font-medium"
                    : "text-gray-600 hover:text-[#3972FE]"
                }
              >
                Главная
              </NavLink>
              <NavLink
                to="/author-info"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium"
                    : "text-gray-600 hover:text-[#3972FE]"
                }
              >
                Для авторов
              </NavLink>
              <NavLink
                to="/for-journals"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium"
                    : "text-gray-600 hover:text-[#3972FE]"
                }
              >
                Для журналов
              </NavLink>
              <NavLink
                to="/contacts"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium"
                    : "text-gray-600 hover:text-[#3972FE]"
                }
              >
                Контакты
              </NavLink>
              <NavLink
                to="/news"
                className={({ isActive }) =>
                  isActive
                    ? "text-[#3972FE] font-medium"
                    : "text-gray-600 hover:text-[#3972FE]"
                }
              >
                Новости
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
                    <Button className="bg-[#3972FE] hover:bg-[#2f62df] text-white">
                      Зарегистрироваться
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {!booted ? (
                    <div className="h-9 w-[140px] rounded-md bg-gray-100 animate-pulse" />
                  ) : (
                    <>
                      {/* Один контекстный кабинет */}
                      <Link to={primary.to}>
                        <Button variant="outline">{primary.label}</Button>
                      </Link>

                      {/* Отдельно модератор (если нужен параллельно) */}
                      {isOrgAdmin && (
                        <Link to="/moderator">
                          <Button variant="outline">Модератор</Button>
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
                onClick={() => setOpen(true)}
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
                  {!booted ? (
                    <div className="h-8 w-[64px] rounded bg-gray-100 animate-pulse" />
                  ) : (
                    <Link to={primary.to}>
                      <Button variant="outline" size="sm">
                        {primary.label}
                      </Button>
                    </Link>
                  )}

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
                to={primary.to}
                onClick={closeMenu}
                className="py-2 text-base text-gray-700 hover:text-gray-900"
              >
                Перейти: {primary.label}{" "}
                <ArrowRight className="inline-block h-4 w-4 ml-1" />
              </Link>
              {isOrgAdmin && (
                <Link
                  to="/moderator"
                  onClick={closeMenu}
                  className="py-2 text-base text-gray-700 hover:text-gray-900"
                >
                  Кабинет модератора
                </Link>
              )}
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
    </>
  );
}
