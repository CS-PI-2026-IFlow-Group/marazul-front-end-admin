import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { usePageTitle } from "../hooks/usePageTitle";

export default function AcessoNegado({ message }) {
  usePageTitle("Acesso Negado");

  return (
    <Card className="min-h-[480px]">
      <EmptyState
        icon={ShieldX}
        title="Acesso negado"
        description={message}
        action={
          <Button asChild variant="outline">
            <Link to="/">Ir para o início</Link>
          </Button>
        }
      />
    </Card>
  );
}
