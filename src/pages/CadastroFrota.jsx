import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

export default function CadastroFrota() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#062A45]">
          Cadastro de Novo Veículo
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("/frota")}
          className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#062A45] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>

      {/* Formulário será implementado na Etapa 2 */}
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">Formulário em construção...</p>
      </div>
    </div>
  );
}
