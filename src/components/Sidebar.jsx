import { Bus, ChartColumn, Contact, LayoutGrid, Map, User, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import logoMarazul from "../assets/logoMarazulIcone.png";
import { cn } from "../lib/utils";
import Rightbar from "./Rightbar";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/frota", label: "Frota", icon: Bus },
  { to: "/viagens", label: "Viagens", icon: Map },
  { to: "/funcionario", label: "Colaboradores", icon: Users },
  { to: "/clientes", label: "Clientes", icon: Contact },
  { to: "/passageiros", label: "Passageiros", icon: User },
  { to: "/relatorios", label: "Relatórios", icon: ChartColumn },
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar p-4">
      <div className="flex items-center gap-3 px-2 py-4">
        <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary">
          <img
            src={logoMarazul}
            alt="Logo da Marazul"
            className="size-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight font-semibold text-sidebar-foreground">
            Marazul
          </p>
          <p className="text-sm text-sidebar-muted">Painel Administrativo</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
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
        <Rightbar onNavigate={onNavigate} />
      </nav>
    </div>
  );
}
