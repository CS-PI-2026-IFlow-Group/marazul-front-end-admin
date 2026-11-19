import { Search } from "lucide-react";

export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center ${className}`}
      role="status"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100">
        <Icon className="size-8 text-slate-400" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-semibold text-[#062A45]">{title}</h3>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
