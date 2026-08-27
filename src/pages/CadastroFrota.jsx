import {
  ArrowLeft,
  Building2,
  Calendar1,
  CheckCircle2,
  CreditCard,
  Hash,
  Layers,
  Loader2,
  Save,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../components/GenericInput";
import GenericSelect from "../components/GenericSelect";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import FrotaService from "../services/FrotaService";

const PLACA_REGEX = /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/;

function formatPlaca(raw) {
  const clean = raw
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7);

  if (clean.length > 3 && /^[A-Z]{3}\d+$/.test(clean)) {
    return clean.slice(0, 3) + "-" + clean.slice(3);
  }

  return clean;
}

export default function CadastroFrota() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [enums, setEnums] = useState({
    models: [],
    types: [],
    statuses: [],
  });

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

  useEffect(() => {
    let active = true;
    FrotaService.getEnums().then((data) => {
      if (active && data) {
        setEnums(data);
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

  const placaValida = PLACA_REGEX.test(form.licensePlate.replace("-", ""));
  const placaTemErro = form.licensePlate.length > 0 && !placaValida;

  const anoValido = form.year.length === 4 && Number(form.year) >= 1950;
  const anoTemErro = form.year.length > 0 && !anoValido;

  const assentosValidos = form.seats.length > 0 && Number(form.seats) > 0;
  const assentosTemErro = form.seats.length > 0 && !assentosValidos;

  const dataVistoriaValida = form.inspectionDate.trim() !== "";

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
    <div className="space-y-1">
      <div className="flex items-start gap-3 flex-col">
        <Button
          variant="outline"
          onClick={() => navigate("/frota")}
          className="gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold border border-slate-300 rounded-lg px-5 h-9 text-xs shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#062A45] pb-1 border-b-[3.5px] border-[#e31e24] inline-block">
            Cadastro de Frota
          </h1>
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-6 py-3.5 items-center gap-3 bg-slate-50/50">
          <Truck className="h-5 w-5 text-[#e31e24]" />
          <h2 className="text-base font-medium text-[#062A45]">
            Informações do veículo
          </h2>
        </div>

        <CardContent className="p-6">
          <form id="form-frota" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <GenericInput
                id="prefix"
                label="PREFIXO"
                labelColor="#062A45"
                icon={Hash}
                placeholder="Ex: 18001"
                required
                value={form.prefix}
                onChange={handleChange("prefix")}
              />

              <GenericInput
                id="licensePlate"
                label="PLACA"
                labelColor="#062A45"
                icon={CreditCard}
                placeholder="ABC-1234 ou ABC1D23"
                maxLength={8}
                required
                value={form.licensePlate}
                onChange={handlePlacaChange}
                hasError={placaTemErro}
                errorMessage="Formato inválido. Use ABC-1234 ou ABC1D23"
                className="uppercase"
              />

              <GenericSelect
                id="model"
                label="MARCA"
                labelColor="#062A45"
                icon={Building2}
                required
                value={form.model}
                onChange={handleSelectChange("model")}
                options={enums.models}
                placeholder="Selecione a marca"
              />

              <GenericSelect
                id="type"
                label="TIPO"
                labelColor="#062A45"
                icon={Layers}
                required
                value={form.type}
                onChange={handleSelectChange("type")}
                options={enums.types}
                placeholder="Selecione o tipo"
              />

              <GenericInput
                id="year"
                label="ANO DE FABRICAÇÃO"
                labelColor="#062A45"
                icon={Calendar1}
                inputMode="numeric"
                placeholder="Ex: 2024"
                maxLength={4}
                required
                value={form.year}
                onChange={handleNumeroChange("year", 4)}
                hasError={anoTemErro}
                errorMessage="Informe um ano válido com 4 dígitos (mínimo 1950)"
              />

              <GenericInput
                id="seats"
                label="QUANTIDADE DE ASSENTOS"
                labelColor="#062A45"
                icon={Users}
                inputMode="numeric"
                placeholder="Ex: 46"
                maxLength={3}
                required
                value={form.seats}
                onChange={handleNumeroChange("seats", 3)}
                hasError={assentosTemErro}
                errorMessage="Informe uma quantidade válida de assentos"
              />

              <GenericSelect
                id="status"
                label="STATUS"
                labelColor="#062A45"
                icon={CheckCircle2}
                required
                value={form.status}
                onChange={handleSelectChange("status")}
                options={enums.statuses}
                placeholder="Selecione o status"
              />

              <GenericInput
                id="inspectionDate"
                label="DATA DE VISTORIA"
                labelColor="#062A45"
                icon={Calendar1}
                type="date"
                required
                value={form.inspectionDate}
                onChange={handleChange("inspectionDate")}
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          <Button
            type="submit"
            form="form-frota"
            disabled={!isFormValid || isLoading}
            className="bg-[#0A1A2F] text-white hover:bg-[#0A1A2F]/90 px-8 py-5 text-sm font-medium rounded-md normal-case tracking-normal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Salvar Veículo
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
