import {
  Calendar1,
  CreditCard,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import FormFooter from "../../components/FormFooter";
import FormSection from "../../components/FormSection";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import { Card } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import FuncionarioService from "../../services/FuncionarioService";
import PerfilService from "../../services/PerfilService";
import { usePageTitle } from "../../hooks/usePageTitle";

const TELEFONE_REGEX = /^\d{2}9\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  usePageTitle(isEdicao ? "Edição de Colaborador" : "Cadastro de Colaborador");
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

  const emailFormatoValido = EMAIL_REGEX.test(email.trim());
  const emailValido = !isUser || emailFormatoValido;
  const emailTemErro = isUser && email.trim() !== "" && !emailFormatoValido;

  const handleTelefoneChange = (e) => {
    setTelefone(formatTelefone(e.target.value));
  };

  const isFormValid =
    nome.trim() !== "" &&
    telefoneValido &&
    funcao !== "" &&
    perfilId !== "" &&
    emailValido &&
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
      navigate("/funcionario");
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
      <LoadingIndicator
        label="Carregando dados do colaborador..."
        className="min-h-[calc(100svh-8rem)] py-0"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={isEdicao ? "Edição de colaborador" : "Cadastro de colaborador"}
      />

      <Card className="gap-0 py-0">
        <form onSubmit={handleSubmit} id="form-funcionario">
          <div className="divide-y">
            <FormSection icon={User} title="Dados pessoais">
              <div className="sm:col-span-2">
                <GenericInput
                  id="nome"
                  placeholder="Nome do colaborador"
                  label="Nome"
                  icon={User}
                  type="text"
                  required
                  onChange={(e) => setNome(e.target.value)}
                  value={nome}
                />
              </div>

              <GenericInput
                id="admissao"
                type="date"
                max={dataAtual}
                label="Admissão"
                icon={Calendar1}
                onChange={(e) => setAdmissao(e.target.value)}
                value={admissao}
              />

              <GenericInput
                label="Telefone"
                id="telefone"
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                icon={Phone}
                placeholder="(44) 99999-9999"
                onChange={handleTelefoneChange}
                value={telefone}
                hasError={telefoneTemErro}
                errorMessage="Informe um celular válido no formato (XX) 9XXXX-XXXX"
              />

              <GenericSelect
                id="funcao"
                label="Função"
                required
                value={funcao}
                placeholder="Selecione uma função"
                onChange={setFuncao}
                options={funcoes}
              />

              {funcao === "DRIVER" && (
                <>
                  <GenericInput
                    id="cnh"
                    label="CNH"
                    type="text"
                    icon={CreditCard}
                    placeholder="Número da Habilitação"
                    value={cnh}
                    onChange={(e) => setCnh(e.target.value)}
                    required
                  />
                  <GenericSelect
                    id="categoriaCNH"
                    label="Categoria"
                    placeholder="Tipo"
                    options={categoriasCnh}
                    value={categoria}
                    onChange={setCategoria}
                    required
                  />
                </>
              )}
            </FormSection>

            <FormSection
              icon={KeyRound}
              title="Acesso ao sistema"
              description="Defina se o colaborador poderá fazer login."
            >
              <GenericSelect
                id="perfil"
                label="Perfil de acesso"
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

              <GenericInput
                id="email"
                label="E-mail"
                type="email"
                icon={Mail}
                placeholder="usuario@marazul.com.br"
                required={isUser}
                disabled={!isUser}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hasError={emailTemErro}
                errorMessage="Informe um e-mail válido"
              />

              <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4 sm:col-span-2">
                <Checkbox
                  id="isUser"
                  checked={isUser}
                  onCheckedChange={(checked) => setIsUser(checked === true)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="isUser" className="cursor-pointer">
                    Permitir acesso ao sistema?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Marque para que o colaborador possa fazer login no sistema.
                  </p>
                </div>
              </div>
            </FormSection>
          </div>
        </form>

        <FormFooter
          formId="form-funcionario"
          onBack={() => navigate("/funcionario")}
          isSaving={isLoading}
          isDisabled={!isFormValid}
          saveLabel={isEdicao ? "Salvar Alterações" : "Salvar colaborador"}
        />
      </Card>
    </div>
  );
};

export default CadastroFuncionario;
