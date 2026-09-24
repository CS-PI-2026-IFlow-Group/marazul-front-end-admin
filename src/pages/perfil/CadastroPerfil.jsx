const CadastroPerfil = ({ isEdicao = false }) => {
  return (
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-slate-700">
          {isEdicao ? "Edição" : "Cadastro"} do Perfil
        </h1>
      </div>
    </div>
  );
};

export default CadastroPerfil;
