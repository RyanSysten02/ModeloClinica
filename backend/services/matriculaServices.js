const matriculaModel = require('../models/matriculaModel');

const createMatricula = async (aluno_id, turma_id, responsavel_id, observacoes) => {
  return await matriculaModel.createMatricula(aluno_id, turma_id, responsavel_id, observacoes);
};

const getMatriculas = async () => {
  return await matriculaModel.getMatriculas();
};

const getMatriculaById = async (id) => {
  return await matriculaModel.getMatriculaById(id);
};

const updateMatricula = async (id, turma_id, responsavel_id, status, observacoes) => {
  return await matriculaModel.updateMatricula(id, turma_id, responsavel_id, status, observacoes);
};

const deleteMatricula = async (id) => {
  return await matriculaModel.deleteMatricula(id);
};

module.exports = {
  createMatricula,
  getMatriculas,
  getMatriculaById,
  updateMatricula,
  deleteMatricula,
};
