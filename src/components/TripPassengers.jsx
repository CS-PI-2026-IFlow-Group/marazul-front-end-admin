import { Info, Pencil, Plus, Search, Trash2, TriangleAlert, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCpf } from "../lib/documentMasks";
import {
  formatCurrency,
  formatMoneyInput,
  moneyInputFromValue,
  parseMoneyInput,
  toCents,
} from "../lib/moneyMasks";
import { cn } from "../lib/utils";
import PassageiroService from "../services/PassageiroService";
import DataTable from "./DataTable";
import FormSection from "./FormSection";
import GenericInput from "./GenericInput";
import GenericSelect from "./GenericSelect";
import LoadingIndicator from "./LoadingIndicator";
import RowActions from "./RowActions";
import { Button } from "./ui/button";

const NO_RESPONSIBLE = "none";
const SEARCH_DELAY_MS = 300;
const MIN_SEARCH_LENGTH = 2;
const PAID_ABOVE_DUE = "O valor pago não pode ultrapassar o valor devido do passageiro.";
const COLUMNS = ["Nome", "CPF", "Valor devido", "Valor pago", "Em aberto", ""];

function validateAmounts(dueInput, paidInput) {
  const dueCents = toCents(parseMoneyInput(dueInput));
  const paidCents = toCents(parseMoneyInput(paidInput));
  const paidError =
    dueCents !== null && paidCents !== null && paidCents > dueCents ? PAID_ABOVE_DUE : "";
  return {
    dueCents,
    paidCents,
    paidError,
    isValid: dueCents !== null && paidCents !== null && !paidError,
  };
}

function preventEnter(action) {
  return (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      action?.();
    }
  };
}

