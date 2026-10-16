import {
  AlertCircle,
  Contact,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Pagination from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatCnpj, formatCpf, onlyDigits } from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";

const PERSON_TYPE_LABELS = {
  PF: "Pessoa Física",
  PJ: "Pessoa Jurídica",
};

const ITEMS_PER_PAGE = 8;

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function getPersonType(client) {
  return onlyDigits(client.cnpj) ? "PJ" : "PF";
}

function formatDocument(client) {
  if (onlyDigits(client.cnpj)) return formatCnpj(client.cnpj);
  if (onlyDigits(client.cpf)) return formatCpf(client.cpf);
  return "—";
}

function formatLocation(client) {
  if (client.city && client.state) return `${client.city}/${client.state}`;
  return client.city || client.state || "—";
}

function ConfirmModal({ client, isLoading, onConfirm, onCancel }) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onCancel}
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl mx-4 border border-slate-100">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#062A45]">
              Excluir Cliente
            </h3>
            <p className="mt-3 text-base text-slate-600">
              Deseja realmente excluir o cliente{" "}
              <span className="font-semibold text-[#062A45]">
                {client.name}
              </span>{" "}
              com documento{" "}
              <span className="font-semibold text-[#062A45]">
                {formatDocument(client)}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Esta ação não poderá ser desfeita e o endereço vinculado ao
              cliente também será excluído.
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg h-12 text-sm cursor-pointer font-semibold"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-lg h-12 bg-red-600 text-sm text-white hover:bg-red-700 cursor-pointer font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar Exclusão"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Clientes() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [confirmClient, setConfirmClient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    ClienteService.getAll()
      .then((data) => {
        if (active) setClients(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setError("Não foi possível carregar a lista de clientes.");
        setClients([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const fetchClients = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  };

  const filteredClients = useMemo(() => {
    const term = normalizeText(searchTerm);
    const termDigits = onlyDigits(searchTerm);

    if (!term) return clients;

    return clients.filter((client) => {
      const matchesName = normalizeText(client.name).includes(term);
      const documentDigits = onlyDigits(client.cpf) + onlyDigits(client.cnpj);
      const matchesDocument =
        termDigits.length > 0 && documentDigits.includes(termDigits);

      return matchesName || matchesDocument;
    });
  }, [clients, searchTerm]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE) || 1;
  const displayedPage = Math.min(currentPage, totalPages);

  const paginatedClients = useMemo(() => {
    const startIndex = (displayedPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, displayedPage]);

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!confirmClient || isDeleting) return;
    setIsDeleting(true);

    try {
      await ClienteService.delete(confirmClient.id);
      setClients((prev) => prev.filter((c) => c.id !== confirmClient.id));
      const remainingPages = Math.max(
        1,
        Math.ceil((filteredClients.length - 1) / ITEMS_PER_PAGE),
      );
      setCurrentPage((page) => Math.min(page, remainingPages));
      toast.success("Cliente excluído com sucesso!");
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;

      if (status === 404) {
        toast.warning("Cliente não encontrado", {
          description: "O cliente já foi removido. A listagem foi atualizada.",
        });
        fetchClients();
      } else if (status === 400 || status === 409) {
        toast.error("Não foi possível excluir o cliente", {
          description:
            data?.message ||
            data?.erro ||
            "A exclusão foi bloqueada por uma regra do sistema.",
        });
      } else {
        toast.error("Erro ao excluir cliente", {
          description: "Ocorreu um problema. Tente novamente.",
        });
      }
    } finally {
      setIsDeleting(false);
      setConfirmClient(null);
    }
  };

  const columns = ["Nome", "Documento", "Tipo", "Cidade/UF", "Ações"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Clientes</h1>
        </div>
        <Button
          onClick={() => navigate("/clientes/cadastro")}
          className="gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg h-11 px-6 shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#062A45]">
              Listagem de Clientes
            </h2>
            {!isLoading && !error && (
              <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {filteredClients.length}
              </span>
            )}
          </div>

          {!isLoading && !error && clients.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <Input
                  id="search-clientes"
                  placeholder="Buscar nome, CPF ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 bg-white border-slate-200 text-xs shadow-none focus-visible:border-[#062A45] focus-visible:ring-[#062A45]/20 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-slate-100" />
              <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-[#062A45]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Carregando clientes...
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Buscando dados dos clientes
              </p>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <p className="mt-1 text-xs text-red-400">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchClients}
              className="mt-1 gap-2 rounded-lg cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && clients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Contact className="h-8 w-8 text-slate-300" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-sm font-semibold text-slate-700">
                Nenhum cliente cadastrado ainda
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Cadastre o primeiro cliente para começar a gerenciar seus
                contratantes.
              </p>
            </div>
            <Button
              onClick={() => navigate("/clientes/cadastro")}
              className="mt-1 gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg"
            >
              <Plus className="h-4 w-4" /> Cadastrar Cliente
            </Button>
          </div>
        )}

        {!isLoading &&
          !error &&
          clients.length > 0 &&
          filteredClients.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
              <Search className="h-10 w-10 text-slate-200" />
              <div className="text-center">
                <p className="text-base font-semibold text-[#062A45]">
                  Nenhum cliente encontrado
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Nenhum cliente corresponde à busca realizada.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSearch}
                className="mt-2 gap-1.5 text-xs rounded-lg cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Limpar busca
              </Button>
            </div>
          )}

        {!isLoading && !error && filteredClients.length > 0 && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className={`py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 ${
                        col === "Ações" ? "px-5 pl-7" : "px-5"
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {paginatedClients.map((client, idx) => (
                  <tr
                    key={client.id}
                    className={`transition-colors duration-150 hover:bg-blue-50/30 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="font-bold text-[#062A45]">
                        {client.name}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 tracking-wider">
                        {formatDocument(client)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {PERSON_TYPE_LABELS[getPersonType(client)]}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {formatLocation(client)}
                    </td>
                    <td className="whitespace-nowrap px-5 pl-7 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            navigate(`/clientes/editar/${client.id}`)
                          }
                          title="Editar cliente"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45] cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => setConfirmClient(client)}
                          title="Excluir cliente"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && filteredClients.length > 0 && (
          <div className="mt-auto">
            <Pagination
              currentPage={displayedPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="cliente"
            />
          </div>
        )}
      </div>

      <ConfirmModal
        client={confirmClient}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmClient(null)}
      />
    </div>
  );
}
