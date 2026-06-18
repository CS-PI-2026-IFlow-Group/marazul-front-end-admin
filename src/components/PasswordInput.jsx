import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function PasswordInput({
  id,
  label = "Senha",
  value,
  onChange,
  placeholder = "••••••••",
  hasError = false,
  errorMessage = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-bold text-[#e31e24] tracking-wider"
      >
        {label}
      </Label>
      <div className="relative">
        <Lock
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${hasError ? "text-red-400" : "text-slate-400"}`}
        />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`pl-9 pr-10 bg-[#F8FAFC] h-11 text-sm transition-colors ${
            hasError
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-slate-200 focus-visible:ring-slate-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {hasError && errorMessage && (
        <p className="text-xs font-medium text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
