import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

export default function Passageiros() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Passageiros</h1>
        </div>
        <Button
          onClick={() => navigate("/passageiros/cadastro")}
          className="gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg h-11 px-6 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> Novo Passageiro
        </Button>
      </div>
    </div>
  );
}
