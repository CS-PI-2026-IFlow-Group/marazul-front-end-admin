import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import FuncionarioService from "../../services/FuncionarioService";

export default function Funcionarios() {
  const navigate = useNavigate();

  const [funcionarios, setFuncionarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFuncionarios = async () => {
    try {
      const response = await FuncionarioService.getAll();
      setFuncionarios(response);
    } catch (error) {
      toast.error("Erro ao carregar funcionários", {
        id: "erro-fetch-funcionarios",
        description:
          error.response?.data?.message ||
          "Não foi possível carregar os colaboradores. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      await fetchFuncionarios();
    };

    carregarDados();
  }, []);

  const funcionariosFiltrados = funcionarios.filter((func) =>
    (func.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleInativar = async (id, nome) => {
    if (
      window.confirm(`Tem certeza que deseja inativar o colaborador ${nome}?`)
    ) {
      try {
        await FuncionarioService.inativar(id);
        toast.success("Colaborador inativado com sucesso!");
        setIsLoading(true);
        await fetchFuncionarios();
      } catch (error) {
        toast.error("Erro ao inativar", {
          id: "erro-inativar",
          description:
            error.response?.data?.message ||
            "Ocorreu um problema ao tentar inativar o colaborador.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#062A45] pb-1 border-b-[3.5px] border-[#e31e24] inline-block">
            Gestão de Colaboradores
          </h1>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-b border-slate-100">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome..."
              className="w-full h-11 pl-9 pr-4 bg-[#F8FAFC] border border-slate-200 rounded-md text-sm outline-none transition-colors focus:border-slate-300 focus:ring-1 focus:ring-slate-300 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => navigate("/funcionario/cadastro")}
            className="w-full sm:w-auto bg-[#0A1A2F] text-white hover:bg-[#0A1A2F]/90 h-11 px-6 text-sm font-medium rounded-md normal-case tracking-normal cursor-pointer"
          >
            <Plus className="mr-2 size-4" />
            Novo Funcionário
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="bg-slate-50/50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Função</th>
                <th className="px-6 py-4">CNH</th>
                <th className="px-6 py-4">Tipo de CNH</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="size-6 animate-spin text-[#062A45]" />
                      <p>Carregando colaboradores...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && funcionariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {searchTerm !== ""
                      ? "Nenhum colaborador encontrado com essa busca."
                      : "Nenhum funcionário cadastrado ainda."}
                  </td>
                </tr>
              )}
              {!isLoading &&
                funcionariosFiltrados.map((func) => {
                  const isMotorista =
                    func.position === "DRIVER" ||
                    (func.position || "").toLowerCase() === "motorista";

                  return (
                    <tr
                      key={func.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-[#0A1A2F]">
                        {func.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {func.cellphoneNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {func.position}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {isMotorista && func.cnhNumber ? func.cnhNumber : "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {isMotorista && func.cnhType ? func.cnhType : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/funcionario/editar/${func.id}`)
                            }
                            title="Editar"
                            className="p-1.5 text-slate-400 hover:text-[#062A45] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => handleInativar(func.id, func.name)}
                            title="Inativar"
                            className="p-1.5 text-slate-400 hover:text-[#e31e24] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
