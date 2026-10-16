import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { isAdmin } from "../lib/auth";
import { cn } from "../lib/utils";

const adminItems = [
  { to: "/perfis", label: "Perfis de Acesso", icon: ShieldCheck },
];

/**
 * Itens de menu restritos ao perfil administrador.
 * Não renderiza nada para os demais perfis.
 */
export default function Rightbar({ onNavigate }) {
  if (!isAdmin()) return null;

  return (
    <div className="space-y-1 border-t border-slate-100 pt-4">
      {adminItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#e31e24]/10 text-[#e31e24] font-semibold"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#062A45]",
            )
          }
        >
          <Icon className="size-5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );
}
