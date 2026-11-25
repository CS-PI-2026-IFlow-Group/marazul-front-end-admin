import { LoaderCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function LoadingIndicator({
  variant = "content",
  label = "Carregando...",
  className,
}) {
  if (variant === "button") {
    return (
      <span
        className={cn("inline-flex items-center justify-center gap-2", className)}
        role="status"
      >
        <LoaderCircle
          className="size-4 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span>{label}</span>
      </span>
    );
  }

  if (!label) {
    return (
      <LoaderCircle
        className={cn(
          "size-7 animate-spin text-primary motion-reduce:animate-none",
          className,
        )}
        role="status"
        aria-label="Carregando"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className="size-7 animate-spin text-primary motion-reduce:animate-none"
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}
