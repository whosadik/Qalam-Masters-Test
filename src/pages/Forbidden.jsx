export default function Forbidden() {
  return (
    <div className="p-10 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-2">Нет доступа (403)</h1>
      <p className="text-gray-600">
        У вас нет прав для просмотра этой страницы.
      </p>
    </div>
  );
}
