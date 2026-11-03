
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
// PÁGINAS
// ========================================

import Manuals from "./routes/Manuals.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import DashboardSAC from "./pages/DashboardSAC.jsx";

import Videos from "./pages/Videos.jsx";
import TabelaPrecos from "./pages/TabelaPrecos.jsx";
import AssistenciaTecnica from "./pages/AssistenciaTecnica.jsx";
import VisitasTecnicas from "./pages/VisitasTecnicas.jsx";

import ImageToPdf from "./pages/ImageToPdf.jsx";
import TreinamentoComercial from "./pages/TreinamentoComercial.jsx";
import Marketing from "./pages/Marketing.jsx";
import DigMarketing from "./pages/DigMarketing.jsx";

import Orcamentos from "./pages/Orcamentos.jsx";
import FichaTec from "./pages/FichaTec.jsx";

import NotFound from "./pages/NotFound.jsx";

// ========================================
// CONTROLE DE ACESSO
// ========================================

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

// ========================================
// ASSISTENTE SYNTER
// ========================================

import SynterAssistant from "./components/SynterAssistant.jsx";

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

function App() {
  const location = useLocation();

  // ========================================
  // VOLTAR AO TOPO AO TROCAR DE ROTA
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
  // PÁGINAS SEM ASSISTENTE
  // ========================================

  const paginasPublicas = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/update-password",
  ];

  const mostrarAssistente =
    !paginasPublicas.includes(location.pathname);

  return (
    <>
      {/* ======================================== */}
      {/* ROTAS                                    */}
      {/* ======================================== */}

      <Routes>
        {/* ======================================== */}
        {/* LOGIN                                    */}
        {/* ======================================== */}

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

        {/* ======================================== */}
        {/* CADASTRO                                 */}
        {/* ======================================== */}

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* ======================================== */}
        {/* RECUPERAÇÃO DE SENHA                     */}
        {/* ======================================== */}

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* ======================================== */}
        {/* ATUALIZAÇÃO DE SENHA                     */}
        {/* ======================================== */}

        <Route
          path="/update-password"
          element={<UpdatePassword />}
        />

        {/* ======================================== */}
        {/* DASHBOARD                                */}
        {/* ======================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* DASHBOARD SAC                            */}
        {/* ======================================== */}

        <Route
          path="/dashsac"
          element={
            <ProtectedRoute>
              <DashboardSAC />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* MANUAIS DE PRODUTOS                      */}
        {/* ======================================== */}

        <Route
          path="/manuals"
          element={
            <ProtectedRoute>
              <Manuals />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* FICHAS TÉCNICAS                          */}
        {/* ======================================== */}

        <Route
          path="/fichas-tecnicas"
          element={
            <ProtectedRoute>
              <FichaTec />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* REDIRECIONAMENTO DA ROTA ANTIGA          */}
        {/* ======================================== */}

        <Route
          path="/ficha-tecnica"
          element={
            <Navigate
              to="/fichas-tecnicas"
              replace
            />
          }
        />

        {/* ======================================== */}
        {/* VÍDEOS                                   */}
        {/* ======================================== */}

        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* TABELA DE PREÇOS                         */}
        {/* ======================================== */}

        <Route
          path="/tabela-precos"
          element={
            <ProtectedRoute>
              <TabelaPrecos />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* ORÇAMENTOS                               */}
        {/* ======================================== */}

        <Route
          path="/orcamentos"
          element={
            <ProtectedRoute>
              <Orcamentos />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* ASSISTÊNCIA TÉCNICA                      */}
        {/* ======================================== */}

        <Route
          path="/assistencia-tecnica"
          element={
            <ProtectedRoute>
              <AssistenciaTecnica />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* VISITAS TÉCNICAS                         */}
        {/* ======================================== */}

        <Route
          path="/visitas-tecnicas"
          element={
            <ProtectedRoute>
              <VisitasTecnicas />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* CONVERSOR IMAGEM PARA PDF                */}
        {/* ======================================== */}

        <Route
          path="/imagem-para-pdf"
          element={
            <ProtectedRoute>
              <ImageToPdf />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* TREINAMENTO COMERCIAL                    */}
        {/* ======================================== */}

        <Route
          path="/treinamento-comercial"
          element={
            <ProtectedRoute>
              <TreinamentoComercial />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* MARKETING                                */}
        {/* ======================================== */}

        <Route
          path="/marketing"
          element={
            <ProtectedRoute>
              <Marketing />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* MARKETING DIGITAL                        */}
        {/* ======================================== */}

        <Route
          path="/digmarketing"
          element={
            <ProtectedRoute>
              <DigMarketing />
            </ProtectedRoute>
          }
        />

        {/* ======================================== */}
        {/* PÁGINAS ANTIGAS DO MFA                   */}
        {/* ======================================== */}

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

        {/* ======================================== */}
        {/* PÁGINA NÃO ENCONTRADA                    */}
        {/* ======================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>

      {/* ======================================== */}
      {/* ASSISTENTE SYNTER                         */}
      {/* ======================================== */}

      {mostrarAssistente && (
        <SynterAssistant />
      )}
    </>
  );
}

export default App;
