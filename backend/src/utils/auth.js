const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const gerarHashSenha = async (senha) => {
  const salt = await bcrypt.genSalt(12); // Custo 12 para maior segurança
  return await bcrypt.hash(senha, salt);
};

const compararSenha = async (senha, senhaHash) => {
  return await bcrypt.compare(senha, senhaHash);
};

const gerarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      perfil: usuario.perfil,
      nome: usuario.nome 
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Configuração segura para gravação de Cookie HttpOnly
const cookieOptions = {
  httpOnly: true, // Impede acesso via JavaScript (Proteção contra XSS)
  secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em produção
  sameSite: 'strict', // Proteção contra CSRF
  maxAge: 8 * 60 * 60 * 1000 // Expira em 8 horas
};

module.exports = {
  gerarHashSenha,
  compararSenha,
  gerarToken,
  cookieOptions
};