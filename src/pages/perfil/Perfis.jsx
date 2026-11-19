import {
  AlertCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Pagination from "../../components/Pagination";
import LoadingIndicator from "../../components/LoadingIndicator";
import EmptyState from "../../components/EmptyState";
import PerfilService from "../../services/PerfilService";
import { usePageTitle } from "../../hooks/usePageTitle";

const ITEMS_PER_PAGE = 8;

function ConfirmDeleteModal({ profile, isLoading, onConfirm, onCancel }) {
  if (!profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Fechar confirmação"
        onClick={onCancel}
        disabled={isLoading}
        className="absolute inset-0 cursor-pointer bg-black/40 backdrop-blur-sm disabled:cursor-not-allowed"
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-100 bg-white p-5 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Fechar confirmação"
          className="absolute right-4 top-4 cursor-pointer rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2
              id="confirm-delete-title"
              className="text-xl font-bold text-[#062A45]"
            >
              Excluir perfil
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Deseja realmente excluir o perfil{" "}
              <span className="font-semibold text-[#062A45]">
                {profile.name ?? profile.nome}
              </span>
              ?
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Esta ação não poderá ser desfeita.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 w-full flex-1 cursor-pointer rounded-lg text-sm font-semibold disabled:cursor-not-allowed md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 w-full flex-1 cursor-pointer rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed md:w-auto"
          >
            {isLoading ? (
              <>
                <LoadingIndicator variant="button" label="Excluindo..." />
              </>
            ) : (
              "Confirmar exclusão"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function Perfis() {
  usePageTitle("Perfis de Acesso");
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    PerfilService.getAll()
      .then((data) => {
        if (active) setProfiles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar a lista de perfis.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [retryCount]);

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const filteredProfiles = useMemo(
    () =>
      profiles.filter((profile) =>
        String(profile.name ?? profile.nome ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch),
      ),
    [profiles, normalizedSearch],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE),
  );
  const displayedPage = Math.min(currentPage, totalPages);
  const paginatedProfiles = useMemo(() => {
    const startIndex = (displayedPage - 1) * ITEMS_PER_PAGE;
    return filteredProfiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProfiles, displayedPage]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setRetryCount((count) => count + 1);
  };

  const handleDelete = async () => {
    if (!profileToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await PerfilService.delete(profileToDelete.id);
      setProfiles((current) =>
        current.filter((profile) => profile.id !== profileToDelete.id),
      );
      const remainingProfiles = filteredProfiles.length - 1;
      const remainingPages = Math.max(
        1,
        Math.ceil(remainingProfiles / ITEMS_PER_PAGE),
      );
      setCurrentPage((page) => Math.min(page, remainingPages));
      toast.success("Perfil excluído com sucesso!");
    } catch (requestError) {
      const status = requestError.response?.status;
      const data = requestError.response?.data;

      if (status === 400) {
        toast.error(
          data?.message || data?.erro || "Não foi possível excluir este perfil.",
        );
      } else if (status === 404) {
        toast.warning("Perfil não encontrado", {
          description: "O perfil já foi removido. A listagem foi atualizada.",
        });
        handleRetry();
      } else {
        toast.error("Erro ao excluir perfil", {
          description: "Ocorreu um problema. Tente novamente.",
        });
      }
    } finally {
      setIsDeleting(false);
      setProfileToDelete(null);
    }
  };

  const columns = ["Nome do Perfil", "Permissões", "Ações"];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#062A45]">Perfis de Acesso</h1>
        <Button
          type="button"
          onClick={() => navigate("/perfis/cadastro")}
          className="h-11 w-full cursor-pointer gap-2 rounded-lg bg-[#062A45] px-6 font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0a1f35] hover:shadow-md md:w-auto"
        >
          <Plus className="h-4 w-4" /> Novo Perfil
        </Button>
      </div>

      <section className="relative flex min-h-[480px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 rounded-t-xl border-b border-slate-100 bg-slate-50/60 px-4 py-4 md:flex-row md:items-center md:justify-between sm:px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#062A45]">
              Listagem de Perfis
            </h2>
            {!isLoading && !error && (
              <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
                {filteredProfiles.length}
              </span>
            )}
          </div>
          {!isLoading && !error && profiles.length > 0 && (
            <div className="relative w-full md:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="search-perfis"
                aria-label="Buscar perfis pelo nome"
                placeholder="Buscar perfil..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 rounded-lg border-slate-200 bg-white pl-9 text-xs shadow-none focus-visible:border-[#062A45] focus-visible:ring-[#062A45]/20"
              />
            </div>
          )}
        </div>

        {isLoading && <LoadingIndicator label={"Carregando perfis..."} />}

        {!isLoading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="max-w-xs text-center">
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <p className="mt-1 text-xs text-red-400">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleRetry}
              className="mt-1 cursor-pointer gap-2 rounded-lg border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <RefreshCw className="h-4 w-4" /> Tentar novamente
            </Button>
          </div>
        )}

        {!isLoading && !error && profiles.length === 0 && <EmptyState icon={ShieldCheck} title={"Nenhum perfil cadastrado ainda"} description={"Cadastre o primeiro perfil de acesso."} action={<Button type={"button"} onClick={() => navigate("/perfis/cadastro")}><Plus className={"mr-2 size-4"}/>Novo perfil</Button>} />}

        {!isLoading && !error && profiles.length > 0 && filteredProfiles.length === 0 && <EmptyState title={"Nenhum perfil encontrado"} description={"Tente ajustar ou limpar a busca."} action={<Button type={"button"} variant={"outline"} onClick={() => setSearchTerm("")}>Limpar busca</Button>} />}

        {!isLoading && !error && filteredProfiles.length > 0 && (
          <div className="hidden flex-1 overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400 ${
                        column === "Ações" ? "pl-7" : ""
                      }`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedProfiles.map((profile, index) => {
                  const name = profile.name ?? profile.nome ?? "Perfil sem nome";
                  const permissionCount = Array.isArray(profile.permissions)
                    ? profile.permissions.length
                    : 0;
                  const isSystemProfile =
                    name.toLocaleLowerCase("pt-BR") === "administrador";

                  return (
                    <tr
                      key={profile.id}
                      className={`transition-colors duration-150 hover:bg-blue-50/30 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#062A45]">{name}</span>
                          {isSystemProfile && (
                            <span className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              Padrão do sistema
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600">
                        <span className="font-semibold text-[#062A45]">
                          {permissionCount}
                        </span>{" "}
                        <span className="text-slate-500">
                          {permissionCount === 1 ? "permissão" : "permissões"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 pl-7">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/perfis/editar/${profile.id}`)
                          }
                          title="Editar perfil"
                          aria-label={`Editar perfil ${name}`}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfileToDelete(profile)}
                          disabled={isSystemProfile}
                          title={
                            isSystemProfile
                              ? "O perfil padrão não pode ser excluído"
                              : "Excluir perfil"
                          }
                          aria-label={`Excluir perfil ${name}`}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && filteredProfiles.length > 0 && <div className="space-y-3 p-4 md:hidden">{paginatedProfiles.map((profile) => { const name = profile.name ?? profile.nome ?? "Perfil sem nome"; const permissionCount = Array.isArray(profile.permissions) ? profile.permissions.length : 0; const isSystemProfile = name.toLocaleLowerCase("pt-BR") === "administrador"; return <article key={profile.id} className="rounded-lg border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="break-words font-semibold text-[#062A45]">{name}</h3>{isSystemProfile && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">Padrão do sistema</span>}</div><p className="mt-2 text-sm text-slate-600">{permissionCount} {permissionCount === 1 ? "permissão" : "permissões"}</p><div className="mt-3 flex items-center gap-1"><button type="button" title="Editar perfil" aria-label="Editar perfil" onClick={() => navigate("/perfis/editar/" + profile.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-150 hover:bg-[#062A45]/10 hover:text-[#062A45]"><Pencil className="h-4 w-4" /></button><button type="button" title={isSystemProfile ? "Perfil padrão do sistema" : "Excluir perfil"} aria-label="Excluir perfil" disabled={isSystemProfile} onClick={() => setProfileToDelete(profile)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div></article>; })}</div>}

        {!isLoading && !error && filteredProfiles.length > 0 && (
          <div className="mt-auto">
            <Pagination
              currentPage={displayedPage}
              totalPages={totalPages}
              totalItems={filteredProfiles.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
              itemName="perfil"
              itemNamePlural="perfis"
            />
          </div>
        )}

      </section>
      <ConfirmDeleteModal
        profile={profileToDelete}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!isDeleting) setProfileToDelete(null);
        }}
      />
    </div>
  );
}
