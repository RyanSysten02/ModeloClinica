const model = require('../models/turma.model');

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

const listStudents = async (id) => {
  return await model.listStudents(id);
};

const findByStatusAndYear = async (status, anoLetivo) => {
  return await model.findByStatusAndYear(status, anoLetivo);
};

const transferStudents = async (sourceTurmaId, targetTurmaId, studentIds) => {
  return await model.transferStudents(sourceTurmaId, targetTurmaId, studentIds);
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
  listStudents,
  findByStatusAndYear,
  transferStudents,
};
