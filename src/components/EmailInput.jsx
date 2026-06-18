import { Mail } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function EmailInput({
  id = "email",
  label = "EMAIL",
  value,
  onChange,
  placeholder = "nome@marazul.com.br",
  hasError = false,
  errorMessage = "",
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-bold text-[#e31e24] tracking-wider uppercase"
      >
        {label}
      </Label>
      <div className="relative">
        <Mail
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
            hasError ? "text-red-400" : "text-slate-400"
          }`}
        />
        <Input
          id={id}
          type="email"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`pl-9 bg-[#F8FAFC] h-11 text-sm transition-colors ${
            hasError
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-slate-300"
          }`}
        />
      </div>
      {hasError && errorMessage && (
        <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
