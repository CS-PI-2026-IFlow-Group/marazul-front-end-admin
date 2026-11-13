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
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">
        <Sidebar />
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="absolute top-6 right-3 z-10 text-muted-foreground"
        >
          <X className="size-5" />
        </Button>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader onOpenMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
