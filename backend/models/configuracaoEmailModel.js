const pool = require('../db.js'); // Ajuste o caminho para seu arquivo de conexão

const getConfiguracao = async () => {
  // Busca a configuração única (id=1)
  const [rows] = await pool.query('SELECT * FROM configuracao_email WHERE id = 1');
  return rows[0];
};

const updateConfiguracao = async (config) => {
  const { 
    smtp_host, smtp_port, smtp_user, smtp_pass, 
    smtp_secure, sender_name, sender_email 
  } = config;
  
  const [result] = await pool.query(
    `UPDATE configuracao_email SET 
      smtp_host = ?, smtp_port = ?, smtp_user = ?, smtp_pass = ?, 
      smtp_secure = ?, sender_name = ?, sender_email = ? 
    WHERE id = 1`,
    [smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, sender_name, sender_email]
  );
  return result;
};

module.exports = {
  getConfiguracao,
  updateConfiguracao,
};