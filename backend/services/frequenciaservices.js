const frequenciaModel = require('../models/frequenciaModel');

// Criar uma nova frequência
const createFrequencia = async (matricula_id, professor_id, presente, data_aula, cod_usuario_inclusao) => {
  const frequencia = await frequenciaModel.createFrequencia(
    matricula_id,
    professor_id,
    presente,
    data_aula,
    cod_usuario_inclusao
  );
  return frequencia;
};

const createBulkFrequencia = async (frequenciasArray, cod_usuario_inclusao) => {
  // Usamos Promise.all para executar todas as inserções de forma concorrente
  const promises = frequenciasArray.map(frequencia => {
    // Para cada item no array, chamamos a função do model que você já tinha
    return frequenciaModel.createFrequencia(
      frequencia.matricula_id,
      frequencia.professor_id,
      frequencia.presente,
      frequencia.data_aula,
      frequencia.periodo,
      cod_usuario_inclusao
    );
  });

  // Espera que todas as inserções no banco de dados terminem
  return Promise.all(promises);
};

const updateBulkFrequencia = async (frequenciasArray, cod_usuario_alteracao) => {
  const promises = frequenciasArray.map(frequencia => {
    return frequenciaModel.upsertFrequencia(frequencia, cod_usuario_alteracao);
  });
  return Promise.all(promises);
};


// Buscar todas as frequências
const getFrequencias = async () => {
  const frequencias = await frequenciaModel.getFrequencias();
  return frequencias;
};

// Buscar frequência por ID
const getFrequenciaById = async (id) => {
  return await frequenciaModel.getFrequenciaById(id);
};

const getFrequenciasAgrupadas = async (turmaId, professorId, periodo) => {
  return await frequenciaModel.getFrequenciasAgrupadas(turmaId, professorId, periodo);
};


// Atualizar frequência
const updateFrequencia = async (id, matricula_id, professor_id, presente, data_aula, cod_usuario_alteracao) => {
  const frequencia = await frequenciaModel.updateFrequencia(
    id,
    matricula_id,
    professor_id,
    presente,
    data_aula,
    cod_usuario_alteracao
  );
  return frequencia;
};

// Deletar frequência
const deleteFrequencia = async (id) => {
  const frequencia = await frequenciaModel.deleteFrequencia(id);
  return frequencia;
};

// Buscar todas as frequências de uma matrícula específica
const getFrequenciasPorMatricula = async (matricula_id) => {
  return await frequenciaModel.getFrequenciasPorMatricula(matricula_id);
};

const getFrequenciaDetalhadaPorAula = async (turmaId, professorId, dataAula, periodo) => {
  return await frequenciaModel.getFrequenciaDetalhadaPorAula(turmaId, professorId, dataAula, periodo);
};

module.exports = {
  createFrequencia,
  createBulkFrequencia,
  updateBulkFrequencia,
  getFrequencias,
  getFrequenciaById,
  updateFrequencia,
  deleteFrequencia,
  getFrequenciasPorMatricula,
  getFrequenciasAgrupadas,
  getFrequenciaDetalhadaPorAula,
};
