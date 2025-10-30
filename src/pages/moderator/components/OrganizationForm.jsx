import { useState } from "react";
import { Button } from "@/components/ui/button";
import Field from "@/components/Field";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function OrganizationForm({
  onSubmit,
  initialData = {},
  disabled = false,
  serverError = "",
  serverFieldErrors = {},
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    head_name: initialData.head_name || "",
    head_phone: initialData.head_phone || "",
    head_email: initialData.head_email || "",
    address: initialData.address || "",
    bin: initialData.bin || "",
    website: initialData.website || "",
    country: initialData.country || "",
    city: initialData.city || "",
    postal_zip: initialData.postal_zip || "",
    social_link: initialData.social_link || "",
  });

  const [agreedToOffer, setAgreedToOffer] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [termsError, setTermsError] = useState("");

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Укажите название организации";
    if (!form.head_name.trim()) errs.head_name = "Укажите ФИО руководителя";
    if (!form.head_email.trim()) errs.head_email = "Укажите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.head_email))
      errs.head_email = "Некорректный email";
    if (!form.head_phone.trim()) errs.head_phone = "Укажите телефон";
    if (!form.bin.trim()) errs.bin = "Укажите БИН";
    else if (!/^\d{12}$/.test(form.bin))
      errs.bin = "БИН должен содержать 12 цифр";
    let terms_error = "";
    if (!agreedToOffer || !agreedToPrivacy) {
      terms_error = "Необходимо принять Условия оферты и Политику конфиденциальности.";
    }
    setTermsError(terms_error);
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length || termsError) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* секция 1: Основное */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">Основная информация</h2>
          <p className="text-sm text-muted-foreground">
            Название и краткое описание организации.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              name="title"
              label="Название"
              placeholder="Qalam University"
              value={form.title}
              onChange={handleChange}
              error={errors.title || serverFieldErrors?.title}
              disabled={disabled}
            />
          </div>

          <div className="md:col-span-2">
            <Field
              name="description"
              label="Описание"
              placeholder="Краткое описание…"
              value={form.description}
              onChange={handleChange}
              error={errors.description || serverFieldErrors?.description}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* секция 2: Контакты руководителя */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">Контакты руководителя</h2>
          <p className="text-sm text-muted-foreground">
            ФИО, телефон и email для оперативной связи.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              name="head_name"
              label="ФИО руководителя"
              placeholder="Иванов Иван Иванович"
              value={form.head_name}
              onChange={handleChange}
              error={errors.head_name || serverFieldErrors?.head_name}
              disabled={disabled}
            />
          </div>

          <Field
            name="head_phone"
            label="Телефон руководителя"
            placeholder="+7 705 000 00 00"
            value={form.head_phone}
            onChange={handleChange}
            error={errors.head_phone || serverFieldErrors?.head_phone}
            disabled={disabled}
          />

          <Field
            name="head_email"
            label="Email руководителя"
            type="email"
            placeholder="head@example.org"
            value={form.head_email}
            onChange={handleChange}
            error={errors.head_email || serverFieldErrors?.head_email}
            disabled={disabled}
          />
        </div>
      </div>

      {/* секция 3: Реквизиты и адрес */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">Реквизиты и адрес</h2>
          <p className="text-sm text-muted-foreground">
            Юридический адрес, БИН, сайт, страна, город и индекс.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field
              name="address"
              label="Адрес"
              placeholder="г. Астана, ул. ..."
              value={form.address}
              onChange={handleChange}
              error={errors.address || serverFieldErrors?.address}
              disabled={disabled}
            />
          </div>

          <Field
            name="bin"
            label="БИН"
            placeholder="12 цифр"
            value={form.bin}
            onChange={handleChange}
            error={errors.bin || serverFieldErrors?.bin}
            disabled={disabled}
          />

          <Field
            name="website"
            label="Сайт"
            placeholder="https://..."
            value={form.website}
            onChange={handleChange}
            error={errors.website || serverFieldErrors?.website}
            disabled={disabled}
          />

          <Field
            name="country"
            label="Страна"
            placeholder="Казахстан"
            value={form.country}
            onChange={handleChange}
            error={errors.country || serverFieldErrors?.country}
            disabled={disabled}
          />

          <Field
            name="city"
            label="Город"
            placeholder="Астана"
            value={form.city}
            onChange={handleChange}
            error={errors.city || serverFieldErrors?.city}
            disabled={disabled}
          />

          <Field
            name="postal_zip"
            label="Почтовый индекс"
            placeholder="010000"
            value={form.postal_zip}
            onChange={handleChange}
            error={errors.postal_zip || serverFieldErrors?.postal_zip}
            disabled={disabled}
          />

          <div className="md:col-span-2">
            <Field
              name="social_link"
              label="Соцсети"
              placeholder="https://t.me/organization"
              value={form.social_link}
              onChange={handleChange}
              error={errors.social_link || serverFieldErrors?.social_link}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* -> ДОБАВИТЬ НОВУЮ СЕКЦИЮ С ЧЕКБОКСАМИ ПЕРЕД КНОПКОЙ */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
                id="agreedToOffer"
                checked={agreedToOffer}
                onCheckedChange={setAgreedToOffer}
                className="mt-1"
                disabled={disabled}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="agreedToOffer">
                Я принимаю <Link to="/public-offer" className="font-medium text-blue-600 hover:text-blue-800 hover:underline" target="_blank">Условия Публичной оферты</Link>
              </Label>
              {/* Опциональный текст ошибки, если чекбокс обязателен */}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
                id="agreedToPrivacy"
                checked={agreedToPrivacy}
                onCheckedChange={setAgreedToPrivacy}
                className="mt-1"
                disabled={disabled}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="agreedToPrivacy">
                Я согласен(на) с <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-800 hover:underline" target="_blank">Политикой конфиденциальности</Link>
              </Label>
            </div>
          </div>

          {termsError && (
              <p className="text-sm font-medium text-destructive">{termsError}</p>
          )}
        </div>
      </div>
      {/* <- КОНЕЦ НОВОЙ СЕКЦИИ */}

      {/* Кнопка действия — единая, без внешней «белой карточки» */}
      <Button type="submit" disabled={disabled} className="w-full">
        {disabled ? "Сохраняем..." : "Сохранить"}
      </Button>
    </form>
  );
}
