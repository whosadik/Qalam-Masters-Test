import { ArrowRight, BookOpen, CheckCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sardar from "../../public/sardar.png";
import FloatingDashboardLauncher from "@/components/FloatingDashboardLauncher";
import { useAuth } from "@/auth/AuthContext";

/**
 * Maximally responsive HomePage
 * — мобильный‑first, аккуратные брейкпоинты, балансировка текста, гибкая сетка
 * — улучшена доступность: semantic lists, mailto/tel, focus-visible для ссылок
 * — улучшена графика: lazy loading, адаптивные размеры, тени/радиусы на брейкпоинтах
 */
export default function HomePage() {
  const { booted, isAuthenticated, isModerator } = useAuth();
  const journalInfo = {
    title: "Веб‑платформа для автоматизации работы журнала",
    description:
      "Наша веб‑платформа — это современное решение для автоматизации всех этапов работы научного журнала: от подачи статьи и рецензирования до публикации и аналитики. Она упрощает взаимодействие между авторами, рецензентами и редакторами, обеспечивая прозрачность, эффективность и удобство в управлении научным контентом.",
    mission:
      "Продвигать научные исследования и развитие академического диалога между представителями различных научных направлений, способствуя интеграции науки и практики.",
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 sm:py-20 md:py-24"
      >
        {/* subtle blob decor */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[22rem] bg-[radial-gradient(60%_60%_at_50%_20%,rgba(29,78,216,0.12),rgba(255,255,255,0))]"
        />

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="inline-flex max-w-full items-center gap-2 whitespace-nowrap bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Научно рецензируемые журналы</span>
                </Badge>

                <h1 className="[text-wrap:balance] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                  {journalInfo.title}
                </h1>

                <p className="[text-wrap:balance] text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-prose">
                  {journalInfo.description}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* главная CTA */}
                {!booted ? (
                  <div className="h-12 w-56 rounded-md bg-gray-200 animate-pulse" />
                ) : !isAuthenticated ? (
                  <Link to="/register" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-md">
                    <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                      Зарегистрироваться
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : isModerator ? (
                  <Link to="/moderator" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-md">
                    <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                      Кабинет модератора
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/author-dashboard" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-md">
                    <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                      Перейти в кабинет
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}

                {/* вторичная CTA — требования к оформлению */}
                <Link
                  to="/requirements"
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-md"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-transparent"
                  >
                    Требования к оформлению
                  </Button>
                </Link>
              </div>

              {/* Features checklist */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2 md:pt-4">
                {[
                  "Рецензируемый журнал",
                  "Быстрое рецензирование",
                  "Международные стандарты",
                ].map((label) => (
                  <li key={label} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-sm sm:text-base">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column (image) */}
            <div className="relative lg:order-last">
              <div className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg">
                <img
                  src={Sardar}
                  alt="Обложка журнала Сардар"
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl ring-1 ring-black/5"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">Qalam Masters</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-prose">
                Научный рецензируемый журнал для публикации оригинальных исследований и обзоров по широкому спектру дисциплин.
              </p>
            </div>

            <nav className="space-y-3">
              <h3 className="font-semibold">Журнал</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    О журнале
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    Архив номеров
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    Требования к статьям
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    Этика публикации
                  </a>
                </li>
              </ul>
            </nav>

            <nav className="space-y-3">
              <h3 className="font-semibold">Авторам</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    Подача статьи
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    Процесс рецензирования
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    Шаблоны оформления
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded">
                    Часто задаваемые вопросы
                  </a>
                </li>
              </ul>
            </nav>

            <div className="space-y-3">
              <h3 className="font-semibold">Контакты редакции</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a
                    href="mailto:contact@gmail.com"
                    className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                  >
                    truemasters@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a
                    href="tel:+77778885544"
                    className="hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                  >
                    +7 771 282 7801
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-400 text-xs sm:text-sm">
            <p>&copy; 2024 Научный журнал "Qalam Masters". Все права защищены.</p>
          </div>

          <FloatingDashboardLauncher />
        </div>
      </footer>
    </div>
  );
}
