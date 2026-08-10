import { ArrowLeft, Phone, User } from "lucide-react";
import { useState } from "react";
import Input from "../../../components/Input";
import { Card, CardContent } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";

const CadastroFuncionario = ({ isEdicao = false }) => {
  const [funcao, setFuncao] = useState("");

  const dataAtual = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start gap-4">
          <button className="mt-1 flex items-center justify-center rounded-full p-1 hover:bg-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-[#062A45]">
            {isEdicao ? "Edição" : "Cadastro"} de Usuário
          </h1>
          <p>
            Preencha as informações abaixo para{" "}
            {isEdicao ? "editar o" : "cadastrar um novo"} usuário ou motorista.
          </p>
        </div>
      </div>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-8 py-5 items-center gap-3">
          <User className="h-5 w-5 text-[#e31e24]" />
          <h2 className="text-base font-medium text-[#062A45]">
            Informações do colaborador
          </h2>
        </div>
        <CardContent className="p-8">
          <form className="space-y-6">
            <div>
              <Input
                id="nome"
                placeholder="Nome do funcionário"
                label="Nome"
                labelColor="text-[#062A45]"
                icon={User}
                type="text"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Input
                  id="admissao"
                  type="date"
                  max={dataAtual}
                  label="Admissão"
                  labelColor="text-[#062A45]"
                />
              </div>
              <div>
                <Input
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
                <Label
                  htmlFor="funcao"
                  className="mb-2 block text-sm font-medium text-slate-700 normal-case tracking-normal"
                >
                  Função <span className="text-[#e31e24]">*</span>
                </Label>
                <select
                  id="funcao"
                  value={funcao}
                  onChange={(e) => setFuncao(e.target.value)}
                  required
                ></select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastroFuncionario;
