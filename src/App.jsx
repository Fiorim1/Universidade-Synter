import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import UpdatePassword from "./components/UpdatePassword.jsx";

import Manuals from "./routes/Manuals.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Videos from "./pages/Videos.jsx";
import TabelaPrecos from "./pages/TabelaPrecos.jsx";
import AssistenciaTecnica from "./pages/AssistenciaTecnica.jsx";
import ImageToPdf from "./pages/ImageToPdf.jsx";
import TreinamentoComercial from "./pages/TreinamentoComercial.jsx";
import NotFound from "./pages/NotFound.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

import SynterAssistant from "./components/SynterAssistant.jsx";
import Marketing from "./pages/Marketing.jsx";


function App() {

  const location = useLocation();


  // ========================================
  // PÁGINAS ONDE O ASSISTENTE NÃO APARECE
  // ========================================

  const paginasPublicas = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/update-password"
  ];


  const mostrarAssistente =
    !paginasPublicas.includes(
      location.pathname
    );


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
        {/* NOVA SENHA                               */}
        {/* ======================================== */}

        <Route
          path="/update-password"
          element={
            <UpdatePassword />
          }
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
        {/* MANUAIS                                  */}
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

        <Route
          path="/marketing"
          element={
            <ProtectedRoute>
              <Marketing />
            </ProtectedRoute>
          }
        />


        {/* ======================================== */}
        {/* PÁGINA NÃO ENCONTRADA                    */}
        {/* ======================================== */}

        <Route
          path="*"
          element={
            <NotFound />
          }
        />


      </Routes>


      {/* ======================================== */}
      {/* ASSISTENTE SYNTER                        */}
      {/* ======================================== */}

      {mostrarAssistente && (
        <SynterAssistant />
      )}


    </>

  );

}


export default App;