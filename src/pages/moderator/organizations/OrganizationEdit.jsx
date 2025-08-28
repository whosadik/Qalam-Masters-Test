// src/pages/moderator/OrganizationEdit.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrganizationForm from "../components/OrganizationForm";
import { Button } from "@/components/ui/button";
import { getOrganization, updateOrganization } from "@/services/organizationsService";

export default function OrganizationEdit() {
  const { id } = useParams(); // ожидается маршрут: /moderator/organizations/:id/edit
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // загрузка организации
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const org = await getOrganization(id); // -> { id, title, head_name, ... }
        if (ignore) return;

        // API -> форма
        setInitialData({
          name: org.title || "",
          description: org.description || "",
          head: org.head_name || "",
          phone: org.head_phone || "",
          email: org.head_email || "",
          address: org.address || "",
          bin: org.bin || "",
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
    // форма -> API
    const payload = {
      title: formValues.name?.trim() || "",
      description: formValues.description?.trim() || "",
      head_name: formValues.head?.trim() || "",
      head_phone: formValues.phone?.trim() || "",
      head_email: formValues.email?.trim() || "",
      address: formValues.address?.trim() || "",
      bin: formValues.bin?.trim() || "",
    };

    setSaving(true);
    setError("");
    try {
      await updateOrganization(id, payload); // PATCH
      navigate(`/moderator/organizations/${id}`, { replace: true });
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
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

      <OrganizationForm onSubmit={handleSubmit} initialData={initialData} disabled={saving} />
    </div>
  );
}
