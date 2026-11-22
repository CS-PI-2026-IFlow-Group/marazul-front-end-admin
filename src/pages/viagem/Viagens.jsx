import { AlertCircle, Map, Pencil, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import LoadingIndicator from "../../components/LoadingIndicator";
import { Button } from "../../components/ui/button";
import { usePageTitle } from "../../hooks/usePageTitle";
import { formatDateTime } from "../../lib/dateTime";
import ViagemService from "../../services/ViagemService";

function formatPlace(city, stateAcronym) {
  if (city && stateAcronym) return `${city}/${stateAcronym}`;
  return city || stateAcronym || "—";
}

export default function Viagens() {
  usePageTitle("Viagens");
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    ViagemService.getAll()
      .then((data) => {
        if (active) setTrips(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!active) return;
        setError("Não foi possível carregar a lista de viagens.");
        setTrips([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const fetchTrips = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  };

  const columns = ["Trecho", "Saída prevista", "Ônibus", "Situação", "Ações"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#062A45]">Viagens</h1>
        </div>
        <Button
          onClick={() => navigate("/viagens/cadastro")}
          className="h-11 w-full gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg px-6 shadow-sm transition-all duration-200 hover:shadow-md md:w-auto"
        >
          <Plus className="h-4 w-4" /> Agendar Viagem
        </Button>
      </div>

      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-4 rounded-t-xl sm:px-5">
          <h2 className="text-base font-semibold text-[#062A45]">
            Listagem de Viagens
          </h2>
          {!isLoading && !error && (
            <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
              {trips.length}
            </span>
          )}
        </div>

        {isLoading && <LoadingIndicator label="Carregando viagens..." />}

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
              onClick={fetchTrips}
              className="mt-1 gap-2 rounded-lg cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && trips.length === 0 && (
          <EmptyState
            icon={Map}
            title="Nenhuma viagem agendada ainda"
            description="Agende a primeira viagem."
            action={
              <Button onClick={() => navigate("/viagens/cadastro")}>
                <Plus className="mr-2 size-4" />
                Agendar viagem
              </Button>
            }
          />
        )}

        {!isLoading && !error && trips.length > 0 && (
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
                {trips.map((trip, idx) => (
                  <tr
                    key={trip.id}
                    className={`transition-colors duration-150 hover:bg-blue-50/30 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    }`}
                  >
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <span className="font-bold text-[#062A45]">
                        {formatPlace(trip.originCity, trip.originStateAcronym)}
                        {" → "}
                        {formatPlace(
                          trip.destinationCity,
                          trip.destinationStateAcronym,
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {formatDateTime(trip.plannedDepartureOrigin)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {trip.vehiclePrefix || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                      {ViagemService.getStatusLabel(trip.status)}
                    </td>
                    <td className="whitespace-nowrap px-5 pl-7 py-3.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/viagens/editar/${trip.id}`)}
                        title="Editar viagem"
                        aria-label="Editar viagem"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45] cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
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
