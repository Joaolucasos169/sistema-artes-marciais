const express = require('express');
const router = express.Router();
const db = require('../db');
const { autenticarToken } = require('../middlewares/authMiddleware');

// 1. BUSCAR LISTA DE FREQUÊNCIA DA TURMA EM UMA DATA
// GET /api/frequencias?modalidade_id=1&data_aula=2026-09-28
router.get('/', autenticarToken, async (req, res) => {
  const { modalidade_id, data_aula } = req.query;

  if (!modalidade_id || !data_aula) {
    return res.status(400).json({ erro: 'Informe o ID da modalidade e a data da aula.' });
  }

  try {
    const query = `
      SELECT 
        a.id AS aluno_id,
        a.nome AS aluno_nome,
        a.graduacao,
        COALESCE(f.presente, false) AS presente,
        f.observacao
      FROM alunos a
      JOIN matriculas m ON a.id = m.aluno_id AND m.ativo = TRUE
      LEFT JOIN frequencias f ON a.id = f.aluno_id 
                             AND f.modalidade_id = $1 
                             AND f.data_aula = $2
      WHERE m.modalidade_id = $1 AND a.ativo = TRUE
      ORDER BY a.nome ASC;
    `;

    const resultado = await db.query(query, [modalidade_id, data_aula]);
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar lista de frequência.' });
  }
});

// 2. REGISTRAR / ATUALIZAR FREQUÊNCIA EM LOTE
// POST /api/frequencias
router.post('/', autenticarToken, async (req, res) => {
  const { modalidade_id, data_aula, presencas } = req.body; 
  // presencas deve ser um array: [{ aluno_id: 1, presente: true, observacao: "" }, ...]

  if (!modalidade_id || !data_aula || !Array.isArray(presencas)) {
    return res.status(400).json({ erro: 'Dados de frequência inválidos.' });
  }

  try {
    await db.query('BEGIN');

    for (const item of presencas) {
      const { aluno_id, presente, observacao } = item;

      // Upsert: Atualiza se já existir registro naquela data/modalidade, ou insere um novo
      const queryUpsert = `
        INSERT INTO frequencias (aluno_id, modalidade_id, data_aula, presente, observacao, registrado_por)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE 
        SET presente = EXCLUDED.presente, 
            observacao = EXCLUDED.observacao, 
            registrado_por = EXCLUDED.registrado_por;
      `;

      // Como o ID da tabela frequência é SERIAL, usamos a consulta de exclusão prévia ou inserção condicional por aluno e data
      await db.query(`
        DELETE FROM frequencias 
        WHERE aluno_id = $1 AND modalidade_id = $2 AND data_aula = $3
      `, [aluno_id, modalidade_id, data_aula]);

      await db.query(`
        INSERT INTO frequencias (aluno_id, modalidade_id, data_aula, presente, observacao, registrado_por)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [aluno_id, modalidade_id, data_aula, presente, observacao || null, req.usuario.id]);
    }

    await db.query('COMMIT');
    res.json({ mensagem: 'Frequência salva com sucesso!' });
  } catch (erro) {
    await db.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao registrar frequência.' });
  }
});

module.exports = router;