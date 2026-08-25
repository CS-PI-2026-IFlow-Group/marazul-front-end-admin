import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import FrotaService from "../services/FrotaService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

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
  const [isLoading, setIsLoading] = useState(false);

  // Enums carregados dinamicamente do backend (ou fallback local)
  const [enums, setEnums] = useState({
    models: [],
    types: [],
    statuses: [],
  });

  // Valores padrão: MARCOPOLO, DD, ACTIVE (alinhados ao back-end)
  const [form, setForm] = useState({
    prefix: "",
    licensePlate: "",
    model: "MARCOPOLO",
    year: "",
    type: "DD",
    seats: "",
    status: "ACTIVE",
    inspectionDate: "",
  });

  // Carrega os enums ao montar o componente
  useEffect(() => {
    let active = true;
    FrotaService.getEnums().then((data) => {
      if (active && data) {
        setEnums(data);
        // Garante que os defaults existam nos enums carregados
        setForm((prev) => ({
          ...prev,
          model:
            prev.model && data.models?.some((m) => m.value === prev.model)
              ? prev.model
              : data.models?.[0]?.value || "MARCOPOLO",
          type:
            prev.type && data.types?.some((t) => t.value === prev.type)
              ? prev.type
              : data.types?.[0]?.value || "DD",
          status:
            prev.status && data.statuses?.some((s) => s.value === prev.status)
              ? prev.status
              : data.statuses?.find((s) => s.value === "ACTIVE")?.value ||
                data.statuses?.[0]?.value ||
                "ACTIVE",
        }));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePlacaChange = (e) => {
    setForm((prev) => ({ ...prev, licensePlate: formatPlaca(e.target.value) }));
  };

  const handleNumeroChange = (field, maxLen) => (e) => {
    const numericValue = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setForm((prev) => ({ ...prev, [field]: numericValue }));
  };

  const handleSelectChange = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validação de placa: formato antigo (ABC-1234) ou Mercosul (ABC1D23)
  const placaValida = PLACA_REGEX.test(form.licensePlate.replace("-", ""));
  const placaTemErro = form.licensePlate.length > 0 && !placaValida;

  // Validação de ano: exatamente 4 dígitos e >= 1950
  const anoValido = form.year.length === 4 && Number(form.year) >= 1950;
  const anoTemErro = form.year.length > 0 && !anoValido;

  // Validação de assentos: deve ser um número positivo
  const assentosValidos = form.seats.length > 0 && Number(form.seats) > 0;
  const assentosTemErro = form.seats.length > 0 && !assentosValidos;

  // Validação de data de vistoria: campo obrigatório
  const dataVistoriaValida = form.inspectionDate.trim() !== "";

  // Todos os campos obrigatórios preenchidos e válidos
  const isFormValid =
    form.prefix.trim() !== "" &&
    placaValida &&
    anoValido &&
    assentosValidos &&
    form.model !== "" &&
    form.type !== "" &&
    form.status !== "" &&
    dataVistoriaValida;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);

    // Payload alinhado ao VehicleRequestDTO do back-end
    const payload = {
      prefix: form.prefix.trim(),
      licensePlate: form.licensePlate.trim().toUpperCase(),
      model: form.model,
      type: form.type,
      year: Number(form.year),
      seats: Number(form.seats),
      status: form.status,
      inspectionDate: form.inspectionDate.trim(),
    };

    try {
      await FrotaService.create(payload);
      toast.success("Veículo cadastrado com sucesso!");
      navigate("/frota");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 409) {
        toast.error("Conflito de cadastro", {
          description:
            data?.message ||
            data?.erro ||
            "Já existe um veículo cadastrado com esta placa.",
        });
      } else if (status === 400 && data?.errors) {
        // Exibe erros de validação do backend campo a campo
        const mensagens = Object.values(data.errors).join("; ");
        toast.error("Erro de validação", { description: mensagens });
      } else {
        toast.error("Erro ao cadastrar veículo", {
          description:
            data?.message ||
            data?.erro ||
            "Ocorreu um problema ao salvar os dados. Tente novamente.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho da página */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-bold text-[#062A45] pb-1 border-b-[3.5px] border-[#e31e24] inline-block">
            Cadastro de Frota
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/frota")}
          className="gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold border border-slate-300 rounded-md px-6 h-10 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>

      {/* Card do formulário */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <h2 className="text-base font-semibold text-[#062A45]">
            Informações do veículo
          </h2>
        </div>

        <div className="p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid 2 colunas */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {/* Prefixo */}
              <div className="space-y-2">
                <Label
                  htmlFor="prefix"
                  className="text-xs font-bold text-[#062A45] tracking-wider uppercase"
                >
                  PREFIXO *
                </Label>
                <Input
                  id="prefix"
                  type="text"
                  placeholder="Ex: 18001"
                  value={form.prefix}
                  onChange={handleChange("prefix")}
                />
              </div>

              {/* Placa */}
              <div className="space-y-2">
                <Label
                  htmlFor="licensePlate"
                  className="text-xs font-bold text-[#062A45] tracking-wider uppercase"
                >
                  PLACA *
                </Label>
                <Input
                  id="licensePlate"
                  type="text"
                  placeholder="ABC-1234 ou ABC1D23"
                  maxLength={8}
                  value={form.licensePlate}
                  onChange={handlePlacaChange}
                  className={`uppercase ${
                    placaTemErro
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                {placaTemErro && (
                  <p className="text-xs font-medium text-red-500">
                    Formato inválido. Use ABC-1234 ou ABC1D23
                  </p>
                )}
              </div>

              {/* Ano de Fabricação */}
              <div className="space-y-2">
                <Label
                  htmlFor="year"
                  className="text-xs font-bold text-[#062A45] tracking-wider uppercase"
                >
                  ANO DE FABRICAÇÃO *
                </Label>
                <Input
                  id="year"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 2024"
                  maxLength={4}
                  value={form.year}
                  onChange={handleNumeroChange("year", 4)}
                  className={
                    anoTemErro
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {anoTemErro && (
                  <p className="text-xs font-medium text-red-500">
                    Informe um ano válido com 4 dígitos (mínimo 1950)
                  </p>
                )}
              </div>

              {/* Quantidade de Assentos */}
              <div className="space-y-2">
                <Label
                  htmlFor="seats"
                  className="text-xs font-bold text-[#062A45] tracking-wider uppercase"
                >
                  QUANTIDADE DE ASSENTOS *
                </Label>
                <Input
                  id="seats"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 46"
                  maxLength={3}
                  value={form.seats}
                  onChange={handleNumeroChange("seats", 3)}
                  className={
                    assentosTemErro
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                      : ""
                  }
                />
                {assentosTemErro && (
                  <p className="text-xs font-medium text-red-500">
                    Informe uma quantidade válida de assentos
                  </p>
                )}
              </div>

              {/* Modelo / Marca (Select - enums dinâmicos) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#062A45] tracking-wider uppercase">
                  MARCA *
                </Label>
                <Select
                  value={form.model}
                  onValueChange={handleSelectChange("model")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.models.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo (Select - enums dinâmicos) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#062A45] tracking-wider uppercase">
                  TIPO *
                </Label>
                <Select
                  value={form.type}
                  onValueChange={handleSelectChange("type")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.types.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status (Select - enums dinâmicos) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-[#062A45] tracking-wider uppercase">
                  STATUS *
                </Label>
                <Select
                  value={form.status}
                  onValueChange={handleSelectChange("status")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enums.statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data de Vistoria (Obrigatório) */}
              <div className="space-y-2">
                <Label
                  htmlFor="inspectionDate"
                  className="text-xs font-bold text-[#062A45] tracking-wider uppercase"
                >
                  DATA DE VISTORIA *
                </Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={form.inspectionDate}
                  onChange={handleChange("inspectionDate")}
                />
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="bg-[#062A45] hover:bg-[#0f172a] text-white h-12 px-8 font-bold rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    Salvando... <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Salvar Veículo
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
