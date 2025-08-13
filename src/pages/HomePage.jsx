import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileText,
  Shield,
  Users,
  BarChart3,
  Mail,
  Phone,
  Globe,
  Award,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom"; // добавьте импорт

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Sardar from "../../public/sardar.png";
import Logo from "../../public/writing 1.png";

export default function HomePage() {
  const journalInfo = {
    title: 'Научный журнал "Qalam Masters"',
    description:
      "Сардар — это научный рецензируемый журнал, публикующий оригинальные исследования, обзоры и аналитические материалы по широкому спектру дисциплин. Мы объединяем ученых, преподавателей, аспирантов и исследователей для обмена знаниями, опытом и передовыми идеями.",
    mission:
      "Продвигать научные исследования и развитие академического диалога между представителями различных научных направлений, способствуя интеграции науки и практики.",
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {/*       <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 flex items-center">
                <img
                  src={Logo}
                  alt="Qalam Masters logo"
                  className="mr-2 h-10 w-10"
                />{" "}
                Qalam Masters
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                О журнале
              </a>
              <a
                href="#topics"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Тематика
              </a>
              <a
                href="#editorial"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Редколлегия
              </a>
              <a
                href="#info"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Информация
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Контакты
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Button variant="outline">Войти</Button>
              <Button>Зарегистрироваться</Button>
            </div>
          </div>
        </div>
      </header> */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                Qalam Masters
              </span>
            </div>
            {/* Обновляем навигацию для ссылок на отдельные страницы */}
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
            <div className="flex items-center gap-4">
              <Button variant="outline">Войти</Button>
              <Button>Подать статью в журнал</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  <BookOpen className="h-4 w-4 mr-2" /> Научный рецензируемый
                  журнал
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  {journalInfo.title}
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  {journalInfo.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6">
                  Подать статью в журнал
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-transparent"
                >
                  Требования к оформлению
                </Button>
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
        </div>
      </footer>
    </div>
  );
}
