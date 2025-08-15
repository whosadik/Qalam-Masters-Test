import OrganizationForm from "..//components/OrganizationForm";

export default function OrganizationEdit() {
  // Тут можно подгрузить данные по id через useParams()
  const initialData = {
    name: "Университет города Астаны",
    description: "Самый лучший университет столицы",
    head: "Алматов Асхат",
    phone: "+7 777 999 65 65",
    email: "ashat@gmail.com",
    address: "г. Астана, улица Достык, зд. 7",
    bin: "47825201641",
  };

  const handleSubmit = (data) => {
    console.log("Организация обновлена:", data);
    alert("Изменения сохранены!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Редактировать организацию</h1>
      <OrganizationForm onSubmit={handleSubmit} initialData={initialData} />
    </div>
  );
}
