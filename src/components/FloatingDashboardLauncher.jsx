"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import DashboardNavigatorModal, {
  useCommandK,
} from "@/components/DashboardNavigatorModal";

export default function FloatingDashboardLauncher() {
  const [open, setOpen] = useState(false);
  useCommandK(setOpen); // шорткат Ctrl/Cmd + K

  // 🔗 твои актуальные ссылки (из App/роутов)
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
          to: "/editorial/screening",
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
        {
          to: "/moderator",
          label: "Модератор организации",
          type: "dashboard",
          desc: "Пользователи, права, системные настройки",
        },
        {
          to: "/moderator/organizations",
          label: "фвы",
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
        { to: "/editorial-screening", label: "Редколлегия" },
        { to: "/author-info", label: "Информация для авторов" },
        { to: "/publication-terms", label: "Условия публикации" },
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

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 sm:h-14 sm:w-14
                   bg-white shadow-lg border border-gray-200 hover:bg-gray-50
                   flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Навигация (Ctrl/Cmd + K)"
        aria-label="Открыть навигацию"
      >
        <Compass className="h-6 w-6 text-gray-800" />
      </button>

      {/* Модалка навигации */}
      <DashboardNavigatorModal
        open={open}
        onClose={() => setOpen(false)}
        items={navItems}
      />
    </>
  );
}
