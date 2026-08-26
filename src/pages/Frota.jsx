import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Frota() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Frota</h1>
          <p className="text-slate-600">Gerenciamento da frota de veículos.</p>
        </div>
        <Button
          onClick={() => navigate("/frota/cadastro")}
          className="gap-2 bg-[#062A45] hover:bg-[#0f172a] text-white font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Cadastrar Veículo
        </Button>
      </div>
    </div>
  );
}
