import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Frota from "./pages/Frota";
import CadastroFrota from "./pages/CadastroFrota";
import Viagens from "./pages/Viagens";
import Funcionarios from "./pages/Funcionarios";
import Relatorios from "./pages/Relatorios";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        {/* Área autenticada: o layout fica fixo e só o Workspace muda */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/frota" element={<Frota />} />
          <Route path="/frota/cadastro" element={<CadastroFrota />} />
          <Route path="/viagens" element={<Viagens />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
