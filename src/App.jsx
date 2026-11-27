import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RequirePermission from "./components/RequirePermission";
import { Toaster } from "./components/ui/sonner";
import AuthProvider from "./context/AuthProvider";
import Login from "./pages/auth/Login";
import RecuperarSenha from "./pages/auth/RecuperarSenha";
import RedefinirSenha from "./pages/auth/RedefinirSenha";
import CadastroFrota from "./pages/CadastroFrota";
import Dashboard from "./pages/Dashboard";
import Frota from "./pages/Frota";
import Inicio from "./pages/Inicio";
import CadastroFuncionario from "./pages/funcionario/CadastroFuncionario";
import Funcionarios from "./pages/funcionario/Funcionario";
import CadastroCliente from "./pages/cliente/CadastroCliente";
import Clientes from "./pages/cliente/Clientes";
import CadastroPassageiro from "./pages/passageiro/CadastroPassageiro";
import Passageiros from "./pages/passageiro/Passageiros";
import CadastroPerfil from "./pages/perfil/CadastroPerfil";
import Perfis from "./pages/perfil/Perfis";
import Relatorios from "./pages/Relatorios";
import ResumoMensal from "./pages/ResumoMensal";
import CadastroViagem from "./pages/viagem/CadastroViagem";
import DetalhesViagem from "./pages/viagem/DetalhesViagem";
import Viagens from "./pages/viagem/Viagens";
import NotFound from "./pages/NotFound";

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
              <AuthProvider>
                <DashboardLayout />
              </AuthProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Inicio />} />

          <Route element={<RequirePermission permission="dashboard:view" />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<RequirePermission permission="frota:view" />}>
            <Route path="/frota" element={<Frota />} />
            <Route path="/frota/cadastro" element={<CadastroFrota />} />
            <Route path="/frota/editar/:id" element={<CadastroFrota />} />
          </Route>

          <Route element={<RequirePermission permission="viagens:view" />}>
            <Route path="/viagens" element={<Viagens />} />
            <Route path="/viagens/cadastro" element={<CadastroViagem />} />
            <Route path="/viagens/detalhes/:id" element={<DetalhesViagem />} />
            <Route
              path="/viagens/editar/:id"
              element={<CadastroViagem isEdicao={true} />}
            />
          </Route>

          <Route element={<RequirePermission permission="passageiros:view" />}>
            <Route path="/passageiros" element={<Passageiros />} />
            <Route path="/passageiros/cadastro" element={<CadastroPassageiro />} />
            <Route
              path="/passageiros/editar/:id"
              element={<CadastroPassageiro isEdicao={true} />}
            />
          </Route>

          <Route element={<RequirePermission permission="funcionario:view" />}>
            <Route path="/funcionario" element={<Funcionarios />} />
            <Route
              path="/funcionario/cadastro"
              element={<CadastroFuncionario />}
            />
            <Route
              path="/funcionario/editar/:id"
              element={<CadastroFuncionario isEdicao={true} />}
            />
          </Route>

          <Route element={<RequirePermission permission="clientes:view" />}>
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/cadastro" element={<CadastroCliente />} />
            <Route path="/clientes/editar/:id" element={<CadastroCliente isEdicao={true} />} />
          </Route>

          <Route element={<RequirePermission permission="perfis:view" />}>
            <Route path="/perfis" element={<Perfis />} />
            <Route path="/perfis/cadastro" element={<CadastroPerfil />} />
            <Route
              path="/perfis/editar/:id"
              element={<CadastroPerfil isEdicao={true} />}
            />
          </Route>

          <Route element={<RequirePermission permission="relatorios:view" />}>
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/relatorios/resumo-mensal" element={<ResumoMensal />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}
