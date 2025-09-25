import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export default function PublicOffer() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Публичная оферта — True Masters</title>
        <meta
          name="description"
          content="Договор публичной оферты ТОО «True Masters»"
        />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Публичная оферта</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Публичная оферта
        </h1>
        <p className="text-gray-500 mb-10">
          Договор публичной оферты ТОО “True Masters”
        </p>

        <section className="prose prose-gray max-w-none">
          <p>
            Настоящий документ является официальным предложением ТОО “True
            Masters” (БИН: 250540031246), именуемого в дальнейшем «Продавец»,
            заключить договор на оказание услуг дистанционным способом
            посредством сети Интернет.
          </p>
          <p>
            Оплата услуг Покупателем означает полное и безоговорочное принятие
            условий настоящей оферты.
          </p>

          <h2>Реквизиты Продавца</h2>
          <ul>
            <li>
              <strong>Наименование:</strong> ТОО “True Masters”
            </li>
            <li>
              <strong>БИН:</strong> 250540031246
            </li>
            <li>
              <strong>Банк:</strong> Филиал АО «ForteBank» в г. Астана
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
              <strong>Адрес:</strong> Казахстан, г. Астана, р-н Сарыарка, ул.
              Кенжебека Кумисбекова, д. 8, н.п. 2б, 010000
            </li>
            <li>
              <strong>Телефон:</strong> +7 771 282 78 01
            </li>
            <li>
              <strong>Email:</strong> info@truemasters.kz
            </li>
            <li>
              <strong>Директор:</strong> Мукатаев Темирлан Ильшатович,
              действующий на основании Устава
            </li>
          </ul>

          <h2>Предмет договора</h2>
          <p>
            Продавец оказывает услуги по публикации, сопутствующим сервисам и
            иным функциональным возможностям платформы Qalam Masters, а
            Покупатель оплачивает их в соответствии с действующими тарифами и
            правилами.
          </p>

          <h2>Порядок оплаты</h2>
          <p>
            Оплата осуществляется безналичным способом через доступные платежные
            средства на сайте/в приложении. Факт оплаты подтверждает согласие с
            условиями оферты.
          </p>

          <h2>Права и обязанности сторон</h2>
          <p>
            Стороны обязуются добросовестно выполнять условия договора. Продавец
            правомочен изменять тарифы и правила оказания услуг с размещением
            актуальной редакции на сайте.
          </p>

          <h2>Прочие условия</h2>
          <p>
            Ко всем отношениям, не урегулированным настоящей офертой,
            применяются нормы действующего законодательства Республики
            Казахстан.
          </p>

          <p className="text-sm text-gray-500">
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
          </p>
        </section>
      </div>
    </div>
  );
}
