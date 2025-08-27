import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login as apiLogin } from "@/services/authService";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Заполните все поля.");
      return;
    }
    try {
      setLoading(true);
      // реальный запрос на бекенд
      await apiLogin({
        email: formData.email.trim(),
        password: formData.password,
      });
      // редирект обратно на страницу, куда пытались попасть, или на /
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    } catch (err) {
      // попытка вытащить человекочитаемую ошибку
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.error ||
        "Неверный email или пароль.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-center text-xl sm:text-2xl font-bold">
            Вход
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="email"
                aria-invalid={!!error && !formData.email}
                aria-describedby="email-help"
              />
              <p id="email-help" className="text-xs text-gray-500">
                Используйте адрес, указанный при регистрации.
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Пароль
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Забыли пароль?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Ваш пароль"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  aria-invalid={!!error && !formData.password}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 inline-flex items-center rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
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
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-sm" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Входим..." : "Войти"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">или</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Secondary actions */}
          <div className="text-center text-sm text-gray-600">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Зарегистрируйтесь
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
