import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import CadastroFuncionario from "./pages/api/cadastros/CadastroFuncionario";
import Funcionarios from "./pages/api/cadastros/Funcionarios";
import Dashboard from "./pages/api/Dashboard";
import Frota from "./pages/api/Frota";
import Relatorios from "./pages/api/Relatorios";
import Viagens from "./pages/api/Viagens";
import Login from "./pages/auth/Login";
import RecuperarSenha from "./pages/auth/RecuperarSenha";
import RedefinirSenha from "./pages/auth/RedefinirSenha";

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
          <Route path="/viagens" element={<Viagens />} />

          <Route
            path="/cadastroFuncionario"
            element={<CadastroFuncionario />}
          />
          <Route path="/funcionarios" element={<Funcionarios />} />

          <Route path="/relatorios" element={<Relatorios />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
