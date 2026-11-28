import { Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../lib/permissions";
import ClienteService from "../services/ClienteService";
import GenericSelect from "./GenericSelect";

const ALL_CLIENTS = { value: "", label: "Todos os clientes" };

function ClientFilter({ filter, value, onChange }) {
  const { profile } = useAuth();
  const canListClients = hasPermission(profile, "clientes:view");
  const [clients, setClients] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canListClients) return undefined;
    let active = true;
    ClienteService.getAll()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setClients(
          list
            .map((client) => ({ value: String(client.id), label: client.name }))
            .sort((left, right) => left.label.localeCompare(right.label, "pt-BR")),
        );
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [canListClients]);

  const unavailable = !canListClients || failed;

  return (
    <div className="space-y-1.5">
      <GenericSelect
        id={`filtro-${filter.chave}`}
        label={filter.titulo}
        icon={Building2}
        searchable
        disabled={unavailable}
        value={value ?? ""}
        onChange={onChange}
        options={[ALL_CLIENTS, ...clients]}
        placeholder={ALL_CLIENTS.label}
        searchPlaceholder="Buscar cliente..."
      />
      {unavailable && (
        <p className="text-xs text-muted-foreground">
          {canListClients
            ? "Não foi possível carregar os clientes. O relatório mostra todos."
            : "Seu perfil não tem acesso à lista de clientes. O relatório mostra todos."}
        </p>
      )}
    </div>
  );
}

const FILTER_COMPONENTS = {
  CLIENTE: ClientFilter,
};

export default function ReportFilters({ filtros, value, onChange }) {
  const supported = filtros.filter((filter) => FILTER_COMPONENTS[filter.tipo]);
  if (supported.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {supported.map((filter) => {
        const Filter = FILTER_COMPONENTS[filter.tipo];
        return (
          <Filter
            key={filter.chave}
            filter={filter}
            value={value[filter.chave]}
            onChange={(next) => onChange({ ...value, [filter.chave]: next })}
          />
        );
      })}
    </div>
  );
}
