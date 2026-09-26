import { ArrowLeft, Loader2, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../../components/GenericInput";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import PerfilService from "../../services/PerfilService";

const CadastroPerfil = ({ isEdicao = false }) => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [permissoes, setPermissoes] = useState([]);
  const [permissoesCarregadas, setPermissoesCarregadas] = useState(false);
  const [erroPermissoes, setErroPermissoes] = useState(false);
  const [tentativaCarregamento, setTentativaCarregamento] = useState(0);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState(
    () => new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdicao) return;

    let active = true;

    PerfilService.getPermissoes()
      .then((data) => {
        if (active) setPermissoes(data);
      })
      .catch(() => {
        if (active) setErroPermissoes(true);
      })
      .finally(() => {
        if (active) setPermissoesCarregadas(true);
      });

    return () => {
      active = false;
    };
  }, [isEdicao, tentativaCarregamento]);

  const permissoesPorModulo = useMemo(
    () =>
      permissoes.reduce((grupos, permissao) => {
        const modulo = permissao.rotaBase || "Outros";
        grupos[modulo] ??= [];
        grupos[modulo].push(permissao);
        return grupos;
      }, {}),
    [permissoes],
  );

  const nomeValido = nome.trim() !== "";
  const isFormValid =
    nomeValido &&
    permissoesSelecionadas.size > 0 &&
    permissoesCarregadas &&
    !erroPermissoes;

  const togglePermissao = (id) => {
    setPermissoesSelecionadas((atuais) => {
      const atualizadas = new Set(atuais);
      const permissaoId = String(id);
      if (atualizadas.has(permissaoId)) atualizadas.delete(permissaoId);
      else atualizadas.add(permissaoId);
      return atualizadas;
    });
  };

  const toggleModulo = (permissoesDoModulo, checked) => {
    setPermissoesSelecionadas((atuais) => {
      const atualizadas = new Set(atuais);
      permissoesDoModulo.forEach(({ id }) => {
        if (checked) atualizadas.add(String(id));
        else atualizadas.delete(String(id));
      });
      return atualizadas;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isEdicao || !isFormValid || isSaving) return;

    setIsSaving(true);
    try {
      await PerfilService.create({
        nome: nome.trim(),
        permissionsIds: Array.from(permissoesSelecionadas),
      });
      toast.success("Perfil cadastrado com sucesso!");
      navigate("/perfis");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 400) {
        toast.error(
          data?.message || data?.erro || "Não foi possível cadastrar o perfil.",
        );
      } else {
        toast.error("Erro ao cadastrar perfil", {
          description: "Ocorreu um problema ao salvar os dados. Tente novamente.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdicao) {
    return (
      <div className="bg-slate-50/50 font-sans">
        <div className="mb-3">
          <h1 className="text-xl font-semibold text-slate-700">Edição do Perfil</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-slate-700">
          {isEdicao ? "Edição" : "Cadastro"} do Perfil
        </h1>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden py-1 gap-0">
        <div className="flex border-b border-slate-100 px-6 py-3 items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-[#e31e24]" />
          <h2 className="text-sm font-medium text-[#062A45]">
            Informações do perfil
          </h2>
        </div>

        <CardContent className="px-6 py-4">
          <form id="form-perfil" onSubmit={handleSubmit} className="space-y-5">
            <GenericInput
              id="nome-perfil"
              label="NOME DO PERFIL"
              labelColor="#062A45"
              type="text"
              placeholder="Ex: Atendimento"
              required
              value={nome}
              onChange={(event) => setNome(event.target.value)}
            />

            <section aria-labelledby="permissoes-heading" className="space-y-3">
              <div>
                <h3
                  id="permissoes-heading"
                  className="text-[11px] font-bold tracking-wider text-[#062A45]"
                >
                  PERMISSÕES <span className="text-[#e31e24]">*</span>
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Selecione ao menos uma permissão para este perfil.
                </p>
              </div>

              {!permissoesCarregadas ? (
                <div
                  className="flex min-h-24 items-center justify-center gap-2 rounded-md border border-slate-200 bg-[#F8FAFC] text-sm text-slate-500"
                  role="status"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando permissões...
                </div>
              ) : erroPermissoes ? (
                <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-center">
                  <p className="text-sm text-red-700">
                    Não foi possível carregar as permissões.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPermissoesCarregadas(false);
                      setErroPermissoes(false);
                      setTentativaCarregamento((tentativa) => tentativa + 1);
                    }}
                    className="h-8 gap-2 rounded-md border-red-200 bg-white px-3 text-xs text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
                  </Button>
                </div>
              ) : permissoes.length === 0 ? (
                <p className="rounded-md border border-slate-200 bg-[#F8FAFC] p-4 text-sm text-slate-500">
                  Nenhuma permissão disponível.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(permissoesPorModulo).map(
                    ([modulo, permissoesDoModulo]) => {
                      const selecionadasNoModulo = permissoesDoModulo.filter(
                        ({ id }) => permissoesSelecionadas.has(String(id)),
                      ).length;
                      const todasSelecionadas =
                        selecionadasNoModulo === permissoesDoModulo.length;

                      return (
                        <fieldset
                          key={modulo}
                          className="rounded-md border border-slate-200 px-4 py-3"
                        >
                          <legend className="px-1 text-sm font-semibold text-[#062A45]">
                            {modulo}
                          </legend>
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Checkbox
                              id={`modulo-${modulo}`}
                              checked={
                                todasSelecionadas
                                  ? true
                                  : selecionadasNoModulo > 0
                                    ? "indeterminate"
                                    : false
                              }
                              onCheckedChange={(checked) =>
                                toggleModulo(permissoesDoModulo, checked === true)
                              }
                              className="border-slate-300 data-[state=checked]:bg-[#062A45]"
                            />
                            <Label
                              htmlFor={`modulo-${modulo}`}
                              className="cursor-pointer text-sm font-medium text-slate-700"
                            >
                              Selecionar todas
                            </Label>
                          </div>
                          <div className="grid grid-cols-1 gap-x-6 gap-y-3 pt-3 sm:grid-cols-2">
                            {permissoesDoModulo.map((permissao) => (
                              <div
                                key={permissao.id}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  id={`permissao-${permissao.id}`}
                                  checked={permissoesSelecionadas.has(
                                    String(permissao.id),
                                  )}
                                  onCheckedChange={() =>
                                    togglePermissao(permissao.id)
                                  }
                                  className="border-slate-300 data-[state=checked]:bg-[#062A45]"
                                />
                                <Label
                                  htmlFor={`permissao-${permissao.id}`}
                                  className="cursor-pointer text-sm font-normal text-slate-600"
                                >
                                  {permissao.funcionalidade}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </fieldset>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/perfis")}
            className="h-9 gap-2 rounded-md border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button
            type="submit"
            form="form-perfil"
            disabled={!isFormValid || isSaving}
            className="flex items-center gap-2 rounded-md bg-[#0A1A2F] px-6 py-4 text-sm font-medium normal-case tracking-normal text-white transition-colors hover:bg-[#0A1A2F]/90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-100 disabled:hover:bg-slate-300"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" /> Salvar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CadastroPerfil;
