import { useSearchParams, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyResult() {
    const [params] = useSearchParams();
    const ok = params.get("success") === "1";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
            <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center text-xl sm:text-2xl font-bold">
                        {ok ? "E-mail подтверждён" : "Ссылка недействительна"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    {ok ? (
                        <>
                            <p>Ваш аккаунт активирован. Теперь вы можете войти.</p>
                            <Link to="/login"><Button>Войти</Button></Link>
                        </>
                    ) : (
                        <>
                            <p>Ссылка устарела или некорректна. Отправьте письмо заново.</p>
                            <Link to="/login/verify-email"><Button>Отправить письмо</Button></Link>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}