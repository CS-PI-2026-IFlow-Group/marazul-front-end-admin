import { NavLink } from "react-router-dom";
import { LayoutDashboard, Truck, Map, Users, BarChart3 } from "lucide-react";
import logoMarazul from "../assets/logoMarazul.png";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/frota", label: "Frota", icon: Truck },
  { to: "/viagens", label: "Viagens", icon: Map },
  { to: "/funcionarios", label: "Funcionários", icon: Users },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex flex-col items-center border-b border-slate-100 px-4 py-6">
        <img
          src={logoMarazul}
          alt="Logo da Marazul"
          className="h-20 object-contain"
        />
        <span className="mt-1 text-sm font-medium text-slate-400">
          Painel Administrativo
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex-grow space-y-1 overflow-y-auto px-3 py-6">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
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
      </nav>
    </div>
  );
}
