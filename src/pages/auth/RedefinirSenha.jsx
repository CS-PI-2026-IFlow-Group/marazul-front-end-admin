import { AlertCircle, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "../../components/AuthLayout";
import AuthPasswordInput from "../../components/AuthPasswordInput";
import AuthSubmitButton from "../../components/AuthSubmitButton";
import { CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import api from "../../config/axiosConfig";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function RedefinirSenha() {
  usePageTitle("Redefinir Senha");
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
      await api.post("/api/auth/redefinir-senha", {
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
          <div className="relative mt-1 rounded-2xl bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="size-10" />
          </div>
        </div>
        <h2 className="-mb-1 font-display text-xl font-bold text-foreground">
          Link Inválido
        </h2>
        <p className="px-4 text-sm leading-relaxed text-muted-foreground">
          Não foi possível identificar o token de segurança. Por favor, solicite
          um novo link de redefinição de senha para continuar
        </p>

        <Link to="/recuperar-senha" className="block w-full">
          <AuthSubmitButton>Solicitar Novo Link</AuthSubmitButton>
        </Link>

        <CardFooter className="justify-center px-8 pt-2">
          <div className="flex w-full justify-center border-t pt-6">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-accent transition-colors hover:underline"
            >
              <ArrowLeft className="mr-2 size-4" /> Voltar para o login
            </Link>
          </div>
        </CardFooter>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <CardHeader className="flex flex-col items-center gap-1.5 px-8 text-center">
        <div className="space-y-2 pt-4">
          <h2 className="-mb-1 font-display text-xl font-bold text-foreground">
            Redefinir sua Senha
          </h2>
          <p className="px-4 text-sm leading-relaxed text-muted-foreground">
            Escolha uma nova senha para acessar sua conta.
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-8">
        <form onSubmit={handleResetPassword} className="space-y-5 text-left">
          <AuthPasswordInput
            id="password"
            label="Nova Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AuthPasswordInput
            id="confirmPassword"
            label="Confirmar Senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            hasError={showMismatchError}
            errorMessage="As senhas não coincidem"
          />

          <div className="space-y-1.5 rounded-xl border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              A senha deve conter:
            </p>

            <div className="mt-1 flex items-center gap-2 text-sm">
              {hasMinLength ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={
                  hasMinLength
                    ? "font-medium text-success"
                    : "text-muted-foreground"
                }
              >
                Mínimo de 8 caracteres
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {hasLetterAndNumber ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" />
              ) : (
                <Circle className="size-4 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={
                  hasLetterAndNumber
                    ? "font-medium text-success"
                    : "text-muted-foreground"
                }
              >
                Combinação de letras e números
              </span>
            </div>
          </div>
          <AuthSubmitButton
            isLoading={isLoading}
            isDisabled={!isFormValid}
            loadingText="Atualizando..."
          >
            Atualizar Senha
          </AuthSubmitButton>
        </form>
      </CardContent>

      <CardFooter className="justify-center px-8 pt-1">
        <div className="flex w-full justify-center border-t pt-5">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:underline"
          >
            <ArrowLeft className="size-4" /> Voltar para o login
          </Link>
        </div>
      </CardFooter>
    </AuthLayout>
  );
}
