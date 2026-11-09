import { AlertCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { usePageTitle } from "../hooks/usePageTitle";
import { isAuthenticated } from "../lib/auth";

export default function NotFound() {
  usePageTitle("Página Não Encontrada");
  const isAuth = isAuthenticated();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9FAFB] p-4 font-sans">
      <Card className="w-full max-w-md border-slate-200 bg-white p-6 text-center shadow-sm">
        <CardHeader className="space-y-3 pb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#e31e24]">
            <AlertCircle className="h-9 w-9" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-[#062A45]">
            404
          </CardTitle>
          <CardDescription className="text-base font-medium text-slate-600">
            Página não encontrada
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <p className="text-sm text-slate-500">
            O endereço acessado não existe, foi movido ou está temporariamente indisponível.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pt-0">
          <Button
            asChild
            className="h-10 rounded-lg bg-[#062A45] px-6 font-semibold text-white shadow-sm transition-all hover:bg-[#0a1f35]"
          >
            <Link to={isAuth ? "/dashboard" : "/login"} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>{isAuth ? "Voltar ao Dashboard" : "Ir para o Login"}</span>
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

