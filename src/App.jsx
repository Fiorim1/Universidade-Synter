import { Routes, Route } from "react-router-dom";

import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import UpdatePassword from "./components/UpdatePassword.jsx";

import Manuals from "./routes/Manuals.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Videos from "./pages/Videos.jsx";
import TabelaPrecos from "./pages/TabelaPrecos.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";


function App() {

  return (

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
      {/* PÁGINA NÃO ENCONTRADA                    */}
      {/* ======================================== */}

      <Route
        path="*"
        element={
          <h1>
            Página não encontrada
          </h1>
        }
      />


    </Routes>

  );

}


export default App;