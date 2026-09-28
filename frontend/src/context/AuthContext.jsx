import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Verifica se o utilizador já tem uma sessão ativa ao carregar a página
  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const resposta = await api.get('/auth/me');
        setUsuario(resposta.data.usuario);
      } catch (erro) {
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    };
    verificarSessao();
  }, []);

  const login = async (email, senha) => {
    const resposta = await api.post('/auth/login', { email, senha });
    setUsuario(resposta.data.usuario);
    return resposta.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (erro) {
      console.error('Erro ao fazer logout', erro);
    } finally {
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
};