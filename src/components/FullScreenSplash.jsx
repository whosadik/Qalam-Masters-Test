export default function FullScreenSplash() {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="flex items-center gap-3 text-gray-600">
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" />
        </svg>
        <span>Загрузка…</span>
      </div>
    </div>
  );
}
