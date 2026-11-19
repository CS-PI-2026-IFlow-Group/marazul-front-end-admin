import {
  AlertCircle,
  Contact,
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
import LoadingIndicator from "../../components/LoadingIndicator";
import EmptyState from "../../components/EmptyState";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatCnpj, formatCpf, onlyDigits } from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";
import { usePageTitle } from "../../hooks/usePageTitle";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onCancel}
      />

      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-100 bg-white p-5 shadow-2xl sm:p-8">
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

        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 w-full flex-1 rounded-lg text-sm cursor-pointer font-semibold md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 w-full flex-1 rounded-lg bg-red-600 text-sm text-white hover:bg-red-700 cursor-pointer font-semibold md:w-auto"
          >
            {isLoading ? (
              <>
                <LoadingIndicator variant="button" label="Excluindo..." />
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
  usePageTitle("Clientes");
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Clientes</h1>
        </div>
        <Button
          onClick={() => navigate("/clientes/cadastro")}
          className="h-11 w-full gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg px-6 shadow-sm transition-all duration-200 hover:shadow-md md:w-auto"
        >
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-4 md:flex-row md:items-center md:justify-between rounded-t-xl sm:px-5">
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
              <div className="relative w-full md:w-72">
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

        {isLoading && <LoadingIndicator label="Carregando clientes..." />}

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

        {!isLoading && !error && clients.length === 0 && <EmptyState icon={Contact} title={"Nenhum cliente cadastrado ainda"} description={"Cadastre o primeiro cliente."} action={<Button onClick={() => navigate("/clientes/cadastro")}><Plus className={"mr-2 size-4"}/>Cadastrar cliente</Button>} />}

        {!isLoading && !error && clients.length > 0 && filteredClients.length === 0 && <EmptyState title={"Nenhum cliente encontrado"} description={"Nenhum cliente corresponde à busca realizada."} action={<Button variant={"outline"} onClick={clearSearch}><RotateCcw className={"mr-2 size-4"}/>Limpar busca</Button>} />}

        {!isLoading && !error && filteredClients.length > 0 && (
          <div className="hidden flex-1 overflow-x-auto md:block">
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

        {!isLoading && !error && filteredClients.length > 0 && <div className="space-y-3 p-4 md:hidden">{paginatedClients.map((client) => <article key={client.id} className="rounded-lg border border-slate-200 p-4"><h3 className="break-words font-semibold text-[#062A45]">{client.name}</h3><dl className="mt-2 grid grid-cols-2 gap-2 text-sm"><div><dt className="text-xs text-slate-500">Documento</dt><dd className="break-all">{formatDocument(client)}</dd></div><div><dt className="text-xs text-slate-500">Tipo</dt><dd>{PERSON_TYPE_LABELS[getPersonType(client)]}</dd></div><div className="col-span-2"><dt className="text-xs text-slate-500">Cidade/UF</dt><dd>{formatLocation(client)}</dd></div></dl><div className="mt-3 flex items-center gap-1"><button type="button" title="Editar cliente" aria-label="Editar cliente" onClick={() => navigate("/clientes/editar/" + client.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45]"><Pencil className="h-4 w-4" /></button><button type="button" title="Excluir cliente" aria-label="Excluir cliente" onClick={() => setConfirmClient(client)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</div>}

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
