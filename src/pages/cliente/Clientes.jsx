import { Contact, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatCnpj, formatCpf } from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";

export default function Clientes() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("");
  const [reload, setReload] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    ClienteService.getAll(filtro)
      .then((data) => {
        if (active) {
          setClientes(Array.isArray(data) ? data : []);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || "Não foi possível carregar os clientes.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [filtro, reload]);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextFilter = busca.trim();
    setLoading(true);
    if (nextFilter === filtro) {
      setReload((value) => value + 1);
    } else {
      setFiltro(nextFilter);
    }
  };

  const handleDelete = async (cliente) => {
    if (!window.confirm(`Excluir o cliente ${cliente.name}?`)) return;

    setDeletingId(cliente.id);
    try {
      await ClienteService.delete(cliente.id);
      toast.success("Cliente excluído com sucesso.");
      setLoading(true);
      setReload((value) => value + 1);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Não foi possível excluir o cliente.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-[#062A45]">
            <Contact className="h-7 w-7 text-[#e31e24]" /> Clientes
          </h1>
          <p className="mt-1 text-sm text-slate-500">Consulte e gerencie os clientes cadastrados.</p>
        </div>
        <Button onClick={() => navigate("/clientes/cadastro")}>
          <Plus className="mr-2 h-4 w-4" /> Novo cliente
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex max-w-xl gap-2">
        <Input
          aria-label="Buscar clientes por nome, CPF ou CNPJ"
          placeholder="Buscar por nome, CPF ou CNPJ"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />
        <Button type="submit" variant="outline">
          <Search className="mr-2 h-4 w-4" /> Buscar
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando clientes...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600" role="alert">{error}</div>
        ) : clientes.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Nenhum cliente encontrado.</div>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Nome</th>
                <th className="px-5 py-4 font-semibold">CPF ou CNPJ</th>
                <th className="px-5 py-4 font-semibold">Cidade / UF</th>
                <th className="px-5 py-4 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="px-5 py-4 font-medium text-[#062A45]">{cliente.name}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {cliente.cpf ? formatCpf(cliente.cpf) : formatCnpj(cliente.cnpj)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {[cliente.city, cliente.state].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                        aria-label={`Editar ${cliente.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingId === cliente.id}
                        onClick={() => handleDelete(cliente)}
                        aria-label={`Excluir ${cliente.name}`}
                      >
                        {deletingId === cliente.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4 text-red-600" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
