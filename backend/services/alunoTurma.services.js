const model = require('../models/alunoTurma.model');

const create = async (data) => {
  return await model.create(data);
};

const findAll = async () => {
  return await model.findAll();
};

const findById = async (id) => {
  return await model.findById(id);
};

const findByMatriculaId = async (matriculaId) => {
  return await model.findByMatriculaId(matriculaId);
};

const findByTurmaId = async (turmaId) => {
  return await model.findByTurmaId(turmaId);
};

const update = async (id, data) => {
  return await model.update(id, data);
};

const deleteById = async (id) => {
  await model.deleteById(id);
};

const deleteByMatriculaId = async (matriculaId) => {
  await model.deleteByMatriculaId(matriculaId);
};

const listStudentsByTurma = async (turmaId) => {
  return await model.listStudentsByTurma(turmaId);
};

const listTurmasByMatricula = async (matriculaId) => {
  return await model.listTurmasByMatricula(matriculaId);
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
