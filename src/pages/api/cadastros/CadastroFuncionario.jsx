import {
  ArrowLeft,
  Calendar1,
  CreditCard,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useState } from "react";
// import useNavigate from "react-router-dom";
import GenericInput from "../../../components/GenericInput";
import GenericSelect from "../../../components/GenericSelect";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../../components/ui/card";

const CadastroFuncionario = ({ isEdicao = false }) => {
  const [funcao, setFuncao] = useState("");
  const [nivelAcesso, setNivelAcesso] = useState("");
  const funcoes = [
    { value: "motorista", label: "Motorista" },
    { value: "admin", label: "Administrador" },
  ]; // valores mockados
  // const navigate = useNavigate();

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

  const dataAtual = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="mb-4">
        <div className="flex items-start gap-4 flex-col">
          <Button
            variant="outline"
            // onClick={() => navigate("/funcionarios")}
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
          <form className="space-y-6">
            <div>
              <GenericInput
                id="nome"
                placeholder="Nome do colaborador"
                label="Nome"
                labelColor="text-[#062A45]"
                icon={User}
                type="text"
                required
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
                  />
                </div>
                <div>
                  <GenericSelect
                    id="categoriaCNH"
                    label="Categoria"
                    labelColor="text-[#062A45]"
                    placeholder="Tipo"
                    options={categoriasCnh}
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
              />
              <p className="mt-2 text-[13px] italic text-slate-500">
                Obrigatório apenas para níveis administrativos.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-8 py-5">
          <Button className="bg-[#0A1A2F] text-white hover:bg-[#0A1A2F]/90 px-8 py-5 text-sm font-medium rounded-md normal-case tracking-normal cursor-pointer">
            <Save className="size-4 mr-1" />
            {isEdicao ? "Salvar Alterações" : "Salvar Usuário"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CadastroFuncionario;
