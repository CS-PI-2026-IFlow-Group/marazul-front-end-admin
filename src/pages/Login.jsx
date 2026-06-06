import { Eye, Lock, LogIn, Mail, EyeOff, Loader2 } from "lucide-react";
import logoMarazul from "../assets/logoMarazul.png";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import { useState } from "react";

import axios from "axios";

import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/auth/login", {
        email: email,
        password: password,
      });

      localStorage.setItem("token", response.data.token);
      toast.success("Login realizado com sucesso!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Falha na autenticação", {
          description: "E-mail ou senha incorretos",
        });
      } else {
        toast.error("Erro ao fazer login", {
          description:
            "Ocorreu um problema ao tentar conectar. Tente novamente",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] p-4">
      <Card className="w-full max-w-100 bg-white shadow-sm border-slate-200 py-6 px-2">
        <CardHeader className="flex flex-col items-center space-y-0">
          <div className="flex flex-col items-center transform">
            <img
              src={logoMarazul}
              alt="Logo da Marazul com um fundo azul escuro, um M em maiúsculo em vermelho e umas ondas logo abaixo"
              className="h-32 object-contain"
            />
          </div>
          <div className="text-center space-y-1 -mt-4">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-9 pr-10 bg-[#F8FAFC] border-slate-200 h-11 text-sm focus-visible:ring-slate-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox
              id="keep-connected"
              className="border-slate-300 data-[state=checked]:bg-[#062A45] cursor-pointer"
            />
            <Label
              htmlFor="keep-connected"
              className="text-sm text-slate-600 font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Manter conectado
            </Label>
          </div>
          <Button
            onClick={handleLogin}
            disabled={!isFormValid || isLoading}
            className="w-full bg-[#062A45] hover:bg-[#004494] text-white h-12 font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                Entrando... <Loader2 className="h-2 w-2 animate-spin" />
              </>
            ) : (
              <>
                Entrar <LogIn className="h-4 w-4 font-bold" />
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="w-full border-t border-slate-100 pt-2 flex justify-center">
            <p className="text-sm text-slate-600">
              Esqueceu a senha?{" "}
              <a
                href="#"
                className="text-[#e31e24] hover:underline font-medium"
              >
                Clique Aqui
              </a>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
