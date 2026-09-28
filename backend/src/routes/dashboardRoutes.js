const express = require('express');
const router = express.Router();
const db = require('../db');
const { autenticarToken } = require('../middlewares/authMiddleware');

// GET /api/dashboard/stats
router.get('/stats', autenticarToken, async (req, res) => {
  try {
    // 1. Estatísticas Gerais (Total Unico e Porcentagem por Gênero Geral)
    const queryGeral = `
      SELECT 
        COUNT(DISTINCT a.id)::int AS total_alunos_geral,
        ROUND(COUNT(DISTINCT CASE WHEN a.genero = 'M' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 2) AS pct_homens_geral,
        ROUND(COUNT(DISTINCT CASE WHEN a.genero = 'F' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 2) AS pct_mulheres_geral
      FROM alunos a
      JOIN matriculas mat ON a.id = mat.aluno_id AND mat.ativo = TRUE
      WHERE a.ativo = TRUE;
    `;

    // 2. Estatísticas por Modalidade (Inscritos e Porcentagem por Gênero)
    const queryPorModalidade = `
      SELECT 
        m.id AS modalidade_id,
        m.nome AS modalidade_nome,
        COUNT(mat.aluno_id)::int AS total_inscritos,
        ROUND(COUNT(CASE WHEN a.genero = 'M' THEN 1 END) * 100.0 / NULLIF(COUNT(mat.aluno_id), 0), 2) AS pct_homens,
        ROUND(COUNT(CASE WHEN a.genero = 'F' THEN 1 END) * 100.0 / NULLIF(COUNT(mat.aluno_id), 0), 2) AS pct_mulheres
      FROM modalidades m
      LEFT JOIN matriculas mat ON m.id = mat.modalidade_id AND mat.ativo = TRUE
      LEFT JOIN alunos a ON mat.aluno_id = a.id AND a.ativo = TRUE
      WHERE m.ativo = TRUE
      GROUP BY m.id, m.nome
      ORDER BY m.nome ASC;
    `;

    const resGeral = await db.query(queryGeral);
    const resModalidades = await db.query(queryPorModalidade);

    res.json({
      geral: resGeral.rows[0] || { total_alunos_geral: 0, pct_homens_geral: 0, pct_mulheres_geral: 0 },
      modalidades: resModalidades.rows
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao carregar estatísticas do dashboard.' });
  }
});

module.exports = router;