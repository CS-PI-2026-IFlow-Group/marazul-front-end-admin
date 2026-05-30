import { Mail, Eye, Lock, LogIn } from "lucide-react";
import logoMarazul from "../assets/logoMarazul.png";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <Card className="w-full max-w-md bg-white shadow-sm border-slate-200 py-6 px-2">
        <CardHeader className="flex flex-col items-center space-y-6 pb-8">
          <div className="flex flec-col items-center gap-1.5 transform -rotate-6">
            <div>
              <img
                src={logoMarazul}
                alt="Logo da Marazul com um fundo azul escuro, um M em maiúsculo em vermelho e umas ondas logo abaixo"
              />
            </div>
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-[#062A45] tracking-tight">
              Marazul
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 font-medium">
              Painel Administrativo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-[11px] font-bold text-[#e31e24] tracking-wider"
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
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-[11px] font-bold text-[#e31e24] tracking-wider"
            >
              SENHA
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-9 pr-10 bg-[#F8FAFC] border-slate-200 h-11 text-sm focus-visible:ring-slate-300"
              />
              <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="keep-connected"
              className="border-slate-300 data-[state=checked]:bg-[#062A45]"
            />
            <Label
              htmlFor="keep-connected"
              className="text-sm text-slate-600 font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Manter conectado
            </Label>
          </div>
          <Button className="w-full bg-[#062A45] hover:bg-[#004494] text-white h-12 font-bolder flex items-center justify-center gap-2 mt-2">
            Entrar <LogIn className="h-4 w-4 font-bolder" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
