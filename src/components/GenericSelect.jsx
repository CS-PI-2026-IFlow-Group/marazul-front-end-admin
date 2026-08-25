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
  labelColor = "#062A45",
  icon: Icon,
  required = false,
  value,
  onChange,
  options = [],
  placeholder = "Selecione uma opção",
  hasError = false,
  errorMessage = "",
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-bold tracking-wider"
        style={{ color: labelColor }}
      >
        {label}
        {required && <span className="text-[#e31e24] ml-1">*</span>}
      </Label>

      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 pointer-events-none ${
              hasError ? "text-red-400" : "text-slate-400"
            }`}
          />
        )}

        <Select required={required} value={value} onValueChange={onChange}>
          <SelectTrigger
            id={id}
            className={`w-full bg-[#F8FAFC] h-11 text-sm transition-colors border rounded-none ${
              Icon ? "pl-9" : "pl-3"
            } ${
              hasError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-200 focus:ring-slate-300 focus:border-slate-400"
            }`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-none border-slate-200 bg-white shadow-lg">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasError && errorMessage && (
        <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
