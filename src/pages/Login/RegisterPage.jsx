import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Building2,
  UserRound,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { signup as apiSignup } from "@/services/authService";
import { useAuth } from "@/auth/AuthContext"; // <-- добавили
import { useTranslation, Trans } from "react-i18next";

// простая оценка силы пароля
function scorePassword(pwd) {
  let s = 0;
  if (!pwd) return 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 5);
}
function strengthLabel(score) {
  return (
    [
      "Очень слабый",
      "Слабый",
      "Средний",
      "Хороший",
      "Сильный",
      "Очень сильный",
    ][score] || "Очень слабый"
  );
}

// делим одно поле "name" на first_name / last_name
function splitName(full) {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "-" };
  return {
    first_name: parts.slice(0, -1).join(" "),
    last_name: parts.slice(-1)[0],
  };
}
export default function RegisterPage() {
  const { t } = useTranslation(["auth", "common"]);
  const [intent, setIntent] = useState("individual"); // "individual" | "create-org" | "join-org"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const emailValid = useMemo(
    () => /^\S+@\S+\.\S+$/.test(formData.email),
    [formData.email]
  );
  const pwdScore = useMemo(
    () => scorePassword(formData.password),
    [formData.password]
  );
  const pwdMatch =
    formData.password && formData.password === formData.confirmPassword;

  const hasErrors = !formData.name || !emailValid || pwdScore < 2 || !pwdMatch;

  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg("");
    setOkMsg("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    if (hasErrors) return;

    try {
      setLoading(true);
      setErrorMsg("");
      const { first_name, last_name } = splitName(formData.name);

      // сохраняем выбранный путь онбординга на после-логина
      sessionStorage.setItem("onboarding.intent", intent);

      await apiSignup({
        email: formData.email.trim(),
        password: formData.password,
        first_name,
        last_name,
      });

      navigate("/login/verify-email", {
        state: { email: formData.email.trim() },
        replace: true,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.password?.[0] ||
        err?.response?.data?.error ||
        err?.message || t("auth:errors.register_failed", "Не удалось создать аккаунт. Попробуйте снова.");
      setErrorMsg(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-center text-xl sm:text-2xl font-bold">
            {t("auth:register.title", "Регистрация")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* ШАГ 0 — выбор пути */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
              {t("auth:register.intent.question", "Как вы планируете использовать Qalam Masters?")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ChoiceCard
                active={intent === "individual"}
                onClick={() => setIntent("individual")}
                icon={<UserRound className="w-4 h-4" />}
                title={t("auth:register.intent.individual.title", "Зарегистрироваться как автор")}
                desc={t("auth:register.intent.individual.desc", "Только личный аккаунт")}
              />
              <ChoiceCard
                active={intent === "create-org"}
                onClick={() => setIntent("create-org")}
                icon={<Building2 className="w-4 h-4" />}
                title={t("auth:register.intent.create_org.title", "Создать организацию")}
                desc={t("auth:register.intent.create_org.desc", "ВУЗ/журнал/компания")}
              />
              {/* <ChoiceCard
                active={intent === "join-org"}
                onClick={() => setIntent("join-org")}
                icon={<UserPlus className="w-4 h-4" />}
                title={t("auth:register.intent.join_org.title", "Присоединиться")}
                desc={t("auth:register.intent.join_org.desc", "К существующей организации")}
              /> */}
            </div>
          </div>

          {/* ФОРМА АККАУНТА */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {t("auth:register.name", "Имя и фамилия")}
              </label>
              <Input
                id="name"
                name="name"
                placeholder={t("auth:register.name_placeholder", "Напр. Иван Иванов")}
                value={formData.name}
                onChange={handleChange}
                onBlur={onBlur}
                autoComplete="name"
                aria-invalid={touched.name && !formData.name}
                disabled={loading}
              />
              {touched.name && !formData.name && (
                <p className="text-xs text-red-600">{t("auth:errors.name_required", "Введите имя.")}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {t("auth:register.email", "Email")}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("auth:register.email_placeholder", "you@example.com")}
                value={formData.email}
                onChange={handleChange}
                onBlur={onBlur}
                autoComplete="email"
                aria-invalid={touched.email && !emailValid}
                disabled={loading}
              />
              {touched.email && !emailValid && (
                <p className="text-xs text-red-600">
                  {t("auth:errors.email_invalid", "Введите корректный email.")}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {t("auth:register.password", "Пароль")}
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder={t("auth:register.password_placeholder", "Минимум 8 символов")}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={onBlur}
                  autoComplete="new-password"
                  aria-invalid={touched.password && pwdScore < 2}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 inline-flex items-center rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={
                    showPwd
                        ? t("auth:login.hide_password", "Скрыть пароль")
                        : t("auth:login.show_password", "Показать пароль")
                  }
                  disabled={loading}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>

              {/* strength bar */}
              <div className="mt-1">
                <div className="h-1.5 w-full rounded bg-gray-200 overflow-hidden">
                  <div
                    className={[
                      "h-full transition-all duration-300",
                      ["w-1/6", "w-2/6", "w-3/6", "w-4/6", "w-5/6", "w-full"][
                        pwdScore
                      ],
                      [
                        "bg-red-500",
                        "bg-orange-500",
                        "bg-yellow-500",
                        "bg-lime-500",
                        "bg-green-500",
                        "bg-emerald-600",
                      ][pwdScore],
                    ].join(" ")}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  {t("auth:password_strength.prefix", "Сила пароля:")}{" "}
                  <span className="font-medium">{strengthLabel(pwdScore)}</span>
                </p>
              </div>

              {touched.password && pwdScore < 2 && (
                <p className="text-xs text-red-600">
                  {t(
                      "auth:errors.password_help",
                      "Добавьте длину (8–12+), цифры, строчные/прописные буквы и символы."
                  )}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {t("auth:register.confirm_password", "Подтвердите пароль")}
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPwd2 ? "text" : "password"}
                  placeholder={t("auth:register.confirm_password_placeholder", "Повторите пароль")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={onBlur}
                  autoComplete="new-password"
                  aria-invalid={touched.confirmPassword && !pwdMatch}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 inline-flex items-center rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowPwd2((v) => !v)}
                  aria-label={showPwd2 ? t("auth:login.hide_password", "Скрыть пароль") : t("auth:login.show_password", "Показать пароль")}
                  disabled={loading}
                >
                  {showPwd2 ? (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && !pwdMatch && (
                <p className="text-xs text-red-600">{t("auth:errors.passwords_not_match", "Пароли не совпадают.")}</p>
              )}
            </div>

            {/* Alerts */}
            {errorMsg && (
              <p className="text-sm text-red-600" role="alert">
                {errorMsg}
              </p>
            )}
            {okMsg && <p className="text-sm text-green-600">{okMsg}</p>}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-[#3972FE] hover:bg-[#2f62df] text-white"
              disabled={loading}
            >
              {loading ? (
                  t("auth:register.loading", "Создаём аккаунт...")
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  {intent === "individual" && t("auth:register.submit", "Зарегистрироваться")}
                  {intent === "create-org" && (
                    <>
                      {t("auth:register.submit_and_go_org", "Зарегистрироваться и перейти к организации")}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                  {intent === "join-org" && (
                    <>
                      {t("auth:register.submit_and_join", "Зарегистрироваться и присоединиться")}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </span>
              )}
            </Button>

            {/* низ формы */}
            <p className="text-center text-xs text-gray-500">
              Регистрируясь, вы соглашаетесь с{" "}
              <Link to="/terms" className="text-blue-600 hover:underline">
                условиями сервиса
              </Link>{" "}
              и{" "}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                политикой конфиденциальности
              </Link>
              .
            </p>
          </form>

          {/* divider + link to login */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">{t("common:or", "или")}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="text-center text-sm text-gray-600">
            {t("auth:register.have_account", "Уже есть аккаунт?")}{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              {t("auth:register.login_link", "Войти")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChoiceCard({ active, onClick, icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border rounded-lg p-3 text-left transition shadow-sm",
        active
          ? "border-blue-600 ring-2 ring-blue-200 bg-white dark:bg-slate-900"
          : "border-gray-200 hover:border-blue-300",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <div
          className={[
            "p-1.5 rounded-md",
            active
              ? "bg-blue-50 dark:bg-slate-800"
              : "bg-gray-50 dark:bg-slate-800",
          ].join(" ")}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-500">{desc}</div>
        </div>
      </div>
    </button>
  );
}
