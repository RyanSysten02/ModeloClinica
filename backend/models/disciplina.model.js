const knex = require('../lib/knex');

const create = async (data) => {
  const result = await knex('disciplina').insert(data);

  return result;
};

const findAll = async () => {
  const result = await knex('disciplina').select();

  if (!result) return [];

  return result;
};

const findById = async (id) => {
  const result = await knex('disciplina').select().where({ id });

  if (!result) return [];

  return result?.at(0);
};

const update = async (id, data) => {
  const result = await knex('disciplina').update(data).where({ id });
  return result;
};

const deleteById = async (id) => {
  await knex('disciplina').delete().where({ id });
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
};
