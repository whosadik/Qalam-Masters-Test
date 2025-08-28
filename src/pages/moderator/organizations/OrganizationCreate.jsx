// src/pages/moderator/OrganizationCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizationForm from "../components/OrganizationForm";
import {
  createOrganization,
  createOrganizationMembership,
} from "@/services/organizationsService";
import { Button } from "@/components/ui/button";

export default function OrganizationCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    setServerError("");
    setServerFieldErrors({});

    try {
      // 1) создаём организацию (нормализацию уже делает сервис)
      const org = await createOrganization(formValues); // -> { id, title, ... }

      // 2) назначаем себя админом (если бэк делает сам — возможный 4xx игнорируем)
      try {
        await createOrganizationMembership({ organization: org.id, role: "admin" });
      } catch (_) {}

      // 3) редирект
       navigate(`/moderator/organizations/${org.id}`, { replace: true });
      // или сразу к созданию журнала:
      // navigate(`/moderator/organizations/${org.id}/add-journal`, { replace: true });
    } catch (e) {
      // «умная» строка ошибки от сервиса (extractDRFError)
      setServerError(e.displayMessage || e.message || "Не удалось создать организацию");

      // дополнительно — разложим пометки по полям, если они есть
      const data = e?.response?.data;
      if (data && typeof data === "object") {
        const { detail, non_field_errors, ...fields } = data;
        const mapped = Object.fromEntries(
          Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v.join(" ") : String(v)])
        );
        setServerFieldErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Добавить организацию</h1>
        <Button variant="outline" onClick={() => navigate(-1)} disabled={submitting}>
          Назад
        </Button>
      </div>

      <OrganizationForm
        onSubmit={handleSubmit}
        disabled={submitting}
        serverError={serverError}
        serverFieldErrors={serverFieldErrors} // <— важно: прокидываем
      />
    </div>
  );
}
