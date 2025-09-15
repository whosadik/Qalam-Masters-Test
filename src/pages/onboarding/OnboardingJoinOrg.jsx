// src/pages/onboarding/OnboardingJoinOrg.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
// сюда же можно подключить сервис: join-by-code, join-by-domain и т.д.

export default function OnboardingJoinOrg() {
  const { t } = useTranslation("onboarding");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    setLoading(true);
    setErr("");
    try {
      // TODO: вызвать твой endpoint: organizations/join-by-code
      // await joinByCode({ code });
      // navigate("/app", { replace: true });
      alert (
          t(
          "join_org.alerts.not_implemented",
          "Здесь будет вызов join-by-code. Вставь сервис и редирект."
        )
      );
    } catch (e) {
      setErr(e?.displayMessage || "Не удалось присоединиться");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-2">{t("join_org.title", "Присоединиться к организации")}</h1>
        <p className="text-sm text-gray-600 mb-4">
          {t(
              "join_org.subtitle",
              "Введите код приглашения от администратора. Если у вас корпоративный email, можно настроить авто-подтверждение по домену."
          )}
        </p>
        <div className="space-y-3">
          <Input
            placeholder={t(
                "join_org.input.code_placeholder",
                "Код приглашения"
            )}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={loading}
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button
            onClick={handleJoin}
            disabled={!code || loading}
            className="w-full"
          >
            {t("join_org.actions.join", "Присоединиться")}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/app")}
            disabled={loading}
            className="w-full"
          >
            {t("join_org.actions.later", "Позже")}
          </Button>
        </div>
      </div>
    </div>
  );
}
