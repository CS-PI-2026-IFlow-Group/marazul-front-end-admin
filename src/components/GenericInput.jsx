import { Label } from "./ui/label";
import { Input } from "./ui/input";

export default function GenericInput({
  id = "input",
  label,
  labelColor = "#062A45",
  icon: Icon,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder,
  hasError = false,
  errorMessage = "",
  className = "",
  ...props
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
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${
              hasError ? "text-red-400" : "text-slate-400"
            }`}
          />
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${Icon ? "pl-9" : "pl-3"} pr-3 bg-[#F8FAFC] h-11 text-sm transition-colors border rounded-lg ${
            hasError
              ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
              : "border-slate-200 focus-visible:ring-slate-300 focus-visible:border-slate-400"
          } ${className}`}
          {...props}
        />
      </div>
      {hasError && errorMessage && (
        <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
