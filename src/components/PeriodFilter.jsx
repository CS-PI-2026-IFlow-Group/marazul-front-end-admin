import { Calendar } from "lucide-react";
import { isValidPeriod } from "../lib/period";
import GenericInput from "./GenericInput";

export default function PeriodFilter({ value, onChange }) {
  const isFilled = Boolean(value.dataInicio && value.dataFim);
  const hasError = isFilled && !isValidPeriod(value);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <GenericInput
        id="dataInicio"
        label="DATA INICIAL"
        icon={Calendar}
        type="date"
        required
        value={value.dataInicio}
        onChange={(event) => onChange({ ...value, dataInicio: event.target.value })}
        hasError={hasError}
      />
      <GenericInput
        id="dataFim"
        label="DATA FINAL"
        icon={Calendar}
        type="date"
        required
        value={value.dataFim}
        onChange={(event) => onChange({ ...value, dataFim: event.target.value })}
        hasError={hasError}
        errorMessage="A data inicial não pode ser posterior à data final."
      />
    </div>
  );
}
