import { Contact, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import FormFooter from "../../components/FormFooter";
import FormSection from "../../components/FormSection";
import GenericInput from "../../components/GenericInput";
import GenericSelect from "../../components/GenericSelect";
import PageHeader from "../../components/PageHeader";
import { Card } from "../../components/ui/card";
import {
  formatCnpj,
  formatCpf,
  isValidCnpj,
  isValidCpf,
  onlyDigits,
} from "../../lib/documentMasks";
import { formatPhone } from "../../lib/phoneMasks";
import ClienteService from "../../services/ClienteService";
import LocalidadeService from "../../services/LocalidadeService";
import { usePageTitle } from "../../hooks/usePageTitle";

const TELEFONE_REGEX = /^\d{2}9\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  usePageTitle(isEdicao ? "Edição de Cliente" : "Cadastro de Cliente");
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
    phone: "",
    email: "",
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
          phone: formatPhone(client?.phone ?? ""),
          email: client?.email ?? "",
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

  const handlePhoneChange = (e) => {
    setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
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

  const telefoneDigits = onlyDigits(form.phone);
  const telefoneValido =
    telefoneDigits.length === 0 || TELEFONE_REGEX.test(telefoneDigits);
  const telefoneTemErro = form.phone.length > 0 && !telefoneValido;

  const emailPreenchido = form.email.trim().length > 0;
  const emailValido = !emailPreenchido || EMAIL_REGEX.test(form.email.trim());
  const emailTemErro = emailPreenchido && !emailValido;

  const isFormValid =
    nomeValido &&
    documentoValido &&
    ruaValida &&
    numeroValido &&
    telefoneValido &&
    emailValido &&
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
      phone: form.phone,
      email: form.email,
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
    <div>
      <PageHeader title={isEdicao ? "Editar cliente" : "Cadastro de cliente"} />

      <Card className="gap-0 py-0">
        <form id="form-cliente" onSubmit={handleSubmit}>
          <div className="divide-y">
            <FormSection icon={Contact} title="Dados do cliente">
              <div className="sm:col-span-2">
                <GenericInput
                  id="name"
                  label="Nome"
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
                label="Tipo de pessoa"
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

              <GenericInput
                id="phone"
                label="Telefone"
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                icon={Phone}
                placeholder="(44) 99999-9999"
                disabled={isLoadingClient}
                value={form.phone}
                onChange={handlePhoneChange}
                hasError={telefoneTemErro}
                errorMessage="Informe um celular válido no formato (XX) 9XXXX-XXXX"
              />

              <GenericInput
                id="email"
                label="E-mail"
                type="email"
                icon={Mail}
                placeholder="contato@cliente.com.br"
                disabled={isLoadingClient}
                value={form.email}
                onChange={handleChange("email")}
                hasError={emailTemErro}
                errorMessage="Informe um e-mail válido"
              />
            </FormSection>

            <FormSection icon={MapPin} title="Endereço">
              <GenericInput
                id="street"
                label="Rua"
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
                label="Número"
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

              <div className="sm:col-span-2">
                <GenericInput
                  id="complement"
                  label="Complemento"
                  type="text"
                  placeholder="Ex: Sala 2, Bloco B"
                  disabled={isLoadingClient}
                  value={form.complement}
                  onChange={handleChange("complement")}
                />
              </div>

              <GenericSelect
                id="state"
                label="Estado"
                required
                disabled={isLoadingClient}
                value={form.stateId}
                onChange={handleStateChange}
                options={states}
                placeholder="Selecione o estado"
              />

              <GenericSelect
                id="city"
                label="Cidade"
                required
                disabled={isLoadingClient || !form.stateId || isLoadingCities}
                value={form.cityId}
                onChange={handleCityChange}
                options={cities}
                placeholder={getCityPlaceholder()}
              />
            </FormSection>
          </div>
        </form>

        <FormFooter
          formId="form-cliente"
          onBack={() => navigate("/clientes")}
          isSaving={isSaving}
          isDisabled={!podeSalvar}
          saveLabel="Salvar cliente"
        />
      </Card>
    </div>
  );
}
