import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  UserCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { getProfile, logout } from "../lib/auth";

export default function TopHeader({ onOpenMenu }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let active = true;
    getProfile().then((data) => {
      if (active) setProfile(data);
    });
    return () => {
      active = false;
    };
  }, []);

  // Fecha o dropdown ao clicar fora.
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    // replace impede voltar ao painel pelo botão "Voltar" do navegador.
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      {/* Botão hambúrguer (apenas mobile) */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="rounded-lg p-2 text-[#062A45] transition hover:bg-slate-100 md:hidden"
      >
        <Menu className="size-6" />
      </button>

      {/* Empurra o conteúdo da conta para a direita no desktop */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        {/* Notificações */}
        <button
          type="button"
          aria-label="Notificações"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
        >
          <Bell className="size-5" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        {/* Conta */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100"
          >
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-bold text-[#062A45]">
                {profile ? profile.nome : "Carregando..."}
              </p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
            <UserCircle className="size-8 text-[#062A45]" />
            <ChevronDown
              className={cn(
                "size-4 text-slate-400 transition",
                accountOpen && "rotate-180",
              )}
            />
          </button>

          {accountOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 text-slate-800 shadow-xl">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Usuário Logado
                </p>
                <p className="truncate text-sm font-bold text-[#062A45]">
                  {profile ? profile.nome : "Carregando..."}
                </p>
                {profile && (
                  <p className="truncate text-xs text-slate-500">
                    {profile.email}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-slate-50"
              >
                <Settings className="size-4 text-slate-400" /> Conta
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="size-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
