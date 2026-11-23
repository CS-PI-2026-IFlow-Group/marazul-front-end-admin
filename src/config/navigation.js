import {
  Bus,
  ChartColumn,
  Contact,
  LayoutGrid,
  Map,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { hasPermission } from "../lib/permissions";

export const mainNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, permission: "dashboard:view" },
  { to: "/frota", label: "Frota", icon: Bus, permission: "frota:view" },
  { to: "/viagens", label: "Viagens", icon: Map, permission: "viagens:view" },
  { to: "/funcionario", label: "Colaboradores", icon: Users, permission: "funcionario:view" },
  { to: "/clientes", label: "Clientes", icon: Contact, permission: "clientes:view" },
  { to: "/passageiros", label: "Passageiros", icon: User, permission: "passageiros:view" },
  { to: "/relatorios", label: "Relatórios", icon: ChartColumn, permission: "relatorios:view" },
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
