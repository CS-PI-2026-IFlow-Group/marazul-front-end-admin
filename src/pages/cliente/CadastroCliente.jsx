import { ArrowLeft, Contact } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import {
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
} from "../../lib/documentMasks";

const PERSON_TYPE_OPTIONS = [
  { value: "PF", label: "Pessoa Física" },
  { value: "PJ", label: "Pessoa Jurídica" },
];

const DOCUMENT_CONFIG = {
  PF: {
    label: "CPF",
    placeholder: "000.000.000-00",
    maxLength: 14,
    format: formatCpf,
    validate: isValidCpf,
    errorMessage: "Informe um CPF válido",
  },
  PJ: {
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    maxLength: 18,
    format: formatCnpj,
    validate: isValidCnpj,
    errorMessage: "Informe um CNPJ válido",
  },
};

export default function CadastroCliente({ isEdicao = false }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    personType: "PF",
    document: "",
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePersonTypeChange = (value) => {
    setForm((prev) =>
      prev.personType === value
        ? prev
        : { ...prev, personType: value, document: "" },
    );
  };

  const handleDocumentChange = (e) => {
    const { format } = DOCUMENT_CONFIG[form.personType];
    setForm((prev) => ({ ...prev, document: format(e.target.value) }));
  };

  const documentConfig = DOCUMENT_CONFIG[form.personType];

  const nomeValido = form.name.trim().length > 0;
  const nomeTemErro = form.name.length > 0 && !nomeValido;

  const documentoValido = documentConfig.validate(form.document);
  const documentoCompleto = form.document.length === documentConfig.maxLength;
  const documentoTemErro = documentoCompleto && !documentoValido;

  return (
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <div className="flex items-start gap-2 flex-col-reverse">
          <div>
            <h1 className="text-xl font-semibold text-slate-700">
              {isEdicao ? "Edição de Cliente" : "Cadastro de Cliente"}
            </h1>
          </div>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden py-1 gap-0">
        <div className="flex border-b border-slate-100 px-6 py-3 items-center gap-3">
          <Contact className="h-4 w-4 text-[#e31e24]" />
          <h2 className="text-sm font-medium text-[#062A45]">
            Dados do Cliente
          </h2>
        </div>

        <form id="form-cliente">
          <CardContent className="px-6 py-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <GenericInput
                  id="name"
                  label="NOME"
                  labelColor="#062A45"
                  type="text"
                  placeholder="Ex: Maria da Silva"
                  required
                  value={form.name}
                  onChange={handleChange("name")}
                  hasError={nomeTemErro}
                  errorMessage="O nome não pode conter apenas espaços"
                />
              </div>

              <GenericSelect
                id="personType"
                label="TIPO DE PESSOA"
                labelColor="#062A45"
                required
                value={form.personType}
                onChange={handlePersonTypeChange}
                options={PERSON_TYPE_OPTIONS}
                placeholder="Selecione o tipo de pessoa"
              />

              <GenericInput
                id="document"
                label={documentConfig.label}
                labelColor="#062A45"
                type="text"
                inputMode="numeric"
                placeholder={documentConfig.placeholder}
                maxLength={documentConfig.maxLength}
                required
                value={form.document}
                onChange={handleDocumentChange}
                hasError={documentoTemErro}
                errorMessage={documentConfig.errorMessage}
              />
            </div>
          </CardContent>
        </form>

        <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
          <Button
            variant="outline"
            onClick={() => navigate("/clientes")}
            className="h-9 gap-2 rounded-md border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
