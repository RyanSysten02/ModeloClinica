const knex = require("../lib/knex");

const create = async (data) => {
  try {
    const result = await knex("disciplina").insert(data);

    return result;
  } catch (error) {
    return error.message;
  }
};

const findAll = async () => {
  try {
    const result = await knex("disciplina").select();

    if (!result) return [];

    return result;
  } catch (error) {
    return error.message;
  }
};

const findById = async (id) => {
  try {
    const result = await knex("disciplina").select().where({ id });

    if (!result) return [];

    return result?.at(0);
  } catch (error) {
    return error.message;
  }
};

const update = async (id, data) => {
  try {
    const result = await knex("disciplina").update(data).where({ id });
    return result;
  } catch (error) {
    return error.message;
  }
};

const deleteById = async (id) => {
  try {
    await await knex("disciplina").delete().where({ id });
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
