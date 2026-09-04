import { Routes, Route } from "react-router-dom";

import Home from "./components/Home.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Register from "./components/Register.jsx";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Home />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}

export default App;