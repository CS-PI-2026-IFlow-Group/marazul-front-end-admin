import axios from "axios";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthHeader from "../../components/AuthHeader";
import AuthLayout from "../../components/AuthLayout";
import GenericInput from "../../components/Input";
import PasswordInput from "../../components/PasswordInput";
import SubmitButton from "../../components/SubmitButton";
import { CardContent, CardFooter, CardHeader } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("api/auth/login", {
        email: email,
        senha: password,
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
    <AuthLayout>
      <CardHeader className="flex flex-col items-center space-y-0">
        <AuthHeader />
      </CardHeader>

      <CardContent>
        <form onSubmit={handleLogin} className="space-y-6">
          <GenericInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
          <SubmitButton
            isLoading={isLoading}
            isDisabled={!isFormValid}
            loadingText="Entrando..."
            icon={LogIn}
          >
            Entrar
          </SubmitButton>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="w-full border-t border-slate-100 pt-2 flex justify-center">
          <p className="text-sm text-slate-600">
            Esqueceu a senha?{" "}
            <Link
              to="/recuperar-senha"
              className="text-[#e31e24] hover:underline font-medium"
            >
              Clique Aqui
            </Link>
          </p>
        </div>
      </CardFooter>
    </AuthLayout>
  );
}
