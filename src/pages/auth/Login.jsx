import { LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthHeader from "../../components/AuthHeader";
import AuthInput from "../../components/AuthInput";
import AuthLayout from "../../components/AuthLayout";
import AuthPasswordInput from "../../components/AuthPasswordInput";
import AuthSubmitButton from "../../components/AuthSubmitButton";
import { CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import api from "../../config/axiosConfig";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function Login() {
  usePageTitle("Login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: email,
        senha: password,
      });

      localStorage.setItem("token", response.data.token);
      toast.success("Login realizado com sucesso!");

      setTimeout(() => {
        navigate("/");
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
    <AuthLayout>
      <CardHeader className="flex flex-col items-center gap-1.5 px-8">
        <AuthHeader />
      </CardHeader>

      <CardContent className="px-8">
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <AuthInput
            id="email"
            label="E-mail"
            type="email"
            icon={Mail}
            placeholder="nome@marazul.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthPasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="keep-connected" />
            <Label
              htmlFor="keep-connected"
              className="cursor-pointer leading-none font-normal text-muted-foreground"
            >
              Manter conectado
            </Label>
          </div>
          <AuthSubmitButton
            isLoading={isLoading}
            isDisabled={!isFormValid}
            loadingText="Entrando..."
            icon={LogIn}
          >
            Entrar
          </AuthSubmitButton>
        </form>
      </CardContent>

      <CardFooter className="justify-center px-8">
        <div className="flex w-full justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Esqueceu a senha?{" "}
            <Link
              to="/recuperar-senha"
              className="font-medium text-accent hover:underline"
            >
              Clique Aqui
            </Link>
          </p>
        </div>
      </CardFooter>
    </AuthLayout>
  );
}
