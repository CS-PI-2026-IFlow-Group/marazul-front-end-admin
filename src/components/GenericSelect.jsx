import { ChevronDown } from "lucide-react";
import { Label } from "./ui/label";

export default function GenericSelect({
  id,
  label,
  labelColor = "#e31e24",
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
        {required && <span className="text-[#e31e24]">*</span>}
      </Label>

      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
              hasError ? "text-red-400" : "text-slate-400"
            }`}
          />
        )}
        <select
          id={id}
          required={required}
          value={value}
          onChange={onChange}
          className={`w-full appearance-none bg-[#F8FAFC] h-11 text-sm transition-colors outline-none border ${
            Icon ? "pl-9" : "pl-3"
          } pr-10 ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-200 focus:border-slate-300 focus:ring-1 focus:ring-slate-300"
          }`}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
            hasError ? "text-red-400" : "text-slate-400"
          }`}
        />
      </div>
      {hasError && errorMessage && (
        <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
