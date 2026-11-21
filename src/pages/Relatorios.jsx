import { useEffect, useState } from "react";
import { CalendarDays, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import FleetUsageSummary from "../components/FleetUsageSummary";
import FleetUsageTable from "../components/FleetUsageTable";
import { usePageTitle } from "../hooks/usePageTitle";
import fleetUsageReportService from "../services/FleetUsageReportService";

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonthPeriod() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    dataInicio: formatDateInput(firstDay),
    dataFim: formatDateInput(lastDay),
  };
}

function getPeriodDays(dataInicio, dataFim) {
  const start = Date.parse(`${dataInicio}T00:00:00Z`);
  const end = Date.parse(`${dataFim}T00:00:00Z`);

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;

  return Math.floor((end - start) / 86400000) + 1;
}

function normalizeVehicles(payload, periodDays) {
  const rows = Array.isArray(payload)
    ? payload
    : payload?.veiculos ?? payload?.vehicles ?? payload?.resultados ?? [];

  return rows.map((row, index) => {
    const prefix = row.prefixo ?? row.prefix ?? row.vehiclePrefix ?? "Sem prefixo";
    const plate = row.placa ?? row.licensePlate ?? row.plate ?? "Sem placa";
    const trips = Number(
      row.viagensRealizadas ?? row.totalViagens ?? row.tripCount ?? row.trips ?? 0,
    );
    const daysDriven = Number(
      row.diasRodados ?? row.daysDriven ?? row.distinctDaysDriven ?? 0,
    );
    const daysStopped = Number(
      row.diasParados ?? row.daysStopped ?? Math.max(0, periodDays - daysDriven),
    );
    const reportedUtilization =
      row.percentualAproveitamento ??
      row.aproveitamento ??
      row.utilizationPercentage;
    const utilization = Number(
      reportedUtilization ?? (periodDays > 0 ? (daysDriven / periodDays) * 100 : 0),
    );

    return {
      id: row.veiculoId ?? row.vehicleId ?? row.id ?? `${prefix}-${plate}-${index}`,
      prefix,
      plate,
      status: row.status ?? row.situacao ?? "ACTIVE",
      trips,
      daysDriven,
      daysStopped,
      utilization: Number.isFinite(utilization) ? utilization : 0,
    };
  });
}

