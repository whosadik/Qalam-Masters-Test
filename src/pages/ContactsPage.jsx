import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  Send,
  FileQuestion,
  HelpCircle,
  Globe2,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export default function ContactsPage() {
  const { t } = useTranslation(["info_pages"]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6FAFF] via-[#EFF4FF] to-white text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient( circle at 30% 30%, #3972FE 0%, #A3C6FF 40%, transparent 70% )",
          }}
        />

        <div className="container mx-auto px-4 pt-16 pb-8 lg:pt-24 lg:pb-14">
          <div className="max-w-3xl">
            <Badge className="mb-3 bg-[#3972FE]/10 text-[#3972FE] hover:bg-[#3972FE]/10 border border-[#3972FE]/30">
              {t("info_pages:contacts.badge", "Свяжитесь с нами")}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              {t("info_pages:contacts.title", "Контакты и поддержка")}
            </h1>
            <p className="mt-4 text-slate-600 text-lg">
              {t(
                  "info_pages:contacts.subtitle",
                  "Мы рядом, чтобы помочь: вопросы по публикации, интеграциям, договорам и технической поддержке."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* КОНТАКТЫ — БЕЗ КАРТОЧЕК */}
      <section className="container mx-auto px-4 py-10 lg:py-14">
        {/* Плашки с основными контактами */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Mail className="size-5 text-[#3972FE]" /> Email
            </div>
            <a
              className="mt-2 inline-block text-[#3972FE] hover:underline"
              href="mailto:info@truemasters.kz"
            >
              truemasters@inbox.ru
            </a>
            <p className="mt-1 text-sm text-slate-600">
              {t(
                  "info_pages:contacts.email.note",
                  "Для авторов и редакций"
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Phone className="size-5 text-[#3972FE]" /> {t("info_pages:contacts.phone.label", "Телефон")}
            </div>
            <a
              className="mt-2 inline-block text-[#3972FE] hover:underline"
              href="tel:+77712827801"
            >
              +7 771 282 78 01
            </a>
            <p className="mt-1 text-sm text-slate-600">{t("info_pages:contacts.phone.hours", "Пн–Пт, 9:00–18:00")}</p>
          </div>

          {/* <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="size-5 text-[#3972FE]" /> {t("info_pages:contacts.office.label", "Офис")}
            </div>
            <p className="mt-2 text-slate-700">
              {t("info_pages:contacts.office.address", "г. Астана, пр-т Мангилик Ел, 1")}
            </p>
          </div> */}
        </div>
      </section>

      {/* КАРТА */}
      {/*  <section className="container mx-auto px-4 py-10 lg:py-14">
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <div className="aspect-[16/9] w-full grid place-items-center text-slate-500">
            <div className="text-center px-6">
              <MapPin className="mx-auto mb-3" />
              <p className="font-medium">Здесь будет карта</p>
              <p className="text-sm">
                Встроим Google Maps / 2GIS embed, когда будет готов iframe
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* НИЖНИЙ CTA */}
      <section className="bg-white/60 border-t border-slate-100">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                {t(
                    "info_pages:contacts.cta.title",
                    "Есть вопрос по подаче или подключению журнала?"
                )}
              </h2>
              <p className="mt-2 text-slate-600">
                {t(
                    "info_pages:contacts.cta.subtitle",
                    "Напишите нам — поможем настроить процесс и ускорить публикации."
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Button
                asChild
                className="h-11 px-6 bg-[#3972FE] hover:bg-[#2f63e3]"
              >
                <a
                  href="https://wa.me/77712827801"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="size-4" /> {t("info_pages:contacts.cta.button_label", "Связаться с отделом")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
