const pool = require('../db');

const getPermissoesPorFuncao = async () => {
  const [rows] = await pool.query(`
    SELECT r.nome AS role, p.recurso, p.pode_acessar
    FROM permissoes p
    JOIN roles r ON p.role_id = r.id
  `);

  // Agrupar por função
  const result = {};
  rows.forEach(row => {
    if (!result[row.role]) result[row.role] = {};
    result[row.role][row.recurso] = !!row.pode_acessar;
  });

  return result;
};

const salvarPermissoes = async (permissoesAtualizadas) => {
  for (const role in permissoesAtualizadas) {
    const [[roleRow]] = await pool.query('SELECT id FROM roles WHERE nome = ?', [role]);
    const roleId = roleRow.id;

    for (const recurso in permissoesAtualizadas[role]) {
      const pode = permissoesAtualizadas[role][recurso];

      const [[perm]] = await pool.query(
        'SELECT id FROM permissoes WHERE role_id = ? AND recurso = ?',
        [roleId, recurso]
      );

      if (perm) {
        await pool.query(
          'UPDATE permissoes SET pode_acessar = ? WHERE id = ?',
          [pode, perm.id]
        );
      } else {
        await pool.query(
          'INSERT INTO permissoes (role_id, recurso, pode_acessar) VALUES (?, ?, ?)',
          [roleId, recurso, pode]
        );
      }
    }
  }
};

module.exports = {
  getPermissoesPorFuncao,
  salvarPermissoes,
};
