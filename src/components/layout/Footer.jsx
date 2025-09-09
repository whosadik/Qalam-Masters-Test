import { Link } from "react-router-dom";

export default function Footer() {
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
                Автоматизированная платформа для публикации научных статей и
                журналов.
              </p>
            </div>

            <nav className="space-y-3">
              <h3 className="font-medium">Платформа</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link
                    to="/journals"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    Каталог журналов
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="space-y-3">
              <h3 className="font-medium">Авторам</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link
                    to="/author-info"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    Для авторов
                  </Link>
                </li>
                <li>
                  <Link
                    to="/submit-article"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    Подача статьи
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="space-y-3">
              <h3 className="font-medium">Организациям</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link
                    to="/organizations/new"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    Создать организацию
                  </Link>
                </li>
                <li>
                  <Link
                    to="{`/moderator/organizations/${org.id}/add-journal`}"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    Создать журнал
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contacts"
                    className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3972FE] rounded"
                  >
                    Связаться с нами
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-gray-400 text-xs sm:text-sm">
            <p>
              &copy; {new Date().getFullYear()} Qalam Masters. Все права
              защищены.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
