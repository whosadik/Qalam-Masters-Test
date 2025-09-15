import { Link } from "react-router-dom";
import {useTranslation} from "react-i18next";


export default function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <footer id="contact" className="bg-[#0B1220] text-white">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">Qalam Masters</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-prose">
                {t(
                    "footer:tagline",
                    "Автоматизированная платформа для публикации научных статей и журналов."
                )}
              </p>
            </div>

            <nav className="space-y-3">
              <h3 className="font-medium">{t("footer:platform.title", "Платформа")}</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link
                    to="/journals"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    {t("footer:platform.journals_catalog", "Каталог журналов")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    {t(
                        "footer:platform.privacy_policy",
                        "Политика конфиденциальности"
                    )}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="space-y-3">
              <h3 className="font-medium">{t("footer:authors.title", "Авторам")}</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link
                    to="/author-info"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    {t("footer:authors.for_authors", "Для авторов")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/submit-article"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    {t("footer:authors.submit_article", "Подача статьи")}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="space-y-3">
              <h3 className="font-medium">{t("footer:orgs.title", "Организациям")}</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link
                    to="/organizations/new"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    {t("footer:orgs.create_org", "Создать организацию")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="{`/moderator/organizations/${org.id}/add-journal`}"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    {t("footer:orgs.create_journal", "Создать журнал")}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacts"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    {t("footer:orgs.contact_us", "Связаться с нами")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-gray-400 text-xs sm:text-sm">
            <p>
              &copy; {new Date().getFullYear()} Qalam Masters.{" "}
              {t("footer:copyright", "Все права защищены.")}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
