import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { formatCnpj, formatCpf, onlyDigits } from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";
import LocalidadeService from "../../services/LocalidadeService";

const emptyForm = {
  name: "",
  cpf: "",
  cnpj: "",
  street: "",
  number: "",
  complement: "",
  cityId: "",
};

export default function CadastroCliente({ isEdicao = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [documentType, setDocumentType] = useState("cpf");
  const [estadoId, setEstadoId] = useState("");
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [states, client] = await Promise.all([
          LocalidadeService.getEstados(),
          isEdicao && id ? ClienteService.getById(id) : Promise.resolve(null),
        ]);
        const address = client?.address || {};
        const city = address.cityId && !address.state
          ? await LocalidadeService.getCidadeById(address.cityId)
          : null;
        if (!active) return;

        setEstados(states);
        if (client) {
          const selectedState = states.find(
            (state) => state.id === city?.stateId || state.acronym === address.state,
          );
          setForm({
            name: client.name || "",
            cpf: formatCpf(client.cpf),
            cnpj: formatCnpj(client.cnpj),
            street: address.street || "",
            number: address.number || "",
            complement: address.complement || "",
            cityId: address.cityId ? String(address.cityId) : "",
          });
          setDocumentType(client.cnpj ? "cnpj" : "cpf");
          setEstadoId(selectedState ? String(selectedState.id) : "");
        }
      } catch (requestError) {
        if (!active) return;
        toast.error(requestError.response?.data?.message || "Não foi possível carregar os dados do cliente.");
        if (isEdicao) navigate("/clientes");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [id, isEdicao, navigate]);

  useEffect(() => {
    if (!estadoId) return;
    let active = true;

    LocalidadeService.getCidades(estadoId)
      .then((data) => {
        if (active) setCidades(data);
      })
      .catch((requestError) => {
        if (active) {
          toast.error(requestError.response?.data?.message || "Não foi possível carregar as cidades.");
        }
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });

    return () => { active = false; };
  }, [estadoId]);

  const setField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const changeState = (value) => {
    setEstadoId(value);
    setCidades([]);
    setLoadingCities(true);
    setField("cityId", "");
  };

  const changeDocumentType = (value) => {
    setDocumentType(value);
    setForm((previous) => ({ ...previous, cpf: "", cnpj: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const document = documentType === "cpf" ? onlyDigits(form.cpf) : onlyDigits(form.cnpj);
    const expectedLength = documentType === "cpf" ? 11 : 14;

    if (document.length !== expectedLength) {
      toast.error(`Informe um ${documentType.toUpperCase()} com ${expectedLength} dígitos.`);
      return;
    }
    if (!form.cityId) {
      toast.error("Selecione a cidade do cliente.");
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: form.name,
        cpf: documentType === "cpf" ? form.cpf : null,
        cnpj: documentType === "cnpj" ? form.cnpj : null,
        address: {
          street: form.street,
          number: form.number,
          complement: form.complement,
          cityId: form.cityId,
        },
      };

      if (isEdicao) {
        await ClienteService.update(id, data);
      } else {
        await ClienteService.create(data);
      }
      toast.success(isEdicao ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.");
      navigate("/clientes");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || requestError.message || "Não foi possível salvar o cliente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Carregando formulário...
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <Button variant="ghost" onClick={() => navigate("/clientes")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para clientes
        </Button>
        <h1 className="mt-3 text-2xl font-bold text-[#062A45]">
          {isEdicao ? "Editar cliente" : "Cadastrar cliente"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200">
          <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <GenericInput id="name" label="Nome" required value={form.name}
                onChange={(event) => setField("name", event.target.value)} maxLength={255} />
            </div>
            <GenericSelect id="documentType" label="Tipo de documento" required
              value={documentType} onChange={changeDocumentType}
              options={[{ value: "cpf", label: "CPF" }, { value: "cnpj", label: "CNPJ" }]} />
            <GenericInput id="document" label={documentType.toUpperCase()} required
              value={documentType === "cpf" ? form.cpf : form.cnpj}
              onChange={(event) => setField(documentType,
                documentType === "cpf" ? formatCpf(event.target.value) : formatCnpj(event.target.value))}
              inputMode="numeric" />
            <div className="md:col-span-2 border-t border-slate-100 pt-5 text-lg font-semibold text-[#062A45]">
              Endereço
            </div>
            <GenericInput id="street" label="Rua" required value={form.street}
              onChange={(event) => setField("street", event.target.value)} />
            <GenericInput id="number" label="Número" required value={form.number}
              onChange={(event) => setField("number", event.target.value)} />
            <GenericInput id="complement" label="Complemento" value={form.complement}
              onChange={(event) => setField("complement", event.target.value)} />
            <GenericSelect id="state" label="Estado" required value={estadoId}
              onChange={changeState} options={estados.map((state) => ({
                value: String(state.id), label: `${state.name} (${state.acronym})`,
              }))} />
            <GenericSelect id="city" label="Cidade" required value={form.cityId}
              onChange={(value) => setField("cityId", value)}
              placeholder={loadingCities ? "Carregando cidades..." : "Selecione a cidade"}
              options={cidades.map((city) => ({ value: String(city.id), label: city.name }))} />
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate("/clientes")}>Cancelar</Button>
            <Button type="submit" disabled={saving || loadingCities}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEdicao ? "Salvar alterações" : "Cadastrar cliente"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </section>
  );
}
