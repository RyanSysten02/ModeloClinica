const model = require('../models/disciplina.model');

const create = async (data) => {
  return await model.create(data);
};

const findAll = async () => {
  return await model.findAll();
};

const findById = async (id) => {
  return await model.findById(id);
};

const update = async (id, data) => {
  return await model.update(id, data);
};

const deleteById = async (id) => {
  await model.deleteById(id);
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
};
