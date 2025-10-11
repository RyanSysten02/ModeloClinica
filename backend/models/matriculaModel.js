const pool = require('../db');
const knex = require('../lib/knex');

const createMatricula = async (
  aluno_id,
  turma_id,
  responsavel_id,
  observacoes,
  data_matricula,
  ano_letivo,
  turno
) => {
  const [result] = await pool.query(
    `INSERT INTO matricula (aluno_id, turma_id, responsavel_id, observacoes, data_matricula, ano_letivo, turno)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      aluno_id,
      turma_id,
      responsavel_id,
      observacoes,
      data_matricula,
      ano_letivo,
      turno,
    ]
  );
  return result.insertId;
};

const getMatriculas = async (query) => {
  const [rows] = await pool.query(`
    SELECT m.*, a.nome AS aluno_nome, t.nome AS turma_nome, r.nome AS responsavel_nome
    FROM matricula m
    JOIN aluno a ON m.aluno_id = a.id
    LEFT JOIN turma t ON m.turma_id = t.id
    LEFT JOIN responsavel r ON m.responsavel_id = r.id
  `);
  return rows;
};

const getMatriculasQuery = async (query) => {
  const values = query?.periodo?.split(';');

  const result = await knex
    .select(
      'matricula.*',
      'aluno.nome as aluno_nome',
      'turma.nome as turma_nome'
    )
    .from('matricula')
    .innerJoin('aluno', 'matricula.aluno_id', 'aluno.id')
    .leftJoin('turma', 'matricula.turma_id', 'turma.id')
    .whereIn('matricula.ano_letivo', values);

  return result;
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

const getMatriculasByTurma = async (turmaId) => {
  // A query é a mesma de getMatriculas, mas com um "WHERE" para filtrar por turma.
  const [rows] = await pool.query(
    `
    SELECT m.*, a.nome AS aluno_nome, a.id AS aluno_id, t.nome AS turma_nome, r.nome AS responsavel_nome
    FROM matricula m
    JOIN aluno a ON m.aluno_id = a.id
    JOIN turma t ON m.turma_id = t.id
    LEFT JOIN responsavel r ON m.responsavel_id = r.id
    WHERE m.turma_id = ?
  `,
    [turmaId]
  ); // Passar o ID como parâmetro previne SQL Injection
  return rows;
};

const updateMatricula = async (
  id,
  turma_id,
  responsavel_id,
  status,
  observacoes
) => {
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
  getMatriculasByTurma,
  getMatriculasQuery,
};
