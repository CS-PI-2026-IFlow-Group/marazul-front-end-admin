import {
  AlertCircle,
  ArrowDownWideNarrow,
  ArrowUpDown,
  BusFront,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { Button } from "./ui/button";

export default function FleetUsageTable({
  vehicles,
  loading,
  error,
  noTrips,
  onRetry,
  sortDirection,
  setSortDirection,
  getVehicleStatus,
  formatPercent,
}) {
  return (
    <section aria-labelledby="fleet-usage-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 id="fleet-usage-heading" className="text-base font-semibold text-[#101828]">
            Utilização por ônibus
          </h2>
          <p className="text-xs text-slate-500">
            {loading ? "Carregando frota..." : `${vehicles.length} ônibus na frota`}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowDownWideNarrow aria-hidden="true" className="size-3.5" />
          Ordenação por aproveitamento
        </span>
      </div>

      {noTrips && !loading && (
        <div role="status" className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <BusFront aria-hidden="true" className="size-5 shrink-0" />
          <p>Não há viagens no período selecionado. A frota permanece listada com os contadores zerados.</p>
        </div>
      )}

      <div className="overflow-x-auto">
        {!loading && error ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 py-12 text-center" role="alert">
            <div className="flex size-11 items-center justify-center rounded-full border border-red-100 bg-red-50">
              <AlertCircle aria-hidden="true" className="size-5 text-red-500" />
            </div>
            <div className="max-w-sm">
              <p className="text-sm font-semibold text-slate-800">Não foi possível carregar o relatório</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{error}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onRetry}
              className="mt-1 h-9 cursor-pointer gap-2 rounded-lg border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <RefreshCw aria-hidden="true" className="size-3.5" />
              Tentar novamente
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="text-[10px] font-semibold uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Ônibus</th>
                <th scope="col" className="px-4 py-3">Situação</th>
                <th scope="col" className="px-4 py-3 text-right">Viagens</th>
                <th scope="col" className="px-4 py-3 text-right">Dias rodados</th>
                <th scope="col" className="px-4 py-3 text-right">Dias parados</th>
                <th scope="col" aria-sort={sortDirection === "desc" ? "descending" : "ascending"} className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setSortDirection((direction) => direction === "desc" ? "asc" : "desc")}
                    className="inline-flex items-center gap-1.5 text-right hover:text-[#062A45] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#167D91]"
                    aria-label={`Ordenar por aproveitamento, atualmente ${sortDirection === "desc" ? "decrescente" : "crescente"}`}
                  >
                    Aproveitamento
                    <ArrowUpDown aria-hidden="true" className="size-3.5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <span role="status" className="inline-flex items-center gap-2">
                      <RefreshCw aria-hidden="true" className="size-4 animate-spin" />
                      Carregando dados da frota...
                    </span>
                  </td>
                </tr>
              )}
              {!loading && !error && vehicles.map((vehicle) => {
                const status = getVehicleStatus(vehicle.status);
                const barWidth = Math.max(0, Math.min(100, vehicle.utilization));

                return (
                  <tr key={vehicle.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <p className="font-medium text-[#101828]">Ônibus {vehicle.prefix}</p>
                      <p className="text-xs text-slate-500">{vehicle.plate}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}>
                        {status.label}
                        {vehicle.status === "UNDER_MAINTENANCE" && <Wrench aria-hidden="true" className="ml-1.5 size-3" />}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{vehicle.trips.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{vehicle.daysDriven.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-slate-700">{vehicle.daysStopped.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3.5">
                      <div className="ml-auto flex max-w-36 items-center justify-end gap-3">
                        <span className="w-12 text-right font-semibold tabular-nums text-[#062A45]">
                          {formatPercent(vehicle.utilization)}
                        </span>
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <span className="block h-full rounded-full bg-[#1B9A91]" style={{ width: `${barWidth}%` }} />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && vehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Nenhum ônibus cadastrado na frota.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}