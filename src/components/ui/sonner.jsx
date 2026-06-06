import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg",
          error:
            "group-[.toaster]:!bg-red-50 group-[.toaster]:!text-red-600 group-[.toaster]:!border-red-200",
          success:
            "group-[.toaster]:!bg-green-50 group-[.toaster]:!text-green-700 group-[.toaster]:!border-green-200",
          description: "group-[.toast]:text-inherit opacity-80",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
