import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Componente para proteger rotas privadas
function PrivateRoute({ children }) {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <p>A carregar...</p>
      </div>
    );
  }

  return usuario ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota pública de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rota protegida do Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />

          {/* Redireciona qualquer rota inválida ou a raiz para o login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}