import { AlertCircle, Contact, Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { formatCnpj, formatCpf, onlyDigits } from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";

const PERSON_TYPE_CONFIG = {
  PF: {
    label: "Pessoa Física",
    bg: "bg-sky-50",
    text: "text-sky-700",
    dot: "bg-sky-500",
    border: "border-sky-200",
  },
  PJ: {
    label: "Pessoa Jurídica",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
    border: "border-violet-200",
  },
};

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

function PersonTypeBadge({ type }) {
  const config = PERSON_TYPE_CONFIG[type] || PERSON_TYPE_CONFIG.PF;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function Clientes() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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

  const columns = ["Nome", "Documento", "Cidade/UF"];

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
                {clients.length}
              </span>
            )}
          </div>

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

        {!isLoading && !error && clients.length > 0 && (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {clients.map((client, idx) => (
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
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 tracking-wider">
                          {formatDocument(client)}
                        </span>
                        <PersonTypeBadge type={getPersonType(client)} />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {formatLocation(client)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
