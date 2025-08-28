// src/pages/moderator/OrganizationView.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganization } from "@/services/organizationsService";
import { listJournals } from "@/services/journalsService"; 

export default function OrganizationView() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 1) грузим организацию
        const o = await getOrganization(id);
        setOrg(o);

        // 2) если бэк возвращает связанные журналы — возьмём их
        if (Array.isArray(o.journals)) {
          setJournals(o.journals);
        } else {
          // иначе тянем через отдельный запрос
          try {
            const js = await listJournals({ organization: id });
            setJournals(js?.results ?? js ?? []);
          } catch {
            // если нет такого API — оставляем пусто
          }
        }
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.error ||
          "Не удалось загрузить организацию";
        setErr(String(msg));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-gray-500">Загрузка…</div>;
  }
  if (err) {
    return <div className="p-6 text-red-600">{err}</div>;
  }
  if (!org) {
    return <div className="p-6 text-red-600">Организация не найдена</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{org.title}</h1>
      <p>{org.description}</p>

      <Card className="border-0 shadow-sm">
        <CardContent className="space-y-2 p-4">
          <p>
            <strong>Руководитель:</strong> {org.head_name}
          </p>
          <p>
            <strong>Телефон:</strong> {org.head_phone}
          </p>
          <p>
            <strong>Email:</strong> {org.head_email}
          </p>
          <p>
            <strong>Адрес:</strong> {org.address}
          </p>
          <p>
            <strong>БИН:</strong> {org.bin}
          </p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold">Журналы организации</h2>
      {journals.length === 0 ? (
        <p className="text-gray-500">Пока нет журналов.</p>
      ) : (
        <ul className="list-disc pl-6">
          {journals.map((j) => (
            <li key={j.id}>
              <Link
                to={`/moderator/journals/${j.id}`}
                className="text-blue-600 underline"
              >
                {j.title || j.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Link to={`/moderator/organizations/${id}/edit`}>
          <Button variant="outline">Редактировать</Button>
        </Link>
        <Link to={`/moderator/organizations/${id}/add-journal`}>
          <Button>Добавить журнал</Button>
        </Link>
      </div>
    </div>
  );
}
