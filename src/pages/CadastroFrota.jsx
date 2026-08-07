import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const MARCAS = ["MARCOPOLO", "COMIL", "IRIZAR_BRASIL", "BUSSCAR"];
const TIPOS = ["DD", "LD"];
const STATUS_OPTIONS = ["ATIVO", "INATIVO", "MANUTENCAO"];

// Labels legíveis para exibição
const MARCA_LABELS = {
  MARCOPOLO: "Marcopolo",
  COMIL: "Comil",
  IRIZAR_BRASIL: "Irizar Brasil",
  BUSSCAR: "Busscar",
};

const STATUS_LABELS = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  MANUTENCAO: "Manutenção",
};

// Aceita formato antigo (ABC-1234) e Mercosul (ABC1D23)
const PLACA_REGEX = /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;

/**
 * Formata o valor digitado aplicando máscara de placa.
 * - Remove caracteres inválidos e converte para maiúsculo.
 * - Insere hífen automaticamente no formato antigo (ABC-1234).
 */
function formatPlaca(raw) {
  const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);

  // Formato antigo: 3 letras + 4 dígitos → insere hífen
  if (clean.length > 3 && /^[A-Z]{3}\d+$/.test(clean)) {
    return clean.slice(0, 3) + "-" + clean.slice(3);
  }

  return clean;
}

export default function CadastroFrota() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    prefixo: "",
    placa: "",
    marca: "MARCOPOLO",
    anoFabricacao: "",
    tipo: "DD",
    quantidadeAssentos: "",
    status: "ATIVO",
    dataVistoria: "",
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePlacaChange = (e) => {
    setForm((prev) => ({ ...prev, placa: formatPlaca(e.target.value) }));
  };

  const handleSelectChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validação: placa só é validada se o usuário já digitou algo
  const placaValida = PLACA_REGEX.test(form.placa.replace("-", ""));
  const placaTemErro = form.placa.length > 0 && !placaValida;

  // Todos os campos obrigatórios preenchidos + placa válida
  const isFormValid =
    form.prefixo.trim() !== "" &&
    placaValida &&
    form.anoFabricacao !== "" &&
    form.quantidadeAssentos !== "" &&
    form.marca !== "" &&
    form.tipo !== "" &&
    form.status !== "";

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#062A45]">
          Cadastro de Novo Veículo
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("/frota")}
          className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#062A45] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>

      {/* Card do formulário */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <form className="space-y-6">
          {/* Grid 2 colunas */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Prefixo */}
            <div className="space-y-2">
              <Label
                htmlFor="prefixo"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider"
              >
                PREFIXO
              </Label>
              <Input
                id="prefixo"
                type="text"
                value={form.prefixo}
                onChange={handleChange("prefixo")}
                className="bg-[#F8FAFC] h-11 text-sm border-slate-200 focus-visible:ring-slate-300"
              />
            </div>

            {/* Placa */}
            <div className="space-y-2">
              <Label
                htmlFor="placa"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider"
              >
                PLACA
              </Label>
              <Input
                id="placa"
                type="text"
                placeholder="ABC-1234"
                maxLength={8}
                value={form.placa}
                onChange={handlePlacaChange}
                className={`bg-[#F8FAFC] h-11 text-sm uppercase ${
                  placaTemErro
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-slate-200 focus-visible:ring-slate-300"
                }`}
              />
              {placaTemErro && (
                <p className="text-xs font-medium text-red-500 -mt-1">
                  Formato inválido. Use ABC-1234 ou ABC1D23
                </p>
              )}
            </div>

            {/* Ano de Fabricação */}
            <div className="space-y-2">
              <Label
                htmlFor="anoFabricacao"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider"
              >
                ANO DE FABRICAÇÃO
              </Label>
              <Input
                id="anoFabricacao"
                type="number"
                value={form.anoFabricacao}
                onChange={handleChange("anoFabricacao")}
                className="bg-[#F8FAFC] h-11 text-sm border-slate-200 focus-visible:ring-slate-300"
              />
            </div>

            {/* Quantidade de Assentos */}
            <div className="space-y-2">
              <Label
                htmlFor="quantidadeAssentos"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider"
              >
                QUANTIDADE DE ASSENTOS
              </Label>
              <Input
                id="quantidadeAssentos"
                type="number"
                value={form.quantidadeAssentos}
                onChange={handleChange("quantidadeAssentos")}
                className="bg-[#F8FAFC] h-11 text-sm border-slate-200 focus-visible:ring-slate-300"
              />
            </div>

            {/* Marca (Select) */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-[#e31e24] tracking-wider">
                MARCA
              </Label>
              <Select
                value={form.marca}
                onValueChange={handleSelectChange("marca")}
              >
                <SelectTrigger className="w-full bg-[#F8FAFC] h-11 text-sm border border-slate-200 rounded-md px-3 focus-visible:ring-slate-300 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARCAS.map((m) => (
                    <SelectItem key={m} value={m} className="cursor-pointer">
                      {MARCA_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo (Select) */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-[#e31e24] tracking-wider">
                TIPO
              </Label>
              <Select
                value={form.tipo}
                onValueChange={handleSelectChange("tipo")}
              >
                <SelectTrigger className="w-full bg-[#F8FAFC] h-11 text-sm border border-slate-200 rounded-md px-3 focus-visible:ring-slate-300 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t} className="cursor-pointer">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status (Select) */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-[#e31e24] tracking-wider">
                STATUS
              </Label>
              <Select
                value={form.status}
                onValueChange={handleSelectChange("status")}
              >
                <SelectTrigger className="w-full bg-[#F8FAFC] h-11 text-sm border border-slate-200 rounded-md px-3 focus-visible:ring-slate-300 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="cursor-pointer">
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data de Vistoria */}
            <div className="space-y-2">
              <Label
                htmlFor="dataVistoria"
                className="text-[11px] font-bold text-[#e31e24] tracking-wider"
              >
                DATA DE VISTORIA
              </Label>
              <Input
                id="dataVistoria"
                type="date"
                value={form.dataVistoria}
                onChange={handleChange("dataVistoria")}
                className="bg-[#F8FAFC] h-11 text-sm border-slate-200 focus-visible:ring-slate-300"
              />
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="bg-[#062A45] hover:bg-[#0f172a] text-white h-12 px-8 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Veículo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
