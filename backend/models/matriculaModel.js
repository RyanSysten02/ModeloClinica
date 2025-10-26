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

const getMatriculas = async () => {
  const [rows] = await pool.query(`
    SELECT m.*, a.nome AS aluno_nome, t.nome AS turma_nome, r.nome AS responsavel_nome
    FROM matricula m
    JOIN aluno a ON m.aluno_id = a.id
    LEFT JOIN turma t ON m.turma_id = t.id
    LEFT JOIN responsavel r ON m.responsavel_id = r.id
  `);
  return rows;
};

// =================================================================
// FUNÇÃO CORRIGIDA
// =================================================================
const getMatriculasQuery = async (query) => {
  // 1. Define os parâmetros a partir da query da requisição
  const periodo = query?.periodo?.split(';');
  const turmaId = query?.turma_id;

  // 2. Inicia a construção da query base com Knex
  let querySelect = knex
    .select(
      'matricula.*',
      'aluno.nome as aluno_nome',
      'turma.nome as turma_nome',
      'aluno_turma.id as aluno_turma_id',
      'aluno_turma.campo_unico as campo_unico'
      // Obs: Removi 'aluno_turma.ano_letivo' e 'aluno_turma.turma_id' do SELECT
      // para evitar ambiguidade com 'matricula.ano_letivo' e 'matricula.turma_id'
    )
    .from('matricula')
    .innerJoin('aluno', 'matricula.aluno_id', 'aluno.id')
    .leftJoin('aluno_turma', 'matricula.id', 'aluno_turma.matricula_id')
    // Faz o LEFT JOIN com 'turma' usando 'matricula.turma_id',
    // o que é consistente com os filtros e as outras funções.
    .leftJoin('turma', 'matricula.turma_id', 'turma.id')
    .whereNotIn('matricula.status', ['inativa', 'cancelada']);

  // 3. Adiciona filtros condicionais à query
  if (periodo && periodo.length > 0) {
    querySelect = querySelect.whereIn('matricula.ano_letivo', periodo);
  }

  if (turmaId && turmaId !== 'null') {
    querySelect = querySelect.where('matricula.turma_id', turmaId);
  }

  if (turmaId === 'null') {
    querySelect = querySelect.whereNull('matricula.turma_id');
  }

  // 4. Executa a query construída
  const result = await querySelect;

  // 5. Retorna o resultado
  return result;
};
// =================================================================
// FIM DA FUNÇÃO CORRIGIDA
// =================================================================

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