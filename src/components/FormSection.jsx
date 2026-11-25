import { cn } from "../lib/utils";

export default function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}) {
  return (
    <section
      className={cn("grid gap-6 p-6 lg:grid-cols-[220px_1fr]", className)}
    >
      <div>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-accent" />}
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}
