import { Link } from "react-router-dom";

export default function PaymentAndRefund() {
  return (
    <div className="min-h-screen bg-white">
      <title>Условия оплаты, возврата и доставки — True Masters</title>
      <meta
        name="description"
        content="Оплата онлайн (Visa, MasterCard, ForteBank и др.), правила возврата средств и информация о доставке для IT-услуг True Masters (Казахстан)."
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <nav className="mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">
            Условия оплаты, возврата и доставки
          </span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Условия оплаты, возврата и доставки
        </h1>

        <section className="prose prose-gray max-w-none">
          <ol className="list-decimal pl-5 space-y-4">
            <li>
              Оплата услуг осуществляется онлайн банковскими картами{" "}
              <strong>Visa</strong>, <strong>MasterCard</strong>,{" "}
              <strong>ForteBank</strong> и другими платёжными средствами через
              интернет-эквайринг.
            </li>
            <li>
              Возврат денежных средств возможен при письменном обращении
              Заказчика <strong>до момента оказания услуги</strong>. Если услуга
              была оказана в полном объёме, возврат не производится.
            </li>
            <li>
              Возврат осуществляется на ту же карту, с которой был произведён
              платёж, в течение <strong>5–10 рабочих дней</strong> после
              подтверждения обращения.
            </li>
            <li>
              IT-услуги и цифровые сервисы предоставляются дистанционно,{" "}
              <strong>доставка не требуется</strong>.
            </li>
          </ol>

          <p className="mt-6">
            По вопросам оплаты и возврата можно обращаться по адресу:{" "}
            <a
              href="mailto:info@truemasters.kz"
              className="text-blue-600 hover:underline"
            >
              info@truemasters.kz
            </a>
            , тел.:{" "}
            <a
              href="tel:+77712827801"
              className="text-blue-600 hover:underline"
            >
              +7 771 282 78 01
            </a>
            .
          </p>

          <p className="text-sm text-gray-500 mt-6">
            Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
          </p>
        </section>
      </div>
    </div>
  );
}
