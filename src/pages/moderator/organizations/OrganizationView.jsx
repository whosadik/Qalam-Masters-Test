import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function OrganizationView() {
  const { id } = useParams();

  // Имитация данных
  const organization = {
    id,
    name: "Университет города Астаны",
    description: "Самый лучший университет столицы",
    head: "Алматов Асхат",
    phone: "+7 777 999 65 65",
    email: "ashat@gmail.com",
    address: "г. Астана, улица Достык, зд. 7",
    bin: "47825201641",
    journals: [{ id: 1, name: "Вестник науки" }],
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{organization.name}</h1>
      <p>{organization.description}</p>

      <div className="border p-4 rounded space-y-1">
        <p>
          <strong>Руководитель:</strong> {organization.head}
        </p>
        <p>
          <strong>Телефон:</strong> {organization.phone}
        </p>
        <p>
          <strong>Email:</strong> {organization.email}
        </p>
        <p>
          <strong>Адрес:</strong> {organization.address}
        </p>
        <p>
          <strong>БИН:</strong> {organization.bin}
        </p>
      </div>

      <h2 className="text-xl font-semibold">Журналы организации</h2>
      <ul className="list-disc pl-6">
        {organization.journals.map((j) => (
          <li key={j.id}>
            <Link
              to={`/moderator/journals/${j.id}`}
              className="text-blue-600 underline"
            >
              {j.name}
            </Link>
          </li>
        ))}
      </ul>

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
