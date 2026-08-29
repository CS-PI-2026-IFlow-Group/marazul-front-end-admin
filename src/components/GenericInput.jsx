import { Mail } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";

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
  className,
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
          className={cn(
            "pr-3 bg-[#F8FAFC] h-11 text-sm transition-colors",
            Icon ? "pl-9" : "pl-3",
            hasError
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-slate-300",
            className
          )}
          {...props}
        />
      </div>
      {hasError && errorMessage && (
        <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
