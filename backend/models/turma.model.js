const knex = require('../lib/knex');

const create = async (data) => {
  try {
    const result = await knex('turma').insert(data);

    return result;
  } catch (error) {
    return error.message;
  }
};

const findAll = async () => {
  try {
    const result = await knex('turma').select();

    if (!result) return [];

    return result;
  } catch (error) {
    return error.message;
  }
};

const findById = async (id) => {
  try {
    const result = await knex('turma').select().where({ id });

    if (!result) return [];

    return result?.at(0);
  } catch (error) {
    return error.message;
  }
};

const update = async (id, data) => {
  try {
    const result = await knex('turma').update(data).where({ id });
    return result;
  } catch (error) {
    return error.message;
  }
};

const deleteById = async (id) => {
  try {
    await knex('turma').delete().where({ id });
  } catch (error) {
    return error.message;
  }
};

const listStudents = async (id) => {
  try {
    const result = await knex
      .from('turma')
      .innerJoin('matricula', 'turma.id', 'matricula.turma_id')
      .innerJoin('aluno', 'matricula.aluno_id', 'aluno.id')
      .where('turma.id', id);

    return result;
  } catch (error) {
    return error.message;
  }
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
  listStudents,
};
