import { ArrowLeft, CreditCard, Loader2, Phone, Save, User, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import GenericInput from "../../components/GenericInput";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { formatCpf, isValidCpf, onlyDigits } from "../../lib/documentMasks";
import { formatPhone } from "../../lib/phoneMasks";
import PassageiroService from "../../services/PassageiroService";

const backButtonClass = "h-9 gap-2 rounded-md border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 cursor-pointer";

export default function CadastroPassageiro({ isEdicao = false }) {
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
    <div className="bg-slate-50/50 font-sans">
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-slate-700">
          {isEdicao ? "Editar Passageiro" : "Cadastro do Passageiro"}
        </h1>
      </div>

      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden py-1 gap-0">
          <div className="flex border-b border-slate-100 px-6 py-3 items-center gap-3">
            <UserRound className="h-4 w-4 text-[#e31e24]" />
            <h2 className="text-sm font-medium text-[#062A45]">Informações do passageiro</h2>
          </div>

          <CardContent className="px-6 py-4">
            {isFetching && <div role="status" className="flex items-center gap-2 py-4 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Carregando passageiro...</div>}
            {loadError && <div role="alert" className="py-4 text-sm text-red-600">{loadError} <Button variant="outline" onClick={() => { setIsFetching(true); setLoadError(""); setReload((value) => value + 1); }} className="ml-2">Tentar novamente</Button></div>}
            <form id="form-passageiro" onSubmit={handleSubmit} className="space-y-3">
              <fieldset disabled={isFetching || isSaving || Boolean(loadError)} className="space-y-3">
              <GenericInput
                id="name"
                label="Nome"
                labelColor="#062A45"
                icon={User}
                placeholder="Nome do passageiro"
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                hasError={name.length > 0 && !nameValid}
                errorMessage="Informe um nome válido"
              />
              <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                <GenericInput
                  id="cpf"
                  label="CPF"
                  labelColor="#062A45"
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
                  labelColor="#062A45"
                  icon={Phone}
                  placeholder="(11) 99999-9999"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={15}
                  value={phone}
                  onBeforeInput={(event) => {
                    if (event.data && /\D/.test(event.data)) event.preventDefault();
                  }}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                  hasError={phone.length > 0 && !phoneValid}
                  errorMessage="Informe um telefone com 11 dígitos"
                />
              </div>
              </fieldset>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
            <Button variant="outline" onClick={() => navigate("/passageiros")} className={backButtonClass}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button
              type="submit"
              form="form-passageiro"
              disabled={!isFormValid || isSaving || isFetching || Boolean(loadError) || (isEdicao && !hasChanges)}
              className="flex items-center gap-2 rounded-md bg-[#0A1A2F] px-6 py-4 text-sm font-medium normal-case tracking-normal text-white transition-colors hover:bg-[#0A1A2F]/90 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-100 disabled:hover:bg-slate-300 cursor-pointer"
            >
              {isSaving ? <><Loader2 className="mr-2 size-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 size-4" /> Salvar</>}
            </Button>
          </CardFooter>
      </Card>
    </div>
  );
}
