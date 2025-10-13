const substituicaoService = require('../services/substituicaoService');
const jwt = require('jsonwebtoken');

// Lida com a busca de aulas agendadas
const getAgendamentos = async (req, res) => {
  try {
    // Os filtros vêm da query string da URL (ex: /agendamentos?data=2025-10-07)
    const filtros = req.query; 
    const agendamentos = await substituicaoService.getAgendamentosParaSubstituicao(filtros);
    res.status(200).json(agendamentos);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lida com a execução da substituição
const substituirProfessor = async (req, res) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    const id_usuario_responsavel = decoded.id;

    // Dados da substituição vêm do corpo da requisição
    const { id_agendamento_aula, id_professor_anterior, id_professor_novo, motivo } = req.body;
    
    if (!id_agendamento_aula || !id_professor_anterior || !id_professor_novo) {
        return res.status(400).json({ message: 'Dados insuficientes para a substituição.' });
    }

    await substituicaoService.executarSubstituicao({
      id_agendamento_aula,
      id_professor_anterior,
      id_professor_novo,
      motivo,
      id_usuario_responsavel // Adiciona o ID do usuário que está fazendo a ação
    });

    res.status(200).json({ message: 'Substituição realizada com sucesso!' });
  } catch (error) {
    console.error("Erro ao realizar substituição:", error);
    res.status(400).json({ message: error.message });
  }
};

// Lida com a busca do histórico de uma aula
const getHistorico = async (req, res) => {
    try {
        // O ID da aula vem como parâmetro na URL (ex: /historico/123)
        const { id_agendamento } = req.params; 
        const historico = await substituicaoService.getHistoricoPorAgendamentoId(id_agendamento);
        res.status(200).json(historico);
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
  getAgendamentos,
  substituirProfessor,
  getHistorico,
};