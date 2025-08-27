import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, MapPin, Calendar, Globe } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { updateMe, deleteMe } from "@/services/authService";

export default function AuthorProfile() {
  const { user, refreshMe, logout } = useAuth();
  const navigate = useNavigate();

  // локальное состояние формы
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    city: "",
    academic_title: "",
    academic_degree: "",
    website_link: "",
    bio: "",
    avatar: "", // URL
  });
  const [editMode, setEditMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // при первом рендере и при изменении user наполняем форму
  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      country: user.country || "",
      city: user.city || "",
      academic_title: user.academic_title || "",
      academic_degree: user.academic_degree || "",
      website_link: user.website_link || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
    });
  }, [user]);

  const fullName = useMemo(() => {
    if (!user) return "";
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length ? parts.join(" ") : user.email || "—";
  }, [user]);

  const registeredAt = useMemo(() => {
    const dt = user?.date_joined || user?.created_at;
    if (!dt) return "";
    try {
      return new Date(dt).toLocaleDateString();
    } catch {
      return String(dt);
    }
  }, [user]);

  const handleChange = (e) => {
    setErr(""); setMsg("");
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setErr(""); setMsg("");
    setBusy(true);
    try {
      // PATCH — обновляем только изменённые поля
      await updateMe(form, "patch");
      await refreshMe(); // подтянуть свежего пользователя
      setMsg("Профиль обновлён");
      setEditMode(false);
    } catch (e) {
      const m =
        e?.response?.data?.detail ||
        e?.response?.data?.non_field_errors?.[0] ||
        e?.response?.data?.error ||
        "Не удалось сохранить профиль.";
      setErr(String(m));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setErr(""); setMsg("");
    if (!confirm("Удалить аккаунт безвозвратно?")) return;
    setBusy(true);
    try {
      await deleteMe(); // сервер удалит; токены чистятся в сервисе
      logout();
      navigate("/", { replace: true });
    } catch (e) {
      const m =
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        "Не удалось удалить аккаунт.";
      setErr(String(m));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Профиль автора
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Верхняя шапка */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center">
                {form.avatar ? (
                  // аватар из url
                  <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {fullName || "—"}
                </h2>
                {user?.academic_title && (
                  <p className="text-gray-600">{user.academic_title}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                  {user?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </span>
                  )}
                  {(user?.city || user?.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {[user.city, user.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {registeredAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Регистрация: {registeredAt}
                    </span>
                  )}
                  {user?.website_link && (
                    <a
                      href={user.website_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Веб-сайт
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Форма редактирования */}
            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя</label>
                  <Input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="Имя"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Фамилия</label>
                  <Input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="Фамилия"
                    autoComplete="family-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Телефон</label>
                  <Input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="+7 777 000 00 00"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Страна</label>
                  <Input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="Казахстан"
                    autoComplete="country-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Город</label>
                  <Input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="Алматы"
                    autoComplete="address-level2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Академическое звание</label>
                  <Input
                    name="academic_title"
                    value={form.academic_title}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="Кандидат наук / Профессор"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Академическая степень</label>
                  <Input
                    name="academic_degree"
                    value={form.academic_degree}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="PhD / MSc / ... "
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ссылка на сайт</label>
                  <Input
                    name="website_link"
                    value={form.website_link}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="https://…"
                    type="url"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">URL аватара</label>
                  <Input
                    name="avatar"
                    value={form.avatar}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">О себе</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    disabled={!editMode || busy}
                    placeholder="Краткая информация об исследованиях, интересах…"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              {/* сообщения */}
              {err && <p className="text-sm text-red-600">{err}</p>}
              {msg && <p className="text-sm text-green-600">{msg}</p>}

              {/* кнопки */}
              <div className="flex flex-wrap gap-3">
                {!editMode ? (
                  <>
                    <Button onClick={() => setEditMode(true)}>Редактировать профиль</Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={busy}
                      title="Удалить аккаунт навсегда"
                    >
                      Удалить аккаунт
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={busy}>
                      {busy ? "Сохраняем…" : "Сохранить"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // откат к текущему user
                        setEditMode(false);
                        setErr(""); setMsg("");
                        if (user) {
                          setForm({
                            first_name: user.first_name || "",
                            last_name: user.last_name || "",
                            phone: user.phone || "",
                            country: user.country || "",
                            city: user.city || "",
                            academic_title: user.academic_title || "",
                            academic_degree: user.academic_degree || "",
                            website_link: user.website_link || "",
                            bio: user.bio || "",
                            avatar: user.avatar || "",
                          });
                        }
                      }}
                      disabled={busy}
                    >
                      Отмена
                    </Button>
                  </>
                )}
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
