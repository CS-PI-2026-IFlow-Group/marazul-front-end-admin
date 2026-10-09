import { ArrowLeft, Contact, Loader2, MapPin, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import {
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  onlyDigits,
} from "../../lib/documentMasks";
import ClienteService from "../../services/ClienteService";
import LocalidadeService from "../../services/LocalidadeService";

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

function toCityOptions(data) {
  return (Array.isArray(data) ? data : []).map((city) => ({
    value: String(city.id),
    label: city.name,
  }));
}

export default function CadastroCliente({ isEdicao = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingClient, setIsLoadingClient] = useState(isEdicao);
  const [initialForm, setInitialForm] = useState(null);

  const [form, setForm] = useState({
    name: "",
    personType: "PF",
    document: "",
    street: "",
    number: "",
    complement: "",
    stateId: "",
    cityId: "",
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const selectedStateRef = useRef("");

  useEffect(() => {
    let active = true;

    LocalidadeService.getEstados()
      .then((data) => {
        if (!active) return;
        setStates(
          (Array.isArray(data) ? data : []).map((state) => ({
            value: String(state.id),
            label: `${state.name} (${state.acronym})`,
          })),
        );
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar os estados.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isEdicao) return;

    let active = true;

    ClienteService.getById(id)
      .then(async (client) => {
        const address = client?.address ?? {};
        const city = address.cityId
          ? await LocalidadeService.getCidadeById(address.cityId)
          : null;
        const stateId = city?.stateId ? String(city.stateId) : "";
        const cityList = stateId
          ? await LocalidadeService.getCidades(stateId)
          : [];

        if (!active) return;

        const personType = onlyDigits(client?.cnpj) ? "PJ" : "PF";
        const loadedForm = {
          name: client?.name ?? "",
          personType,
          document: DOCUMENT_CONFIG[personType].format(
            personType === "PJ" ? client.cnpj : client?.cpf,
          ),
          street: address.street ?? "",
          number: address.number ?? "",
          complement: address.complement ?? "",
          stateId,
          cityId: address.cityId ? String(address.cityId) : "",
        };

        selectedStateRef.current = stateId;
        setCities(toCityOptions(cityList));
        setForm(loadedForm);
        setInitialForm(loadedForm);
        setIsLoadingClient(false);
      })
      .catch((error) => {
        if (!active) return;
        const status = error.response?.status;
        toast.error(
          status === 404 || status === 400
            ? "Cliente não encontrado."
            : "Erro ao carregar dados do cliente.",
        );
        navigate("/clientes");
      });

    return () => {
      active = false;
    };
  }, [isEdicao, id, navigate]);

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

  const handleStateChange = (value) => {
    if (!value || value === form.stateId) return;

    selectedStateRef.current = value;
    setForm((prev) => ({ ...prev, stateId: value, cityId: "" }));
    setCities([]);
    setIsLoadingCities(true);

    LocalidadeService.getCidades(value)
      .then((data) => {
        if (selectedStateRef.current !== value) return;
        setCities(toCityOptions(data));
      })
      .catch(() => {
        if (selectedStateRef.current !== value) return;
        toast.error("Não foi possível carregar as cidades do estado.");
      })
      .finally(() => {
        if (selectedStateRef.current === value) setIsLoadingCities(false);
      });
  };

  const handleCityChange = (value) => {
    if (!value) return;
    setForm((prev) => ({ ...prev, cityId: value }));
  };

  const documentConfig = DOCUMENT_CONFIG[form.personType];

  const nomeValido = form.name.trim().length > 0;
  const nomeTemErro = form.name.length > 0 && !nomeValido;

  const documentoValido = documentConfig.validate(form.document);
  const documentoCompleto = form.document.length === documentConfig.maxLength;
  const documentoTemErro = documentoCompleto && !documentoValido;

  const ruaValida = form.street.trim().length > 0;
  const ruaTemErro = form.street.length > 0 && !ruaValida;

  const numeroValido = form.number.trim().length > 0;
  const numeroTemErro = form.number.length > 0 && !numeroValido;

  const isFormValid =
    nomeValido &&
    documentoValido &&
    ruaValida &&
    numeroValido &&
    form.stateId !== "" &&
    form.cityId !== "";

  const houveAlteracao =
    !isEdicao ||
    (initialForm !== null &&
      Object.keys(form).some((field) => form[field] !== initialForm[field]));

  const podeSalvar =
    isFormValid && houveAlteracao && !isSaving && !isLoadingClient;

  const getCityPlaceholder = () => {
    if (!form.stateId) return "Selecione um estado primeiro";
    if (isLoadingCities) return "Carregando cidades...";
    return "Selecione a cidade";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!podeSalvar) return;

    setIsSaving(true);

    const document = onlyDigits(form.document);
    const payload = {
      name: form.name.trim(),
      cpf: form.personType === "PF" ? document : "",
      cnpj: form.personType === "PJ" ? document : "",
      address: {
        street: form.street,
        number: form.number,
        complement: form.complement,
        cityId: form.cityId,
      },
    };

    try {
      if (isEdicao) {
        await ClienteService.update(id, payload);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await ClienteService.create(payload);
        toast.success("Cliente cadastrado com sucesso!");
      }
      navigate("/clientes");
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (isEdicao && status === 404) {
        toast.error("Cliente não encontrado.");
        navigate("/clientes");
        return;
      }

      const backendMessage =
        status === 400 || status === 409 ? data?.message || data?.erro : null;

      toast.error(`Erro ao ${isEdicao ? "atualizar" : "cadastrar"} cliente`, {
        description:
          backendMessage ||
          "Ocorreu um problema ao salvar os dados. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <div className="flex items-start gap-2 flex-col-reverse">
          <div>
            <h1 className="text-xl font-semibold text-slate-700">
              {isEdicao ? "Editar Cliente" : "Cadastro de Cliente"}
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

        <form id="form-cliente" onSubmit={handleSubmit}>
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
                  disabled={isLoadingClient}
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
                disabled={isLoadingClient}
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
                disabled={isLoadingClient}
                value={form.document}
                onChange={handleDocumentChange}
                hasError={documentoTemErro}
                errorMessage={documentConfig.errorMessage}
              />
            </div>
          </CardContent>

          <div className="flex border-y border-slate-100 px-6 py-3 items-center gap-3">
            <MapPin className="h-4 w-4 text-[#e31e24]" />
            <h2 className="text-sm font-medium text-[#062A45]">Endereço</h2>
          </div>

          <CardContent className="px-6 py-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
              <GenericInput
                id="street"
                label="RUA"
                labelColor="#062A45"
                type="text"
                placeholder="Ex: Rua das Gaivotas"
                required
                disabled={isLoadingClient}
                value={form.street}
                onChange={handleChange("street")}
                hasError={ruaTemErro}
                errorMessage="A rua não pode conter apenas espaços"
              />

              <GenericInput
                id="number"
                label="NÚMERO"
                labelColor="#062A45"
                type="text"
                placeholder="Ex: 120"
                maxLength={10}
                required
                disabled={isLoadingClient}
                value={form.number}
                onChange={handleChange("number")}
                hasError={numeroTemErro}
                errorMessage="O número não pode conter apenas espaços"
              />

              <div className="md:col-span-2">
                <GenericInput
                  id="complement"
                  label="COMPLEMENTO"
                  labelColor="#062A45"
                  type="text"
                  placeholder="Ex: Sala 2, Bloco B"
                  disabled={isLoadingClient}
                  value={form.complement}
                  onChange={handleChange("complement")}
                />
              </div>

              <GenericSelect
                id="state"
                label="ESTADO"
                labelColor="#062A45"
                required
                disabled={isLoadingClient}
                value={form.stateId}
                onChange={handleStateChange}
                options={states}
                placeholder="Selecione o estado"
              />

              <GenericSelect
                id="city"
                label="CIDADE"
                labelColor="#062A45"
                required
                disabled={isLoadingClient || !form.stateId || isLoadingCities}
                value={form.cityId}
                onChange={handleCityChange}
                options={cities}
                placeholder={getCityPlaceholder()}
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
          <Button
            type="submit"
            form="form-cliente"
            disabled={!podeSalvar}
            className="flex items-center gap-2 rounded-md bg-[#0A1A2F] px-6 py-4 text-sm font-medium normal-case tracking-normal text-white transition-colors hover:bg-[#0A1A2F]/90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-100 disabled:hover:bg-slate-300 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Salvar Cliente
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
