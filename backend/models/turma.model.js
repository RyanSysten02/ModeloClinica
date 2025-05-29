const knex = require('../lib/knex');

const create = async (data) => {
  const result = await knex('turma').insert(data);

  return result;
};

const findAll = async () => {
  const result = await knex('turma').select();

  if (!result) return [];

  return result;
};

const findById = async (id) => {
  const result = await knex('turma').select().where({ id });

  if (!result) return [];

  return result?.at(0);
};

const update = async (id, data) => {
  const result = await knex('turma').update(data).where({ id });
  return result;
};

const deleteById = async (id) => {
  const result = await knex('turma').delete().where({ id });

  return result;
};

const listStudents = async (id) => {
  const result = await knex
    .from('turma')
    .innerJoin('matricula', 'turma.id', 'matricula.turma_id')
    .innerJoin('aluno', 'matricula.aluno_id', 'aluno.id')
    .where('turma.id', id);

  return result;
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
  listStudents,
};
