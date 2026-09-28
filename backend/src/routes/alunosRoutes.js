const express = require('express');
const router = express.Router();
const db = require('../db');
const { autenticarToken } = require('../middlewares/authMiddleware');

// 1. LISTAR ALUNOS (Com filtro opcional por modalidade)
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { modalidade_id } = req.query;
    let query = `
      SELECT DISTINCT a.*, 
             ARRAY_AGG(m.nome) AS modalidades
      FROM alunos a
      LEFT JOIN matriculas mat ON a.id = mat.aluno_id AND mat.ativo = TRUE
      LEFT JOIN modalidades m ON mat.modalidade_id = m.id
      WHERE a.ativo = TRUE
    `;
    const params = [];

    // Se for PROFESSOR, filtra automaticamente para mostrar apenas os alunos das modalidades que ele leciona
    if (req.usuario.perfil === 'PROFESSOR') {
      query += ` AND mat.modalidade_id IN (
        SELECT modalidade_id FROM professor_modalidade WHERE professor_id = $1
      )`;
      params.push(req.usuario.id);
    } else if (modalidade_id) {
      params.push(modalidade_id);
      query += ` AND mat.modalidade_id = $${params.length}`;
    }

    query += ` GROUP BY a.id ORDER BY a.nome ASC`;

    const resultado = await db.query(query, params);
    res.json(resultado.rows);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao buscar alunos.' });
  }
});

// 2. CADASTRAR ALUNO
router.post('/', autenticarToken, async (req, res) => {
  const {
    nome,
    cpf,
    data_nascimento,
    genero,
    telefone,
    email,
    graduacao,
    foto_url,
    tipo_sanguineo,
    nome_pai,
    nome_mae,
    rua,
    numero,
    bairro,
    cidade,
    estado,
    cep,
    modalidades_ids // Array com IDs das modalidades em que o aluno será matriculado ex: [1, 2]
  } = req.body;

  if (!nome || !data_nascimento || !genero) {
    return res.status(400).json({ erro: 'Nome, data de nascimento e gênero são obrigatórios.' });
  }

  try {
    // Inicia uma transação no PostgreSQL
    await db.query('BEGIN');

    // Inserção com PreparedStatement (Proteção contra SQL Injection)
    const sqlAluno = `
      INSERT INTO alunos (
        nome, cpf, data_nascimento, genero, telefone, email, graduacao, foto_url,
        tipo_sanguineo, nome_pai, nome_mae, rua, numero, bairro, cidade, estado, cep
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `;

    const paramsAluno = [
      nome, cpf || null, data_nascimento, genero, telefone || null, email || null,
      graduacao || null, foto_url || null, tipo_sanguineo || null, nome_pai || null,
      nome_mae || null, rua || null, numero || null, bairro || null, cidade || null,
      estado || null, cep || null
    ];

    const resAluno = await db.query(sqlAluno, paramsAluno);
    const novoAluno = resAluno.rows[0];

    // Matricular o aluno nas modalidades selecionadas
    if (Array.isArray(modalidades_ids) && modalidades_ids.length > 0) {
      for (const modId of modalidades_ids) {
        await db.query(
          'INSERT INTO matriculas (aluno_id, modalidade_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [novoAluno.id, modId]
        );
      }
    }

    await db.query('COMMIT');
    res.status(201).json({ mensagem: 'Aluno cadastrado com sucesso!', aluno: novoAluno });
  } catch (erro) {
    await db.query('ROLLBACK');
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao cadastrar aluno.' });
  }
});

// 3. EDITAR ALUNO
router.put('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const {
    nome, cpf, data_nascimento, genero, telefone, email, graduacao, foto_url,
    tipo_sanguineo, nome_pai, nome_mae, rua, numero, bairro, cidade, estado, cep
  } = req.body;

  try {
    const sql = `
      UPDATE alunos SET
        nome = $1, cpf = $2, data_nascimento = $3, genero = $4, telefone = $5,
        email = $6, graduacao = $7, foto_url = $8, tipo_sanguineo = $9, nome_pai = $10,
        nome_mae = $11, rua = $12, numero = $13, bairro = $14, cidade = $15,
        estado = $16, cep = $17
      WHERE id = $18 AND ativo = TRUE
      RETURNING *;
    `;

    const params = [
      nome, cpf, data_nascimento, genero, telefone, email, graduacao, foto_url,
      tipo_sanguineo, nome_pai, nome_mae, rua, numero, bairro, cidade, estado, cep, id
    ];

    const resultado = await db.query(sql, params);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    res.json({ mensagem: 'Dados do aluno atualizados!', aluno: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao atualizar aluno.' });
  }
});

// 4. EXCLUIR ALUNO (Soft Delete - altera status ativo para FALSE)
router.delete('/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await db.query(
      'UPDATE alunos SET ativo = FALSE WHERE id = $1 RETURNING id, nome',
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    res.json({ mensagem: 'Aluno removido com sucesso!', aluno: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao remover aluno.' });
  }
});

module.exports = router;