import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Sidebar fixa (desktop) */}
      <aside className="fixed top-0 left-0 z-40 hidden h-screen w-64 md:block">
        <Sidebar />
      </aside>

      {/* Overlay do menu mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          mobileOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar deslizante (mobile) */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="absolute top-4 right-4 z-10 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </Button>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>

      {/* Área de conteúdo (Workspace) - rola de forma independente */}
      <div className="min-h-screen md:pl-64">
        <TopHeader onOpenMenu={() => setMobileOpen(true)} />
        <main>
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
