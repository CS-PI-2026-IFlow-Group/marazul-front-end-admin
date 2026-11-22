import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { usePageTitle } from "../hooks/usePageTitle";

export default function AcessoNegado({ message }) {
  usePageTitle("Acesso Negado");

  return (
    <div className="flex min-h-[480px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <EmptyState
        icon={ShieldX}
        title="Acesso negado"
        description={message}
        action={
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/">Ir para o início</Link>
          </Button>
        }
      />
    </div>
  );
}
