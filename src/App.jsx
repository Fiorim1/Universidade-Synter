import { Routes, Route } from "react-router-dom"

import Login from "./components/Login.jsx"
import Register from "./components/Register.jsx"
import ForgotPassword from "./components/ForgotPassword.jsx"
import UpdatePassword from "./components/UpdatePassword.jsx"

import Dashboard from "./pages/Dashboard.jsx"

import ProtectedRoute from "./components/ProtectedRoute.jsx"
import PublicRoute from "./components/PublicRoute.jsx"


function App() {

    return (

        <Routes>

            {/* 
                PÁGINA INICIAL DO SISTEMA

                Ao acessar:
                localhost:5173/

                o usuário verá o Login.

                Se já estiver autenticado,
                PublicRoute envia para /dashboard.
            */}
            <Route
                path="/"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />


            {/* 
                Também permite acessar o login
                através de /login.
            */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />


            {/* Cadastro de usuário */}
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />


            {/* Recuperação de senha */}
            <Route
                path="/forgot-password"
                element={
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                }
            />


            {/* 
                Nova senha.

                NÃO usamos PublicRoute aqui porque
                o link de recuperação do Supabase
                cria uma sessão temporária.
            */}
            <Route
                path="/update-password"
                element={<UpdatePassword />}
            />


            {/* 
                DASHBOARD PROTEGIDO

                Só entra se existir uma
                sessão válida no Supabase.
            */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            {/* Página inexistente */}
            <Route
                path="*"
                element={
                    <h1>Página não encontrada</h1>
                }
            />

        </Routes>

    )

}

export default App