import axios from "axios";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import AuthHeader from "../../components/AuthHeader";
import AuthLayout from "../../components/AuthLayout";
import EmailInput from "../../components/EmailInput";
import SubmitButton from "../../components/SubmitButton";
import { CardContent, CardFooter, CardHeader } from "../../components/ui/card";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post("api/auth/recuperar-senha", { email });
      toast.info("Processando sua solicitação...");

      setIsSubmitted(true);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        toast.error("Erro no servidor", {
          description:
            "Ocorreu um problema tentar enviar o e-mail. Tente mais tarde.",
        });
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <div className="bg-[#ffefef] p-4 rounded-xl relative mt-1">
            <MailCheck className="h-10 w-10 text-[#e31e24]" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#062A45] -mb-1">
          E-mail enviado!
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed px-4">
          Enviamos um link de recuperação para o endereço de e-mail informado.
          Por favor, verifique sua caixa de entrada ou spam para continuar.
        </p>

        <Link to="/login" className="block w-full">
          <SubmitButton>
            <ArrowLeft className="h-4 w-4" /> Voltar ao Login
          </SubmitButton>
        </Link>

        <CardFooter className="flex justify-center pt-2">
          <div className="w-full border-t border-slate-100 pt-6 flex justify-center">
            <p className="text-sm text-slate-500">
              Não recebeu o e-mail?{" "}
              <button
                onClick={handleRecoverPassword}
                disabled={isLoading}
                className="text-[#e31e24] hover:text-[#c1191f] hover:underline cursor-pointer"
              >
                Reenviar e-mail
              </button>
            </p>
          </div>
        </CardFooter>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
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
        <form onSubmit={handleRecoverPassword} className="space-y-6">
          <div className="space-y-2">
            <EmailInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <SubmitButton
            isLoading={isLoading}
            isDisabled={!isEmailValid}
            loadingText="Enviando..."
            icon={ArrowRight}
          >
            Enviar Link de Recuperação
          </SubmitButton>
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
    </AuthLayout>
  );
}
