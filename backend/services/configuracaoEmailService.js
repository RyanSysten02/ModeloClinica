const configuracaoEmailModel = require('../models/configuracaoEmailModel');

const getConfiguracao = async () => {
  return await configuracaoEmailModel.getConfiguracao();
};

const updateConfiguracao = async (config) => {
  return await configuracaoEmailModel.updateConfiguracao(config);
};

module.exports = {
  getConfiguracao,
  updateConfiguracao,
};