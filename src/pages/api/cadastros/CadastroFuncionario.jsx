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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../../../components/GenericInput";
import GenericSelect from "../../../components/GenericSelect";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../components/ui/card";

const CadastroFuncionario = ({ isEdicao = false, funcionarioId = null }) => {
  const [funcao, setFuncao] = useState("");
  const [nivelAcesso, setNivelAcesso] = useState("");
  const [nome, setNome] = useState("");
  const [admissao, setAdmissao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cnh, setCnh] = useState("");
  const [categoria, setCategoria] = useState("");
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);

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
      nome: nome.trim(),
      admissao: admissao,
      telefone: telefone,
      funcao: funcao,
      nivelAcesso: nivelAcesso,
      ...(funcao === "motorista" && { cnh: cnh.trim(), categoria }),
      ...(email && { email: email.trim() }),
    };

    try {
      if (isEdicao) {
        await axios.put(`/api/funcionario/${funcionarioId}`, payload);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await axios.post("/api/funcionario", payload);
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
