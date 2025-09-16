import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// Учитываем GitHub Pages под-путь: import.meta.env.BASE_URL есть у Vite
const base = (import.meta && import.meta.env && import.meta.env.BASE_URL) || "/";

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "ru",
        supportedLngs: ["kk", "ru", "en"],
        ns: ["navbar", "footer", "home", "auth", "common", "info_pages", "news", "onboarding", "journal_public", "journal_issues", "articles", "submission", "review", "dashboards", "moderator_orgs", "moderator_journals"],
        defaultNS: "common",
        returnEmptyString: false,
        backend: {
            // файлы перевода будем складывать в public/locales
            loadPath: `${base}locales/{{lng}}/{{ns}}.json`,
        },
        detection: {
            order: ["querystring", "localStorage", "navigator"],
            lookupQuerystring: "lang",
            caches: ["localStorage"],
        },
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: true,
        },
    });

export default i18n;
