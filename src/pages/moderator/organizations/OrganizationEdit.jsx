// src/pages/moderator/OrganizationEdit.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrganizationForm from "../components/OrganizationForm";
import { Button } from "@/components/ui/button";
import { getOrganization, updateOrganization } from "@/services/organizationsService";

export default function OrganizationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      setServerFieldErrors({});
      try {
        const org = await getOrganization(id); // -> { id, title, head_name, ... }

        if (ignore) return;

        // ❗ КЛАДЁМ КЛЮЧИ ТАК ЖЕ, КАК ИХ ЖДЁТ ФОРМА
        setInitialData({
          title: org.title || "",
          description: org.description || "",
          head_name: org.head_name || "",
          head_phone: org.head_phone || "",
          head_email: org.head_email || "",
          address: org.address || "",
          bin: org.bin || "",
          website: org.website || "",
          country: org.country || "",
          city: org.city || "",
          // если на бэке postal_code — в форму кладём "postal_zip", а при сабмите замапим обратно
          postal_zip: org.postal_code || "",
          // если social_links — массив, возьмём первый для удобства редактирования
          social_link: Array.isArray(org.social_links) && org.social_links.length ? org.social_links[0] : "",
        });
      } catch (e) {
        if (!ignore) {
          const msg =
            e?.response?.data?.detail ||
            e?.response?.data?.error ||
            "Не удалось загрузить организацию";
          setError(String(msg));
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  const handleSubmit = async (formValues) => {
    // ❗ ФОРМА → API (ключи как у API)
    const payload = {
      title: formValues.title?.trim(),
      description: formValues.description?.trim(),
      head_name: formValues.head_name?.trim(),
      head_phone: formValues.head_phone?.trim(),
      head_email: formValues.head_email?.trim(),
      address: formValues.address?.trim(),
      bin: formValues.bin?.trim(),
      website: formValues.website?.trim(),
      country: formValues.country?.trim(),
      city: formValues.city?.trim(),
      postal_code: formValues.postal_zip?.trim(),     // мапим обратно
      social_links: formValues.social_link?.trim()    // строка → массив
        ? [formValues.social_link.trim()]
        : [],
    };

    setSaving(true);
    setError("");
    setServerFieldErrors({});
    try {
      await updateOrganization(id, payload); // PATCH внутри сервиса
      navigate(`/moderator/organizations/${id}`, { replace: true });
    } catch (e) {
      // Покажем и общий, и по-полевой ошибки
      const fieldErrs = e?.response?.data && typeof e.response.data === "object" ? e.response.data : {};
      setServerFieldErrors(fieldErrs);

      const msg =
        fieldErrs?.detail ||
        e?.response?.data?.error ||
        "Не удалось сохранить изменения";
      setError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Загрузка…</div>;
  }

  if (!initialData) {
    return (
      <div className="p-6">
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error || "Организация не найдена"}
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Назад</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Редактировать организацию</h1>
        <Button variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Назад
        </Button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      <OrganizationForm
        onSubmit={handleSubmit}
        initialData={initialData}
        disabled={saving}
        serverError={error}
        serverFieldErrors={serverFieldErrors}
      />
    </div>
  );
}
