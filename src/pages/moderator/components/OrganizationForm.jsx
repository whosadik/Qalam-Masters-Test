import { useState } from "react";
import { Button } from "@/components/ui/button";
import Field from "@/components/Field";

export default function OrganizationForm({
  onSubmit,
  initialData = {},
  disabled = false,
  serverError = "",
  serverFieldErrors = {},   // 👈 добавили
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
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-lg border p-4 rounded bg-white"
    >
      {serverError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {serverError}
        </div>
      )}

      <Field
        name="title"
        label="Название"
        placeholder="Qalam University"
        value={form.title}
        onChange={handleChange}
        error={errors.title || serverFieldErrors?.title}
        disabled={disabled}
      />

      <Field
        name="description"
        label="Описание"
        placeholder="Краткое описание…"
        value={form.description}
        onChange={handleChange}
        error={errors.description || serverFieldErrors?.description}
        disabled={disabled}
      />

      <Field
        name="head_name"
        label="ФИО руководителя"
        placeholder="Иванов Иван Иванович"
        value={form.head_name}
        onChange={handleChange}
        error={errors.head_name || serverFieldErrors?.head_name}
        disabled={disabled}
      />

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

      <Field
        name="address"
        label="Адрес"
        placeholder="г. Астана, ул. ..."
        value={form.address}
        onChange={handleChange}
        error={errors.address || serverFieldErrors?.address}
        disabled={disabled}
      />

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

      <Field
        name="social_link"
        label="Соцсети"
        placeholder="https://t.me/organization"
        value={form.social_link}
        onChange={handleChange}
        error={errors.social_link || serverFieldErrors?.social_link}
        disabled={disabled}
      />

      <Button type="submit" disabled={disabled} className="w-full">
        {disabled ? "Сохраняем..." : "Сохранить"}
      </Button>
    </form>
  );
}
