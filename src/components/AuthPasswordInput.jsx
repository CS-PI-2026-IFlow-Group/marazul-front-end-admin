import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import AuthInput from "./AuthInput";

export default function AuthPasswordInput({
  id,
  label = "Senha",
  placeholder = "••••••••",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthInput
      id={id}
      label={label}
      icon={Lock}
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      action={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      }
      {...props}
    />
  );
}
