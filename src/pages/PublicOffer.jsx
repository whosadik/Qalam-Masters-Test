import { Link } from "react-router-dom";

export default function PublicOffer() {
  return (
    <div className="min-h-screen bg-white">
      <title>Публичная оферта — True Masters</title>
      <meta
        name="description"
        content="Публичная оферта ТОО «True Masters» на оказание IT-услуг и предоставление цифровых сервисов."
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Публичная оферта</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Публичная оферта
        </h1>

        <section className="prose prose-gray max-w-none space-y-4">
          <p>
            Настоящий документ является официальным предложением{" "}
            <strong>ТОО «True Masters»</strong> (БИН 250540031246), именуемого в
            дальнейшем «Исполнитель», заключить договор на оказание IT-услуг и
            предоставление цифровых сервисов дистанционным способом посредством
            сети Интернет.
          </p>

          <p>
            Оплата услуг Заказчиком означает полное и безоговорочное принятие
            условий настоящей оферты.
          </p>

          <h2>Реквизиты компании</h2>
          <ul>
            <li>
              <strong>Наименование:</strong> ТОО «True Masters»
            </li>
            <li>
              <strong>БИН:</strong> 250540031246
            </li>
            <li>
              <strong>Адрес:</strong> Казахстан, г. Астана, р-н Сарыарка, ул.
              Кенжебека Кумисбекова, д. 8, н.п. 2б, 010000
            </li>
            <li>
              <strong>Телефон:</strong>{" "}
              <a
                href="tel:+77712827801"
                className="text-blue-600 hover:underline"
              >
                +7 771 282 78 01
              </a>
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:info@truemasters.kz"
                className="text-blue-600 hover:underline"
              >
                info@truemasters.kz
              </a>
            </li>
            <li>
              <strong>Банк:</strong> АО «ForteBank», филиал в г. Астана
            </li>
            <li>
              <strong>ИИК:</strong> KZ3996503F0014973858KZT
            </li>
            <li>
              <strong>БИК:</strong> IRTYKZKA
            </li>
            <li>
              <strong>КБЕ:</strong> 17
            </li>
            <li>
              <strong>Директор:</strong> Мукатаев Темирлан Ильшатович
            </li>
          </ul>

          <p className="text-sm text-gray-500 mt-6">
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
          </p>
        </section>
      </div>
    </div>
  );
}
