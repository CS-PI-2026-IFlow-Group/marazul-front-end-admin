import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import Login from "./pages/auth/Login";
import RecuperarSenha from "./pages/auth/RecuperarSenha";
import RedefinirSenha from "./pages/auth/RedefinirSenha";
import CadastroFrota from "./pages/CadastroFrota";
import Dashboard from "./pages/Dashboard";
import Frota from "./pages/Frota";
import CadastroFuncionario from "./pages/funcionario/CadastroFuncionario";
import Funcionarios from "./pages/funcionario/Funcionario";
import Relatorios from "./pages/Relatorios";
import Viagens from "./pages/Viagens";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

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

          <Route path="/funcionario" element={<Funcionarios />} />
          <Route
            path="/funcionario/cadastro"
            element={<CadastroFuncionario />}
          />
          <Route
            path="/funcionario/editar/:id"
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
