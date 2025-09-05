"use client";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/services/authService";

export default function VerifyEmailNotice() {
    const location = useLocation();
    const initial = location.state?.email || new URLSearchParams(location.search).get("email") || "";
    const [email, setEmail] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const onResend = async () => {
        if (!email) return;
        setLoading(true);
        try {
            await resendVerificationEmail(email);
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
            <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center text-xl sm:text-2xl font-bold">
                        Подтвердите e-mail
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Мы отправили письмо на <b>{email || "указанный e-mail"}</b>.
                        Перейдите по ссылке из письма, чтобы активировать аккаунт.
                    </p>
                    <ul className="list-disc pl-5 text-xs text-gray-600">
                        <li>Проверьте папки «Спам», «Промоакции».</li>
                        <li>Не пришло? Отправьте письмо ещё раз.</li>
                    </ul>

                    <div className="space-y-2">
                        <label className="text-sm">E-mail</label>
                        <Input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
                        <Button onClick={onResend} disabled={!email || loading} className="w-full">
                            {loading ? "Отправляем…" : "Отправить письмо ещё раз"}
                        </Button>
                        {sent && <p className="text-green-600 text-sm">Если аккаунт существует и не активирован — письмо отправлено.</p>}
                    </div>

                    <div className="text-center">
                        <Link to="/login" className="text-blue-600 hover:underline text-sm">Вернуться ко входу</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}