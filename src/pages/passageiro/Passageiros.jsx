import { AlertCircle, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Pagination from "../../components/Pagination";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { formatCpf } from "../../lib/documentMasks";
import { formatPassengerPhone, matchesPassenger } from "../../lib/passengerList";
import PassageiroService from "../../services/PassageiroService";

const ITEMS_PER_PAGE = 8;
const COLUMNS = ["Nome", "CPF", "Telefone", "Ações"];

function ConfirmDeleteModal({ passenger, isLoading, onConfirm, onCancel }) {
  if (!passenger) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={isLoading ? undefined : onCancel} />
      <div role="dialog" aria-modal="true" aria-labelledby="delete-passenger-title" className="relative z-10 w-full max-w-lg rounded-xl bg-white p-8 shadow-2xl mx-4 border border-slate-100">
        <button type="button" onClick={onCancel} disabled={isLoading} aria-label="Fechar" className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h3 id="delete-passenger-title" className="text-xl font-bold text-[#062A45]">Excluir Passageiro</h3>
            <p className="mt-3 text-base text-slate-600">
              Deseja realmente excluir o passageiro <span className="font-semibold text-[#062A45]">{passenger.name}</span> com documento <span className="font-semibold text-[#062A45]">{formatCpf(passenger.cpf)}</span>?
            </p>
            <p className="mt-2 text-sm text-slate-500">Esta ação não poderá ser desfeita.</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1 rounded-lg h-12 text-sm cursor-pointer font-semibold">Cancelar</Button>
          <Button onClick={onConfirm} disabled={isLoading} className="flex-1 rounded-lg h-12 bg-red-600 text-sm text-white hover:bg-red-700 cursor-pointer font-semibold">
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...</> : "Confirmar Exclusão"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Passageiros() {
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

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#062A45]">Passageiros</h1>
        <Button onClick={() => navigate("/passageiros/cadastro")} className="gap-2 bg-[#062A45] hover:bg-[#0a1f35] text-white font-bold cursor-pointer rounded-lg h-11 px-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <Plus className="h-4 w-4" /> Novo Passageiro
        </Button>
      </div>

      <div className="relative flex flex-col min-h-[480px] rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between rounded-t-xl">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#062A45]">Listagem de Passageiros</h2>
            {!isLoading && !error && <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">{filteredPassengers.length}</span>}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input id="search-passengers" aria-label="Buscar passageiro por nome ou CPF" placeholder="Buscar nome ou CPF..." value={searchTerm}
              onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
              className="pl-9 h-9 bg-white border-slate-200 text-xs shadow-none focus-visible:border-[#062A45] focus-visible:ring-[#062A45]/20 rounded-lg" />
          </div>
        </div>

        {isLoading && <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 className="h-10 w-10 animate-spin text-[#062A45]" /><p className="text-sm font-medium text-slate-700">Carregando passageiros...</p></div>}

        {!isLoading && error && <div className="flex flex-col items-center justify-center py-24 gap-4" role="alert">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><AlertCircle className="h-8 w-8 text-red-500" /></div>
          <div className="text-center max-w-xs"><p className="text-sm font-semibold text-red-700">{error}</p><p className="mt-1 text-xs text-red-400">Verifique sua conexão e tente novamente.</p></div>
          <Button variant="outline" onClick={retry} className="mt-1 gap-2 rounded-lg cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs"><RefreshCw className="h-4 w-4" /> Tentar novamente</Button>
        </div>}

        {!isLoading && !error && passengers.length === 0 && <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100"><UserRound className="h-8 w-8 text-slate-300" /></div>
          <p className="text-sm font-semibold text-slate-700">Nenhum passageiro cadastrado ainda</p>
        </div>}

        {!isLoading && !error && passengers.length > 0 && filteredPassengers.length === 0 && <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
          <Search className="h-10 w-10 text-slate-200" />
          <p className="text-base font-semibold text-[#062A45]">Nenhum passageiro encontrado</p>
        </div>}

        {!isLoading && !error && filteredPassengers.length > 0 && <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50/40">{COLUMNS.map((column) => <th key={column} className={`py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 ${column === "Ações" ? "px-5 pl-7" : "px-5"}`}>{column}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-50">{paginatedPassengers.map((passenger, index) => <tr key={passenger.id} className={`transition-colors duration-150 hover:bg-blue-50/30 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
              <td className="whitespace-nowrap px-5 py-3.5"><span className="font-bold text-[#062A45]">{passenger.name}</span></td>
              <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{formatCpf(passenger.cpf)}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">{formatPassengerPhone(passenger.phone)}</td>
              <td className="whitespace-nowrap px-5 pl-7 py-3.5"><div className="flex items-center gap-1">
                <button type="button" onClick={() => navigate(`/passageiros/editar/${passenger.id}`)} aria-label={`Editar ${passenger.name}`} title="Editar passageiro" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45] cursor-pointer"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => setConfirmPassenger(passenger)} aria-label={`Excluir ${passenger.name}`} title="Excluir passageiro" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>)}</tbody>
          </table>
        </div>}

        {!isLoading && !error && filteredPassengers.length > 0 && <div className="mt-auto"><Pagination currentPage={displayedPage} totalPages={totalPages} totalItems={filteredPassengers.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} itemName="passageiro" /></div>}
      </div>

      <ConfirmDeleteModal passenger={confirmPassenger} isLoading={isDeleting} onConfirm={handleDelete} onCancel={() => { if (!isDeleting) setConfirmPassenger(null); }} />
    </div>
  );
}
