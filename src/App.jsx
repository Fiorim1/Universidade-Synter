import { useEffect } from "react";

import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// ========================================
// UNIVERSIDADE SYNTER
// AUTENTICAÇÃO
// ========================================

import * as LoginModule from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import UpdatePassword from "./components/UpdatePassword.jsx";

const Login = LoginModule.default ?? LoginModule.Login;

// ========================================
// CONTROLE DE ACESSO E RECUPERAÇÃO
// ========================================

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import PasswordRecoveryGuard from "./components/PasswordRecoveryGuard.jsx";

// ========================================
// DASHBOARDS
// ========================================

import Dashboard from "./pages/Dashboard.jsx";
import DashboardSAC from "./pages/DashboardSAC.jsx";

// ========================================
// APLICATIVO SYNTER
// ========================================

import AplicativoSynter from "./pages/AplicativoSynter.jsx";

// ========================================
// DOCUMENTAÇÃO E CONTEÚDOS
// ========================================

import Manuals from "./routes/Manuals.jsx";
import FichaTec from "./pages/FichaTec.jsx";
import Videos from "./pages/Videos.jsx";
import TabelaPrecos from "./pages/TabelaPrecos.jsx";
import PerguntasFrequentes from "./pages/PerguntasFrequentes.jsx";

// ========================================
// TREINAMENTOS
// ========================================

import TreinamentoComercial from "./pages/TreinamentoComercial.jsx";

// ========================================
// GESTÃO COMERCIAL
// ========================================

import Orcamentos from "./pages/Orcamentos.jsx";
import Marketing from "./pages/Marketing.jsx";
import DigMarketing from "./pages/DigMarketing.jsx";
import MecMarketing from "./pages/MecMarketing.jsx";
import FerragensMarketing from "./pages/FerragensMarketing.jsx";

// ========================================
// SELETOR DE FECHADURAS
// ========================================

import SeletorFechaduras from "./pages/SeletorFechaduras.jsx";

// ========================================
// REDE DE CREDENCIADOS
// ========================================

import TecnicosHomologados from "./pages/TecnicosHomologados.jsx";
import GerenciarTecnicos from "./pages/GerenciarTecnicos.jsx";

// ========================================
// ASSISTÊNCIA E ATENDIMENTO
// ========================================

import AssistenciaTecnica from "./pages/AssistenciaTecnica.jsx";
import VisitasTecnicas from "./pages/VisitasTecnicas.jsx";
import SynterAnalytics from "./pages/SynterAnalytics.jsx";

// ========================================
// FERRAMENTAS
// ========================================

import ImageToPdf from "./pages/ImageToPdf.jsx";

// ========================================
// ASSISTENTE SYNTER
// ========================================

import SynterAssistant from "./components/SynterAssistant.jsx";

// ========================================
// PÁGINA NÃO ENCONTRADA
// ========================================

import NotFound from "./pages/NotFound.jsx";

// ========================================
// ROTAS SEM ASSISTENTE
// ========================================

