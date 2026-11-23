import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { isAdmin } from "../lib/auth";
import { cn } from "../lib/utils";

const adminItems = [
  { to: "/perfis", label: "Perfis de Acesso", icon: ShieldCheck },
];

export default function Rightbar({ onNavigate }) {
  if (!isAdmin()) return null;

  return (
    <div className="mt-3 flex flex-col gap-1 border-t border-sidebar-border pt-3">
      {adminItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent font-semibold text-sidebar-foreground [&_svg]:text-accent"
                : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )
          }
        >
          <Icon className="size-4.5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
}
