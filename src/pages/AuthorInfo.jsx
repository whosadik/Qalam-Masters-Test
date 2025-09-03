import { BookOpen, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "../components/layout/Navbar";
import { Link } from "react-router-dom";

export default function AuthorInfo() {
  const requirements = [
    {
      title: "Оформление рукописи",
      items: [
        "Объем статьи: от 4 до 12 страниц",
        "Шрифт: Times New Roman, 12 pt",
        "Интервал: 1,5",
        "Поля: 2 см со всех сторон",
        "Формат файла: .doc или .docx",
      ],
    },
    {
      title: "Структура статьи",
      items: [
        "Название статьи (на русском и английском языках)",
        "Аннотация (150-250 слов)",
        "Ключевые слова (5-7 слов)",
        "Введение",
        "Основная часть",
        "Заключение",
        "Список литературы",
      ],
    },
    {
      title: "Требования к авторам",
      items: [
        "Указание полного ФИО автора(ов)",
        "Ученая степень и звание",
        "Место работы и должность",
        "Контактная информация",
        "ORCID (при наличии)",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Navbar></Navbar>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-green-100 text-green-800 mb-6">
            Информация для авторов
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Требования к оформлению статей
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Подробная информация о требованиях к оформлению и подаче научных
            статей в журнал
          </p>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {requirements.map((section, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Процесс подачи и рецензирования
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Пошаговое руководство по процессу подачи статьи и её
              рецензирования
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Подача статьи",
                desc: "Загрузите статью через личный кабинет",
              },
              {
                step: "2",
                title: "Первичная проверка",
                desc: "Проверка на соответствие требованиям",
              },
              {
                step: "3",
                title: "Рецензирование",
                desc: "Двойное слепое рецензирование",
              },
              {
                step: "4",
                title: "Публикация",
                desc: "Размещение в ближайшем номере",
              },
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold text-lg">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-orange-500 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Важные замечания
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>
                      • Статьи, не соответствующие требованиям оформления,
                      возвращаются авторам без рассмотрения
                    </li>
                    <li>
                      • Плагиат и самоплагиат недопустимы - все статьи
                      проверяются на оригинальность
                    </li>
                    <li>
                      • Авторы несут ответственность за достоверность
                      представленных данных
                    </li>
                    <li>• Конфликт интересов должен быть указан в статье</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <Link to="/author-dashboard">
            <Button size="lg" className="text-lg px-8 py-6">
              Подать статью в журнал
            </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
