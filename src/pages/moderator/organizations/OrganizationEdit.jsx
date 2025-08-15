import OrganizationForm from "../components/OrganizationForm";
import { useNavigate } from "react-router-dom";

const KEY_ORG = "myOrg";

export default function OrganizationEdit() {
  const navigate = useNavigate();
  // Тут можно подгрузить данные по id через useParams()

  const initialData = JSON.parse(localStorage.getItem(KEY_ORG) || "null") || {
    name: "Университет города Астаны",
    description: "Самый лучший университет столицы",
    head: "Алматов Асхат",
    phone: "7 777 999 65 65",
    email: "ashat@gmail.com",
    address: "г. Астана, улица Достык, зд. 7",
    bin: "47825201641",
  };

  const handleSubmit = (data) => {
    const org = {
      id: 1,
      updatedAt: new Date().toLocaleDateString("ru-RU"),
      ...data,
    };
    localStorage.setItem(KEY_ORG, JSON.stringify(org));
    alert("Изменения сохранены!");
    navigate("/moderator");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Редактировать организацию</h1>
      <OrganizationForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
