import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./pages/Dashboard";
import Frota from "./pages/Frota";
import Relatorios from "./pages/Relatorios";
import Viagens from "./pages/Viagens";
import Login from "./pages/auth/Login";
import RecuperarSenha from "./pages/auth/RecuperarSenha";
import RedefinirSenha from "./pages/auth/RedefinirSenha";
import CadastroFuncionario from "./pages/funcionarios/CadastroFuncionario";
import Funcionarios from "./pages/funcionarios/Funcionarios";

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

          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route
            path="/funcionarios/cadastro"
            element={<CadastroFuncionario />}
          />
          <Route
            path="/funcionarios/editar/:id"
            element={<CadastroFuncionario isEdicao={true} />}
          />

          <Route path="/relatorios" element={<Relatorios />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
