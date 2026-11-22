import {
  BarChart3,
  Contact,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { hasPermission } from "../lib/permissions";

export const mainNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { to: "/frota", label: "Frota", icon: Truck, permission: "frota:view" },
  { to: "/viagens", label: "Viagens", icon: Map, permission: "viagens:view" },
  { to: "/funcionario", label: "Colaboradores", icon: Users, permission: "funcionario:view" },
  { to: "/clientes", label: "Clientes", icon: Contact, permission: "clientes:view" },
  { to: "/passageiros", label: "Passageiros", icon: UserRound, permission: "passageiros:view" },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, permission: "relatorios:view" },
];

export const adminNavItems = [
  { to: "/perfis", label: "Perfis de Acesso", icon: ShieldCheck, permission: "perfis:view" },
];

export function filterNavItems(items, profile) {
  return items.filter((item) => hasPermission(profile, item.permission));
}

export function getFirstAllowedPath(profile) {
  const [first] = filterNavItems([...mainNavItems, ...adminNavItems], profile);
  return first?.to ?? null;
}
