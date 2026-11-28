import { CreditCard, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import FormFooter from "../../components/FormFooter";
import FormSection from "../../components/FormSection";
import GenericInput from "../../components/GenericInput";
import LoadingIndicator from "../../components/LoadingIndicator";
import PageHeader from "../../components/PageHeader";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { formatCpf, isValidCpf, onlyDigits } from "../../lib/documentMasks";
import { formatPhone } from "../../lib/phoneMasks";
import PassageiroService from "../../services/PassageiroService";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function CadastroPassageiro({ isEdicao = false }) {
  usePageTitle(isEdicao ? "Edição de Passageiro" : "Cadastro de Passageiro");
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdicao);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    if (!isEdicao) return;
    let active = true;
    PassageiroService.getById(id)
      .then((passenger) => {
        if (!active) return;
        const initialData = PassageiroService.buildPayload(passenger);
        setName(passenger.name ?? "");
        setCpf(formatCpf(passenger.cpf));
        setPhone(formatPhone(passenger.phone));
        setOriginalData(initialData);
        setLoadError("");
      })
      .catch(() => {
        if (active) setLoadError("Não foi possível carregar o passageiro. Tente novamente.");
      })
      .finally(() => {
        if (active) setIsFetching(false);
      });
    return () => { active = false; };
  }, [id, isEdicao, reload]);

  const nameValid = name.trim().length > 0;
  const cpfValid = isValidCpf(cpf);
  const phoneDigits = onlyDigits(phone);
  const phoneValid = phoneDigits.length === 0 || phoneDigits.length === 11;
  const isFormValid = nameValid && cpfValid && phoneValid;
  const currentData = PassageiroService.buildPayload({ name: name.trim(), cpf, phone });
  const hasChanges = originalData !== null && (
    currentData.name !== originalData.name ||
    currentData.cpf !== originalData.cpf ||
    currentData.phone !== originalData.phone
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid || isSaving || isFetching || (isEdicao && (!originalData || !hasChanges))) return;

    setIsSaving(true);
    try {
      if (isEdicao) {
        await PassageiroService.update(id, currentData);
        toast.success("Passageiro atualizado com sucesso!");
      } else {
        await PassageiroService.create(currentData);
        toast.success("Passageiro cadastrado com sucesso!");
      }
      navigate("/passageiros");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.erro ||
          `Não foi possível ${isEdicao ? "atualizar" : "cadastrar"} o passageiro. Tente novamente.`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdicao ? "Editar passageiro" : "Cadastro de passageiro"}
      />

      <Card className="gap-0 py-0">
        {isFetching && (
          <div
            role="status"
            className="flex items-center gap-2 border-b px-6 py-4 text-sm text-muted-foreground"
          >
            <LoadingIndicator label="" className="size-4" />
            Carregando passageiro...
          </div>
        )}
        {loadError && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-2 border-b px-6 py-4 text-sm text-destructive"
          >
            {loadError}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFetching(true);
                setLoadError("");
                setReload((value) => value + 1);
              }}
            >
              Tentar novamente
            </Button>
          </div>
        )}

        <form id="form-passageiro" onSubmit={handleSubmit}>
          <fieldset disabled={isFetching || isSaving || Boolean(loadError)}>
            <FormSection icon={User} title="Informações do passageiro">
              <div className="sm:col-span-2">
                <GenericInput
                  id="name"
                  label="Nome"
                  icon={User}
                  placeholder="Nome do passageiro"
                  required
                  maxLength={255}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  hasError={name.length > 0 && !nameValid}
                  errorMessage="Informe um nome válido"
                />
              </div>
              <GenericInput
                id="cpf"
                label="CPF"
                icon={CreditCard}
                placeholder="000.000.000-00"
                required
                inputMode="numeric"
                maxLength={14}
                value={cpf}
                onChange={(event) => setCpf(formatCpf(event.target.value))}
                hasError={cpf.length > 0 && !cpfValid}
                errorMessage="Informe um CPF válido"
              />
              <GenericInput
                id="phone"
                label="Telefone"
                icon={Phone}
                placeholder="(11) 99999-9999"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                value={phone}
                onBeforeInput={(event) => {
                  if (event.data && /\D/.test(event.data))
                    event.preventDefault();
                }}
                onChange={(event) => setPhone(formatPhone(event.target.value))}
                hasError={phone.length > 0 && !phoneValid}
                errorMessage="Informe um telefone com 11 dígitos"
              />
            </FormSection>
          </fieldset>
        </form>

        <FormFooter
          formId="form-passageiro"
          onBack={() => navigate("/passageiros")}
          isSaving={isSaving}
          isDisabled={
            !isFormValid ||
            isFetching ||
            Boolean(loadError) ||
            (isEdicao && !hasChanges)
          }
          saveLabel="Salvar passageiro"
        />
      </Card>
    </div>
  );
}