const ROTAS_SEM_ASSISTENTE = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/update-password",
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function App() {
  const location = useLocation();

  // ========================================
  // ROLAGEM AO TROCAR DE ROTA
  // ========================================

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // ========================================
  // EXIBIÇÃO DO ASSISTENTE SYNTER
  // ========================================

  const mostrarAssistente =
    !ROTAS_SEM_ASSISTENTE.includes(
      location.pathname
    );

  return (
    <>
      {/* ====================================
          PROTEÇÃO DA RECUPERAÇÃO DE SENHA

          Enquanto existir uma recuperação
          ativa, o sistema não deve liberar
          a navegação para outras páginas.

          A validação da alteração continua
          sendo responsabilidade do Supabase.
      ==================================== */}

      <PasswordRecoveryGuard>
        <Routes>

          {/* ====================================
              LOGIN
          ==================================== */}

          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* ====================================
              CADASTRO
          ==================================== */}

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* ====================================
              ESQUECI MINHA SENHA
          ==================================== */}

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* ====================================
              REDEFINIÇÃO DE SENHA

              Não utilizar PublicRoute ou
              ProtectedRoute nesta rota.

              O UpdatePassword valida a
              sessão de recuperação.
          ==================================== */}

          <Route
            path="/update-password"
            element={<UpdatePassword />}
          />

          {/* ====================================
              DASHBOARD PRINCIPAL
          ==================================== */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              DASHBOARD SAC
              ACESSO ADMINISTRATIVO
          ==================================== */}

          <Route
            path="/dashsac"
            element={
              <ProtectedRoute requiredRole="adm,sat">
                <DashboardSAC />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              APLICATIVO SYNTER
          ==================================== */}

          <Route
            path="/aplicativo-synter"
            element={
              <ProtectedRoute>
                <AplicativoSynter />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              MANUAIS
          ==================================== */}

          <Route
            path="/manuals"
            element={
              <ProtectedRoute>
                <Manuals />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              FICHAS TÉCNICAS
          ==================================== */}

          <Route
            path="/fichas-tecnicas"
            element={
              <ProtectedRoute>
                <FichaTec />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ficha-tecnica"
            element={
              <Navigate
                to="/fichas-tecnicas"
                replace
              />
            }
          />

          {/* ====================================
              VÍDEOS DE INSTALAÇÃO
          ==================================== */}

          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <Videos />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              TABELA DE PREÇOS
          ==================================== */}

          <Route
            path="/tabela-precos"
            element={
              <ProtectedRoute>
                <TabelaPrecos />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              PERGUNTAS FREQUENTES
          ==================================== */}

          <Route
            path="/perguntas-frequentes"
            element={
              <ProtectedRoute>
                <PerguntasFrequentes />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              TREINAMENTO COMERCIAL
          ==================================== */}

          <Route
            path="/treinamento-comercial"
            element={
              <ProtectedRoute>
                <TreinamentoComercial />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              ORÇAMENTOS
          ==================================== */}

          <Route
            path="/orcamentos"
            element={
              <ProtectedRoute>
                <Orcamentos />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              SELETOR DE FECHADURAS
          ==================================== */}

          <Route
            path="/seletor-fechaduras"
            element={
              <ProtectedRoute>
                <SeletorFechaduras />
              </ProtectedRoute>
            }
          />

          <Route
            path="/comparador-fechaduras"
            element={
              <Navigate
                to="/seletor-fechaduras"
                replace
              />
            }
          />

          {/* ====================================
              REDE DE CREDENCIADOS
          ==================================== */}

          <Route
            path="/tecnicos-homologados"
            element={
              <ProtectedRoute>
                <TecnicosHomologados />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tecnicos-homologados/gerenciar"
            element={
              <ProtectedRoute>
                <GerenciarTecnicos />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              ASSISTÊNCIA TÉCNICA
              ACESSO ADMINISTRATIVO
          ==================================== */}

          <Route
            path="/assistencia-tecnica"
            element={
              <ProtectedRoute requiredRole="adm,sat">
                <AssistenciaTecnica />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              VISITAS TÉCNICAS
              ACESSO ADMINISTRATIVO
          ==================================== */}

          <Route
            path="/visitas-tecnicas"
            element={
              <ProtectedRoute>
                <VisitasTecnicas />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              SYNTER ANALYTICS
              ACESSO ADMINISTRATIVO
          ==================================== */}

          <Route
            path="/synter-analytics"
            element={
              <ProtectedRoute requiredRole="adm,sat">
                <SynterAnalytics />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              MARKETING
          ==================================== */}

          <Route
            path="/marketing"
            element={
              <ProtectedRoute>
                <Marketing />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              MARKETING — FECHADURAS DIGITAIS
          ==================================== */}

          <Route
            path="/digmarketing"
            element={
              <ProtectedRoute>
                <DigMarketing />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              MARKETING — FECHADURAS MECÂNICAS
          ==================================== */}

          <Route
            path="/mecmarketing"
            element={
              <ProtectedRoute>
                <MecMarketing />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              MARKETING — FERRAGENS
          ==================================== */}

          <Route
            path="/ferragensmarketing"
            element={
              <ProtectedRoute>
                <FerragensMarketing />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              CONVERSOR DE IMAGEM PARA PDF
          ==================================== */}

          <Route
            path="/imagem-para-pdf"
            element={
              <ProtectedRoute>
                <ImageToPdf />
              </ProtectedRoute>
            }
          />

          {/* ====================================
              ROTAS ANTIGAS DE MFA

              Redirecionamentos de
              compatibilidade.
          ==================================== */}

          <Route
            path="/mfa/setup"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/mfa/verify"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* ====================================
              PÁGINA NÃO ENCONTRADA
          ==================================== */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </PasswordRecoveryGuard>

      {/* ====================================
          ASSISTENTE SYNTER
      ==================================== */}

      {mostrarAssistente && (
        <SynterAssistant />
      )}
    </>
  );
}