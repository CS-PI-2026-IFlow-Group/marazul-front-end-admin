import { Calendar } from "lucide-react";
import { isValidPeriod } from "../lib/period";
import { cn } from "../lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const FIELDS = [
  { id: "dataInicio", label: "Data inicial" },
  { id: "dataFim", label: "Data final" },
];

const ERROR_ID = "periodo-erro";

export default function PeriodFilter({ value, onChange }) {
  const isFilled = Boolean(value.dataInicio && value.dataFim);
  const hasError = isFilled && !isValidPeriod(value);

  return (
    <div className="space-y-2">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>
            <div className="relative">
              <Calendar
                className={cn(
                  "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
                  hasError ? "text-destructive" : "text-muted-foreground",
                )}
                aria-hidden="true"
              />
              <Input
                id={field.id}
                type="date"
                required
                value={value[field.id]}
                onChange={(event) => onChange({ ...value, [field.id]: event.target.value })}
                aria-invalid={hasError}
                aria-describedby={hasError ? ERROR_ID : undefined}
                className="pl-9"
              />
            </div>
          </div>
        ))}
      </div>
      {hasError && (
        <p id={ERROR_ID} className="text-xs font-medium text-destructive">
          A data inicial não pode ser posterior à data final.
        </p>
      )}
    </div>
  );
}
