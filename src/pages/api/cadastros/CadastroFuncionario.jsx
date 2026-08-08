import { ArrowLeft } from "lucide-react";

const CadastroFuncionario = ({ isEdicao = false }) => {
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
        </div>
      </div>
    </div>
  );
};

export default CadastroFuncionario;
