import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

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
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      // ВСЁ: дальше умный роутер сам разрулит роли
      navigate("/app", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.error ||
        err?.message ||
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
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium">
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
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Пароль
                </label>
                {/* Убери ссылку, если маршрута нет */}
                {/* <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Забыли пароль?
                </Link> */}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 px-3 inline-flex items-center rounded-r-md hover:bg-gray-100 focus:outline-none"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}
                  disabled={loading}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Входим..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
