const matriculaModel = require('../models/matriculaModel');

const createMatricula = async (aluno_id, turma_id, responsavel_id, observacoes, data_matricula, ano_letivo, turno) => {
  return await matriculaModel.createMatricula(aluno_id, turma_id, responsavel_id, observacoes, data_matricula, ano_letivo, turno);
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

const atualizarStatusMatricula = async (id, status) => {
  const result = await matriculaModel.atualizarStatusMatricula(id, status);
  return result;
};


module.exports = {
  createMatricula,
  getMatriculas,
  getMatriculaById,
  updateMatricula,
  deleteMatricula,
  atualizarStatusMatricula,
};
