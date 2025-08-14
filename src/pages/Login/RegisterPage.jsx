import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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
  return Math.min(s, 5); // 0..5
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

export default function RegisterPage() {
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
  const navigate = useNavigate();

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
      // TODO: отправить данные на бэкенд
      await new Promise((r) => setTimeout(r, 500)); // имитация сети
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-center text-xl sm:text-2xl font-bold">
            Регистрация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Имя
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Ваше имя"
                value={formData.name}
                onChange={handleChange}
                onBlur={onBlur}
                autoComplete="name"
                aria-invalid={touched.name && !formData.name}
              />
              {touched.name && !formData.name && (
                <p className="text-xs text-red-600">Введите имя.</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={onBlur}
                autoComplete="email"
                aria-invalid={touched.email && !emailValid}
              />
              {touched.email && !emailValid && (
                <p className="text-xs text-red-600">
                  Введите корректный email.
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Пароль
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Минимум 8 символов"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={onBlur}
                  autoComplete="new-password"
                  aria-invalid={touched.password && pwdScore < 2}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 inline-flex items-center rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Индикатор силы пароля */}
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
                  Сила пароля:{" "}
                  <span className="font-medium">{strengthLabel(pwdScore)}</span>
                </p>
              </div>

              {touched.password && pwdScore < 2 && (
                <p className="text-xs text-red-600">
                  Добавьте длину (8–12+), цифры, строчные/прописные буквы и
                  символы.
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Подтвердите пароль
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPwd2 ? "text" : "password"}
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={onBlur}
                  autoComplete="new-password"
                  aria-invalid={touched.confirmPassword && !pwdMatch}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 inline-flex items-center rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowPwd2((v) => !v)}
                  aria-label={showPwd2 ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPwd2 ? (
                    <EyeOff className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
              {touched.confirmPassword && !pwdMatch && (
                <p className="text-xs text-red-600">Пароли не совпадают.</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
            </Button>

            {/* Низ формы */}
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

          {/* Divider & link to login */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">или</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="text-center text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Войти
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
