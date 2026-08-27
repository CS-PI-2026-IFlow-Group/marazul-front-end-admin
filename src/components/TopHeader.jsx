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
import { toast } from "sonner";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { getProfile, logout } from "../lib/auth";

export default function TopHeader({ onOpenMenu }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileFailed, setProfileFailed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let active = true;

    getProfile()
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch((error) => {
        if (!active) return;

        // Token expirado ou sessão inválida (401) já é tratado pelo interceptor
        // do axios, que limpa o token e redireciona. Duplicar aqui causaria
        // navegação dupla.
        if (error.response?.status === 401) return;

        // API indisponível ou erro inesperado: o painel continua utilizável e
        // o usuário fica sabendo que o perfil não carregou.
        setProfileFailed(true);
        toast.error("Não foi possível carregar seu perfil", {
          description:
            "Verifique sua conexão com o servidor e recarregue a página.",
        });
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

  const displayName = profile
    ? profile.nome
    : profileFailed
      ? "Perfil indisponível"
      : "Carregando...";

  const handleLogout = () => {
    logout();
    // replace impede voltar ao painel pelo botão "Voltar" do navegador.
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
      {/* Botão hambúrguer (apenas mobile) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMenu}
        aria-label="Abrir menu"
        className="text-[#062A45] hover:bg-slate-100 md:hidden"
      >
        <Menu className="size-6" />
      </Button>

      {/* Empurra o conteúdo da conta para a direita no desktop */}
      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        {/* Notificações */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notificações"
          className="text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell className="size-5" />
        </Button>

        <div className="h-8 w-px bg-slate-200" />

        {/* Conta */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            onClick={() => setAccountOpen((v) => !v)}
            className="flex h-auto items-center gap-2 px-1 normal-case tracking-normal hover:bg-slate-100"
          >
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-bold text-[#062A45]">
                {displayName}
              </p>
              <p className="text-xs font-normal text-slate-500">Administrador</p>
            </div>
            <UserCircle className="size-8 text-[#062A45]" />
            <ChevronDown
              className={cn(
                "size-4 text-slate-400 transition",
                accountOpen && "rotate-180",
              )}
            />
          </Button>

          {accountOpen && (
            <div className="absolute right-0 mt-2 w-56 border border-slate-200 bg-white py-2 text-slate-800 shadow-xl">
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Usuário Logado
                </p>
                <p className="truncate text-sm font-bold text-[#062A45]">
                  {displayName}
                </p>
                {profile && (
                  <p className="truncate text-xs text-slate-500">
                    {profile.email}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-2 rounded-none px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-slate-800 hover:bg-slate-50"
              >
                <Settings className="size-4 text-slate-400" /> Conta
              </Button>

              <div className="my-1 border-t border-slate-100" />

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="h-auto w-full justify-start gap-2 rounded-none px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-[#e31e24] hover:bg-red-50 hover:text-[#c1191f]"
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
