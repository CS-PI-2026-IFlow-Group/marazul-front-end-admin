import { cn } from "../lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function GenericInput({
  id,
  label,
  labelColor,
  icon: Icon,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder = "",
  hasError = false,
  errorMessage = "",
  className,
  ...props
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
              "pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2",
              hasError ? "text-destructive" : "text-muted-foreground",
            )}
          />
        )}
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(
            "h-10",
            Icon && "pl-10",
            hasError &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15",
            className,
          )}
          {...props}
        />
      </div>
      {hasError && errorMessage && (
        <p className="mt-0.5 text-xs font-medium text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
