const pool = require('../db.js');

// Busca agendamentos de aula com base em filtros para a tela de substituição
const getAgendamentosParaSubstituicao = async (filtros = {}) => {
  let query = `
    SELECT
        aa.id,
        aa.start,
        aa.end,
        aa.tipo AS disciplina_nome,
        t.id AS turma_id,
        t.nome AS turma_nome,
        p.id AS professor_id,
        p.nome AS professor_nome
    FROM agendamento_aula AS aa
    INNER JOIN turma AS t ON aa.id_turma = t.id
    INNER JOIN professor AS p ON aa.id_func_responsavel = p.id
    WHERE 1=1
  `;

  const params = [];

  if (filtros.data) {
    query += ` AND DATE(aa.start) = ?`;
    params.push(filtros.data);
  }
  if (filtros.id_turma) {
    query += ` AND aa.id_turma = ?`;
    params.push(filtros.id_turma);
  }
  if (filtros.id_professor) {
    query += ` AND aa.id_func_responsavel = ?`;
    params.push(filtros.id_professor);
  }
  if (filtros.disciplinaNome) {
    query += ` AND aa.tipo = ?`;
    params.push(filtros.disciplinaNome);
  }

  query += ` ORDER BY aa.start ASC`;

  const [rows] = await pool.query(query, params);
  return rows;
};

// Atualiza o professor responsável em um agendamento de aula
const updateProfessorAgendamento = async (id_agendamento_aula, id_novo_professor) => {
  const [result] = await pool.query(
    `UPDATE agendamento_aula SET id_func_responsavel = ? WHERE id = ?`,
    [id_novo_professor, id_agendamento_aula]
  );
  return result;
};

// Cria um registro na tabela de histórico de substituições
const createHistoricoSubstituicao = async (dadosHistorico) => {
  const { 
    id_agendamento_aula, 
    id_professor_anterior, 
    id_professor_novo, 
    id_usuario_responsavel, 
    motivo 
  } = dadosHistorico;
  
  const [result] = await pool.query(
    `INSERT INTO substituicoes_historico 
       (id_agendamento_aula, id_professor_anterior, id_professor_novo, id_usuario_responsavel, motivo) 
     VALUES (?, ?, ?, ?, ?)`,
    [id_agendamento_aula, id_professor_anterior, id_professor_novo, id_usuario_responsavel, motivo]
  );
  return result;
};

// Busca o histórico de substituições de uma aula específica
const getHistoricoPorAgendamentoId = async (id_agendamento_aula) => {
  const [rows] = await pool.query(
    `SELECT
        h.id,
        h.data_substituicao,
        h.motivo,
        p_antigo.nome AS professor_anterior_nome,
        p_novo.nome AS professor_novo_nome,
        u.nome AS usuario_responsavel_nome
     FROM substituicoes_historico AS h
     INNER JOIN professor AS p_antigo ON h.id_professor_anterior = p_antigo.id
     INNER JOIN professor AS p_novo ON h.id_professor_novo = p_novo.id
     LEFT JOIN user AS u ON h.id_usuario_responsavel = u.id
     WHERE h.id_agendamento_aula = ?
     ORDER BY h.data_substituicao DESC`,
    [id_agendamento_aula]
  );
  return rows;
};

module.exports = {
  getAgendamentosParaSubstituicao,
  updateProfessorAgendamento,
  createHistoricoSubstituicao,
  getHistoricoPorAgendamentoId,
};