import { AlertCircle, Contact, Loader2, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import ClienteService from "../../services/ClienteService";

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

      </div>
    </div>
  );
}
