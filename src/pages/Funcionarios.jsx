import { Pencil, Plus, Search, Trash2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

const mockFuncionarios = [
  {
    id: 1,
    nome: "Felipe Júnior",
    telefone: "(44) 9 9999-9999",
    funcao: "Motorista",
    cnh: "1234567890",
    categoriaCnh: "D",
  },
  {
    id: 2,
    nome: "Janaína",
    telefone: "(11) 9 8888-8888",
    funcao: "Administrativo",
    cnh: null,
    categoriaCnh: null,
  },
  {
    id: 3,
    nome: "Maria Eduarda",
    telefone: "(21) 9 7777-7777",
    funcao: "Motorista",
    cnh: "9876543210",
    categoriaCnh: "E",
  },
];

export default function Funcionarios() {
  // const navigate = useNavigate();

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
            />
          </div>
          <Button
            // onClick={() => navigate()}
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
              {mockFuncionarios.map((func) => (
                <tr
                  key={func.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-[#0A1A2F]">
                    {func.nome}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{func.telefone}</td>
                  <td className="px-6 py-4 text-slate-600">{func.funcao}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {func.funcao.toLowerCase() === "motorista" && func.cnh
                      ? func.cnh
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {func.funcao.toLowerCase() === "motorista" &&
                    func.categoriaCnh
                      ? func.categoriaCnh
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Editar"
                        className="p-1.5 text-slate-400 hover:text-[#062A45] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        title="Excluir"
                        className="p-1.5 text-slate-400 hover:text-[#e31e24] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
