const knex = require("../lib/knex");

const create = async (data) => {
  try {
    const result = await knex("turma").insert(data);

    return result;
  } catch (error) {
    return error.message;
  }
};

const findAll = async () => {
  try {
    const result = await knex("turma").select();

    if (!result) return [];

    return result;
  } catch (error) {
    return error.message;
  }
};

const findById = async (id) => {
  try {
    const result = await knex("turma").select().where({ id });

    if (!result) return [];

    return result?.at(0);
  } catch (error) {
    return error.message;
  }
};

const update = async (id, data) => {
  try {
    const result = await knex("turma").update(data).where({ id });
    return result;
  } catch (error) {
    return error.message;
  }
};

const deleteById = async (id) => {
  try {
    await await knex("turma").delete().where({ id });
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
};
