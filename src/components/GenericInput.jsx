import { Mail } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function GenericInput({
  id = "email",
  label = "EMAIL",
  labelColor = "#e31e24",
  icon: Icon = Mail,
  type = "email",
  required = false,
  value,
  onChange,
  placeholder = "nome@marazul.com.br",
  hasError = false,
  errorMessage = "",
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
        {required && <span className="text-[#e31e24]">*</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
              hasError ? "text-red-400" : "text-slate-400"
            }`}
          ></Icon>
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`pl-9 pr-3 bg-[#F8FAFC] h-11 text-sm transition-colors ${
            hasError
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-slate-300"
          }`}
          {...props}
        />
      </div>
      {hasError && errorMessage && (
        <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
