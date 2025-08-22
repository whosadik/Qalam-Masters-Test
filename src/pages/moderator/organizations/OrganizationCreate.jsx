import OrganizationForm from "../components/OrganizationForm";
import { useNavigate } from "react-router-dom";

const KEY_ORG = "myOrg";

export default function OrganizationCreate() {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    const org = {
      id: 1, // у модератора ровно одна организация
      updatedAt: new Date().toLocaleDateString("ru-RU"),
      ...data,
    };
    localStorage.setItem(KEY_ORG, JSON.stringify(org));
    alert("Организация создана!");
    navigate("/moderator"); // вернуться в дашборд
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Добавить организацию</h1>
      <OrganizationForm onSubmit={handleSubmit} />
    </div>
  );
}
