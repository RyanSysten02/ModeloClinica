const substituicaoModel = require('../models/substituicaoModel');

// Busca a grade de aulas (com as substituições aplicadas se houver)
const getAgendamentosParaSubstituicao = async (filtros) => {
  return await substituicaoModel.getAgendamentosParaSubstituicao(filtros);
};

/**
 * Registra uma substituição eventual.
 * Diferente do modelo anterior, não precisamos atualizar a tabela de aulas (grade fixa),
 * apenas inserimos/atualizamos na tabela de 'substituicoes_eventuais'.
 */
const executarSubstituicaoEventual = async (dadosSubstituicao) => {
  // O controller já manda o objeto pronto: { aula_id, professor_substituto_id, data_aula, ... }
  return await substituicaoModel.createSubstituicaoEventual(dadosSubstituicao);
};

// Busca o histórico de substituições eventuais de uma aula da grade
const getDetalhesSubstituicao = async (id_aula_grade) => {
  return await substituicaoModel.getDetalhesSubstituicao(id_aula_grade);
};

module.exports = {
  getAgendamentosParaSubstituicao,
  executarSubstituicaoEventual,
  getDetalhesSubstituicao,
};