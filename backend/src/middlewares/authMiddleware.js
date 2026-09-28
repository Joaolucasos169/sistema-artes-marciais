const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
  // Busca o token no cookie seguro ou no header Authorization (para compatibilidade)
  const token = req.cookies?.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Sessão não encontrada ou expirada.' });
  }

  try {
    const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuarioDecodificado;
    next();
  } catch (erro) {
    return res.status(403).json({ erro: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
};

const autorizarAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.perfil === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ erro: 'Acesso restrito apenas para administradores.' });
  }
};

module.exports = { autenticarToken, autorizarAdmin };