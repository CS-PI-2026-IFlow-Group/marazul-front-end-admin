import { Link } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import AuthHeader from "../components/AuthHeader";

export default function RecuperarSenha() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] p-4">
      <Card className="w-full max-w-100 bg-white shadow-sm border-slate-200 py-6 px-2">
        <CardHeader className="flex flex-col items-center space-y-0">
          <AuthHeader />
          <div className="text-center pt-6 space-y-2">
            <p className="text-sm text-slate-500 px-2 leading-relaxed">
              Digite o seu e-mail associado à sua conta para receber um link de
              recuperação para a senha
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider uppercase"
              >
                EMAIL
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@marazul.com.br"
                  className="pl-9 bg-[#F8FAFC] border-slate-200 h-11 text-sm focus-visible:ring-slate-300"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white h-12 font-bold flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              Enviar Link de Recuperação <ArrowRight className="h-4 w-4 " />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-2">
          <div className="w-full border-t border-slate-100 pt-6 flex justify-center">
            <Link
              to="/login"
              className="flex items-center text-sm text-[#e31e24] hover:text-[#c1191f] hover:underline font-medium gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para o login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
