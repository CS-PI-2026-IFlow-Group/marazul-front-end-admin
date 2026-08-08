import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export default function Funcionarios() {
  const navigate = useNavigate();

  const proxPagina = () => {
    navigate("/cadastroFuncionario");
  };

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-[#062A45]">Funcionários</h1>
      <p className="text-slate-600">Gerenciamento dos funcionários.</p>
      <Button
        className="bg-[#062A45] hover:bg-[#0f172a] text-white h-12 font-bold flex items-center justify-center gap-2 mt-2 cursor-pointer"
        onClick={proxPagina}
      >
        <Plus className="mr-2 h-4 w-4" /> Novo Cadastro
      </Button>
    </div>
  );
}
