import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function OrganizationList() {
  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      name: "Университет города Астаны",
      head: "Алматов Асхат",
      journals: 3,
    },
    {
      id: 2,
      name: "Казахская академия наук",
      head: "Серикова Айжан",
      journals: 5,
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Удалить организацию?")) {
      setOrganizations(organizations.filter((org) => org.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Организации</h1>
        <Link to="/moderator/organizations/new">
          <Button>Добавить организацию</Button>
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Название</th>
            <th className="p-2 border">Руководитель</th>
            <th className="p-2 border">Журналов</th>
            <th className="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org.id}>
              <td className="p-2 border">{org.name}</td>
              <td className="p-2 border">{org.head}</td>
              <td className="p-2 border">{org.journals}</td>
              <td className="p-2 border space-x-2">
                <Link to={`/moderator/organizations/${org.id}`}>
                  <Button size="sm" variant="outline">
                    Просмотр
                  </Button>
                </Link>
                <Link to={`/moderator/organizations/${org.id}/edit`}>
                  <Button size="sm" variant="outline">
                    Редактировать
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(org.id)}
                >
                  Удалить
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
