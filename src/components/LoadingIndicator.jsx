import { LoaderCircle } from "lucide-react";

export default function LoadingIndicator({
  variant = "content",
  label = "Carregando...",
  className = "",
}) {
  const spinnerClass =
    variant === "button"
      ? "size-4"
      : "size-8";

  if (variant === "button") {
    return (
      <span className={`inline-flex items-center justify-center gap-2 ${className}`} role="status">
        <LoaderCircle className={`${spinnerClass} animate-spin motion-reduce:animate-none`} aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  if (!label) {
    return (
      <LoaderCircle
        className={`${spinnerClass} animate-spin motion-reduce:animate-none ${className}`}
        role="status"
        aria-label="Carregando"
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-[#062A45] ${className}`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className={`${spinnerClass} animate-spin motion-reduce:animate-none`} aria-hidden="true" />
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
  );
}
