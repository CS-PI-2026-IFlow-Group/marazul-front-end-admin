import {
  ArrowLeft,
  Calendar1,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import FuncionarioService from "../../services/FuncionarioService";
import PerfilService from "../../services/PerfilService";

// Celular: DDD (2 dígitos) + 9 + 8 dígitos
const TELEFONE_REGEX = /^\d{2}9\d{8}$/;

function formatTelefone(raw) {
  const digits = String(raw ?? "")
    .replace(/\D/g, "")
    .slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const CadastroFuncionario = ({ isEdicao = false }) => {
  const [funcao, setFuncao] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [perfilId, setPerfilId] = useState("");
  const [nome, setNome] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoria, setCategoria] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  const [funcoes, setFuncoes] = useState([]);
  const [categoriasCnh, setCategoriasCnh] = useState([]);
  const [perfis, setPerfis] = useState([]);

  const dataAtual = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [enums, perfisOptions] = await Promise.all([
          FuncionarioService.getEnums(),
          PerfilService.getOptions().catch(() => {
            toast.error("Não foi possível carregar os perfis de acesso.");
            return [];
          }),
        ]);
        setFuncoes(enums.positions);
        setCategoriasCnh(enums.cnhCategories);
        setPerfis(perfisOptions);

        if (isEdicao && id) {
          const dados = await FuncionarioService.getById(id);
          setNome(dados.name || "");
          setAdmissao(dados.admissionDate || "");
          setTelefone(formatTelefone(dados.cellphoneNumber));
          setFuncao(dados.position || "");
          setIsUser(dados.isUser === true);
          setPerfilId(FuncionarioService.getPerfilId(dados));
          setCnh(dados.cnhNumber || "");
          setCategoria(dados.cnhType || "");
          setEmail(dados.email || "");
          setStatus(dados.status || "ACTIVE");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Erro ao carregar os dados iniciais.",
        );
        if (isEdicao) navigate("/funcionario");
      } finally {
        setIsFetching(false);
      }
    };

    carregarDadosIniciais();
  }, [isEdicao, id, navigate]);

  const telefoneDigits = telefone.replace(/\D/g, "");
  const telefoneValido =
    telefoneDigits.length === 0 || TELEFONE_REGEX.test(telefoneDigits);
  const telefoneTemErro = !telefoneValido;

  const handleTelefoneChange = (e) => {
    setTelefone(formatTelefone(e.target.value));
  };

  const isFormValid =
    nome.trim() !== "" &&
    telefoneValido &&
    funcao !== "" &&
    perfilId !== "" &&
    (isUser ? email.trim() !== "" : true) &&
    (funcao === "DRIVER" ? cnh.trim() !== "" && categoria !== "" : true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    const payload = {
      name: nome.trim(),
      admissionDate: admissao,
      cellphoneNumber: telefone,
      position: funcao,
      isUser,
      ...FuncionarioService.buildPerfilPayload(perfilId),
      status,
      ...(funcao === "DRIVER" && {
        cnhNumber: cnh.trim(),
        cnhType: categoria,
      }),
      ...(isUser && email.trim() && { email: email.trim() }),
    };

    try {
      if (isEdicao) {
        await FuncionarioService.update(id, payload);
        toast.success("Colaborador atualizado com sucesso!");
      } else {
        await FuncionarioService.create(payload);
        toast.success("Colaborador cadastrado com sucesso!");
      }
      setTimeout(() => {
        navigate("/funcionario");
      }, 1000);
    } catch (error) {
      toast.error(
        isEdicao
          ? "Erro ao atualizar colaborador"
          : "Erro ao cadastrar colaborador",
        {
          description:
            error.response?.data?.message ||
            "Ocorreu um erro ao salvar os dados. Tente novamente.",
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-[calc(100svh-8rem)] flex-col items-center justify-center font-sans text-slate-500 gap-3">
        <Loader2 className="size-8 animate-spin text-[#062A45]" />
        <p>Carregando dados do colaborador...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <div className="flex items-start gap-2 flex-col-reverse">
          <div>
            <h1 className="text-xl font-semibold text-slate-700">
              {isEdicao ? "Edição" : "Cadastro"} do Colaborador
            </h1>
          </div>
        </div>
      </div>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden py-1 gap-0">
        <div className="flex border-b border-slate-100 px-6 py-3 items-center gap-3">
          <User className="h-4 w-4 text-[#e31e24]" />
          <h2 className="text-sm font-medium text-[#062A45]">
            Informações do colaborador
          </h2>
        </div>

        <CardContent className="px-6 py-4">
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
            id="form-funcionario"
          >
            <div>
              <GenericInput
                id="nome"
                placeholder="Nome do colaborador"
                label="Nome"
                labelColor="#062A45"
                icon={User}
                type="text"
                required
                onChange={(e) => setNome(e.target.value)}
                value={nome}
              />
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div>
                <GenericInput
                  id="admissao"
                  type="date"
                  max={dataAtual}
                  label="Admissão"
                  labelColor="#062A45"
                  icon={Calendar1}
                  onChange={(e) => setAdmissao(e.target.value)}
                  value={admissao}
                />
              </div>
              <div>
                <GenericInput
                  label="Telefone"
                  id="telefone"
                  type="text"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={15}
                  icon={Phone}
                  placeholder="(44) 99999-9999"
                  labelColor="#062A45"
                  onChange={handleTelefoneChange}
                  value={telefone}
                  hasError={telefoneTemErro}
                  errorMessage="Informe um celular válido no formato (XX) 9XXXX-XXXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div>
                <GenericSelect
                  id="funcao"
                  label="Função"
                  required
                  value={funcao}
                  placeholder="Selecione uma função"
                  onChange={setFuncao}
                  options={funcoes}
                />
              </div>
              <div>
                <GenericSelect
                  id="perfil"
                  label="Perfil de Acesso"
                  icon={ShieldCheck}
                  required
                  value={perfilId}
                  placeholder={
                    perfis.length > 0
                      ? "Selecione um perfil"
                      : "Nenhum perfil disponível"
                  }
                  onChange={setPerfilId}
                  options={perfis}
                />
              </div>
            </div>
            {funcao === "DRIVER" && (
              <div className="grid  grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                <div>
                  <GenericInput
                    id="cnh"
                    label="CNH"
                    type="text"
                    icon={CreditCard}
                    placeholder="Número da Habilitação"
                    labelColor="#062A45"
                    value={cnh}
                    onChange={(e) => setCnh(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <GenericSelect
                    id="categoriaCNH"
                    label="Categoria"
                    labelColor="#062A45"
                    placeholder="Tipo"
                    options={categoriasCnh}
                    value={categoria}
                    onChange={setCategoria}
                    required
                  />
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-[#F8FAFC] px-4 py-3">
              <Checkbox
                id="isUser"
                checked={isUser}
                onCheckedChange={(checked) => setIsUser(checked === true)}
                className="mt-0.5 rounded-[4px] border-slate-300 bg-white cursor-pointer data-[state=checked]:border-[#062A45] data-[state=checked]:bg-[#062A45] data-[state=checked]:text-white"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="isUser"
                  className="cursor-pointer text-sm font-medium normal-case tracking-normal text-[#062A45]"
                >
                  Permitir acesso ao sistema?
                </Label>
                <p className="text-[13px] text-slate-500">
                  Marque para que o colaborador possa fazer login no sistema.
                </p>
              </div>
            </div>
            <div>
              <GenericInput
                id="email"
                label="E-mail"
                labelColor="#062A45"
                type="email"
                icon={Mail}
                placeholder="usuario@marazul.com.br"
                required={isUser}
                disabled={!isUser}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <Button
            variant="outline"
            onClick={() => navigate("/funcionario")}
            className="h-9 gap-2 rounded-md border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button
            className="flex items-center gap-2 rounded-md bg-[#0A1A2F] px-6 py-4 text-sm font-medium normal-case tracking-normal text-white transition-colors hover:bg-[#0A1A2F]/90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-100 disabled:hover:bg-slate-300 cursor-pointer"
            type="submit"
            form="form-funcionario"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                {isEdicao ? "Salvar Alterações" : "Salvar Colaborador"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CadastroFuncionario;
