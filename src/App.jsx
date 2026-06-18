import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RecuperarSenha from "./pages/RecuperarSenha";
import { Toaster } from "./components/ui/sonner";
import RedefinirSenha from "./pages/RedefinirSenha";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
