import { ArrowRight, BookOpen, CheckCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sardar from "../../public/sardar.png";
import FloatingDashboardLauncher from "@/components/FloatingDashboardLauncher";
import { useAuth } from "@/auth/AuthContext";


export default function HomePage() {
  const { booted, isAuthenticated, isModerator } = useAuth();
  const journalInfo = {
    title: "Веб-платформа для автоматизации работы журнала",
    description:
      "Наша веб-платформа — это современное решение для автоматизации всех этапов работы научного журнала: от подачи статьи и рецензирования до публикации и аналитики. Она упрощает взаимодействие между авторами, рецензентами и редакторами, обеспечивая прозрачность, эффективность и удобство в управлении научным контентом.",
    mission:
      "Продвигать научные исследования и развитие академического диалога между представителями различных научных направлений, способствуя интеграции науки и практики.",
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar></Navbar>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <BookOpen className="h-4 w-4 mr-2" /> Научно рецензируемые
                  журналы
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {journalInfo.title}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {journalInfo.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* главная CTA */}
                {!booted ? (
                  // скелетон, пока AuthContext бутстрапится
                  <div className="h-12 w-56 rounded-md bg-gray-200 animate-pulse" />
                ) : !isAuthenticated ? (
                  // гость -> кнопка регистрации
                  <Link to="/register">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Зарегистрироваться
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : isModerator ? (
                  // модератор -> в кабинет модератора
                  <Link to="/moderator">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Кабинет модератора
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  // обычный пользователь -> в личный кабинет автора
                  <Link to="/author-dashboard">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Перейти в кабинет
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}

                {/* вторичная CTA — требования к оформлению */}
                <Link to="/requirements">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 bg-transparent"
                  >
                    Требования к оформлению
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Рецензируемый журнал</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Быстрое рецензирование</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">Международные стандарты</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative">
                <img
                  src={Sardar}
                  alt="Обложка журнала Сардар"
                  className="w-full max-w-md mx-auto h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">Qalam Masters</span>
              </div>
              <p className="text-gray-400">
                Научный рецензируемый журнал для публикации оригинальных
                исследований и обзоров по широкому спектру дисциплин.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Журнал</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    О журнале
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Архив номеров
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Требования к статьям
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Этика публикации
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Авторам</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Подача статьи
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Процесс рецензирования
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Шаблоны оформления
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Часто задаваемые вопросы
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Контакты редакции</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@gmail.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+7 777 888 55 44</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 Научный журнал "Qalam Masters". Все права защищены.
            </p>
          </div>
            <FloatingDashboardLauncher />
        </div>

      </footer>
    </div>
  );
}
