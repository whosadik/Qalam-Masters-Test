import OrganizationForm from "../components/OrganizationForm";

export default function OrganizationCreate() {
  const handleSubmit = (data) => {
    console.log("Создана организация:", data);
    alert("Организация создана!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Добавить организацию</h1>
      <OrganizationForm onSubmit={handleSubmit} />
    </div>
  );
}
