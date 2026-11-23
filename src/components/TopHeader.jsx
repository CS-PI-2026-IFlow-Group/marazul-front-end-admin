import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { logout } from "../lib/auth";
import { useAuth } from "../context/AuthContext";

function getInitials(nome) {
  const parts = nome?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (parts.length === 0) return "";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

export default function TopHeader({ onOpenMenu }) {
  const navigate = useNavigate();
  const { profile, failed } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = profile
    ? profile.nome
    : failed
      ? "Perfil indisponível"
      : "Carregando...";

  const initials = getInitials(profile?.nome);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-6 backdrop-blur">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="text-foreground md:hidden"
      >
        <Menu className="size-5" />
      </Button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notificações"
          className="text-muted-foreground"
        >
          <Bell className="size-5" />
        </Button>

        <div className="relative border-l pl-4" ref={menuRef}>
          <Button
            variant="ghost"
            onClick={() => setAccountOpen((v) => !v)}
            aria-expanded={accountOpen}
            className="h-auto gap-3 px-1.5 py-1"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-base font-semibold text-foreground">
              {initials || <User className="size-4 text-muted-foreground" />}
            </span>
            <span className="hidden text-right sm:block">
              <span className="block text-base leading-tight font-semibold text-foreground">
                {displayName}
              </span>
              {profile?.perfil && (
                <span className="block text-sm font-normal text-muted-foreground">
                  {profile.perfil}
                </span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition",
                accountOpen && "rotate-180",
              )}
            />
          </Button>

          {accountOpen && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border bg-popover py-1.5 text-popover-foreground shadow-lg">
              <div className="border-b px-4 py-2">
                <p className="text-sm text-muted-foreground">Usuário Logado</p>
                <p className="truncate text-base font-semibold">{displayName}</p>
                {profile && (
                  <p className="truncate text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-2 rounded-none px-4 py-2.5 text-base font-normal"
              >
                <Settings className="size-4 text-muted-foreground" /> Conta
              </Button>

              <div className="my-1 border-t" />

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="h-auto w-full justify-start gap-2 rounded-none px-4 py-2.5 text-base font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="size-4" /> Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
