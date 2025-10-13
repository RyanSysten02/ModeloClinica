const knex = require('../lib/knex');

const QUATIDADE_PERMITIDA = 40;

const validate = async (turmaId) => {
  const result = await knex('aluno_turma').count('turma_id as total').where({
    turma_id: turmaId,
  });

  const total = result?.[0]?.total;

  if (total >= QUATIDADE_PERMITIDA) {
    throw Error(
      `A quantidade máxima de ${QUATIDADE_PERMITIDA} alunos permitida, já foi preenchida!`
    );
  }
};

const create = async (data) => {
  const turmaId = data?.turma_id;

  await validate(turmaId);

  const campo_unico = `${data?.matricula_id}_${data?.ano_letivo}`;
  const result = await knex('aluno_turma').insert({ ...data, campo_unico });

  return result;
};

const findAll = async () => {
  const result = await knex('aluno_turma').select();

  if (!result) return [];

  return result;
};

const findById = async (id) => {
  const result = await knex('aluno_turma').select().where({ id });

  if (!result) return [];

  return result?.at(0);
};

const findByMatriculaId = async (matriculaId) => {
  const result = await knex('aluno_turma')
    .select()
    .where({ matricula_id: matriculaId });

  if (!result) return [];

  return result;
};

const findByTurmaId = async (turmaId) => {
  const result = await knex('aluno_turma')
    .select()
    .where({ turma_id: turmaId });

  if (!result) return [];

  return result;
};

const update = async (id, data) => {
  const turmaId = data?.turma_id;

  await validate(turmaId);

  const result = await knex('aluno_turma').update(data).where({ id });
  return result;
};

const deleteById = async (id) => {
  await knex('aluno_turma').delete().where({ id });
};

const deleteByMatriculaId = async (matriculaId) => {
  await knex('aluno_turma').delete().where({ matricula_id: matriculaId });
};

const listStudentsByTurma = async (turmaId) => {
  const result = await knex
    .from('aluno_turma')
    .innerJoin('matricula', 'aluno_turma.matricula_id', 'matricula.id')
    .innerJoin('aluno', 'matricula.aluno_id', 'aluno.id')
    .where('aluno_turma.turma_id', turmaId)
    .select(
      'aluno_turma.*',
      'matricula.aluno_id',
      'aluno.nome as aluno_nome',
      'matricula.ano_letivo'
    );

  return result;
};

const listTurmasByMatricula = async (matriculaId) => {
  const result = await knex
    .from('aluno_turma')
    .innerJoin('turma', 'aluno_turma.turma_id', 'turma.id')
    .innerJoin('matricula', 'aluno_turma.matricula_id', 'matricula.id')
    .where('aluno_turma.matricula_id', matriculaId)
    .select(
      'aluno_turma.*',
      'turma.nome as turma_nome',
      'matricula.aluno_id',
      'matricula.ano_letivo'
    );

  return result;
};

module.exports = {
  create,
  findAll,
  findById,
  findByMatriculaId,
  findByTurmaId,
  update,
  deleteById,
  deleteByMatriculaId,
  listStudentsByTurma,
  listTurmasByMatricula,
};
