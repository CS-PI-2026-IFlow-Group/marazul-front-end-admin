import { Search } from "lucide-react";
import { cn } from "../lib/utils";

export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-6 py-20 text-center",
        className,
      )}
      role="status"
    >
      <div className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-7" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
