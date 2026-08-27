import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import CadastroFrota from "./pages/CadastroFrota";
import Dashboard from "./pages/Dashboard";
import Frota from "./pages/Frota";
import Funcionarios from "./pages/funcionario/Funcionario";
import CadastroFuncionario from "./pages/funcionario/CadastroFuncionario";
import Login from "./pages/Login";
import Viagens from "./pages/Viagens";
import Relatorios from "./pages/Relatorios";
import RecuperarSenha from "./pages/RecuperarSenha";
import RedefinirSenha from "./pages/RedefinirSenha";

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
