import { NavLink } from "react-router-dom";
import { adminNavItems, filterNavItems } from "../config/navigation";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

export default function Rightbar({ onNavigate }) {
  const { profile } = useAuth();
  const adminItems = filterNavItems(adminNavItems, profile);

  if (adminItems.length === 0) return null;

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
