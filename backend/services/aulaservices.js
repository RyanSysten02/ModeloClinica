const aulaModel = require('../models/aulaModel');

const getHorarios = async () => {
  return await aulaModel.getHorarios();
};

const getAulasByDia = async (dia_semana) => {
  return await aulaModel.getAulasByDia(dia_semana);
};

const replaceDia = async (dia_semana, aulas, userId) => {
  return await aulaModel.replaceDia(dia_semana, aulas, userId);
};

const getHistorico = async (dataInicio, dataFim) => {
  return await aulaModel.getHistorico(dataInicio, dataFim);
};

const getHistoricoSnapshot = async (id) => {
  return await aulaModel.getHistoricoSnapshot(id);
};

module.exports = {
  getHorarios,
  getAulasByDia,
  replaceDia,
  getHistorico,
  getHistoricoSnapshot,
};
