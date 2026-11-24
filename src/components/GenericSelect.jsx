import { cn } from "../lib/utils";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function GenericSelect({
  id,
  label,
  labelColor,
  icon: Icon,
  required = false,
  disabled = false,
  value,
  onChange,
  options = [],
  placeholder = "Selecione uma opção",
  hasError = false,
  errorMessage = "",
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="tracking-wide uppercase"
        style={labelColor ? { color: labelColor } : undefined}
      >
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>

      <div className="relative">
        {Icon && (
          <Icon
            className={cn(
              "pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2",
              hasError ? "text-destructive" : "text-muted-foreground",
            )}
          />
        )}

        <Select
          required={required}
          disabled={disabled}
          value={value}
          onValueChange={onChange}
        >
          <SelectTrigger
            id={id}
            className={cn(
              "h-10",
              Icon && "pl-10",
              hasError &&
                "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15",
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasError && errorMessage && (
        <p className="mt-0.5 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
