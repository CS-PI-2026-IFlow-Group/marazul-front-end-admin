import { Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
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
import { formatCpf } from "../../lib/documentMasks";
import { formatPassengerPhone, matchesPassenger } from "../../lib/passengerList";
import PassageiroService from "../../services/PassageiroService";
import { usePageTitle } from "../../hooks/usePageTitle";

const ITEMS_PER_PAGE = 8;
const COLUMNS = ["Nome", "CPF", "Telefone", ""];

function ConfirmDeleteModal({ passenger, isLoading, onConfirm, onCancel }) {
  if (!passenger) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-passenger-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl sm:p-8"
      >
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
            <h3
              id="delete-passenger-title"
              className="font-display text-xl font-bold text-foreground"
            >
              Excluir Passageiro
            </h3>
            <p className="mt-3 text-base text-muted-foreground">
              Deseja realmente excluir o passageiro{" "}
              <span className="font-semibold text-foreground">
                {passenger.name}
              </span>{" "}
              com documento{" "}
              <span className="font-semibold text-foreground">
                {formatCpf(passenger.cpf)}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Esta ação não poderá ser desfeita.
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

export default function Passageiros() {
  usePageTitle("Passageiros");
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmPassenger, setConfirmPassenger] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    PassageiroService.getAll()
      .then((data) => {
        if (active) {
          setPassengers(Array.isArray(data) ? data : []);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar os passageiros.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [reload]);

  const filteredPassengers = useMemo(
    () => passengers.filter((passenger) => matchesPassenger(passenger, searchTerm)),
    [passengers, searchTerm],
  );
  const totalPages = Math.max(1, Math.ceil(filteredPassengers.length / ITEMS_PER_PAGE));
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedPassengers = filteredPassengers.slice(
    (displayedPage - 1) * ITEMS_PER_PAGE,
    displayedPage * ITEMS_PER_PAGE,
  );

  const retry = () => {
    setIsLoading(true);
    setError("");
    setReload((value) => value + 1);
  };

  const handleDelete = async () => {
    if (!confirmPassenger || isDeleting) return;
    setIsDeleting(true);
    try {
      await PassageiroService.delete(confirmPassenger.id);
      setPassengers((previous) => previous.filter((passenger) => passenger.id !== confirmPassenger.id));
      const remainingPages = Math.max(1, Math.ceil((filteredPassengers.length - 1) / ITEMS_PER_PAGE));
      setCurrentPage((page) => Math.min(page, remainingPages));
      toast.success("Passageiro excluído com sucesso!");
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;
      if (status === 400 || status === 409) {
        toast.error(data?.message || data?.erro || "A exclusão foi bloqueada por uma regra do sistema.");
      } else if (status === 404) {
        toast.warning("Passageiro não encontrado. A listagem será atualizada.");
        retry();
      } else {
        toast.error("Não foi possível excluir o passageiro. Tente novamente.");
      }
    } finally {
      setIsDeleting(false);
      setConfirmPassenger(null);
    }
  };

  const showList = !isLoading && !error && filteredPassengers.length > 0;

  const renderActions = (passenger) => (
    <RowActions>
      <button
        type="button"
        onClick={() => navigate(`/passageiros/editar/${passenger.id}`)}
        aria-label={`Editar ${passenger.name}`}
        title="Editar passageiro"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmPassenger(passenger)}
        aria-label={`Excluir ${passenger.name}`}
        title="Excluir passageiro"
      >
        <Trash2 className="size-4" />
      </button>
    </RowActions>
  );

  return (
    <div>
      <PageHeader
        title="Passageiros"
        action={
          <Button onClick={() => navigate("/passageiros/cadastro")}>
            <Plus /> Novo passageiro
          </Button>
        }
      />

      <ListCard
        title="Listagem de passageiros"
        count={!isLoading && !error ? filteredPassengers.length : undefined}
        search={{
          id: "search-passengers",
          label: "Buscar passageiro por nome ou CPF",
          placeholder: "Buscar nome ou CPF…",
          value: searchTerm,
          onChange: (event) => {
            setSearchTerm(event.target.value);
            setCurrentPage(1);
          },
        }}
      >
        {isLoading && <LoadingIndicator label="Carregando passageiros..." />}

        {!isLoading && error && <ErrorState message={error} onRetry={retry} />}

        {!isLoading && !error && passengers.length === 0 && (
          <EmptyState
            icon={UserRound}
            title="Nenhum passageiro cadastrado ainda"
            description="Cadastre o primeiro passageiro para começar."
            action={
              <Button onClick={() => navigate("/passageiros/cadastro")}>
                <Plus /> Cadastrar passageiro
              </Button>
            }
          />
        )}

        {!isLoading &&
          !error &&
          passengers.length > 0 &&
          filteredPassengers.length === 0 && (
            <EmptyState
              title="Nenhum passageiro encontrado"
              description="Tente ajustar ou limpar a busca."
              action={
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Limpar busca
                </Button>
              }
            />
          )}

        {showList && (
          <>
            <DataTable head={COLUMNS} className="hidden md:block">
              {paginatedPassengers.map((passenger) => (
                <tr key={passenger.id}>
                  <td className="font-medium text-foreground">
                    {passenger.name}
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatCpf(passenger.cpf)}
                  </td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatPassengerPhone(passenger.phone)}
                  </td>
                  <td>{renderActions(passenger)}</td>
                </tr>
              ))}
            </DataTable>

            <div className="space-y-3 p-4 md:hidden">
              {paginatedPassengers.map((passenger) => (
                <article key={passenger.id} className="rounded-xl border p-4">
                  <h3 className="font-semibold break-words text-foreground">
                    {passenger.name}
                  </h3>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">CPF</dt>
                      <dd>{formatCpf(passenger.cpf)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Telefone
                      </dt>
                      <dd>{formatPassengerPhone(passenger.phone)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3">{renderActions(passenger)}</div>
                </article>
              ))}
            </div>

            <Pagination
              currentPage={displayedPage}
              totalPages={totalPages}
              totalItems={filteredPassengers.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="passageiro"
            />
          </>
        )}
      </ListCard>

      <ConfirmDeleteModal
        passenger={confirmPassenger}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setConfirmPassenger(null);
        }}
      />
    </div>
  );
}
