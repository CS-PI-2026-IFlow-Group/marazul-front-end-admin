import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export default function ErrorState({ message, onRetry, className }) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-6 py-20 text-center",
        className,
      )}
      role="alert"
    >
      <div className="grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-destructive">{message}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Verifique sua conexão e tente novamente.
      </p>
      {onRetry && (
        <div className="mt-6">
          <Button type="button" variant="outline" onClick={onRetry}>
            <RefreshCw /> Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
