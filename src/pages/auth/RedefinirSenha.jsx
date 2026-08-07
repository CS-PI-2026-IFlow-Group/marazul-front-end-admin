import axios from "axios";
import { AlertCircle, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "../../components/AuthLayout";
import PasswordInput from "../../components/PasswordInput";
import SubmitButton from "../../components/SubmitButton";
import { CardContent, CardFooter, CardHeader } from "../../components/ui/card";

export default function RedefinirSenha() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <div className="bg-[#ffefef] p-4 rounded-xl relative mt-1">
            <AlertCircle className="h-10 w-10 text-[#e31e24]" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#062A45] -mb-1">
          Link Inválido
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed px-4">
          Não foi possível identificar o token de segurança. Por favor, solicite
          um novo link de redefinição de senha para continuar
        </p>

        <Link to="/recuperar-senha" className="block w-full">
          <SubmitButton>Solicitar Novo Link</SubmitButton>
        </Link>

        <CardFooter className="flex justify-center pt-2">
          <div className="w-full border-t border-slate-100 pt-6 flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-[#e31e24] hover:text-[#c1191f] hover:underline font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para o login
            </Link>
          </div>
        </CardFooter>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <CardHeader className="flex flex-col items-center space-y-0 text-center">
        <div className="pt-6 space-y-2">
          <h2 className="text-xl font-bold text-[#062A45] -mb-1">
            Redefinir sua Senha
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed px-4">
            Escolha uma nova senha para acessar sua conta.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-6 text-left">
          <PasswordInput
            id="password"
            label="Nova Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            hasError={showMismatchError}
            errorMessage="As senhas não coincidem"
          />

          <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-4 space-y-0">
            <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              A senha deve conter:
            </p>

            <div className="flex items-center gap-1 text-sm mt-1">
              {hasMinLength ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300 shrink-0" />
              )}
              <span
                className={
                  hasMinLength ? "text-green-700 font-medium" : "text-slate-600"
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
          <SubmitButton
            isLoading={isLoading}
            isDisabled={!isFormValid}
            loadingText="Atualizando..."
          >
            Atualizar Senha
          </SubmitButton>
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
    </AuthLayout>
  );
}
