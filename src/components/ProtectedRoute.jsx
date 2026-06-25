import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // replace evita que o usuário volte ao painel pelo botão "Voltar".
    return <Navigate to="/login" replace />;
  }

  return children;
}
