import { ArrowLeft, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardFooter } from "../../components/ui/card";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function CadastroViagem({ isEdicao = false }) {
  usePageTitle(isEdicao ? "Edição de Viagem" : "Agendamento de Viagem");
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-slate-700">
          {isEdicao ? "Editar Viagem" : "Agendar Viagem"}
        </h1>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden py-1 gap-0">
        <div className="flex border-b border-slate-100 px-6 py-3 items-center gap-3">
          <Map className="h-4 w-4 text-[#e31e24]" />
          <h2 className="text-sm font-medium text-[#062A45]">
            Dados da Viagem
          </h2>
        </div>

        <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-6 md:flex-row md:justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/viagens")}
            className="h-11 w-full gap-2 rounded-md border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 cursor-pointer md:w-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
