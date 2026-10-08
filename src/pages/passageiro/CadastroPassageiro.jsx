import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

export default function CadastroPassageiro({ isEdicao = false }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-slate-700">
          {isEdicao ? "Edição" : "Cadastro"} do Passageiro
        </h1>
      </div>
      <Button
        variant="outline"
        onClick={() => navigate("/passageiros")}
        className="h-9 gap-2 rounded-md border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>
    </div>
  );
}
