import { Contact, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import ListCard from "../../components/ListCard";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import Pagination from "../../components/Pagination";
import RowActions from "../../components/RowActions";
import { Button } from "../../components/ui/button";
import { formatCnpj, formatCpf, onlyDigits } from "../../lib/documentMasks";
import { formatPhone } from "../../lib/phoneMasks";
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
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onCancel}
      />

      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Fechar"
          className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Trash2 className="size-8" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Excluir Cliente
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente excluir o cliente{" "}
              <span className="font-semibold text-foreground">
                {client.name}
              </span>{" "}
              com documento{" "}
              <span className="font-semibold text-foreground">
                {formatDocument(client)}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação não poderá ser desfeita e o endereço vinculado ao
              cliente também será excluído.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 w-full flex-1 font-semibold"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-11 w-full flex-1"
          >
            {isLoading ? (
              <LoadingIndicator variant="button" label="Excluindo..." />
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

  const columns = ["Nome", "Documento", "Tipo", "Telefone", "Cidade/UF", ""];

  const showList = !isLoading && !error && filteredClients.length > 0;

  const renderActions = (client) => (
    <RowActions>
      <button
        type="button"
        onClick={() => navigate(`/clientes/editar/${client.id}`)}
        title="Editar cliente"
        aria-label={`Editar cliente ${client.name}`}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmClient(client)}
        title="Excluir cliente"
        aria-label={`Excluir cliente ${client.name}`}
      >
        <Trash2 className="size-4" />
      </button>
    </RowActions>
  );

  return (
    <div>
      <PageHeader
        title="Clientes"
        action={
          <Button onClick={() => navigate("/clientes/cadastro")}>
            <Plus /> Novo cliente
          </Button>
        }
      />

      <ListCard
        title="Clientes"
        count={!isLoading && !error ? filteredClients.length : undefined}
        search={{
          id: "search-clientes",
          label: "Buscar cliente por nome, CPF ou CNPJ",
          placeholder: "Buscar nome, CPF ou CNPJ…",
          value: searchTerm,
          onChange: (e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          },
        }}
      >
        {isLoading && <LoadingIndicator label="Carregando clientes..." />}

        {!isLoading && error && (
          <ErrorState message={error} onRetry={fetchClients} />
        )}

        {!isLoading && !error && clients.length === 0 && (
          <EmptyState
            icon={Contact}
            title="Nenhum cliente cadastrado ainda"
            description="Cadastre o primeiro cliente para começar a gerenciar seus contratantes."
            action={
              <Button onClick={() => navigate("/clientes/cadastro")}>
                <Plus /> Cadastrar cliente
              </Button>
            }
          />
        )}

        {!isLoading &&
          !error &&
          clients.length > 0 &&
          filteredClients.length === 0 && (
            <EmptyState
              title="Nenhum cliente encontrado"
              description="Nenhum cliente corresponde à busca realizada."
              action={
                <Button variant="outline" onClick={clearSearch}>
                  <RotateCcw /> Limpar busca
                </Button>
              }
            />
          )}

        {showList && (
          <>
            <DataTable head={columns} className="hidden md:block">
              {paginatedClients.map((client) => (
                <tr key={client.id}>
                  <td className="font-semibold text-foreground">
                    {client.name}
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="rounded-md border bg-muted px-2 py-1 font-mono text-xs text-foreground">
                      {formatDocument(client)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {PERSON_TYPE_LABELS[getPersonType(client)]}
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatPhone(client.phone)}
                  </td>
                  <td className="text-muted-foreground">
                    {formatLocation(client)}
                  </td>
                  <td>{renderActions(client)}</td>
                </tr>
              ))}
            </DataTable>

            <div className="space-y-3 p-4 md:hidden">
              {paginatedClients.map((client) => (
                <article key={client.id} className="rounded-xl border p-4">
                  <h3 className="font-semibold break-words text-foreground">
                    {client.name}
                  </h3>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Documento
                      </dt>
                      <dd className="break-all">{formatDocument(client)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Tipo</dt>
                      <dd>{PERSON_TYPE_LABELS[getPersonType(client)]}</dd>
                    </div>
                    {client.phone && (
                      <div className="col-span-2">
                        <dt className="text-xs text-muted-foreground">
                          Telefone
                        </dt>
                        <dd>{formatPhone(client.phone)}</dd>
                      </div>
                    )}
                    <div className="col-span-2">
                      <dt className="text-xs text-muted-foreground">
                        Cidade/UF
                      </dt>
                      <dd>{formatLocation(client)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3">{renderActions(client)}</div>
                </article>
              ))}
            </div>

            <Pagination
              currentPage={displayedPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="cliente"
            />
          </>
        )}
      </ListCard>

      <ConfirmModal
        client={confirmClient}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmClient(null)}
      />
    </div>
  );
}
