const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importação das Rotas
const authRoutes = require('./routes/authRoutes');
const alunosRoutes = require('./routes/alunosRoutes');
const frequenciasRoutes = require('./routes/frequenciasRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { erro: 'Limite de requisições excedido. Tente novamente mais tarde.' }
});
app.use(globalLimiter);
app.use(express.json());

// Registro dos Endpoints da API
app.use('/api/auth', authRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/frequencias', frequenciasRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API de Controle de Alunos rodando com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});