function Note({ tone = "neutral", icon: Icon = Info, children }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm sm:col-span-2",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning",
        tone === "danger" && "border-destructive/20 bg-destructive/10 text-destructive",
        tone === "neutral" && "bg-muted/40 text-muted-foreground",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function Modal({ title, titleId, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 cursor-pointer rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
        <h3 id={titleId} className="pr-8 font-display text-xl font-bold text-foreground">
          {title}
        </h3>
        {children}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">{footer}</div>
      </div>
    </div>
  );
}

function TotalBox({ label, value, highlight = false }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-bold tabular-nums",
          highlight ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

export default function TripPassengers({
  passengers = [],
  responsiblePassengerId = null,
  onChange,
  capacity = null,
  suggestedAmount = null,
  minimumPassengers = null,
  disabled = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searchState, setSearchState] = useState("idle");
  const [selected, setSelected] = useState(null);
  const [dueInput, setDueInput] = useState("");
  const [paidInput, setPaidInput] = useState("");
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const count = passengers.length;
  const hasCapacity = capacity !== null && capacity !== undefined;
  const isFull = hasCapacity && count >= capacity;
  const isOverCapacity = hasCapacity && count > capacity;
  const isBelowMinimum = Boolean(minimumPassengers) && count < minimumPassengers;
  const includedIds = new Set(passengers.map((passenger) => Number(passenger.passengerId)));
  const options = results.filter((passenger) => !includedIds.has(Number(passenger.id)));
  const showResults = !selected && searchTerm.trim().length >= MIN_SEARCH_LENGTH;
  const addValidation = validateAmounts(dueInput, paidInput);
  const canAdd = !disabled && !isFull && Boolean(selected) && addValidation.isValid;
  const editValidation = editing ? validateAmounts(editing.dueInput, editing.paidInput) : null;

  const totals = passengers.reduce(
    (sum, passenger) => {
      const due = toCents(passenger.amountDue) ?? 0;
      const paid = toCents(passenger.amountPaid) ?? 0;
      return { due: sum.due + due, paid: sum.paid + paid };
    },
    { due: 0, paid: 0 },
  );

  useEffect(() => {
    const term = searchTerm.trim();
    if (selected || term.length < MIN_SEARCH_LENGTH) return undefined;

    let active = true;
    const timer = setTimeout(() => {
      PassageiroService.search(term)
        .then((data) => {
          if (!active) return;
          setResults(data);
          setSearchState("done");
        })
        .catch(() => {
          if (!active) return;
          setResults([]);
          setSearchState("error");
        });
    }, SEARCH_DELAY_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selected]);

  const emit = (nextPassengers, nextResponsible = responsiblePassengerId) => {
    onChange?.({ passengers: nextPassengers, responsiblePassengerId: nextResponsible });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim().length < MIN_SEARCH_LENGTH) {
      setResults([]);
      setSearchState("idle");
    } else {
      setSearchState("loading");
    }
  };

  const handleSelect = (passenger) => {
    setSelected(passenger);
    setSearchTerm("");
    setResults([]);
    setSearchState("idle");
    setDueInput(moneyInputFromValue(suggestedAmount));
    setPaidInput(moneyInputFromValue(0));
  };

  const clearSelection = () => {
    setSelected(null);
    setDueInput("");
    setPaidInput("");
  };

  const handleAdd = () => {
    if (!canAdd) return;
    emit([
      ...passengers,
      {
        passengerId: Number(selected.id),
        name: selected.name,
        cpf: selected.cpf,
        amountDue: addValidation.dueCents / 100,
        amountPaid: addValidation.paidCents / 100,
      },
    ]);
    clearSelection();
  };

  const openEdit = (passenger) => {
    setEditing({
      passenger,
      dueInput: moneyInputFromValue(passenger.amountDue),
      paidInput: moneyInputFromValue(passenger.amountPaid ?? 0),
    });
  };

  const handleSaveEdit = () => {
    if (!editValidation?.isValid) return;
    const editedId = Number(editing.passenger.passengerId);
    emit(
      passengers.map((passenger) =>
        Number(passenger.passengerId) === editedId
          ? {
              ...passenger,
              amountDue: editValidation.dueCents / 100,
              amountPaid: editValidation.paidCents / 100,
            }
          : passenger,
      ),
    );
    setEditing(null);
  };

  const handleRemove = () => {
    const removedId = Number(removing.passengerId);
    emit(
      passengers.filter((passenger) => Number(passenger.passengerId) !== removedId),
      Number(responsiblePassengerId) === removedId ? null : responsiblePassengerId,
    );
    setRemoving(null);
  };

  const handleResponsibleChange = (value) => {
    emit(passengers, value === NO_RESPONSIBLE ? null : Number(value));
  };

  const isResponsible = (passenger) =>
    responsiblePassengerId !== null &&
    Number(responsiblePassengerId) === Number(passenger.passengerId);

  const renderActions = (passenger) => (
    <RowActions>
      <button
        type="button"
        onClick={() => openEdit(passenger)}
        disabled={disabled}
        title="Alterar valores"
        aria-label={`Alterar valores de ${passenger.name}`}
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setRemoving(passenger)}
        disabled={disabled}
        title="Remover da viagem"
        aria-label={`Remover ${passenger.name} da viagem`}
      >
        <Trash2 className="size-4" />
      </button>
    </RowActions>
  );

  const renderName = (passenger) => (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="font-medium text-foreground">{passenger.name}</span>
      {isResponsible(passenger) && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-primary">
          Responsável
        </span>
      )}
    </span>
  );

  const openAmount = (passenger) =>
    ((toCents(passenger.amountDue) ?? 0) - (toCents(passenger.amountPaid) ?? 0)) / 100;

  return (
    <FormSection
      icon={Users}
      title="Passageiros"
      description={
        hasCapacity
          ? `${count} de ${capacity} assentos`
          : `${count} ${count === 1 ? "passageiro" : "passageiros"} · selecione o ônibus para ver a capacidade`
      }
    >
      {isOverCapacity && (
        <Note tone="danger" icon={TriangleAlert}>
          O ônibus selecionado tem {capacity} assentos, menos que os {count} passageiros
          incluídos. Remova passageiros ou escolha um ônibus maior.
        </Note>
      )}

      {isFull && !isOverCapacity && (
        <Note tone="danger" icon={TriangleAlert}>
          A viagem comporta no máximo {capacity} passageiros e todos os assentos do ônibus
          selecionado já estão ocupados. Remova um passageiro ou escolha um ônibus maior para
          incluir outro.
        </Note>
      )}

      {isBelowMinimum && (
        <Note tone="warning" icon={TriangleAlert}>
          A viagem tem {count} de {minimumPassengers} passageiros mínimos. Você pode salvar
          assim, mas ela só poderá ser confirmada com pelo menos {minimumPassengers}{" "}
          passageiros.
        </Note>
      )}

      <div className="grid gap-4 rounded-xl border bg-muted/30 p-4 sm:col-span-2 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_auto] lg:items-start">
        <div className="relative">
          {selected ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium tracking-wide text-foreground uppercase">
                Passageiro
              </p>
              <div className="flex h-10 items-center justify-between gap-2 rounded-lg border bg-card px-3.5 text-sm">
                <span className="truncate">
                  <span className="font-medium text-foreground">{selected.name}</span>
                  <span className="text-muted-foreground"> · {formatCpf(selected.cpf)}</span>
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  aria-label="Trocar passageiro"
                  className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            <GenericInput
              id="busca-passageiro"
              label="Incluir passageiro"
              icon={Search}
              placeholder={isFull ? "Sem assentos disponíveis" : "Buscar por nome ou CPF"}
              value={searchTerm}
              onChange={(event) => handleSearchChange(event.target.value)}
              onKeyDown={preventEnter()}
              disabled={disabled || isFull}
              autoComplete="off"
              aria-expanded={showResults}
              aria-controls="resultados-passageiro"
            />
          )}

          {showResults && (
            <div
              id="resultados-passageiro"
              className="absolute top-full right-0 left-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border bg-popover py-1 text-popover-foreground shadow-lg"
            >
              {searchState === "loading" && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                  <LoadingIndicator label="" className="size-4" />
                  Buscando passageiros...
                </div>
              )}
              {searchState === "error" && (
                <p className="px-4 py-3 text-sm text-destructive">
                  Não foi possível buscar os passageiros.
                </p>
              )}
              {searchState === "done" && options.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  {results.length > 0
                    ? "Os passageiros encontrados já estão na viagem."
                    : "Nenhum passageiro encontrado."}
                </p>
              )}
              {searchState === "done" &&
                options.map((passenger) => (
                  <button
                    key={passenger.id}
                    type="button"
                    onClick={() => handleSelect(passenger)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    <span className="font-medium text-foreground">{passenger.name}</span>
                    <span className="text-muted-foreground">{formatCpf(passenger.cpf)}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <GenericInput
          id="valor-devido"
          label="Valor devido"
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={dueInput}
          onChange={(event) => setDueInput(formatMoneyInput(event.target.value))}
          onKeyDown={preventEnter(handleAdd)}
          disabled={disabled || !selected}
        />

        <GenericInput
          id="valor-pago"
          label="Valor pago"
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={paidInput}
          onChange={(event) => setPaidInput(formatMoneyInput(event.target.value))}
          onKeyDown={preventEnter(handleAdd)}
          disabled={disabled || !selected}
          hasError={Boolean(addValidation.paidError)}
          errorMessage={addValidation.paidError}
        />

        <Button type="button" onClick={handleAdd} disabled={!canAdd} className="lg:mt-6.5">
          <Plus /> Incluir
        </Button>
      </div>

      {count === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground sm:col-span-2">
          Nenhum passageiro incluído ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border sm:col-span-2">
          <DataTable head={COLUMNS} className="hidden md:block">
            {passengers.map((passenger) => {
              const open = openAmount(passenger);
              return (
                <tr key={passenger.passengerId}>
                  <td>{renderName(passenger)}</td>
                  <td className="whitespace-nowrap text-muted-foreground">
                    {formatCpf(passenger.cpf)}
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    {formatCurrency(passenger.amountDue)}
                  </td>
                  <td className="whitespace-nowrap tabular-nums">
                    {formatCurrency(passenger.amountPaid ?? 0)}
                  </td>
                  <td
                    className={cn(
                      "whitespace-nowrap tabular-nums",
                      open > 0 ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {formatCurrency(open)}
                  </td>
                  <td>{renderActions(passenger)}</td>
                </tr>
              );
            })}
          </DataTable>

          <div className="divide-y md:hidden">
            {passengers.map((passenger) => (
              <article key={passenger.passengerId} className="p-4">
                {renderName(passenger)}
                <p className="text-sm text-muted-foreground">{formatCpf(passenger.cpf)}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Devido</dt>
                    <dd className="tabular-nums">{formatCurrency(passenger.amountDue)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Pago</dt>
                    <dd className="tabular-nums">{formatCurrency(passenger.amountPaid ?? 0)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Em aberto</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatCurrency(openAmount(passenger))}
                    </dd>
                  </div>
                </dl>
                <div className="mt-2">{renderActions(passenger)}</div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
        <TotalBox label="Total devido" value={totals.due / 100} highlight />
        <TotalBox label="Total recebido" value={totals.paid / 100} highlight />
        <TotalBox
          label="Total em aberto"
          value={(totals.due - totals.paid) / 100}
          highlight={totals.due - totals.paid > 0}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <GenericSelect
          id="responsavel"
          label="Responsável pelo grupo"
          value={
            responsiblePassengerId === null || responsiblePassengerId === undefined
              ? NO_RESPONSIBLE
              : String(responsiblePassengerId)
          }
          onChange={handleResponsibleChange}
          disabled={disabled || count === 0}
          placeholder="Sem responsável"
          options={[
            { value: NO_RESPONSIBLE, label: "Sem responsável" },
            ...passengers.map((passenger) => ({
              value: String(passenger.passengerId),
              label: passenger.name,
            })),
          ]}
        />
        <p className="text-xs text-muted-foreground">
          Opcional. Escolha um dos passageiros incluídos.
        </p>
      </div>

      {editing && (
        <Modal
          title={`Alterar valores de ${editing.passenger.name}`}
          titleId="editar-passageiro-viagem"
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                className="h-11 w-full flex-1 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editValidation?.isValid}
                className="h-11 w-full flex-1"
              >
                Salvar valores
              </Button>
            </>
          }
        >
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <GenericInput
              id="editar-valor-devido"
              label="Valor devido"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={editing.dueInput}
              onChange={(event) =>
                setEditing((prev) => ({ ...prev, dueInput: formatMoneyInput(event.target.value) }))
              }
              onKeyDown={preventEnter(handleSaveEdit)}
            />
            <GenericInput
              id="editar-valor-pago"
              label="Valor pago"
              inputMode="numeric"
              placeholder="R$ 0,00"
              value={editing.paidInput}
              onChange={(event) =>
                setEditing((prev) => ({ ...prev, paidInput: formatMoneyInput(event.target.value) }))
              }
              onKeyDown={preventEnter(handleSaveEdit)}
              hasError={Boolean(editValidation?.paidError)}
              errorMessage={editValidation?.paidError}
            />
          </div>
        </Modal>
      )}

      {removing && (
        <Modal
          title="Remover passageiro da viagem"
          titleId="remover-passageiro-viagem"
          onClose={() => setRemoving(null)}
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRemoving(null)}
                className="h-11 w-full flex-1 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                className="h-11 w-full flex-1"
              >
                Remover da viagem
              </Button>
            </>
          }
        >
          <p className="mt-3 text-base text-muted-foreground">
            Deseja remover{" "}
            <span className="font-semibold text-foreground">{removing.name}</span> desta
            viagem?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            O cadastro do passageiro continua salvo; ele só sai da lista desta viagem.
            {isResponsible(removing) && " Ele também deixará de ser o responsável pelo grupo."}
          </p>
        </Modal>
      )}
    </FormSection>
  );
}
