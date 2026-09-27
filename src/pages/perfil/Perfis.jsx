import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

export default function Perfis() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#062A45]">Perfis de Acesso</h1>
        <Button
          onClick={() => navigate("/perfis/cadastro")}
          className="h-11 gap-2 rounded-lg bg-[#062A45] px-6 font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0a1f35] hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> Novo Perfil
        </Button>
      </div>
    </div>
  );
}
