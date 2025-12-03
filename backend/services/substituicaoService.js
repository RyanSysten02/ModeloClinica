const substituicaoModel = require('../models/substituicaoModel');

// Busca agendamentos de aula com base nos filtros
const getAgendamentosParaSubstituicao = async (filtros) => {
  return await substituicaoModel.getAgendamentosParaSubstituicao(filtros);
};

/**
 * Orquestra a operação de substituição de professor.
 * Primeiro, atualiza o professor na aula.
 * Segundo, cria um registro de histórico para a troca.
 */
const executarSubstituicao = async (dadosSubstituicao) => {
  const { 
    id_agendamento_aula, 
    id_professor_novo, 
    id_professor_anterior, // Precisamos saber quem era o professor antigo
    id_usuario_responsavel, 
    motivo 
  } = dadosSubstituicao;

  // Passo 1: Atualiza a aula com o novo professor
  await substituicaoModel.updateProfessorAgendamento(id_agendamento_aula, id_professor_novo);

  // Passo 2: Prepara os dados e cria o registro no histórico
  const dadosHistorico = {
    id_agendamento_aula,
    id_professor_anterior,
    id_professor_novo,
    id_usuario_responsavel,
    motivo
  };
  
  const resultadoHistorico = await substituicaoModel.createHistoricoSubstituicao(dadosHistorico);
  
  return resultadoHistorico;
};

// Busca o histórico de substituições de uma aula específica
const getHistoricoPorAgendamentoId = async (id_agendamento_aula) => {
  return await substituicaoModel.getHistoricoPorAgendamentoId(id_agendamento_aula);
};


module.exports = {
  getAgendamentosParaSubstituicao,
  executarSubstituicao,
  getHistoricoPorAgendamentoId,
};