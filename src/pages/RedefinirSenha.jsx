import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Lock, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function RedefinirSenha() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] p-4">
      <Card className="w-full max-w-100 bg-white shadow-md border-slate-200 py-6 px-2">
        <CardHeader className="flex flex-col items-center space-y-0 text-center">
          <div className="pt-6 space-y-2">
            <h2 className="text-xl font-bold text-[#062A45]">
              Redefinir sua Senha
            </h2>
            <p className="text-sm text-slate-500 px-4 leading-relaxed">
              Escolha uma nova senha para acessar sua conta.
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider uppercase"
              >
                Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-[#F8FAFC] border-slate-200 h-11 text-sm focus-visible:ring-slate-300"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider uppercase"
              >
                Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-[#F8FAFC] border-slate-200 h-11 text-sm focus-visible:ring-slate-300"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
                  <EyeOff className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-4 space-y-2.5">
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                A senha deve conter:
              </p>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">Mínimo de 8 caracteres</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600">
                  Combinação de letras e números
                </span>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white h-12 font-bold flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              ATUALIZAR SENHA
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-1">
          <div className="w-full border-t border-slate-100 pt-5 flex justify-center">
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