function getVehicleStatus(status) {
  const normalized = String(status ?? "").toUpperCase();

  if (normalized === "INACTIVE" || normalized === "INATIVO") {
    return { label: "Inativo", className: "bg-rose-50 text-rose-700 ring-rose-200" };
  }

  if (
    normalized === "UNDER_MAINTENANCE" ||
    normalized === "EM_MANUTENÇÃO" ||
    normalized === "EM MANUTENÇÃO"
  ) {
    return {
      label: "Em manutenção",
      className: "bg-amber-50 text-amber-800 ring-amber-200",
    };
  }

  return { label: "Ativo", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
}

function formatPercent(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function formatPeriodDate(value) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function csvCell(value) {
  const text = String(value ?? "");
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;

  return `"${safeText.replaceAll('"', '""')}"`;
}

export default function Relatorios() {
  usePageTitle("Uso da frota");

  const [period, setPeriod] = useState(getCurrentMonthPeriod);
  const [appliedPeriod, setAppliedPeriod] = useState(getCurrentMonthPeriod);
  const [reloadKey, setReloadKey] = useState(0);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periodError, setPeriodError] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fleetUsageReportService
      .getUsoFrota(appliedPeriod.dataInicio, appliedPeriod.dataFim, {
        signal: controller.signal,
      })
      .then((data) => {
        if (!active) return;
        setReport(data);
        setLoading(false);
      })
      .catch((requestError) => {
        if (!active) return;
        setLoading(false);
        if (requestError.response?.status === 401) return;
        setError(
          requestError.response?.data?.message ??
            requestError.response?.data?.erro ??
            "Não foi possível carregar o relatório. Tente novamente.",
        );
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [appliedPeriod, reloadKey]);

  const periodDays = getPeriodDays(appliedPeriod.dataInicio, appliedPeriod.dataFim);
  const vehicles = report ? normalizeVehicles(report, periodDays) : [];
  const totalTrips = vehicles.reduce((total, vehicle) => total + vehicle.trips, 0);
  const averageDaysDriven = vehicles.length
    ? vehicles.reduce((total, vehicle) => total + vehicle.daysDriven, 0) / vehicles.length
    : 0;
  const sortedVehicles = [...vehicles].sort((left, right) => {
    const difference = left.utilization - right.utilization;
    if (difference !== 0) return sortDirection === "desc" ? -difference : difference;
    return left.prefix.localeCompare(right.prefix, "pt-BR");
  });
  const mostUsed = totalTrips > 0 ? sortedVehicles[0] : null;
  const leastUsed = totalTrips > 0 ? sortedVehicles[sortedVehicles.length - 1] : null;

  const handlePeriodChange = (event) => {
    setPeriod((current) => ({ ...current, [event.target.name]: event.target.value }));
    setPeriodError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!period.dataInicio || !period.dataFim) {
      setPeriodError("Informe as duas datas do período.");
      return;
    }

    if (period.dataInicio > period.dataFim) {
      setPeriodError("A data inicial deve ser anterior ou igual à data final.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);
    setAppliedPeriod({ ...period });
    setReloadKey((key) => key + 1);
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setReport(null);
    setReloadKey((key) => key + 1);
  };

  const handleExport = () => {
    const header = [
      "Prefixo",
      "Placa",
      "Status",
      "Viagens realizadas",
      "Dias rodados",
      "Dias parados",
      "Aproveitamento (%)",
    ];
    const rows = sortedVehicles.map((vehicle) => [
      vehicle.prefix,
      vehicle.plate,
      getVehicleStatus(vehicle.status).label,
      vehicle.trips,
      vehicle.daysDriven,
      vehicle.daysStopped,
      vehicle.utilization.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `uso-da-frota_${appliedPeriod.dataInicio}_${appliedPeriod.dataFim}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#101828] sm:text-3xl">Relatórios</h1>
        </div>
        <Button
          type="button"
          onClick={handleExport}
          disabled={loading || !report}
          className="normal-case tracking-normal rounded-lg bg-[#171717] text-white hover:bg-[#303030]"
        >
          <Download aria-hidden="true" />
          Exportar CSV
        </Button>
      </header>

      <FleetUsageSummary
        totalTrips={totalTrips}
        averageDaysDriven={averageDaysDriven}
        mostUsed={mostUsed}
        leastUsed={leastUsed}
        loading={loading}
        error={error}
      />

      <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 py-2 text-xs text-slate-500">
        <p className="flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-500" />
          Período de {formatPeriodDate(appliedPeriod.dataInicio)} a {formatPeriodDate(appliedPeriod.dataFim)}
        </p>
        <p aria-live="polite">
          {loading ? "Atualizando relatório..." : `${totalTrips.toLocaleString("pt-BR")} viagens no período`}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 border-b border-slate-200 pb-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#101828]">
            <CalendarDays aria-hidden="true" className="size-4 text-slate-500" />
            Período e filtros
          </h2>
          <Button type="submit" disabled={loading} variant="ghost" className="h-8 normal-case tracking-normal text-slate-600">
            Aplicar período
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-2xl">
          <label className="grid gap-1.5 text-xs font-medium text-slate-700">
            Data inicial
            <input
              type="date"
              name="dataInicio"
              value={period.dataInicio}
              onChange={handlePeriodChange}
              aria-invalid={Boolean(periodError)}
              className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#167D91] focus:ring-2 focus:ring-[#167D91]/20"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-slate-700">
            Data final
            <input
              type="date"
              name="dataFim"
              value={period.dataFim}
              onChange={handlePeriodChange}
              aria-invalid={Boolean(periodError)}
              className="h-9 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#167D91] focus:ring-2 focus:ring-[#167D91]/20"
            />
          </label>
        </div>
      </form>

      {periodError && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {periodError}
        </p>
      )}

      <FleetUsageTable
        vehicles={sortedVehicles}
        loading={loading}
        error={error}
        noTrips={Boolean(report && totalTrips === 0)}
        onRetry={handleRetry}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        getVehicleStatus={getVehicleStatus}
        formatPercent={formatPercent}
      />
      </section>
    </div>
  );
}
