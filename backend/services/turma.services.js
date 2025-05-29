const model = require("../models/turma.model");
const alunoModel = require("../models/alunoModel");

const create = async (data) => {
  try {
    return await model.create(data);
  } catch (error) {
    return error.message;
  }
};

const findAll = async () => {
  try {
    return await model.findAll();
  } catch (error) {
    return error.message;
  }
};

const findById = async (id) => {
  try {
    return await model.findById(id);
  } catch (error) {
    return error.message;
  }
};

const update = async (id, data) => {
  try {
    return await model.update(id, data);
  } catch (error) {
    return error.message;
  }
};

const deleteById = async (id) => {
  try {
    await model.deleteById(id);
  } catch (error) {
    return error.message;
  }
};

const query = async (name) => {
  try {
    return await alunoModel.query(name);
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
  query,
};
