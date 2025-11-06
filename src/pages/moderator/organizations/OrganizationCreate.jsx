// src/pages/moderator/OrganizationCreate.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizationForm from "../components/OrganizationForm";
import {
  createOrganization,
  createOrganizationMembership,
} from "@/services/organizationsService";

import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrganizationCreate() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    setServerError("");
    setServerFieldErrors({});
    try {
      const org = await createOrganization(formValues);
      try {
        await createOrganizationMembership({
          organization: org.id,
          role: "admin",
        });
      } catch (_) {}
      navigate(`/moderator/organizations/${org.id}`, { replace: true });
    } catch (e) {
      setServerError(
        e.displayMessage || e.message ||  t(
              "moderator_orgs:organization_create.create_failed",
              "Не удалось создать организацию"
          )
      );
      const data = e?.response?.data;
      if (data && typeof data === "object") {
        const { detail, non_field_errors, ...fields } = data;
        const mapped = Object.fromEntries(
          Object.entries(fields).map(([k, v]) => [
            k,
            Array.isArray(v) ? v.join(" ") : String(v),
          ])
        );
        setServerFieldErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6FAFF] to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="pl-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("moderator_orgs:organization_create.back", "Назад")}
            </Button>
          </div>
        </div>

        {/* Server error (без карточек) */}
        {serverError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Форма: секции внутри, без внешнего белого бокса */}
        <OrganizationForm
          onSubmit={handleSubmit}
          disabled={submitting}
          serverError={serverError}
          serverFieldErrors={serverFieldErrors}
        />
      </div>
    </div>
  );
}
