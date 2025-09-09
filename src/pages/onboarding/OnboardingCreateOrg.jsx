// src/pages/onboarding/OnboardingCreateOrg.jsx
import OrganizationCreate from "@/pages/moderator/organizations/OrganizationCreate";

export default function OnboardingCreateOrg() {
  // Можно добавить заголовок, шаги, подсказки — но в минимальном варианте просто реюз
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Создание организации</h1>
        <p className="text-sm text-gray-600 mb-6">
          Заполните основные поля сейчас. Реквизиты и детали можно будет
          завершить позже в профиле.
        </p>
        <OrganizationCreate />
      </div>
    </div>
  );
}
