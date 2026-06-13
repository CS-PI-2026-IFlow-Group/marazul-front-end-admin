import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Lock,
  EyeOff,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function RedefinirSenha() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const hasMinLength = password.length >= 8;
  const hasLetterAndNumber = /[A-Za-z]/.test(password) && /\d/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const isFormValid = hasMinLength && hasLetterAndNumber && passwordsMatch;
  const showMismatchError =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    try {
      await axios.post("api/auth/redefinir-senha", {
        token: token,
        novaSenha: password,
      });

      toast.success("Senha redefinida com sucesso!");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.error("Erro ao redefinir a senha", {
        description:
          error.response?.data?.message ||
          "O token pode ter expirado. Solicite um novo link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <form onSubmit={handleResetPassword} className="space-y-5">
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${showMismatchError ? "text-red-400" : "text-slate-400"}`}
                />
                <Input
                  id="confirmPassword"
                  placeholder="••••••••"
                  className={`pl-9 pr-10 bg-[#F8FAFC] h-11 text-sm transition-colors ${
                    showMismatchError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-slate-200 focus-visible:ring-slate-300"
                  }`}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {showMismatchError && (
                <p className="text-xs font-medium text-red-500 mt-1">
                  As senhas não coincidem.
                </p>
              )}
            </div>
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-4 space-y-0">
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                A senha deve conter:
              </p>

              <div className="flex items-center gap-1 text-sm">
                {hasMinLength ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                <span
                  className={
                    hasMinLength
                      ? "text-green-700 font-medium"
                      : "text-slate-600"
                  }
                >
                  Mínimo de 8 caracteres
                </span>
              </div>

              <div className="flex items-center gap-1 text-sm">
                {hasLetterAndNumber ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                <span
                  className={
                    hasLetterAndNumber
                      ? "text-green-700 font-medium"
                      : "text-slate-600"
                  }
                >
                  Combinação de letras e números
                </span>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white h-12 font-bold flex items-center justify-center gap-2 mt-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  Atualizando... <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "ATUALIZAR SENHA"
              )}
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
