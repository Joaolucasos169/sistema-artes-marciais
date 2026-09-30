const pool = require('./src/config/db'); // Ajusta conforme o teu caminho de conexão
const bcrypt = require('bcrypt');

async function seedAdmin() {
  try {
    const emailAdmin = 'admin@sistema.com';
    const senhaPura = '123456';
    
    // Verifica se já existe
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [emailAdmin]);
    
    if (existe.rows.length > 0) {
      console.log('ℹ️ Utilizador administrador já existe na base de dados.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senhaPura, salt);

    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES ($1, $2, $3, $4)`,
      ['Administrador', emailAdmin, hash, 'ADMIN']
    );

    console.log('✅ Utilizador administrador criado com sucesso! E-mail: admin@sistema.com | Senha: 123456');
  } catch (err) {
    console.error('❌ Erro ao criar admin:', err.message);
  } finally {
    pool.end();
  }
}

seedAdmin();