import axios from "axios";
import {
  ArrowLeft,
  Calendar1,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";

const CadastroFuncionario = ({ isEdicao = false }) => {
  const [funcao, setFuncao] = useState("");
  const [nivelAcesso, setNivelAcesso] = useState("");
  const [nome, setNome] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoria, setCategoria] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();
  const [isFetching, setIsFetching] = useState(isEdicao);

  const funcoes = [
    { value: "motorista", label: "Motorista" },
    { value: "admin", label: "Administrador" },
  ]; // valores mockados
  const navigate = useNavigate();

  const categoriasCnh = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "AB", label: "AB" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
    { value: "E", label: "E" },
  ];

  const niveisAcesso = [
    { value: "comum", label: "Comum" },
    { value: "admin", label: "Administrador (Admin)" },
  ];

  const dataAtual = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const carregarFuncionario = async () => {
      if (isEdicao && id) {
        try {
          const response = await axios.get(`/api/funcionarios/${id}`);
          const dados = response.data;

          setNome(dados.name || "");
          setAdmissao(dados.admissionDate || "");
          setTelefone(dados.cellphoneNumber || "");
          setFuncao(dados.position || "");
          setNivelAcesso(dados.userRole || "");
          setCnh(dados.cnhNumber || "");
          setCategoria(dados.cnhType || "");
          setEmail(dados.email || "");
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "Erro ao carregar os dados do funcionário.",
          );
          navigate("/funcionarios");
        } finally {
          setIsFetching(false);
        }
      }
    };

    carregarFuncionario();
  }, [isEdicao, id, navigate]);

  const isFormValid =
    nome.trim() != "" &&
    funcao != "" &&
    nivelAcesso !== "" &&
    (nivelAcesso === "admin" ? email.trim() !== "" : true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    const payload = {
      name: nome.trim(),
      admissionDate: admissao,
      cellphoneNumber: telefone,
      position: funcao,
      userRole: nivelAcesso,
      ...(funcao === "motorista" && {
        cnhNumber: cnh.trim(),
        cnhType: categoria,
      }),
      ...(email && { email: email.trim() }),
    };

    try {
      if (isEdicao) {
        await axios.put(`/api/funcionarios/${id}`, payload);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await axios.post("/api/funcionarios", payload);
        toast.success("Usuário cadastrado com sucesso!");
      }
      setTimeout(() => {
        navigate("/funcionarios");
      }, 1000);
    } catch (error) {
      toast.error(
        isEdicao ? "Erro ao atualizar usuário" : "Erro ao cadastrar usuário",
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
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center font-sans text-slate-500 gap-3">
        <Loader2 className="size-8 animate-spin text-[#062A45]" />
        <p>Carregando dados do colaborador...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="mb-4">
        <div className="flex items-start gap-4 flex-col">
          <Button
            variant="outline"
            onClick={() => navigate("/funcionarios")}
            className="gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold border border-slate-300 rounded-lg px-6 h-10 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#062A45] pb-1 border-b-[3.5px] border-[#e31e24] inline-block">
              {isEdicao ? "Edição" : "Cadastro"} de Usuário
            </h1>
          </div>
        </div>
      </div>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-8 py-5 items-center gap-3">
          <User className="h-5 w-5 text-[#e31e24]" />
          <h2 className="text-base font-medium text-[#062A45]">
            Informações do colaborador
          </h2>
        </div>
        <CardContent className="p-8">
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            id="form-funcionario"
          >
            <div>
              <GenericInput
                id="nome"
                placeholder="Nome do colaborador"
                label="Nome"
                labelColor="text-[#062A45]"
                icon={User}
                type="text"
                required
                onChange={(e) => setNome(e.target.value)}
                value={nome}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <GenericInput
                  id="admissao"
                  type="date"
                  max={dataAtual}
                  label="Admissão"
                  labelColor="text-[#062A45]"
                  icon={Calendar1}
                  onChange={(e) => setAdmissao(e.target.value)}
                  value={admissao}
                />
              </div>
              <div>
                <GenericInput
                  label="telefone"
                  id="telefone"
                  type="text"
                  icon={Phone}
                  placeholder="(44) 9 9999-9999"
                  labelColor="text-[#062A45]"
                  onChange={(e) => setTelefone(e.target.value)}
                  value={telefone}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  id="nivelAcesso"
                  label="Nível de Acesso"
                  required
                  value={nivelAcesso}
                  placeholder="Selecione o nível"
                  onChange={setNivelAcesso}
                  options={niveisAcesso}
                />
              </div>
            </div>
            {funcao === "motorista" && (
              <div className="grid  grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <GenericInput
                    id="cnh"
                    label="CNH"
                    type="text"
                    icon={CreditCard}
                    placeholder="Número da Habilitação"
                    labelColor="text-[#062A45]"
                    value={cnh}
                    onChange={(e) => setCnh(e.target.value)}
                  />
                </div>
                <div>
                  <GenericSelect
                    id="categoriaCNH"
                    label="Categoria"
                    labelColor="text-[#062A45]"
                    placeholder="Tipo"
                    options={categoriasCnh}
                    value={categoria}
                    onChange={setCategoria}
                  />
                </div>
              </div>
            )}
            <div>
              <GenericInput
                id="email"
                label="E-mail"
                labelColor="text-[#062A45]"
                type="email"
                icon={Mail}
                placeholder="usuario@marazul.com.br"
                required={nivelAcesso === "admin"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-2 text-[13px] italic text-slate-500">
                Obrigatório apenas para níveis administrativos.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-8 py-5">
          <Button
            className="bg-[#0A1A2F] text-white hover:bg-[#0A1A2F]/90 px-8 py-5 text-sm font-medium rounded-md normal-case tracking-normal cursor-pointer"
            type="submit"
            form="form-funcionario"
            disabled={!isFormValid || isLoading}
          >
            {" "}
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-5 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-5" />
                {isEdicao ? "Salvar Alterações" : "Salvar Usuário"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CadastroFuncionario;
