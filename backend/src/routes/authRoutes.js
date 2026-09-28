const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { gerarHashSenha, compararSenha, gerarToken, cookieOptions } = require('../utils/auth');

// Rate Limiter para a rota de Login (Máximo de 5 tentativas a cada 15 minutos)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { erro: 'Muitas tentativas de login. Tente novamente após 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Informe e-mail e senha.' });
  }

  try {
    // PROTEÇÃO SQL INJECTION: Uso de consulta parametrizada com $1
    const resultado = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const usuario = resultado.rows[0];
    const senhaValida = await compararSenha(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = gerarToken(usuario);

    // Envia o token dentro de um Cookie HttpOnly
    res.cookie('token', token, cookieOptions);

    res.json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno no servidor ao realizar login.' });
  }
});

// POST /api/auth/logout (Destrói o token limpando o cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });
  res.json({ mensagem: 'Logout realizado com sucesso! Sessão encerrada.' });
});

// GET /api/auth/me (Verifica usuário autenticado atual)
const { autenticarToken } = require('../middlewares/authMiddleware');
router.get('/me', autenticarToken, (req, res) => {
  res.json({ usuario: req.usuario });
});

module.exports = router;