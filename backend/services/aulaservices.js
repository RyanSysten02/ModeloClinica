const aulaModel = require('../models/aulamodel');

const getHorarios = async () => {
  return await aulaModel.getHorarios();
};

const getAulasByDia = async (dia_semana) => {
  return await aulaModel.getAulasByDia(dia_semana);
};

const replaceDia = async (dia_semana, aulas) => {
  return await aulaModel.replaceDia(dia_semana, aulas);
};

module.exports = {
  getHorarios,
  getAulasByDia,
  replaceDia,
};
