import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';

// Componente temporário para rotas protegidas
const RotaPrivada = ({ children }) => {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        A carregar sessão...
      </div>
    );
  }

  return usuario ? children : <Navigate to="/login" />;
};

function RotasApp() {
  const { usuario } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/dashboard" /> : <Login />} />
      
      <Route 
        path="/dashboard" 
        element={
          <RotaPrivada>
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
              <h1 className="text-3xl font-bold">Painel / Dashboard (Em construção)</h1>
            </div>
          </RotaPrivada>
        } 
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <RotasApp />
      </AuthProvider>
    </Router>
  );
}