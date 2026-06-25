import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Container,
  Users,
} from "lucide-react";
import logoMarazul from "../assets/logoMarazul.png";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/frota", label: "Frota", icon: Truck },
  { to: "/carrocerias", label: "Carrocerias", icon: Container },
  { to: "/funcionarios", label: "Funcionários", icon: Users },
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-[#062A45] text-slate-200">
      {/* Logo */}
      <div className="flex flex-col items-center border-b border-white/10 px-4 py-6">
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
      <nav className="flex-grow space-y-1.5 overflow-y-auto px-4 py-6">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-[#e31e24] text-white shadow-md"
                  : "text-slate-300 hover:bg-white/10 hover:text-white",
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
