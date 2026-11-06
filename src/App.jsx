
import { useEffect } from "react";

import {
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// ========================================
// AUTENTICAÇÃO
// ========================================

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import UpdatePassword from "./components/UpdatePassword.jsx";

// ========================================
// CONTROLE DE ACESSO
// ========================================

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

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
// CONTEÚDOS E DOCUMENTAÇÃO
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

// ========================================
// COMPARADOR DE FECHADURAS
// ========================================

import ComparadorFechaduras from "./pages/ComparadorFechaduras.jsx";

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

function App() {
  const location = useLocation();

  // ========================================
  // VOLTAR AO TOPO AO MUDAR DE PÁGINA
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
  // CONTROLE DE EXIBIÇÃO DO ASSISTENTE
  // ========================================

  const mostrarAssistente =
    !ROTAS_SEM_ASSISTENTE.includes(
      location.pathname
    );

  return (
    <>
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
            RECUPERAR SENHA
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
            ATUALIZAR SENHA
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
        ==================================== */}

        <Route
          path="/dashsac"
          element={
            <ProtectedRoute>
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
            MANUAIS DE PRODUTOS
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

        {/* ROTA ANTIGA — FICHAS TÉCNICAS */}

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
            VÍDEOS EDUCATIVOS
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
            COMPARADOR DE FECHADURAS
            NOVA FUNCIONALIDADE
        ==================================== */}

        <Route
          path="/comparador-fechaduras"
          element={
            <ProtectedRoute>
              <ComparadorFechaduras />
            </ProtectedRoute>
          }
        />

        {/* ====================================
            ASSISTÊNCIA TÉCNICA
        ==================================== */}

        <Route
          path="/assistencia-tecnica"
          element={
            <ProtectedRoute>
              <AssistenciaTecnica />
            </ProtectedRoute>
          }
        />

        {/* ====================================
            VISITAS TÉCNICAS
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
        ==================================== */}

        <Route
          path="/synter-analytics"
          element={
            <ProtectedRoute>
              <SynterAnalytics />
            </ProtectedRoute>
          }
        />

        {/* ====================================
            MATERIAIS DE MARKETING
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
            MARKETING DIGITAL
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
            ROTAS ANTIGAS DE AUTENTICAÇÃO
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

      {/* ====================================
          ASSISTENTE SYNTER
      ==================================== */}

      {mostrarAssistente && (
        <SynterAssistant />
      )}

    </>
  );
}

export default App;
