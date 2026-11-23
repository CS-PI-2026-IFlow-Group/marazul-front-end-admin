import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:font-sans group-[.toaster]:text-card-foreground group-[.toaster]:shadow-lg",
          error:
            "group-[.toaster]:!border-destructive/25 group-[.toaster]:!bg-[color-mix(in_oklch,var(--destructive)_8%,var(--card))] group-[.toaster]:!text-destructive",
          success:
            "group-[.toaster]:!border-success/25 group-[.toaster]:!bg-[color-mix(in_oklch,var(--success)_8%,var(--card))] group-[.toaster]:!text-success",
          warning:
            "group-[.toaster]:!border-warning/30 group-[.toaster]:!bg-[color-mix(in_oklch,var(--warning)_10%,var(--card))] group-[.toaster]:!text-foreground",
          info:
            "group-[.toaster]:!border-info/25 group-[.toaster]:!bg-[color-mix(in_oklch,var(--info)_8%,var(--card))] group-[.toaster]:!text-info",
          description: "group-[.toast]:text-inherit opacity-80",
          actionButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
