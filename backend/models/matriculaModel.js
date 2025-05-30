const pool = require('../db');

const createMatricula = async (aluno_id, turma_id, responsavel_id, observacoes, data_matricula, ano_letivo, turno) => {
  const [result] = await pool.query(
    `INSERT INTO matricula (aluno_id, turma_id, responsavel_id, observacoes, data_matricula, ano_letivo, turno)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [aluno_id, turma_id, responsavel_id, observacoes, data_matricula, ano_letivo, turno]
  );
  return result.insertId;
};


const getMatriculas = async () => {
  const [rows] = await pool.query(`
    SELECT m.*, a.nome AS aluno_nome, t.nome AS turma_nome, r.nome AS responsavel_nome
    FROM matricula m
    JOIN aluno a ON m.aluno_id = a.id
    JOIN turma t ON m.turma_id = t.id
    LEFT JOIN responsavel r ON m.responsavel_id = r.id
  `);
  return rows;
};

const getMatriculaById = async (id) => {
  const [rows] = await pool.query(
    `SELECT m.*, a.nome AS aluno_nome, t.nome AS turma_nome, r.nome AS responsavel_nome
     FROM matricula m
     JOIN aluno a ON m.aluno_id = a.id
     JOIN turma t ON m.turma_id = t.id
     LEFT JOIN responsavel r ON m.responsavel_id = r.id
     WHERE m.id = ?`,
    [id]
  );
  return rows[0];
};

const updateMatricula = async (id, turma_id, responsavel_id, status, observacoes) => {
  await pool.query(
    `UPDATE matricula
     SET turma_id = ?, responsavel_id = ?, status = ?, observacoes = ?
     WHERE id = ?`,
    [turma_id, responsavel_id, status, observacoes, id]
  );
};

const deleteMatricula = async (id) => {
  await pool.query(`DELETE FROM matricula WHERE id = ?`, [id]);
};

const atualizarStatusMatricula = async (id, status) => {
  const [result] = await pool.query(
    `UPDATE matricula SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
};



module.exports = {
  createMatricula,
  getMatriculas,
  getMatriculaById,
  updateMatricula,
  deleteMatricula,
  atualizarStatusMatricula,
};
